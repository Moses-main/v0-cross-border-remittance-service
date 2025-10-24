'use client';

import { TransferForm } from '@/components/transfer/transfer-form';
import { Web3Provider } from '@/components/web3-provider';

export default function TransferPage() {
  return (
    <Web3Provider>
      <div className="container mx-auto py-10">
        <TransferForm />
      </div>
    </Web3Provider>
  );
}
