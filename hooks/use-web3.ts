"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ethers } from "ethers"
import { 
  USDC_ADDRESS,
  USDC_ABI,
  REMITTANCE_ABI,
  ERC20_ABI 
} from "@/lib/web3-config"
import { 
  registerUser as registerUserService,
  initiateTransfer as initiateTransferService,
  withdrawCashback as withdrawCashbackService,
  getUserInfo as getUserInfoService,
  getUserTransactions as getUserTransactionsService
} from "@/utils/paymentService"
import { useWallet } from "./useWallet"

// Helper functions for formatting
const formatEther = (wei: ethers.BigNumberish) => {
  return ethers.formatEther(wei)
}

const formatUnits = (value: ethers.BigNumberish, decimals: number = 6) => {
  return ethers.formatUnits(value, decimals)
}

// ERC20 ABI - Imported from web3-config

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: number
  token: string
  txHash?: string
}

interface UserInfo {
  isRegistered: boolean
  referrer: string
  totalTransferred: string
  totalReceived: string
  cashbackEarned: string
  referralRewards: string
  referralCount: number
  lastActivity: number
}

interface Web3State {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  usdcContract: ethers.Contract | null
  balance: string
  usdcBalance: string
  transactions: Transaction[]
  userInfo: UserInfo | null
}

interface Web3Actions {
  connectWallet: () => Promise<string | undefined>
  disconnectWallet: () => void
  registerUser: (referrer: string) => Promise<string | undefined>
  initiateTransfer: (
    recipient: string,
    amount: string,
    recipientCountry: string,
    tokenAddress: string
  ) => Promise<{ txHash: string; blockNumber: number; timestamp: number } | undefined>
  withdrawCashback: (tokenAddress: string) => Promise<string | undefined>
  fetchUserTransactions: (userAddress: string, start?: number, count?: number) => Promise<Transaction[] | undefined>
  getUserInfo: (userAddress: string) => Promise<UserInfo | undefined>
  clearError: () => void
  getBalance: () => Promise<string>
  getUSDCBalance: () => Promise<string>
}

