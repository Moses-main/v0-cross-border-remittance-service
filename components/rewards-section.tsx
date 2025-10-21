"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Gift } from "lucide-react"

export function RewardsSection() {
  return (
    <section id="rewards" className="py-20 md:py-32 bg-secondary/30">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Earn While You Send</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multiple ways to maximize your earnings on RemitFlow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Cashback
                </CardTitle>
                <Badge variant="secondary">1%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>Earn 1% cashback on all transactions over $1,000</CardDescription>
              <p className="text-sm text-muted-foreground">
                Automatically credited to your account and withdrawable anytime
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Referrals
                </CardTitle>
                <Badge variant="secondary">0.5%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>Earn 0.5% on every transaction from your referrals</CardDescription>
              <p className="text-sm text-muted-foreground">Unlimited earning potential with your referral network</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Volume Bonus
                </CardTitle>
                <Badge variant="secondary">Tier</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>Unlock higher rewards as you increase your transaction volume</CardDescription>
              <p className="text-sm text-muted-foreground">Tier 1: $10k | Tier 2: $50k | Tier 3: $100k+</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
