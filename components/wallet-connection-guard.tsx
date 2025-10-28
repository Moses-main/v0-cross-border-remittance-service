"use client"

import type React from "react"

// No-op guard: always render children without requiring wallet connection

interface WalletConnectionGuardProps {
  children: React.ReactNode
  fallbackMessage?: string
}

export function WalletConnectionGuard({ children, fallbackMessage }: WalletConnectionGuardProps) {
  return <>{children}</>
}
