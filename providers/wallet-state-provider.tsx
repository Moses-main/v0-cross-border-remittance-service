"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAccount } from "wagmi";

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
