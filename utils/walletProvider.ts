import { WalletCapabilities, WalletProvider } from './types';

/**
 * Checks if the wallet provider supports EIP-5792 wallet_sendCalls with paymaster
 * 
 * This function queries the wallet's capabilities to determine if it supports
 * the paymaster service feature, which enables gasless transactions.
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @returns {Promise<boolean>} True if paymaster service is supported, false otherwise
 * 
 * @example
 * const isSupported = await isWalletSendCallsSupported(provider);
 * if (isSupported) {
 *   console.log('Wallet supports gasless transactions!');
 * }
 */
export const isWalletSendCallsSupported = async (provider: WalletProvider): Promise<boolean> => {
  // Basic provider validation
  if (!provider || typeof provider.request !== 'function') return false;

  try {
    // Query wallet capabilities using EIP-5792
    const capabilities = await provider.request({
      method: 'wallet_getCapabilities',
      params: []
    }) as WalletCapabilities;

    // Check if any chain supports paymaster service
    if (capabilities) {
      return Object.values(capabilities).some(
        chainCapabilities => chainCapabilities?.paymasterService?.supported
      );
    }
    return false;
  } catch (error) {
    console.error('Error checking wallet capabilities:', error);
    // Fallback: check if provider has request method
    return typeof provider.request === 'function';
  }
};

/**
 * Checks if the wallet is connected to the specified chain
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @param {number} chainId - The chain ID to check against
 * @returns {Promise<boolean>} True if connected to the specified chain
 */
export const isConnectedToChain = async (
  provider: WalletProvider,
  chainId: number
): Promise<boolean> => {
  try {
    const currentChainId = await provider.request({
      method: 'eth_chainId',
      params: []
    }) as `0x${string}`;
    return parseInt(currentChainId, 16) === chainId;
  } catch (error) {
    console.error('Error checking chain ID:', error);
    return false;
  }
};

/**
 * Gets the current chain ID from the wallet
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @returns {Promise<number | null>} The current chain ID or null if not available
 */
export const getCurrentChainId = async (provider: WalletProvider): Promise<number | null> => {
  try {
    const chainIdHex = await provider.request({
      method: 'eth_chainId',
      params: []
    }) as `0x${string}`;
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Gets the current account address from the wallet
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @returns {Promise<string | null>} The current account address or null if not connected
 */
export const getCurrentAccount = async (provider: WalletProvider): Promise<string | null> => {
  try {
    const accounts = await provider.request({
      method: 'eth_accounts',
      params: []
    }) as string[];
    return accounts?.[0]?.toLowerCase() || null;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return null;
  }
};

/**
 * Adds a chain to the wallet if it's not already added
 * 
 * @param {WalletProvider} provider - The wallet provider instance
 * @param {Object} chainParams - The chain parameters to add
 * @returns {Promise<boolean>} True if the chain was added or already exists, false otherwise
 */
export const addChainIfNeeded = async (
  provider: WalletProvider,
  chainParams: {
    chainId: `0x${string}`;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
  }
): Promise<boolean> => {
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [chainParams]
    });
    return true;
  } catch (error) {
    // 4001 error means the user rejected the request
    if ((error as { code?: number })?.code === 4001) {
      console.log('User rejected adding the chain');
      return false;
    }
    // 4902 error means the chain is already added
    if ((error as { code?: number })?.code === 4001) {
      return true;
    }
    console.error('Error adding chain:', error);
    return false;
  }
};
