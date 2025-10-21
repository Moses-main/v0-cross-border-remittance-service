"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

const BASE_SEPOLIA_CHAIN_ID = 84532

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)

            // Get current chain ID
            const chainIdHex = await window.ethereum.request({
              method: "eth_chainId",
            })
            setChainId(Number.parseInt(chainIdHex, 16))
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)

          // Switch to Base Sepolia if not already on it
          try {
            const chainIdHex = await window.ethereum.request({
              method: "eth_chainId",
            })
            const currentChainId = Number.parseInt(chainIdHex, 16)
            setChainId(currentChainId)

            if (currentChainId !== BASE_SEPOLIA_CHAIN_ID) {
              try {
                await window.ethereum.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
                })
              } catch (switchError: any) {
                // Chain doesn't exist, add it
                if (switchError.code === 4902) {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
                        chainName: "Base Sepolia",
                        rpcUrls: ["https://sepolia.base.org"],
                        nativeCurrency: {
                          name: "Ethereum",
                          symbol: "ETH",
                          decimals: 18,
                        },
                        blockExplorerUrls: ["https://sepolia.basescan.org"],
                      },
                    ],
                  })
                }
              }
            }
          } catch (chainError) {
            console.error("Failed to switch chain:", chainError)
          }
        }
      } else {
        setError("MetaMask or Web3 wallet not detected. Please install MetaMask.")
      }
    } catch (err: any) {
      console.error("Failed to connect wallet:", err)
      setError(err.message || "Failed to connect wallet")
      setIsConnected(false)
      setAddress(null)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
    setError(null)
  }, [])

  return (
    <Web3Context.Provider
      value={{ isConnected, address, chainId, connectWallet, disconnectWallet, isConnecting, error }}
    >
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
