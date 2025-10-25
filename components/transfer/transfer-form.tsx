'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Simple toast implementation since we don't have the use-toast hook
const useToast = () => {
  const toast = (options: any) => {
    console.log('Toast:', options);
  };
  return { toast };
};

// Supported tokens
const SUPPORTED_TOKENS = [
  {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'USDT',
    decimals: 6,
  },
];

export function TransferForm() {
  const { 
    isConnected, 
    account, 
    initiateTransfer, 
    registerUser,
    balance,
    usdcBalance,
    getBalance,
    getUSDCBalance
  } = useWeb3();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const { toast } = useToast();

  // Check if user is registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (isConnected && account) {
        try {
          setIsCheckingRegistration(true);
          // For now, we'll assume the user is registered since we don't have this check in the hook
          // In a real app, you would check this from the contract
setIsUserRegistered(true);
        } catch (error) {
          console.error('Error checking registration:', error);
        } finally {
          setIsCheckingRegistration(false);
        }
      }
    };

    checkRegistration();
  }, [isConnected, account, isUserRegistered]);

  // Refresh balances when token changes
  useEffect(() => {
    if (isConnected && account) {
      getBalance();
      getUSDCBalance();
    }
  }, [isConnected, account, selectedToken]);

  const handleRegister = async () => {
    if (!isConnected || !account) return;
    
    setIsLoading(true);
    try {
      await registerUser('0x0000000000000000000000000000000000000000');
      setIsUserRegistered(true);
      toast({
        title: 'Success',
        description: 'Successfully registered for remittance service!',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to register',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!recipient || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert amount to the correct decimals
      const amountInWei = ethers.parseUnits(amount, selectedToken.decimals).toString();
      
      // Call the initiateTransfer function from useWeb3
      const result = await initiateTransfer(
        recipient,
        amountInWei.toString(),
        'NG', // Default country code
        selectedToken.address
      );

      if (result) {
        toast({
          title: 'Success',
          description: `Successfully initiated transfer of ${amount} ${selectedToken.symbol} to ${recipient}`,
        });
        
        // Reset form
        setRecipient('');
        setAmount('');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate transfer',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking registration
  if (isCheckingRegistration) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking registration status...</span>
      </div>
    );
  }

  // Show registration prompt if not registered
  if (!isUserRegistered && isConnected) {
    return (
      <div className="rounded-lg border p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <h3 className="text-lg font-medium">Registration Required</h3>
          <p className="text-sm text-muted-foreground">
            You need to register with the remittance service before making transfers.
          </p>
          <Button 
            onClick={handleRegister} 
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Send Money</h1>
        <p className="text-muted-foreground">
          Transfer funds to any wallet address
        </p>
      </div>
      
      <div className="rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={!isConnected || isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected || isLoading}
                className="flex-1"
              />
              <Select
                value={selectedToken.address}
                onValueChange={(value) => {
                  const token = SUPPORTED_TOKENS.find(t => t.address === value) || SUPPORTED_TOKENS[0];
                  setSelectedToken(token);
                }}
                disabled={!isConnected || isLoading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {selectedToken.symbol === 'USDC' 
                ? `${usdcBalance} USDC` 
                : `${balance} ${selectedToken.symbol}`}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Fee</span>
                <span className="text-sm text-muted-foreground">~$0.50</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">You'll Send</span>
                <span className="text-sm font-medium">
                  {amount || '0.00'} {selectedToken.symbol}
                </span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isConnected || isLoading || !recipient || !amount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send Money'
              )}
            </Button>
            
            {!isConnected && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Please connect your wallet to continue</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
