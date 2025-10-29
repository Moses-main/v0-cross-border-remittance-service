"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import REMITTANCE_ABI, { REMITTANCE_CONTRACT_ADDRESS } from "@/lib/web3-config";

export type WalletState = {
  isConnected: boolean;
  address?: `0x${string}`;
  isRegistered?: boolean;
  isRegistering?: boolean;
  chain?: {
    id: number;
    name?: string;
  } | null;
};

const WalletStateContext = createContext<WalletState | undefined>(undefined);

export function WalletStateProvider({ children }: { children: React.ReactNode }) {
  const { address, chain, isConnected } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | undefined>(undefined);
  const lastCheckedRef = useRef<`0x${string}` | undefined>(undefined);

  // Check registration status on address change
  useEffect(() => {
    if (!isConnected || !address) {
      setIsRegistered(undefined);
      return;
    }

    // Skip if we've already checked this address
    if (lastCheckedRef.current === address) {
      return;
    }
    
    const controller = new AbortController();
    let mounted = true;
    
    const checkRegistration = async () => {
      try {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL, {
            fetchOptions: { signal: controller.signal }
          }),
        });

        const userInfo = await publicClient.readContract({
          abi: REMITTANCE_ABI as any,
          address: REMITTANCE_CONTRACT_ADDRESS,
          functionName: "getUserInfo",
          args: [address as `0x${string}`],
        }) as readonly [`0x${string}`, bigint, bigint, `0x${string}`, boolean];

        if (mounted) {
          setIsRegistered(!!(userInfo && userInfo[4]));
          lastCheckedRef.current = address;
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && mounted) {
          console.error("Error checking registration status:", error);
          setIsRegistered(undefined);
        }
      }
    };

    checkRegistration();
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isConnected, address]);

  const value = useMemo<WalletState>(
    () => ({
      isConnected: !!isConnected,
      address: address as `0x${string}` | undefined,
      chain,
      isRegistered,
      isRegistering,
    }),
    [
      isConnected, 
      address, 
      chain?.id, 
      chain?.name, 
      isRegistered, 
      isRegistering
    ]
  );

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

export function useWalletState(): WalletState {
  const ctx = useContext(WalletStateContext);
  if (!ctx) {
    throw new Error("useWalletState must be used within a WalletStateProvider");
  }
  return ctx;
}
