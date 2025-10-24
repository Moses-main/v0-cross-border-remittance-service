import { baseSepolia } from "viem/chains";
import { WalletProvider, WalletSDK, WalletState } from "./types";
import {
  isWalletSendCallsSupported,
  isConnectedToChain,
  getCurrentChainId,
  getCurrentAccount,
  addChainIfNeeded
} from "./walletProvider";

/**
 * Check if MetaMask or compatible wallet is available
 */
export const getEthereumProvider = (): WalletProvider | null => {
  if (typeof window === "undefined") return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  return {
    request: async (args: { method: string; params?: any[] }) => {
      return ethereum.request(args);
    },
    on: (event: string, handler: (...args: any[]) => void) => {
      ethereum.on(event, handler);
    },
    removeListener: (event: string, handler: (...args: any[]) => void) => {
      ethereum.removeListener(event, handler);
    },
    chainId: ethereum.chainId,
    selectedAddress: ethereum.selectedAddress,
  };
};

/**
 * Checks if MetaMask or compatible wallet is available
 *
 * @returns {boolean} True if the wallet is available
 */
export const isWalletAvailable = (): boolean => {
  return getEthereumProvider() !== null;
};

/**
 * Connects to the user's MetaMask wallet
 *
 * Initiates the wallet connection flow, requesting account access from the user.
 * Returns the connected account address, provider, and chain ID.
 *
 * @returns {Promise<{
 *   address: string;
 *   provider: WalletProvider;
 *   chainId: number;
 * }>} Object containing wallet connection details
 *
 * @throws {Error} If provider is unavailable or no accounts are returned
 */
export const connectWallet = async () => {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("MetaMask or compatible wallet not available");
  }

  try {
    // Request account access
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet");
    }

    // Get the current chain ID
    const chainIdHex = await provider.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(chainIdHex, 16);

    return {
      address: accounts[0].toLowerCase(),
      provider,
      chainId,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to connect wallet"
    );
  }
};

/**
 * Switches the wallet to Base Sepolia network
 * 
 * Checks the current network and switches to Base Sepolia if needed.
 * If the network is not added to the wallet, it will be added automatically.
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @returns {Promise<boolean>} True if switch is successful, false otherwise
 * 
 * @example
 * const success = await switchToBaseSepolia(provider);
 * if (success) {
 *   console.log('Switched to Base Sepolia');
 * }
 */
export const switchToBaseSepolia = async (
  provider: WalletProvider
): Promise<boolean> => {
  try {
    const baseSepoliaChainId = `0x${baseSepolia.id.toString(16)}`;
    const currentChainId = await provider.request({
      method: "eth_chainId",
    }) as string;

    // If already on Base Sepolia, return early
    if (currentChainId === baseSepoliaChainId) {
      return true;
    }

    try {
      // Try to switch to Base Sepolia
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: baseSepoliaChainId }],
      });
      return true;
    } catch (switchError: any) {
      // 4902: Chain not added to wallet
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: baseSepoliaChainId,
                chainName: baseSepolia.name,
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [baseSepolia.rpcUrls.default.http[0]],
                blockExplorerUrls: [baseSepolia.blockExplorers?.default?.url],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding Base Sepolia:", addError);
          return false;
        }
      }
      // User rejected the request
      if (switchError.code === 4001) {
        console.log("User rejected the switch to Base Sepolia");
        return false;
      }
      console.error("Error switching to Base Sepolia:", switchError);
      return false;
    }
  } catch (error) {
    console.error("Error in switchToBaseSepolia:", error);
    return false;
  }
};

/**
 * Disconnects the wallet by clearing local state
 * Note: MetaMask doesn't have a disconnect method, so we just clear our local state
 *
 * @param {WalletProvider} provider - The wallet provider instance
 * @returns {Promise<boolean>} True if disconnection is successful, false otherwise
 *
 * @example
 * await disconnectWallet(provider);
 * console.log('Wallet disconnected');
 */
export const disconnectWallet = async (provider: WalletProvider): Promise<boolean> => {
  try {
    // MetaMask doesn't have a disconnect method, so we just return success
    // The actual disconnection happens when the user disconnects in their wallet
    return true;
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    return false;
  }
};

/**
 * Gets the current wallet state using standard MetaMask
 *
 * @returns {Promise<WalletState>} The current wallet state
 */
export const getWalletState = async (): Promise<WalletState> => {
  const provider = getEthereumProvider();
  if (!provider) {
    return {
      address: null,
      account: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
      contract: null,
    };
  }

  try {
    // Check if already connected by getting accounts
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    if (!accounts || accounts.length === 0) {
      return {
        address: null,
        account: null,
        chainId: null,
        isConnected: false,
        provider,
        signer: null,
        contract: null,
      };
    }

    // Get current chain ID
    const chainIdHex = await provider.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(chainIdHex, 16);

    return {
      address: accounts[0].toLowerCase(),
      account: accounts[0].toLowerCase(), // Alias for compatibility
      chainId,
      isConnected: true,
      provider,
      signer: null, // Will be set by the useWeb3 hook
      contract: null, // Will be set by the useWeb3 hook
    };
  } catch (error) {
    console.error("Error getting wallet state:", error);
    return {
      address: null,
      account: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
      contract: null,
    };
  }
};
