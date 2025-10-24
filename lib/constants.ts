import { ERC20_ABI } from "./web3-config";

// Re-export ERC20_ABI for convenience
export { ERC20_ABI };

// Base Sepolia token addresses
export const TOKEN_ADDRESSES = {
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
  USDT: "0xfad636016e34182822db5c4a4e9b887aa4b8c8b8", // USDT on Base Sepolia
} as const;

export const SUPPORTED_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "💵",
    address: TOKEN_ADDRESSES.USDC,
    abi: ERC20_ABI,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    icon: "💵",
    address: TOKEN_ADDRESSES.USDT,
    abi: ERC20_ABI,
  },
] as const;

// Supported countries and their currencies
export const SUPPORTED_COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN", rate: 1550 },
  { code: "KE", name: "Kenya", currency: "KES", rate: 130 },
  { code: "GH", name: "Ghana", currency: "GHS", rate: 12.5 },
  { code: "IN", name: "India", currency: "INR", rate: 83.5 },
  { code: "PH", name: "Philippines", currency: "PHP", rate: 56.2 },
  { code: "BD", name: "Bangladesh", currency: "BDT", rate: 109.5 },
  { code: "PK", name: "Pakistan", currency: "PKR", rate: 278.5 },
  { code: "UG", name: "Uganda", currency: "UGX", rate: 3850 },
  { code: "TZ", name: "Tanzania", currency: "TZS", rate: 2550 },
  { code: "ZA", name: "South Africa", currency: "ZAR", rate: 18.5 },
] as const;

// Transaction fees and rewards
export const FEE_STRUCTURE = {
  transferFeePercentage: 0.5, // 0.5%
  cashbackPercentage: 1.0, // 1% cashback for large transactions
  largeTransactionThreshold: 1000, // $1000 threshold for cashback
  referralRewardPercentage: 0.5, // 0.5% referral reward
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia
  chainName: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorerUrl: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
} as const;