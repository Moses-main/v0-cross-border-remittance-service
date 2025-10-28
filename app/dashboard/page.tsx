"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TransferForm } from "@/components/TransferForm";
import { TransactionHistory } from "@/components/transaction-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, Wallet, Gift, TrendingUp } from "lucide-react";
import { WalletConnectionGuard } from "@/components/wallet-connection-guard";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useAccount } from "wagmi";
import { useI18n } from "@/components/language-provider";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { t } = useI18n();
  const [stats, setStats] = useState({
    totalSent: "0.00",
    cashbackBalance: "0.00",
    referralRewards: "0.00",
    transactionCount: 0,
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchUserStats(address);
    }
  }, [isConnected, address]);

  const fetchUserStats = async (userAddress: string) => {
    try {
      const response = await fetch(`/api/user/stats?address=${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setStats({
            totalSent: data.totalSent || "0.00",
            cashbackBalance: data.cashbackBalance || "0.00",
            referralRewards: data.referralRewards || "0.00",
            transactionCount: data.transactionCount || 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      setStats({
        totalSent: "0.00",
        cashbackBalance: "0.00",
        referralRewards: "0.00",
        transactionCount: 0,
      });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      // cubic-bezier for easeOut-like feel to satisfy TS Easing type
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <DashboardLayout>
      <WalletConnectionGuard
        fallbackMessage={t("connect_your_wallet_to_start_sending_remittances")}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Overview */}
          <motion.div
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_sent")}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.transactionCount} {t("transactions")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cashback_balance")}
                </CardTitle>
                <Gift className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.cashbackBalance}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("available_to_withdraw")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("referral_rewards")}
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.referralRewards}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("from_your_network")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("account_status")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t("active")}</div>
                <p className="text-xs text-muted-foreground">
                  {t("verified_account")}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            className="grid gap-8 lg:grid-cols-3"
          >
          <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>{t("send_remittance_title")}</CardTitle>
                  <CardDescription>{t("send_remittance_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t("quick_info")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("transfer_fee_label")}
                    </p>
                    <p className="text-2xl font-bold text-primary">0.5%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("cashback_rate_label")}
                    </p>
                    <p className="text-2xl font-bold text-accent">1%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("min_transfer_label")}
                    </p>
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
                <CardTitle>{t("transaction_history")}</CardTitle>
                <CardDescription>{t("recent_transfers")}</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory userAddress={address || ""} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </WalletConnectionGuard>
    </DashboardLayout>
  );
}
