declare module '@/services/remittance-service' {
  export class RemittanceService {
    getUSDCBalance(address: `0x${string}`): Promise<bigint>;
    getAllowance(owner: `0x${string}`, spender?: `0x${string}`): Promise<bigint>;
    approveUSDC(amount: bigint): Promise<any>;
    executeGroupPayment(
      sender: `0x${string}`,
      recipients: { address: `0x${string}`; amount: string }[],
      tokenAddress?: `0x${string}`
    ): Promise<{
      transactionHash: string;
      status: 'success' | 'failed';
      blockNumber: bigint;
    }>;
  }
  
  export const remittanceService: RemittanceService;
}
