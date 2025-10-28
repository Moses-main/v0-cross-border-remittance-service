import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an Ethereum address to a shorter version
 * @param address The full Ethereum address
 * @param startLength Number of characters to show at the start (default: 6)
 * @param endLength Number of characters to show at the end (default: 4)
 * @returns Formatted address (e.g., 0x1234...5678)
 */
export function formatAddress(
  address: string | null | undefined,
  startLength = 6,
  endLength = 4
): string {
  if (!address) return "";
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

// Base Sepolia Configuration
export const CHAIN_CONFIG = {
  chainId: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
} as const;

export const CONTRACTS = {
  USDC: "0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4" as const,
} as const;

export function formatCurrency(
  amount: string | number,
  currency: string = "USDC"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toFixed(2)} ${currency}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateTxHash(): string {
  return `0x${Math.random().toString(16).substring(2, 66)}`;
}
