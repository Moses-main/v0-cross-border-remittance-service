import { baseSepolia } from "viem/chains";
import { 
  createPublicClient, 
  http, 
  encodeFunctionData,
  decodeFunctionResult,
  type PublicClient,
  type Address,
  type Hash,
  type Hex,
  type TransactionRequest,
  type Transport,
  type Chain
} from "viem";
import REMITTANCE_ABI from "@/lib/web3-config";
import { ERC20_ABI } from "@/lib/constants";

type PaymasterConfig = {
  paymasterUrl: string;
  paymasterAddress: Address;
  sponsorshipPolicyId?: string;
};

type BatchStatus = {
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  receipts?: any[];
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

type TransferParams = {
  recipient: Address;
  amount: bigint;
  recipientCountry: string;
  token: Address;
  value?: bigint;
};

type UserInfo = {
  isRegistered: boolean;
  referrer: Address;
  totalTransferred: bigint;
  totalReceived: bigint;
  cashbackEarned: bigint;
  referralRewards: bigint;
  referralCount: number;
  lastActivity: number;
};

type TransactionInfo = {
  id: string;
  from: Address;
  to: Address;
  amount: bigint;
  token: Address;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
};

/**
 * Creates a Viem public client for interacting with the Base Sepolia blockchain
 */
export const createClient = (rpcUrl: string): PublicClient<Transport, Chain> => {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
};

/**
 * Encodes a function call to the Remittance contract
 */
export const encodeRemittanceCall = (functionName: string, args: unknown[] = []): Hex => {
  return encodeFunctionData({
    abi: REMITTANCE_ABI,
    functionName,
    args,
  });
};

/**
 * Sends a gasless transaction using the paymaster
 */
export const sendGaslessTransaction = async (
  provider: any, // TODO: Replace with proper type when available
  from: Address,
  to: Address,
  data: Hex,
  paymasterConfig: PaymasterConfig
): Promise<{ txHash: string }> => {
  try {
    // Prepare the transaction request
    const txRequest: TransactionRequest = {
      from,
      to,
      data,
      gas: BigInt(2000000), // Default gas limit, adjust as needed
    };

    // Call the paymaster to get gas and paymaster data
    const paymasterResponse = await fetch(paymasterConfig.paymasterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [
          {
            sender: from,
            callData: data,
            callGasLimit: BigInt(2000000),
            verificationGasLimit: BigInt(1000000),
            preVerificationGas: BigInt(100000),
            maxFeePerGas: BigInt(100000000),
            maxPriorityFeePerGas: BigInt(1000000),
            paymasterAndData: '0x',
            signature: '0x',
          },
          paymasterConfig.paymasterAddress,
          {
            type: 'payg',
          },
        ],
      }),
    });

    if (!paymasterResponse.ok) {
      throw new Error('Failed to get paymaster data');
    }

    const { result } = await paymasterResponse.json();
    
    // Send the transaction with paymaster data
    const txHash = await provider.request({
      method: 'eth_sendRawTransaction',
      params: [result.paymasterAndData],
    });

    return { txHash };
  } catch (error) {
    console.error('Error in sendGaslessTransaction:', error);
    throw error;
  }
};

/**
 * Sends a regular transaction with gas payment
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {Address} from - The sender's address
 * @param {Address} to - The contract address
 * @param {Hex} data - The encoded function data
 * @param {bigint} [value] - The amount of native token to send
 * @returns {Promise<Hash>} The transaction hash
 */
export const sendRegularTransaction = async (
  provider: any, // TODO: Import proper type from viem
  from: Address,
  to: Address,
  data: Hex,
  value: bigint = BigInt(0)
): Promise<Hash> => {
  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to,
        data,
        value: `0x${value.toString(16)}`,
        // Gas parameters will be filled by the wallet
      }],
    });

    return txHash;
  } catch (error) {
    console.error('Error sending regular transaction:', error);
    throw new Error("Failed to send transaction");
  }
};

