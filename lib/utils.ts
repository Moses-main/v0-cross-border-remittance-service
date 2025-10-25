import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  if (!address) return ''
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}
