"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Users, TrendingUp, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function RewardsPage() {
  // Disconnected from wallet/web3; use local placeholder state
  const [rewardsData, setRewardsData] = useState({
    cashbackBalance: "0.00",
    referralRewards: "0.00",
    totalEarned: "0.00",
    referralCode: "",
    referralCount: 0,
    tier: "Bronze",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Initialize with demo referral code and placeholder values
    const demoCode = `REF-USER123`;
    setRewardsData((prev) => ({
      ...prev,
      referralCode: demoCode,
    }));
  }, []);

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(rewardsData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render UI regardless of wallet connection
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Rewards Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cashback Balance
              </CardTitle>
              <Gift className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${rewardsData.cashbackBalance}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available to withdraw
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Referral Rewards
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${rewardsData.referralRewards}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {rewardsData.referralCount} referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earned
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${rewardsData.totalEarned}
              </div>
              <Badge className="mt-2">{rewardsData.tier}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cashback" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cashback">Cashback Program</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
            <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
          </TabsList>

          {/* Cashback Tab */}
          <TabsContent value="cashback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>How Cashback Works</CardTitle>
                <CardDescription>
                  Earn rewards on every transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Send a Remittance</p>
                      <p className="text-sm text-muted-foreground">
                        Transfer funds to any recipient worldwide
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Earn Cashback</p>
                      <p className="text-sm text-muted-foreground">
                        Get 1% cashback on transactions over $1,000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Withdraw Anytime</p>
                      <p className="text-sm text-muted-foreground">
                        Withdraw your cashback balance to your wallet
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-medium mb-3">
                    Cashback Rates by Transaction Size
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">$10 - $999</span>
                      <span className="font-medium">0.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        $1,000 - $9,999
                      </span>
                      <span className="font-medium">1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">$10,000+</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4">Withdraw Cashback</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
                <CardDescription>
                  Earn rewards by inviting friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Share Your Code</p>
                      <p className="text-sm text-muted-foreground">
                        Copy and share your unique referral code
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Friends Sign Up</p>
                      <p className="text-sm text-muted-foreground">
                        Your friends use your code to create an account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Earn Rewards</p>
                      <p className="text-sm text-muted-foreground">
                        Get 0.5% on every transaction they make
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-medium mb-3">Your Referral Code</h4>
                  <div className="flex gap-2">
                    <Input
                      value={rewardsData.referralCode}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyReferralCode}
                      className="shrink-0 bg-transparent"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button className="w-full mt-4">Share on Social Media</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tier Benefits</CardTitle>
                <CardDescription>
                  Unlock higher rewards as you increase your transaction volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Bronze Tier</h4>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      $0 - $10,000 total volume
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>1% cashback on transactions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>0.5% referral rewards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>24/7 customer support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Silver Tier</h4>
                      <Badge variant="outline">$10,000+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      $10,000 - $50,000 total volume
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>1.5% cashback on transactions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>1% referral rewards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Gold Tier</h4>
                      <Badge variant="outline">$50,000+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      $50,000+ total volume
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>2% cashback on transactions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>1.5% referral rewards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Dedicated account manager</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referral Activity</CardTitle>
            <CardDescription>Track your referral earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No referral activity yet. Share your code to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
