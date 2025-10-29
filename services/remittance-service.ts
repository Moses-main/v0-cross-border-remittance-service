import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { parseUnits, formatUnits } from 'viem';
import { REMITTANCE_ABI, REMITTANCE_CONTRACT_ADDRESS, USDC_ADDRESS, USDC_ABI } from '@/lib/web3-config';

// Import paymaster service
import { paymasterService } from '@/lib/paymaster';

export class RemittanceService {
  private publicClient;
  private walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    if (typeof window !== 'undefined' && window.ethereum) {
      this.walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
    }
  }

  /**
   * Check if a user is registered
   */
  async isUserRegistered(address: `0x${string}`): Promise<boolean> {
    try {
      const userInfo = await this.publicClient.readContract({
        address: REMITTANCE_CONTRACT_ADDRESS,
        abi: REMITTANCE_ABI as any,
        functionName: 'getUserInfo',
        args: [address],
      });
      
      // userInfo[4] is the isActive flag
      return !!(userInfo && userInfo[4]);
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  /**
   * Register a new user (only called if paymaster handles the first transaction)
   */
  private async registerUser(address: `0x${string}`): Promise<boolean> {
    try {
      if (!this.walletClient) {
        throw new Error('Wallet client not available');
      }

      const [account] = await this.walletClient.getAddresses();
      
      // Use paymaster to sponsor the registration
      const result = await paymasterService.sponsorTransaction({
        to: REMITTANCE_CONTRACT_ADDRESS,
        data: this.encodeRegisterUserTx(account),
        value: '0',
        from: account,
      });

      return result.success;
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error('Failed to register user');
    }
  }

  /**
   * Encode the registerUser transaction data
   */
  private encodeRegisterUserTx(account: `0x${string}`) {
    return '0x' + 
      'a6f2ae3a' + // function selector for registerUser(address)
      '0000000000000000000000000000000000000000000000000000000000000000' + // zero address for referrer
      account.slice(2).padStart(64, '0'); // sender address
  }

  /**
   * Get USDC balance for an address
   */
  async getUSDCBalance(address: `0x${string}`): Promise<bigint> {
    try {
      const balance = await this.publicClient.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      
      return balance as bigint;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }

  /**
   * Check USDC allowance for the remittance contract
   */
  async getAllowance(owner: `0x${string}`, spender: `0x${string}` = REMITTANCE_CONTRACT_ADDRESS): Promise<bigint> {
    try {
      const allowance = await this.publicClient.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [owner, spender],
      });
      
      return allowance as bigint;
    } catch (error) {
      console.error('Error checking allowance:', error);
      throw new Error('Failed to check allowance');
    }
  }

  /**
   * Approve USDC spending by the remittance contract
   */
  async approveUSDC(amount: bigint) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const [address] = await this.walletClient.getAddresses();
      
      const { request } = await this.publicClient.simulateContract({
        account: address,
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [REMITTANCE_CONTRACT_ADDRESS, amount],
      });

      const hash = await this.walletClient.writeContract(request);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return receipt;
    } catch (error) {
      console.error('Approval failed:', error);
      throw new Error('Token approval failed');
    }
  }

  /**
   * Execute a group payment
   */
  async executeGroupPayment(
    sender: `0x${string}`,
    recipients: { address: `0x${string}`; amount: string }[],
    tokenAddress: `0x${string}` = USDC_ADDRESS
  ) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check if user is registered, if not, register them
      const isRegistered = await this.isUserRegistered(sender);
      if (!isRegistered) {
        // This will be handled by the paymaster
        console.log('User not registered, will be registered in the first transaction');
      }

      // Convert amounts to wei (USDC has 6 decimals)
      const amounts = recipients.map(r => parseUnits(r.amount, 6));
      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
      
      // Check and approve if needed
      const currentAllowance = await this.getAllowance(sender);
      if (currentAllowance < totalAmount) {
        await this.approveUSDC(totalAmount);
      }

      const [address] = await this.walletClient.getAddresses();
      
      // Prepare the transaction
      const { request } = await this.publicClient.simulateContract({
        account: address,
        address: REMITTANCE_CONTRACT_ADDRESS,
        abi: REMITTANCE_ABI as any,
        functionName: 'batchTransfer',
        args: [
          recipients.map(r => r.address), // recipients
          amounts, // amounts
          tokenAddress, // token address
        ],
      });

      // Send the transaction
      const hash = await this.walletClient.writeContract(request);
      
      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return {
        transactionHash: receipt.transactionHash,
        status: receipt.status === 'success' ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Group payment failed:', error);
      
      // Rethrow with a more user-friendly message
      let errorMessage = 'Transaction failed';
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction reverted by the contract';
        }
      }
      
      throw new Error(errorMessage);
    }
  }
}

export const remittanceService = new RemittanceService();
