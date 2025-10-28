import { encodeFunctionData, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { createBaseAccountSDK } from "@base-org/account";
import type { Address } from "viem";
import { ERC20_ABI } from "@/lib/constants";

export async function transferErc20(
  params: {
    from?: Address;
    to: Address;
    token: Address;
    amount: string; // decimal string, e.g., "12.34"
    decimals: number; // token decimals, e.g., 6 for USDC
    appName?: string;
    appLogoUrl?: string;
  }
): Promise<{ txHash: string }>{
  const { to, token, amount, decimals, appName = "BetaRemit", appLogoUrl = 
    "https://v0-cross-border-remittance-service.vercel.app/logo.png" } = params;

  // Convert human-readable amount to token units
  const valueInUnits = parseUnits(amount, decimals);

  // Encode ERC20 transfer(to, value)
  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, valueInUnits],
  });

  // Initialize Base Account SDK (smart wallet provider)
  const sdk = createBaseAccountSDK({
    appName,
    appLogoUrl,
    appChainIds: [baseSepolia.id],
  });

  const provider = sdk.getProvider();

  // Send the call using wallet_sendCalls for gasless/smart wallet flow
  const txHash = (await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0",
        chainId: `0x${baseSepolia.id.toString(16)}`,
        calls: [
          {
            to: token,
            value: "0x0",
            data,
          },
        ],
      },
    ],
  })) as string;

  return { txHash };
}
