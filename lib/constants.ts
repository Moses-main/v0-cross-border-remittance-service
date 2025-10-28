// import { ERC20_ABI } from "./web3-config";
import { base } from "@base-org/account";
import type { Address } from "viem";

// Re-export ERC20_ABI for convenience
// export { ERC20_ABI };

// ERC20 ABI for USDC transfers
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Utility functions
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(
  amount: string | number,
  currency: string = "USDC"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toFixed(2)} ${currency}`;
}

export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

// Base Sepolia Configuration
export const BASE_SEPOLIA_CHAIN_ID = base.constants.CHAIN_IDS.baseSepolia; // 84532
export const BASE_MAINNET_CHAIN_ID = base.constants.CHAIN_IDS.base; // 8453

// USDC Contract on Base Sepolia
export const USDC_CONTRACT_ADDRESS: Address =
  "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4";

// Base Sepolia token addresses
export const TOKEN_ADDRESSES = {
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia (testnet address)
  USDT: "0xfad636016e34182822db5c4a4e9b887aa4b8c8b8", // USDT on Base Sepolia
  // Canonical WETH on Base (also applicable on Base Sepolia testnet)
  ETH: "0x4200000000000000000000000000000000000006",
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
