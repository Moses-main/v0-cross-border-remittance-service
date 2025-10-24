import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  disconnectWallet as disconnectWalletService,
  switchToBaseSepolia,
  getWalletState,
  isWalletAvailable,
} from "@/utils/walletServices";
import {
  initiateTransfer as initiateTransferService,
  registerUser as registerUserService,
  withdrawCashback as withdrawCashbackService,
  getCallsStatus,
  waitForBatchConfirmation,
} from "@/utils/paymentService";
import { Remittance, Remittance__factory } from "@/lib/typechain-types";
import { TransferParams, UserInfo, TransactionInfo } from "@/utils/types";

// Contract ABI and address
const REMITTANCE_CONTRACT_ADDRESS =
  (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS) ||
  "";

interface UseWalletReturn {
  // Wallet state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  provider: any | null;
  signer: any | null;
  contract: Remittance | null;

  // Wallet methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<boolean>;

  // Contract methods
  registerUser: (referrer: string) => Promise<string>;
  initiateTransfer: (params: TransferParams) => Promise<{ txHash: string }>;
  withdrawCashback: (tokenAddress: string) => Promise<string>;

  // User data
  userInfo: UserInfo | null;
  transactions: TransactionInfo[];
  loading: {
    userInfo: boolean;
    transactions: boolean;
    transaction: boolean;
  };

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useWallet = (): UseWalletReturn => {
  // Wallet state
  const [state, setState] = useState<{
    isConnected: boolean;
    isConnecting: boolean;
    account: string | null;
    chainId: number | null;
    provider: any | null;
    signer: any | null;
    contract: Remittance | null;
    userInfo: UserInfo | null;
    transactions: TransactionInfo[];
    loading: {
      userInfo: boolean;
      transactions: boolean;
      transaction: boolean;
    };
    error: string | null;
  }>({
    isConnected: false,
    isConnecting: true, // Start with connecting state to check initial connection
    account: null,
    chainId: null,
    provider: null,
    signer: null,
    contract: null,
    userInfo: null,
    transactions: [],
    loading: {
      userInfo: false,
      transactions: false,
      transaction: false,
    },
    error: null,
  });

  // Initialize wallet state on mount
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") return;

      try {
        const walletState = await getWalletState();

        setState((prev) => ({
          ...prev,
          ...walletState,
          isConnecting: false,
        }));

        // If wallet is connected, initialize contract and fetch data
        if (
          walletState.isConnected &&
          walletState.provider &&
          walletState.address
        ) {
          await initializeContract(walletState.provider, walletState.address);
          await fetchUserData(walletState.address);
        } else {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
          }));
        }
      } catch (error) {
        console.error("Error initializing wallet:", error);
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to initialize wallet",
        }));
      }
    };

    init();

    // Set up event listeners for account and chain changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setState((prev) => ({
          ...prev,
          isConnected: false,
          account: null,
          signer: null,
          contract: null,
          userInfo: null,
          transactions: [],
        }));
      } else if (accounts[0] !== state.account) {
        // Account changed
        const newAccount = accounts[0].toLowerCase();
        setState((prev) => ({
          ...prev,
          address: newAccount,
          account: newAccount, // Keep both for compatibility
        }));

        // Re-initialize contract and fetch data for the new account
        if (state.provider) {
          initializeContract(state.provider, newAccount);
          fetchUserData(newAccount);
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      // Reload the page when the chain changes
      window.location.reload();
    };

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  /**
   * Initialize the contract instance
   */
  const initializeContract = useCallback(
    async (provider: any, account: string) => {
      try {
        // Create a signer
        const web3Provider = new ethers.BrowserProvider(provider);
        const signer = await web3Provider.getSigner(account);

        // Create contract instance
        const contract = Remittance__factory.connect(
          REMITTANCE_CONTRACT_ADDRESS,
          signer
        ) as any;

        setState((prev) => ({
          ...prev,
          provider: web3Provider,
          signer,
          contract,
        }));

        return { provider: web3Provider, signer, contract };
      } catch (error) {
        console.error("Error initializing contract:", error);
        throw new Error("Failed to initialize contract");
      }
    },
    []
  );

  /**
   * Fetch user data from the contract
   */
  const fetchUserData = useCallback(
    async (account: string) => {
      if (!state.contract) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            userInfo: true,
          },
        }));

        // Fetch user info
        const userInfo = await state.contract.getUser(account);

        // Fetch user transactions
        const transactionIds = await state.contract.getUserTransactions(account);
        const transactions: TransactionInfo[] = [];

        // Fetch the latest 10 transactions
        const count = Math.min(Number(transactionIds.length), 10);
        for (let i = 0; i < count; i++) {
          const txId = transactionIds[i];
          if (txId > 0) {
            const tx = await state.contract.getTransaction(txId);
            transactions.push({
              id: txId,
              sender: tx.sender,
              recipient: tx.recipient,
              amount: tx.amount,
              token: tx.token,
              recipientCountry: tx.recipientCountry,
              fee: tx.fee,
              cashback: tx.cashback,
              timestamp: Number(tx.timestamp),
              completed: tx.completed,
              txHash: "", // Not available from contract, will be set by transaction service
            });
          }
        }

        setState((prev) => ({
          ...prev,
          userInfo: {
            isRegistered: userInfo.isRegistered,
            referrer: userInfo.referrer,
            totalTransferred: userInfo.totalTransferred,
            totalReceived: userInfo.totalReceived,
            cashbackEarned: userInfo.cashbackEarned,
            referralRewards: userInfo.referralRewards,
            referralCount: Number(userInfo.referralCount),
            lastActivity: Number(userInfo.lastActivity),
          },
          transactions,
          loading: {
            ...prev.loading,
            userInfo: false,
          },
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            userInfo: false,
          },
          error: "Failed to fetch user data",
        }));
      }
    },
    [state.contract]
  );

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      const { address, provider } = await connectWallet();

      // Switch to Base Sepolia
      await switchToBaseSepolia(provider);

      // Initialize contract
      const { contract, signer } = await initializeContract(provider, address);

      // Fetch user data
      await fetchUserData(address);

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        account: address,
        provider,
        signer,
        contract,
      }));
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          error instanceof Error ? error.message : "Failed to connect wallet",
      }));
    }
  }, [initializeContract, fetchUserData]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      if (state.signer?.provider) {
        await disconnectWalletService(state.signer.provider);
      }

      setState((prev) => ({
        ...prev,
        isConnected: false,
        account: null,
        signer: null,
        contract: null,
        userInfo: null,
        transactions: [],
      }));
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to disconnect wallet",
      }));
    }
  }, [state.signer]);

  /**
   * Switch to Base Sepolia network
   */
  const switchNetwork = useCallback(async () => {
    if (!state.provider) return false;

    try {
      return await switchToBaseSepolia(state.provider);
    } catch (error) {
      console.error("Error switching network:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to switch network",
      }));
      return false;
    }
  }, [state.provider]);

  /**
   * Register a new user
   */
  const registerUser = useCallback(
    async (referrer: string) => {
      if (!state.contract || !state.account) {
        throw new Error("Wallet not connected");
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: true,
          },
          error: null,
        }));

        const tx = await registerUserService(
          state.provider,
          state.account,
          referrer,
          true, // use paymaster
          {
            url:
              (typeof process !== "undefined" &&
                process.env?.NEXT_PUBLIC_PAYMASTER_URL) ||
              "",
            policyId:
              typeof process !== "undefined" &&
              process.env?.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
          }
        );

        // Wait for transaction confirmation
        await waitForBatchConfirmation(state.provider, tx.txHash);

        // Refresh user data
        await fetchUserData(state.account);

        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
        }));

        return tx;
      } catch (error) {
        console.error("Error registering user:", error);
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
          error:
            error instanceof Error ? error.message : "Failed to register user",
        }));
        throw error;
      }
    },
    [state.contract, state.account, state.provider, fetchUserData]
  );

  /**
   * Initiate a transfer
   */
  const initiateTransfer = useCallback(
    async (params: TransferParams) => {
      if (!state.contract || !state.account) {
        throw new Error("Wallet not connected");
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: true,
          },
          error: null,
        }));

        const tx = await initiateTransferService(
          state.provider,
          state.account,
          params,
          true, // use paymaster
          {
            url:
              (typeof process !== "undefined" &&
                process.env?.NEXT_PUBLIC_PAYMASTER_URL) ||
              "",
            policyId:
              typeof process !== "undefined" &&
              process.env?.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
          }
        );

        // Wait for transaction confirmation
        await waitForBatchConfirmation(state.provider, tx.txHash);

        // Refresh user data
        await fetchUserData(state.account);

        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
        }));

        return tx;
      } catch (error) {
        console.error("Error initiating transfer:", error);
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
          error:
            error instanceof Error
              ? error.message
              : "Failed to initiate transfer",
        }));
        throw error;
      }
    },
    [state.contract, state.account, state.provider, fetchUserData]
  );

  /**
   * Withdraw cashback
   */
  const withdrawCashback = useCallback(
    async (tokenAddress: string) => {
      if (!state.contract || !state.account) {
        throw new Error("Wallet not connected");
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: true,
          },
          error: null,
        }));

        const tx = await withdrawCashbackService(
          state.provider,
          state.account,
          tokenAddress,
          true, // use paymaster
          {
            url:
              (typeof process !== "undefined" &&
                process.env?.NEXT_PUBLIC_PAYMASTER_URL) ||
              "",
            policyId:
              typeof process !== "undefined" &&
              process.env?.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
          }
        );

        // Wait for transaction confirmation
        await waitForBatchConfirmation(state.provider, tx.txHash);

        // Refresh user data
        await fetchUserData(state.account);

        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
        }));

        return tx;
      } catch (error) {
        console.error("Error withdrawing cashback:", error);
        setState((prev) => ({
          ...prev,
          loading: {
            ...prev.loading,
            transaction: false,
          },
          error:
            error instanceof Error
              ? error.message
              : "Failed to withdraw cashback",
        }));
        throw error;
      }
    },
    [state.contract, state.account, state.provider, fetchUserData]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Wallet state
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      account: state.account,
      chainId: state.chainId,
      provider: state.provider,
      signer: state.signer,
      contract: state.contract,

      // User data
      userInfo: state.userInfo,
      transactions: state.transactions,
      loading: state.loading,

      // Error handling
      error: state.error,
      clearError,

      // Wallet methods
      connect,
      disconnect,
      switchNetwork,

      // Contract methods
      registerUser,
      initiateTransfer,
      withdrawCashback,
    }),
    [
      state.isConnected,
      state.isConnecting,
      state.account,
      state.chainId,
      state.provider,
      state.signer,
      state.contract,
      state.userInfo,
      state.transactions,
      state.loading,
      state.error,
      clearError,
      connect,
      disconnect,
      switchNetwork,
      registerUser,
      initiateTransfer,
      withdrawCashback,
    ]
  );
};