export function useWeb3(): Web3State & Web3Actions {
  // State from useWallet
  const {
    account: walletAccount,
    isConnected: walletIsConnected,
    isConnecting: walletIsConnecting,
    provider: walletProvider,
    signer: walletSigner,
    contract: walletContract,
    error: walletError,
    connect: walletConnect,
    disconnect: walletDisconnect,
    registerUser: walletRegisterUser,
    initiateTransfer: walletInitiateTransfer,
    withdrawCashback: walletWithdrawCashback,
    clearError: walletClearError,
    userInfo: walletUserInfo,
    transactions: walletTransactions = []
  } = useWallet()
  
  // Local state for additional data
  const [state, setState] = useState<Omit<Web3State, keyof Web3Actions>>({
    account: walletAccount || null,
    isConnected: walletIsConnected,
    isLoading: walletIsConnecting,
    error: walletError || null,
    provider: walletProvider || null,
    signer: walletSigner || null,
    contract: walletContract as any || null,
    usdcContract: null,
    balance: '0',
    usdcBalance: '0',
    transactions: walletTransactions as any,
    userInfo: walletUserInfo || null
  })

  // Update state helper
  const updateState = useCallback((updates: Partial<Web3State>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  // Update state with wallet data when wallet state changes
  useEffect(() => {
    const updateStateWithWalletData = async () => {
      const updates: Partial<Web3State> = {
        account: walletAccount || null,
        isConnected: walletIsConnected,
        provider: walletProvider || null,
        signer: walletSigner || null,
        contract: walletContract as any || null,
        userInfo: walletUserInfo || null,
        transactions: (walletTransactions as any) || [],
        error: walletError || null,
        isLoading: walletIsConnecting
      }
      
      if (walletAccount) {
        try {
          // Initialize USDC contract if needed
          if (walletProvider && walletSigner && !state.usdcContract) {
            const usdcContract = new ethers.Contract(
              USDC_ADDRESS,
              ERC20_ABI, // Using ERC20_ABI instead of USDC_ABI for consistency
              walletSigner
            )
            updates.usdcContract = usdcContract
          }
          
          // Fetch balances
          if (walletProvider) {
            try {
              const [balance, usdcBalance] = await Promise.all([
                walletProvider.getBalance(walletAccount).then(formatEther).catch(() => '0'),
                state.usdcContract?.balanceOf(walletAccount)
                  .then((balance: bigint) => formatUnits(balance, 6))
                  .catch(() => '0') || Promise.resolve('0')
              ])
              updates.balance = balance
              updates.usdcBalance = usdcBalance
            } catch (error) {
              console.error('Error fetching balances:', error)
            }
          }
        } catch (error) {
          console.error('Error updating wallet data:', error)
        }
      }
      
      updateState(updates)
    }
    
    updateStateWithWalletData()
  }, [walletAccount, walletIsConnected, walletProvider, walletSigner, walletContract, 
      walletUserInfo, walletTransactions, walletError, walletIsConnecting, updateState])

  // Update loading state when wallet is connecting
  useEffect(() => {
    updateState({ isLoading: walletIsConnecting })
  }, [walletIsConnecting, updateState])

  // Update error state when wallet error changes
  useEffect(() => {
    if (walletError) {
      updateState({ error: walletError })
    }
  }, [walletError, updateState])
  
  // Clear error function
  const clearError = useCallback(() => {
    updateState({ error: null })
    walletClearError?.()
  }, [walletClearError, updateState])

  // Get ETH balance
  const getBalance = useCallback(async (): Promise<string> => {
    if (!walletProvider || !walletAccount) return '0'
    
    try {
      const balance = await walletProvider.getBalance(walletAccount)
      const formattedBalance = formatEther(balance)
      updateState({ balance: formattedBalance })
      return formattedBalance
    } catch (error) {
      console.error('Error fetching balance:', error)
      updateState({ balance: '0' })
      return '0'
    }
  }, [walletProvider, walletAccount, updateState])

  // Get USDC balance
  const getUSDCBalance = useCallback(async (): Promise<string> => {
    if (!state.usdcContract || !walletAccount) return '0'
    
    try {
      const balance = await state.usdcContract.balanceOf(walletAccount)
      const formattedBalance = formatUnits(balance, 6)
      updateState({ usdcBalance: formattedBalance })
      return formattedBalance
    } catch (error) {
      console.error('Error fetching USDC balance:', error)
      updateState({ usdcBalance: '0' })
      return '0'
    }
  }, [state.usdcContract, walletAccount, updateState])

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async (
    userAddress: string, 
    start: number = 0, 
    count: number = 10
  ): Promise<Transaction[] | undefined> => {
    if (!walletProvider) return undefined
    
    try {
      updateState({ isLoading: true })
      
      const transactions = await getUserTransactionsService(
        walletProvider,
        userAddress as `0x${string}`,
        start,
        count
      )
      
      updateState({ transactions } as Partial<Web3State>)
      return transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      updateState({
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        transactions: []
      } as Partial<Web3State>)
      return []
    } finally {
      updateState({ isLoading: false })
    }
  }, [walletProvider, updateState])

  // Register a new user
  const registerUser = useCallback(async (referrer: string) => {
    if (!walletProvider || !walletAccount) throw new Error("Wallet not connected")
    
    try {
      updateState({ isLoading: true, error: null })
      
      // Use the wallet's registerUser function if available, otherwise use the service
      if (walletRegisterUser) {
        const result = await walletRegisterUser(referrer)
        return typeof result === 'string' ? result : (result as any)?.txHash || result
      }

      // Fallback to service if wallet doesn't provide the function
      if (!walletSigner) throw new Error("No signer available")

      const result = await registerUserService(
        walletProvider,
        walletAccount as `0x${string}`,
        referrer,
        true // usePaymaster
      )

      return typeof result.txHash === 'string' ? result.txHash : result.txHash
    } catch (error) {
      console.error('Error registering user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to register user'
      updateState({ error: errorMessage })
      throw error
    } finally {
      updateState({ isLoading: false })
    }
  }, [walletProvider, walletAccount, walletSigner, walletRegisterUser, updateState])

  // Initiate transfer function
  const initiateTransfer = useCallback(async (
    recipient: string,
    amount: string,
    recipientCountry: string,
    tokenAddress: string
  ): Promise<{ txHash: string; blockNumber: number; timestamp: number } | undefined> => {
    if (!walletProvider || !walletAccount) {
      throw new Error("Wallet not connected")
    }
    
    try {
      updateState({ isLoading: true, error: null })
      
      // Validate inputs
      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address")
      }
      
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Invalid amount")
      }
      
      // Convert amount to BigInt based on token decimals
      let amountBigInt: bigint
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // Native token (ETH/Base)
        amountBigInt = ethers.parseEther(amount)
      } else {
        // ERC20 token (USDC)
        if (!ethers.isAddress(tokenAddress)) {
          throw new Error("Invalid token address")
        }
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, walletProvider)
        const decimals = await tokenContract.decimals()
        amountBigInt = ethers.parseUnits(amount, decimals)
      }
      
      // Use the payment service to initiate transfer
      const result = await initiateTransferService(
        walletProvider,
        walletAccount as `0x${string}`,
        {
          recipient: recipient as `0x${string}`,
          amount: amountBigInt,
          recipientCountry,
          token: tokenAddress as `0x${string}`,
          value: 0n
        },
        true, // usePaymaster
        undefined // paymasterConfig
      )
      
      // Get transaction receipt to get block number
      let blockNumber = 0
      try {
        const receipt = await walletProvider.waitForTransaction(result.txHash)
        if (receipt?.blockNumber) {
          blockNumber = receipt.blockNumber
        }
      } catch (receiptError) {
        console.warn('Could not fetch transaction receipt:', receiptError)
      }
      
      // Refresh balances and transactions
      await Promise.all([
        getBalance(),
        getUSDCBalance(),
        fetchUserTransactions(walletAccount, 0, 10)
      ])
      
      // Return the result with the expected shape
      return {
        txHash: result.txHash,
        blockNumber,
        timestamp: Math.floor(Date.now() / 1000)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate transfer'
      console.error('Transfer error:', error)
      updateState({ error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      updateState({ isLoading: false })
    }
  }, [walletProvider, walletAccount, getBalance, getUSDCBalance, fetchUserTransactions, updateState])

  // Withdraw cashback function
  const withdrawCashback = useCallback(async (tokenAddress: string): Promise<string | undefined> => {
    if (!walletProvider || !walletAccount) {
      throw new Error("Wallet not connected")
    }
    
    try {
      updateState({ isLoading: true, error: null })
      
      // Use wallet's implementation if available
      if (walletWithdrawCashback) {
        const result = await walletWithdrawCashback(tokenAddress)
        await Promise.all([getBalance(), getUSDCBalance()])
        return result
      }
      
      // Fallback to service implementation
      if (!walletSigner) {
        throw new Error("No signer available")
      }
      
      const result = await withdrawCashbackService(
        walletProvider,
        walletAccount as `0x${string}`,
        tokenAddress as `0x${string}`,
        true, // usePaymaster
        undefined // paymasterConfig
      )
      
      // Refresh balances and user info
      await Promise.all([
        getBalance(),
        getUSDCBalance(),
        getUserInfo(walletAccount)
      ])
      
      return result.txHash
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw cashback'
      console.error('Withdraw error:', error)
      updateState({ error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      updateState({ isLoading: false })
    }
  }, [walletProvider, walletAccount, walletSigner, walletWithdrawCashback, getBalance, getUSDCBalance, updateState])

  // Get user info
  const getUserInfo = useCallback(async (userAddress: string): Promise<UserInfo | undefined> => {
    if (!walletProvider) return undefined
    
    try {
      updateState({ isLoading: true })
      
      // First try to get user info from wallet if available
      if (walletUserInfo) {
        return walletUserInfo
      }
      
      // Fall back to service if wallet doesn't provide user info
      const userInfo = await getUserInfoService(walletProvider, userAddress as `0x${string}`)
      
      if (userInfo) {
        updateState({ userInfo: userInfo as any })
      }
      
      return userInfo as any
    } catch (error) {
      console.error('Error fetching user info:', error)
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user info',
        userInfo: null
      })
      return undefined
    } finally {
      updateState({ isLoading: false })
    }
  }, [walletProvider, walletUserInfo, updateState])

  // Connect wallet function
  const connectWallet = useCallback(async (): Promise<string | undefined> => {
    try {
      await walletConnect()
      return walletAccount || undefined
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      updateState({ error: errorMessage })
      throw new Error(errorMessage)
    }
  }, [walletConnect, walletAccount, updateState])

  // Disconnect wallet function
  const disconnectWallet = useCallback((): void => {
    walletDisconnect()
    updateState({
      account: null,
      isConnected: false,
      provider: null,
      signer: null,
      contract: null,
      usdcContract: null,
      balance: '0',
      usdcBalance: '0',
      transactions: [],
      userInfo: null,
      error: null,
      isLoading: false
    })
  }, [walletDisconnect, updateState])

  // Return the hook value
  return useMemo(() => ({
    // State
    account: state.account,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    provider: state.provider,
    signer: state.signer,
    contract: state.contract,
    usdcContract: state.usdcContract,
    balance: state.balance,
    usdcBalance: state.usdcBalance,
    transactions: state.transactions,
    userInfo: state.userInfo,
    
    // Actions
    connectWallet,
    disconnectWallet,
    registerUser,
    initiateTransfer,
    withdrawCashback,
    fetchUserTransactions,
    getUserInfo,
    clearError,
    getBalance,
    getUSDCBalance
  }), [
    state,
    connectWallet,
    disconnectWallet,
    registerUser,
    initiateTransfer,
    withdrawCashback,
    fetchUserTransactions,
    getUserInfo,
    clearError,
    getBalance,
    getUSDCBalance
  ])
}
