import { Chain, PublicClient, Transport, WalletClient } from 'viem';
import { Remittance } from '@/lib/typechain-types';

export interface WalletCapabilities {
  [chainId: string]: {
    paymasterService?: {
      supported: boolean;
    };
    // Add other capabilities as needed
  };
}

export interface WalletProvider {
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  chainId?: string;
  selectedAddress?: string | null;
}

export interface WalletState {
  address: string | null;
  account: string | null; // Alias for address for compatibility
  chainId: number | null;
  isConnected: boolean;
  provider: WalletProvider | null;
  signer: any | null; // Will be typed with ethers v6 signer
  contract: Remittance | null;
}

export interface TransactionRequest {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  chainId?: number;
  type?: number;
  accessList?: Array<{ address: `0x${string}`; storageKeys: `0x${string}`[] }>;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
  paymasterAndData?: `0x${string}`;
}

export interface BatchCall {
  to: `0x${string}`;
  value?: bigint;
  data: `0x${string}`;
}

export interface BatchTransactionRequest {
  chainId: `0x${string}` | number;
  from: `0x${string}`;
  calls: BatchCall[];
  version: string;
  capabilities?: Record<string, any>;
}

export interface TransactionReceipt {
  transactionHash: `0x${string}`;
  transactionIndex: number;
  blockHash: `0x${string}`;
  blockNumber: number;
  from: `0x${string}`;
  to: `0x${string}` | null;
  status: 'success' | 'reverted' | 'pending';
  logs: Array<{
    address: `0x${string}`;
    topics: `0x${string}`[];
    data: `0x${string}`;
    logIndex: number;
    transactionIndex: number;
    transactionHash: `0x${string}`;
    blockHash: `0x${string}`;
    blockNumber: number;
  }>;
  logsBloom: `0x${string}`;
  gasUsed: bigint;
  cumulativeGasUsed: bigint;
  effectiveGasPrice: bigint;
  type: number;
  contractAddress: `0x${string}` | null;
}

export interface BatchStatus {
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  receipts?: TransactionReceipt[];
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface WalletSDK {
  getProvider: () => WalletProvider;
  connect: () => Promise<{ address: string; chainId: number }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

// Remittance specific types
export interface TransferParams {
  recipient: `0x${string}`;
  amount: bigint;
  recipientCountry: string;
  token: `0x${string}`;
  value?: bigint;
  gasLimit?: number;
}

export interface UserInfo {
  isRegistered: boolean;
  referrer: string;
  totalTransferred: string; // Convert from bigint to string for frontend compatibility
  totalReceived: string;
  cashbackEarned: string;
  referralRewards: string;
  referralCount: number;
  lastActivity: number;
}

export interface TransactionInfo {
  id: bigint;
  sender: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  token: `0x${string}`;
  recipientCountry: string;
  fee: bigint;
  cashback: bigint;
  timestamp: number;
  completed: boolean;
  txHash: string;
}

// Paymaster related types
export interface PaymasterConfig {
  url: string;
  context?: Record<string, any>;
  policyId?: string;
}

export interface GasAndPaymasterAndData {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: `0x${string}`;
}

export interface PaymasterResponse {
  jsonrpc: string;
  id: number;
  result: {
    paymasterAndData: `0x${string}`;
    preVerificationGas: string;
    verificationGasLimit: string;
    callGasLimit: string;
    callGasLimitForAggregator: string;
    paymaster: `0x${string}`;
    paymasterVerificationGasLimit: string;
    paymasterPostOpGasLimit: string;
    paymasterData: `0x${string}`;
  };
}
