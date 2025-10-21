"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Zap, Shield, TrendingUp, Users, Lock, Globe, Smartphone, BarChart3, Coins, RefreshCw } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Settle transfers in seconds with our liquidity pool integration",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Multi-Signature Security",
    description: "Enterprise-grade security with social recovery options",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "AI Rate Prediction",
    description: "Get notified when exchange rates are optimal for sending",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Social Features",
    description: "Send to contacts, create groups, and share transfers",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Lock,
    title: "Insurance Coverage",
    description: "Protect your transfers against smart contract risks",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Cross-Chain Support",
    description: "Send from any chain, receive on any chain",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Fully optimized for mobile with bottom navigation",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track spending patterns and generate tax reports",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Coins,
    title: "Staking Rewards",
    description: "Earn 3-8% APY on idle USDC/USDT balances",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: RefreshCw,
    title: "Recurring Transfers",
    description: "Automate monthly or weekly remittances",
    color: "from-pink-500 to-purple-500",
  },
]

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

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="h-20 md:h-0" />

      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold md:text-5xl">Standout Features</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              What makes RemitFlow different from other crypto remittance services
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                    />
                    <CardHeader>
                      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/50 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border/50 bg-card p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold">Coming Soon</h2>
            <p className="mt-4 text-muted-foreground">
              We're constantly innovating to bring you the best remittance experience. Here's what's on our roadmap:
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>AI-powered exchange rate predictions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Cross-chain remittance support</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Staking rewards on idle balances</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Insurance coverage for transfers</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Advanced compliance and KYC integration</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      <div className="h-20 md:h-0" />
      <Footer />
    </main>
  )
}
