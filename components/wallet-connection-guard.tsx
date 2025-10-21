"use client"

import type React from "react"

import { useWeb3 } from "./web3-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WalletConnectionGuardProps {
  children: React.ReactNode
  fallbackMessage?: string
}

export function WalletConnectionGuard({ children, fallbackMessage }: WalletConnectionGuardProps) {
  const { isConnected, connectWallet, isConnecting, error } = useWeb3()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md border-primary/20 animate-slide-up">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>{fallbackMessage || "Please connect your wallet to access this feature"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full transition-all duration-300 hover:scale-105 active:scale-95"
              size="lg"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We support MetaMask and other Web3 wallets. Make sure you're on Base Sepolia network.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
