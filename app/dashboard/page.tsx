"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { TransferForm } from "@/components/transfer-form"
import { TransactionHistory } from "@/components/transaction-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Wallet, Gift, TrendingUp } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"
import { WalletConnectionGuard } from "@/components/wallet-connection-guard"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DUMMY_USER_STATS } from "@/lib/dummy-data"

export default function DashboardPage() {
  const { isConnected, address } = useWeb3()
  const [stats, setStats] = useState({
    totalSent: "0.00",
    cashbackBalance: "0.00",
    referralRewards: "0.00",
    transactionCount: 0,
  })

  useEffect(() => {
    if (isConnected && address) {
      fetchUserStats(address)
    }
  }, [isConnected, address])

  const fetchUserStats = async (userAddress: string) => {
    try {
      const response = await fetch(`/api/user/stats?address=${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data && Object.keys(data).length > 0 ? data : DUMMY_USER_STATS)
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
      setStats(DUMMY_USER_STATS)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <DashboardLayout>
      <WalletConnectionGuard fallbackMessage="Connect your wallet to start sending remittances">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSent}</div>
                <p className="text-xs text-muted-foreground">{stats.transactionCount} transactions</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cashback Balance</CardTitle>
                <Gift className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.cashbackBalance}</div>
                <p className="text-xs text-muted-foreground">Available to withdraw</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referral Rewards</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.referralRewards}</div>
                <p className="text-xs text-muted-foreground">From your network</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">Verified account</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Send Remittance</CardTitle>
                  <CardDescription>Transfer funds to recipients worldwide using USDC or USDT</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm userAddress={address || ""} />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Transfer Fee</p>
                    <p className="text-2xl font-bold text-primary">0.5%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cashback Rate</p>
                    <p className="text-2xl font-bold text-accent">1%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Min Transfer</p>
                    <p className="text-2xl font-bold">$10</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transfers and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory userAddress={address || ""} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </WalletConnectionGuard>
    </DashboardLayout>
  )
}
