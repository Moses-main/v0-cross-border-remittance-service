import { encodeFunctionData, parseUnits, parseAbi, createPublicClient, http, createWalletClient, custom } from "viem";
import type { Address } from "viem";
import { baseSepolia } from "viem/chains";
import { createBaseAccountSDK } from "@base-org/account";
import REMITTANCE_ABI, {
  REMITTANCE_CONTRACT_ADDRESS,
  ERC20_ABI,
} from "@/lib/web3-config";

export type InitiateRemittanceParams = {
  recipient: Address;
  amount: string; // human-readable decimal amount
  country: string; // recipient country as string per ABI
  token: Address; // stablecoin token address
  decimals: number; // token decimals to convert amount
  owner: Address; // sender/owner address for balance checks
  appName?: string;
  appLogoUrl?: string;
};

export async function initiateRemittance({
  recipient,
  amount,
  country,
  token,
  decimals,
  owner,
  appName = "BetaRemit",
  appLogoUrl = "https://v0-cross-border-remittance-service.vercel.app/logo.png",
}: InitiateRemittanceParams): Promise<{ txHash: string }> {
  const valueInUnits = parseUnits(amount, decimals);

  // Preflight: read on-chain fee (for display/analytics). Note: contract pulls only _amount.
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL) });
  // 0) Preflight: token support and user registration status
  let isTokenSupported = true;
  try {
    isTokenSupported = (await publicClient.readContract({
      abi: REMITTANCE_ABI as any,
      address: REMITTANCE_CONTRACT_ADDRESS as Address,
      functionName: "supportedStablecoins",
      args: [token],
    })) as boolean;
  } catch {
    // if ABI lacks getter, assume supported to not block; contract will revert otherwise
    isTokenSupported = true;
  }
  if (!isTokenSupported) {
    throw new Error("Selected token is not supported by the Remittance contract. Verify the token address matches deployment.");
  }

  let isActive = true;
  try {
    // getUserInfo(address) returns (walletAddress,totalSent,totalReceived,referrer,isActive)
    const userInfo = (await publicClient.readContract({
      abi: REMITTANCE_ABI as any,
      address: REMITTANCE_CONTRACT_ADDRESS as Address,
      functionName: "getUserInfo",
      args: [owner],
    })) as readonly [Address, bigint, bigint, Address, boolean];
    isActive = userInfo[4];
  } catch {
    // If call fails, proceed; contract may auto-register in your version
    isActive = true;
  }
  let feeInUnits: bigint = 0n;
  try {
    feeInUnits = (await publicClient.readContract({
      abi: REMITTANCE_ABI as any,
      address: REMITTANCE_CONTRACT_ADDRESS as Address,
      functionName: "calculateFee",
      args: [valueInUnits],
    })) as bigint;
  } catch {
    // ignore fee read failures
  }

  const totalToApprove = valueInUnits; // contract transfers only _amount; fee is retained from amount on-chain

  // 1) Approve spending (amount) to the remittance contract
  const erc20Abi = parseAbi(ERC20_ABI as readonly string[]);
  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [REMITTANCE_CONTRACT_ADDRESS as Address, totalToApprove],
  });

  // Preflight: ensure owner has enough token balance for amount
  try {
    const balance = (await publicClient.readContract({
      abi: erc20Abi,
      address: token,
      functionName: "balanceOf",
      args: [owner],
    })) as bigint;
    if (balance < valueInUnits) {
      const required = valueInUnits;
      const have = balance;
      throw new Error(
        `Insufficient token balance. Required (amount): ${required.toString()} units; Available: ${have.toString()} units.`
      );
    }
  } catch (e) {
    // If read fails, allow call to proceed; the transaction will revert with a clear error from token
    if (e instanceof Error && e.message.startsWith("Insufficient")) {
      throw e;
    }
  }

  // 2) Encode the initiateTransfer call
  const initiateData = encodeFunctionData({
    abi: REMITTANCE_ABI as any,
    functionName: "initiateTransfer",
    args: [recipient, valueInUnits, country, token],
  });

  // Optional register call if not active
  const registerData = !isActive
    ? encodeFunctionData({
        abi: REMITTANCE_ABI as any,
        functionName: "registerUser",
        args: ["0x0000000000000000000000000000000000000000" as Address],
      })
    : undefined;

  const sdk = createBaseAccountSDK({
    appName,
    appLogoUrl,
    appChainIds: [baseSepolia.id],
  });

  // Ensure the SDK session is connected to the user's wallet
  try {
    // Some environments auto-connect via OnchainKit modal; connect() ensures session
    // If already connected, connect() should be a no-op
    // @ts-ignore - connect may exist depending on SDK version
    if (typeof (sdk as any).connect === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await (sdk as any).connect();
    }
  } catch (e) {
    // swallow and proceed; provider request may still prompt
  }

  const provider = sdk.getProvider();

  // If MetaMask is connected, prefer using EOA flow instead of AA wallet_sendCalls
  if (typeof window !== "undefined" && (window as any)?.ethereum?.isMetaMask) {
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom((window as any).ethereum),
    });
    const [account] = await walletClient.getAddresses();

    // 0) register user if not active
    if (!isActive && registerData) {
      const regHash = await walletClient.writeContract({
        address: REMITTANCE_CONTRACT_ADDRESS as Address,
        abi: REMITTANCE_ABI as any,
        functionName: "registerUser",
        args: ["0x0000000000000000000000000000000000000000" as Address],
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash: regHash });
    }

    // 1) Approve (amount + fee)
    const approveHash = await walletClient.writeContract({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [REMITTANCE_CONTRACT_ADDRESS as Address, totalToApprove],
      account,
    });

    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    // 2) initiateTransfer
    const txHash = await walletClient.writeContract({
      address: REMITTANCE_CONTRACT_ADDRESS as Address,
      abi: REMITTANCE_ABI as any,
      functionName: "initiateTransfer",
      args: [recipient, valueInUnits, country, token],
      account,
    });

    return { txHash };
  }

  // Fallback to Base Account SDK AA flow (will show Base wallet modal)
  const calls: Array<{ to: Address; value: string; data: `0x${string}` }> = [];
  if (!isActive && registerData) {
    calls.push({ to: REMITTANCE_CONTRACT_ADDRESS as Address, value: "0x0", data: registerData as `0x${string}` });
  }
  calls.push({ to: token, value: "0x0", data: approveData as `0x${string}` });
  calls.push({ to: REMITTANCE_CONTRACT_ADDRESS as Address, value: "0x0", data: initiateData as `0x${string}` });

  const txHash = (await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0.0",
        chainId: `0x${baseSepolia.id.toString(16)}`,
        calls,
      },
    ],
  })) as string;

  return { txHash };
}

export async function registerUserOnchain(
  referrer: Address = "0x0000000000000000000000000000000000000000"
) {
  const sdk = createBaseAccountSDK({
    appName: "BetaRemit",
    appLogoUrl:
      "https://v0-cross-border-remittance-service.vercel.app/logo.png",
    appChainIds: [baseSepolia.id],
  });
  const provider = sdk.getProvider();

  const registerData = encodeFunctionData({
    abi: REMITTANCE_ABI as any,
    functionName: "registerUser",
    args: [referrer],
  });

  const txHash = (await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0.0",
        chainId: `0x${baseSepolia.id.toString(16)}`,
        calls: [
          {
            to: REMITTANCE_CONTRACT_ADDRESS as Address,
            value: "0x0",
            data: registerData,
          },
        ],
      },
    ],
  })) as string;

  return { txHash };
}