/**
 * Initiates a transfer using the Remittance contract
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {Address} from - The sender's address
 * @param {TransferParams} params - The transfer parameters
 * @param {boolean} [usePaymaster=false] - Whether to use the paymaster for gasless transactions
 * @param {PaymasterConfig} [paymasterConfig] - The paymaster configuration
 * @returns {Promise<{ txHash: string }>} The transaction hash or batch ID
 */
export const initiateTransfer = async (
  provider: any, // TODO: Import proper type from viem
  from: Address,
  params: TransferParams,
  usePaymaster: boolean = false,
  paymasterConfig?: PaymasterConfig
): Promise<{ txHash: string }> => {
  try {
    const { recipient, amount, recipientCountry, token, value = BigInt(0) } = params;
    
    // Encode the transfer function call
    const data = encodeRemittanceCall('initiateTransfer', [
      recipient,
      amount,
      recipientCountry,
      token,
    ]);

    if (usePaymaster && paymasterConfig) {
      // Use gasless transaction with paymaster
      const result = await sendGaslessTransaction(
        provider,
        from,
        params.token as Address, // The Remittance contract address
        data,
        paymasterConfig
      );
      return result;
    } else {
      // Use regular transaction with gas payment
      const txHash = await sendRegularTransaction(
        provider,
        from,
        params.token as Address, // The Remittance contract address
        data,
        value
      );
      return { txHash };
    }
  } catch (error) {
    console.error('Error initiating transfer:', error);
    throw new Error("Failed to initiate transfer");
  }
};

/**
 * Registers a new user with a referrer
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {Address} from - The user's address
 * @param {Address} referrer - The referrer's address
 * @param {boolean} [usePaymaster=false] - Whether to use the paymaster for gasless transactions
 * @param {PaymasterConfig} [paymasterConfig] - The paymaster configuration
 * @returns {Promise<{ txHash: string }>} The transaction hash or batch ID
 */
