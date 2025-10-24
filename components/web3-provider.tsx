"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useWallet } from "@/hooks/useWallet"

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  account: string | null // Alias for address for compatibility
  chainId: number | null
  provider: any
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  // Smart contract methods
  initiateTransfer: (params: any) => Promise<{ txHash: string }>
  registerUser: (referrer: string) => Promise<string>
  withdrawCashback: (tokenAddress: string) => Promise<string>
  // User data
  userInfo: any
  transactions: any[]
  loading: {
    userInfo: boolean
    transactions: boolean
    transaction: boolean
  }
  clearError: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  // Use the useWallet hook for full smart contract functionality
  const wallet = useWallet()

  const contextValue: Web3ContextType = {
    ...wallet,
    connectWallet: wallet.connect,
    disconnectWallet: wallet.disconnect,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    address: wallet.account, // Map account to address for compatibility
    account: wallet.account, // Keep both for compatibility
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
