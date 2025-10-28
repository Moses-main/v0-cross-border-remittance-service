'use client';

import { TransferForm } from '@/components/TransferForm';
import { Toaster } from 'sonner';

export default function RemitPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Cross-Border Money Transfer</h1>
        <TransferForm />
        <Toaster position="top-center" richColors />
      </div>
    </div>
  );
}