export const registerUser = async (
  provider: any, // TODO: Import proper type from viem
  from: Address,
  referrer: Address,
  usePaymaster: boolean = false,
  paymasterConfig?: PaymasterConfig
): Promise<{ txHash: string }> => {
  try {
    // Encode the registerUser function call
    const data = encodeRemittanceCall('registerUser', [referrer]);

    if (usePaymaster && paymasterConfig) {
      // Use gasless transaction with paymaster
      const result = await sendGaslessTransaction(
        provider,
        from,
        (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
        data,
        paymasterConfig
      );
      return result;
    } else {
      // Use regular transaction with gas payment
      const txHash = await sendRegularTransaction(
        provider,
        from,
        (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
        data
      );
      return { txHash };
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error("Failed to register user");
  }
};

/**
 * Withdraws cashback to the specified token
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {Address} from - The user's address
 * @param {Address} token - The token address to withdraw to
 * @param {boolean} [usePaymaster=false] - Whether to use the paymaster for gasless transactions
 * @param {PaymasterConfig} [paymasterConfig] - The paymaster configuration
 * @returns {Promise<{ txHash: string }>} The transaction hash or batch ID
 */
export const withdrawCashback = async (
  provider: any, // TODO: Import proper type from viem
  from: Address,
  token: Address,
  usePaymaster: boolean = false,
  paymasterConfig?: PaymasterConfig
): Promise<{ txHash: string }> => {
  try {
    // Encode the withdrawCashback function call
    const data = encodeRemittanceCall('withdrawCashback', [token]);

    if (usePaymaster && paymasterConfig) {
      // Use gasless transaction with paymaster
      const result = await sendGaslessTransaction(
        provider,
        from,
        (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
        data,
        paymasterConfig
      );
      return result;
    } else {
      // Use regular transaction with gas payment
      const txHash = await sendRegularTransaction(
        provider,
        from,
        (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
        data
      );
      return { txHash };
    }
  } catch (error) {
    console.error('Error withdrawing cashback:', error);
    throw new Error("Failed to withdraw cashback");
  }
};

/**
 * Gets the status of a batch transaction
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {string} batchId - The batch ID to check
 * @returns {Promise<BatchStatus>} The status of the batch transaction
 */
export const getCallsStatus = async (
  provider: any, // TODO: Import proper type from viem
  batchId: string
): Promise<BatchStatus> => {
  try {
    const status = await provider.request({
      method: 'wallet_getCallsStatus',
      params: [batchId],
    });
    
    return status as BatchStatus;
  } catch (error) {
    console.error('Error getting calls status:', error);
    throw new Error("Failed to get calls status");
  }
};

/**
 * Waits for a batch transaction to be confirmed
 * 
 * @param {WalletProvider} provider - The wallet provider
 * @param {string} batchId - The batch ID to monitor
 * @param {number} [maxAttempts=30] - Maximum number of attempts
 * @param {number} [intervalMs=2000] - Interval between attempts in milliseconds
 * @returns {Promise<BatchStatus>} The final status of the batch transaction
 */
/**
 * Gets user information from the Remittance contract
 * 
 * @param {any} provider - The wallet provider
 * @param {Address} userAddress - The user's address to fetch info for
 * @returns {Promise<UserInfo | null>} The user's information or null if not found
 */
export const getUserInfo = async (
  provider: any, // TODO: Import proper type from viem
  userAddress: Address
): Promise<UserInfo | null> => {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(provider.connection?.url || provider.connection?.rpcUrl)
    });

    const data = encodeFunctionData({
      abi: REMITTANCE_ABI,
      functionName: 'getUser',
      args: [userAddress]
    });

    const result = await client.call({
      to: (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
      data
    });

    if (!result?.data) return null;

    const decoded = decodeFunctionResult({
      abi: REMITTANCE_ABI,
      functionName: 'getUser',
      data: result.data
    }) as unknown as UserInfo;

    return {
      isRegistered: decoded.isRegistered,
      referrer: decoded.referrer,
      totalTransferred: decoded.totalTransferred,
      totalReceived: decoded.totalReceived,
      cashbackEarned: decoded.cashbackEarned,
      referralRewards: decoded.referralRewards,
      referralCount: Number(decoded.referralCount),
      lastActivity: Number(decoded.lastActivity)
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

/**
 * Waits for a batch transaction to be confirmed
 */
/**
 * Gets all transactions for a specific user
 * 
 * @param {PublicClient} provider - The public client for blockchain interaction
 * @param {Address} userAddress - The user's address to fetch transactions for
 * @param {number} start - Starting index for pagination
 * @param {number} count - Number of transactions to fetch
 * @returns {Promise<TransactionInfo[]>} Array of user transactions
 */
export const getUserTransactions = async (
  provider: PublicClient,
  userAddress: Address,
  start: number = 0,
  count: number = 50
): Promise<TransactionInfo[]> => {
  try {
    const data = encodeFunctionData({
      abi: REMITTANCE_ABI,
      functionName: 'getUserTransactions',
      args: [userAddress, BigInt(start), BigInt(count)]
    });

    const result = await provider.call({
      to: (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS as Address) || "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4",
      data
    });

    if (!result?.data) return [];

    const decoded = decodeFunctionResult({
      abi: REMITTANCE_ABI,
      functionName: 'getUserTransactions',
      data: result.data
    }) as unknown as any[];

    return decoded.map(tx => ({
      id: tx.id.toString(),
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      token: tx.token,
      timestamp: Number(tx.timestamp),
      status: tx.completed ? 'completed' : 'pending',
      txHash: tx.txHash
    }));
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
};

/**
 * Waits for a batch transaction to be confirmed
 */
export const waitForBatchConfirmation = async (
  provider: any, // TODO: Import proper type from viem
  batchId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<BatchStatus> => {
  let attempts = 0;
  
  const checkStatus = async (): Promise<BatchStatus> => {
    attempts++;
    const status = await getCallsStatus(provider, batchId);
    
    if (status.status === 'CONFIRMED' || status.status === 'FAILED') {
      return status;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error(`Transaction not confirmed after ${maxAttempts} attempts`);
    }
    
    // Wait for the interval before checking again
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    return checkStatus();
  };
  
  return checkStatus();
};
