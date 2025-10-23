"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gift, Users, Upload, TrendingUp, Lock } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Send money in seconds with blockchain-powered transfers",
  },
  {
    icon: Gift,
    title: "Cashback Rewards",
    description: "Earn 1% cashback on transactions over $1,000",
  },
  {
    icon: Users,
    title: "Referral Program",
    description: "Earn 0.5% on every transaction from your referrals",
  },
  {
    icon: Upload,
    title: "Batch Transfers",
    description: "Upload CSV files to send multiple remittances at once",
  },
  {
    icon: TrendingUp,
    title: "Real-time Tracking",
    description: "Monitor your transfers with live transaction updates",
  },
  {
    icon: Lock,
    title: "Secure & Transparent",
    description: "Smart contract verified transactions on Base Sepolia",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-32 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance">Powerful Features</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Everything you need for seamless cross-border remittance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
