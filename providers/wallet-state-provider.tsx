"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http, createWalletClient, custom } from "viem";
import REMITTANCE_ABI, { REMITTANCE_CONTRACT_ADDRESS } from "@/lib/web3-config";

export type WalletState = {
  isConnected: boolean;
  address?: `0x${string}`;
  chain?: {
    id: number;
    name?: string;
  } | null;
};

const WalletStateContext = createContext<WalletState | undefined>(undefined);

export function WalletStateProvider({ children }: { children: React.ReactNode }) {
  // Source of truth from wagmi (populated by OnchainKit's wallet connect)
  const { address, chain, isConnected } = useAccount();

  // Internal flags for registration flow
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | undefined>(undefined);
  const lastCheckedRef = useRef<`0x${string}` | undefined>(undefined);

  // On first connect per address, ensure the user is registered on-chain
  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address) return;
      if (lastCheckedRef.current === address) return; // already processed for this address

      lastCheckedRef.current = address;

      try {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
        });

        // getUserInfo(address) returns (walletAddress,totalSent,totalReceived,referrer,isActive)
        const userInfo = (await publicClient.readContract({
          abi: REMITTANCE_ABI as any,
          address: REMITTANCE_CONTRACT_ADDRESS,
          functionName: "getUserInfo",
          args: [address as `0x${string}`],
        })) as readonly [`0x${string}`, bigint, bigint, `0x${string}`, boolean];

        if (userInfo && userInfo[4]) {
          setIsRegistered(true);
          return;
        }

        // Not registered: try to register via MetaMask if available
        if (typeof window !== "undefined" && (window as any)?.ethereum) {
          setIsRegistering(true);
          const walletClient = createWalletClient({
            chain: baseSepolia,
            transport: custom((window as any).ethereum),
          });
          const [account] = await walletClient.getAddresses();
          await walletClient.writeContract({
            address: REMITTANCE_CONTRACT_ADDRESS,
            abi: REMITTANCE_ABI as any,
            functionName: "registerUser",
            args: ["0x0000000000000000000000000000000000000000"],
            account,
          });
          setIsRegistered(true);
        } else {
          // If no EOA provider, skip here (AA path in services will register on-demand)
          setIsRegistered(undefined);
        }
      } catch (e) {
        // Non-blocking: leave registered state unknown
        setIsRegistered(undefined);
      } finally {
        setIsRegistering(false);
      }
    };

    void run();
  }, [isConnected, address]);

  const value = useMemo<WalletState>(
    () => ({ isConnected: !!isConnected, address: address as `0x${string}` | undefined, chain }),
    [address, chain, isConnected]
  );

  return (
    <WalletStateContext.Provider value={value}>{children}</WalletStateContext.Provider>
  );
}

export function useWalletState(): WalletState {
  const ctx = useContext(WalletStateContext);
  if (!ctx) {
    throw new Error("useWalletState must be used within a WalletStateProvider");
  }
  return ctx;
}
