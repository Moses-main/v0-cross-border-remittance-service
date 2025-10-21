"use client"

import { useState, useCallback } from "react"
import { BASE_SEPOLIA_CONFIG } from "@/lib/web3-config"

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Switch to Base Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_SEPOLIA_CONFIG.chainId.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_SEPOLIA_CONFIG.chainId.toString(16)}`,
                chainName: BASE_SEPOLIA_CONFIG.chainName,
                rpcUrls: [BASE_SEPOLIA_CONFIG.rpcUrl],
                blockExplorerUrls: [BASE_SEPOLIA_CONFIG.blockExplorerUrl],
                nativeCurrency: BASE_SEPOLIA_CONFIG.nativeCurrency,
              },
            ],
          })
        }
      }

      setAccount(accounts[0])
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setIsConnected(false)
  }, [])

  return {
    account,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
  }
}
