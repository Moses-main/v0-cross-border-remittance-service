import { createWalletClient, custom, http, WalletClient, Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Account } from '@base-org/account';

export type WalletType = 'metamask' | 'base' | 'coinbase' | null;

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  walletType: WalletType;
  walletClient: WalletClient | null;
}

class WalletService {
  private static instance: WalletService;
  private walletClient: WalletClient | null = null;
  private account: `0x${string}` | null = null;
  private chainId: number | null = null;
  private walletType: WalletType = null;
  private listeners: Array<(state: WalletState) => void> = [];

  private constructor() {
    // Initialize with window.ethereum if available
    if (typeof window !== 'undefined' && window.ethereum) {
      this.initializeEthereumListeners();
    }
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  private async initializeEthereumListeners() {
    if (typeof window === 'undefined') return;

    // Handle account changes
    window.ethereum?.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0] as `0x${string}`;
        this.notifyListeners();
      }
    });

    // Handle chain changes
    window.ethereum?.on('chainChanged', (chainId: string) => {
      this.chainId = parseInt(chainId, 16);
      this.notifyListeners();
      // Reload the page when the chain changes
      window.location.reload();
    });
  }

  public async connect(walletType: 'metamask' | 'base' | 'coinbase' = 'metamask'): Promise<WalletState> {
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called in the browser');
    }

    try {
      let accounts: string[] = [];
      
      if (walletType === 'base') {
        // Initialize Base Wallet
        const account = new Account({
          appName: 'BetaRemit',
          appIcon: '/logo.png',
          chain: baseSepolia,
        });
        
        // Request connection
        const { address } = await account.connect();
        this.account = address as `0x${string}`;
        this.chainId = baseSepolia.id;
        this.walletType = 'base';
        
        // Create wallet client
        this.walletClient = createWalletClient({
          account: this.account,
          chain: baseSepolia,
          transport: http(),
        });
      } else {
        // For MetaMask and other injected providers
        if (!window.ethereum) {
          throw new Error('No Ethereum wallet found. Please install MetaMask or another compatible wallet.');
        }

        // Request account access
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        this.account = accounts[0] as `0x${string}`;
        this.walletType = walletType;
        
        // Get chain ID
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        this.chainId = parseInt(chainIdHex, 16);
        
        // Create wallet client
        this.walletClient = createWalletClient({
          account: this.account,
          chain: baseSepolia,
          transport: custom(window.ethereum),
        });
      }

      this.notifyListeners();
      return this.getState();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      );
    }
  }

  public async disconnect(): Promise<void> {
    this.walletClient = null;
    this.account = null;
    this.chainId = null;
    this.walletType = null;
    this.notifyListeners();
  }

  public getState(): WalletState {
    return {
      isConnected: !!this.account,
      address: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
      walletClient: this.walletClient,
    };
  }

  public addListener(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    // Initial notification
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async switchToBaseSepolia(): Promise<boolean> {
    if (!this.walletClient) return false;
    
    try {
      await this.walletClient.switchChain({
        id: baseSepolia.id,
      });
      return true;
    } catch (error) {
      console.error('Error switching to Base Sepolia:', error);
      return false;
    }
  }
}

export const walletService = WalletService.getInstance();

export function useWallet() {
  const [state, setState] = useState<WalletState>(walletService.getState());

  useEffect(() => {
    const unsubscribe = walletService.addListener(newState => {
      setState(newState);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const connect = useCallback(async (walletType: 'metamask' | 'base' | 'coinbase' = 'metamask') => {
    return walletService.connect(walletType);
  }, []);

  const disconnect = useCallback(async () => {
    return walletService.disconnect();
  }, []);

  const switchToBaseSepolia = useCallback(async () => {
    return walletService.switchToBaseSepolia();
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchToBaseSepolia,
  };
}

export default walletService;
