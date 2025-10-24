import { ethers } from "ethers";

// Type aliases for compatibility with ethers v6
type BigNumber = bigint;

// Contract ABI for RemittanceService
export const RemittanceServiceABI = [
  // Constructor
  "constructor(address _stablecoinAddress)",

  // State variables
  "function stablecoin() view returns (address)",
  "function transferFeePercentage() view returns (uint256)",
  "function cashbackPercentage() view returns (uint256)",
  "function largeTransactionThreshold() view returns (uint256)",
  "function referralRewardPercentage() view returns (uint256)",
  "function users(address) view returns (tuple(address walletAddress, uint256 totalSent, uint256 totalReceived, uint256 cashbackBalance, uint256 referralRewards, address referrer, bool isActive))",
  "function transactions(uint256) view returns (tuple(address sender, address recipient, uint256 amount, uint256 fee, uint256 cashback, uint256 timestamp, string recipientCountry, bool completed))",
  "function userTransactions(address) view returns (uint256[])",
  "function transactionCount() view returns (uint256)",
  "function totalVolumeProcessed() view returns (uint256)",

  // Functions
  "function registerUser(address _referrer)",
  "function sendRemittance(address _recipient, uint256 _amount, string _recipientCountry) returns (uint256)",
  "function completeTransfer(uint256 _txId)",
  "function withdrawCashback()",
  "function withdrawReferralRewards()",
  "function getUser(address _userAddress) view returns (tuple(address walletAddress, uint256 totalSent, uint256 totalReceived, uint256 cashbackBalance, uint256 referralRewards, address referrer, bool isActive))",
  "function getTransaction(uint256 _txId) view returns (tuple(address sender, address recipient, uint256 amount, uint256 fee, uint256 cashback, uint256 timestamp, string recipientCountry, bool completed))",
  "function getUserTransactions(address _user) view returns (uint256[])",
  "function getReferralCount(address _user) view returns (uint256)",
  "function setTransferFee(uint256 _newFeePercentage)",
  "function setCashbackPercentage(uint256 _newPercentage)",
  "function setLargeTransactionThreshold(uint256 _newThreshold)",
  "function withdrawFees(uint256 _amount)",

  // Events
  "event TransferInitiated(uint256 indexed txId, address indexed sender, address indexed recipient, uint256 amount, uint256 fee, string recipientCountry)",
  "event CashbackAwarded(address indexed user, uint256 amount)",
  "event ReferralRewardAwarded(address indexed referrer, address indexed referred, uint256 amount)",
  "event UserRegistered(address indexed user, address indexed referrer)",
  "event FeeUpdated(uint256 newFeePercentage)",
];

// Type definitions
export interface User {
  walletAddress: string;
  totalSent: BigNumber;
  totalReceived: BigNumber;
  cashbackBalance: BigNumber;
  referralRewards: BigNumber;
  referrer: string;
  isActive: boolean;
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: BigNumber;
  fee: BigNumber;
  cashback: BigNumber;
  timestamp: BigNumber;
  recipientCountry: string;
  completed: boolean;
}

export interface UserInfo {
  isRegistered: boolean;
  referrer: string;
  totalTransferred: string; // Convert from BigNumber to string for frontend compatibility
  totalReceived: string;
  cashbackEarned: string;
  referralRewards: string;
  referralCount: number;
  lastActivity: number;
}

export interface TransactionInfo {
  id: bigint;
  sender: string;
  recipient: string;
  amount: bigint;
  fee: bigint;
  cashback: bigint;
  timestamp: number;
  recipientCountry: string;
  completed: boolean;
}

export interface TransferParams {
  recipient: string;
  amount: string;
  recipientCountry: string;
  tokenAddress: string;
}

// Contract interface
export interface RemittanceService {
  // Read functions
  stablecoin(): Promise<string>;
  transferFeePercentage(): Promise<BigNumber>;
  cashbackPercentage(): Promise<BigNumber>;
  largeTransactionThreshold(): Promise<BigNumber>;
  referralRewardPercentage(): Promise<BigNumber>;
  users(userAddress: string): Promise<User>;
  transactions(txId: BigNumber): Promise<Transaction>;
  userTransactions(user: string): Promise<BigNumber[]>;
  transactionCount(): Promise<BigNumber>;
  totalVolumeProcessed(): Promise<BigNumber>;
  getUser(userAddress: string): Promise<User>;
  getTransaction(txId: BigNumber): Promise<Transaction>;
  getUserTransactions(user: string): Promise<BigNumber[]>;
  getReferralCount(user: string): Promise<BigNumber>;

  // Write functions
  registerUser(referrer: string): Promise<ethers.ContractTransaction>;
  sendRemittance(
    recipient: string,
    amount: BigNumber,
    recipientCountry: string
  ): Promise<ethers.ContractTransaction>;
  completeTransfer(txId: BigNumber): Promise<ethers.ContractTransaction>;
  withdrawCashback(): Promise<ethers.ContractTransaction>;
  withdrawReferralRewards(): Promise<ethers.ContractTransaction>;
  setTransferFee(
    newFeePercentage: BigNumber
  ): Promise<ethers.ContractTransaction>;
  setCashbackPercentage(
    newPercentage: BigNumber
  ): Promise<ethers.ContractTransaction>;
  setLargeTransactionThreshold(
    newThreshold: BigNumber
  ): Promise<ethers.ContractTransaction>;
  withdrawFees(amount: BigNumber): Promise<ethers.ContractTransaction>;

  // Events
  on(
    eventName: "TransferInitiated",
    listener: (
      txId: BigNumber,
      sender: string,
      recipient: string,
      amount: BigNumber,
      fee: BigNumber,
      recipientCountry: string
    ) => void
  ): void;
  on(
    eventName: "CashbackAwarded",
    listener: (user: string, amount: BigNumber) => void
  ): void;
  on(
    eventName: "ReferralRewardAwarded",
    listener: (
      referrer: string,
      referred: string,
      amount: BigNumber
    ) => void
  ): void;
  on(
    eventName: "UserRegistered",
    listener: (user: string, referrer: string) => void
  ): void;
  on(
    eventName: "FeeUpdated",
    listener: (newFeePercentage: BigNumber) => void
  ): void;
}

// Factory for creating contract instances
export const RemittanceService__factory = {
  connect: (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
    return new ethers.Contract(address, RemittanceServiceABI, signerOrProvider) as unknown as RemittanceService;
  },
  abi: RemittanceServiceABI,
};

// Export types that match the useWallet.ts expectations
export type Remittance = RemittanceService;
export const Remittance__factory = RemittanceService__factory;








