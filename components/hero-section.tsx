"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Globe } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-32">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                Send Money Across Borders
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg">
                Fast, secure, and affordable remittance service powered by blockchain. Earn cashback and referral
                rewards on every transaction.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="gap-2 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
              <div className="space-y-1 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <p className="text-xl sm:text-2xl font-bold text-primary">0.5%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Transfer Fee</p>
              </div>
              <div className="space-y-1 animate-slide-up" style={{ animationDelay: "150ms" }}>
                <p className="text-xl sm:text-2xl font-bold text-accent">1%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Cashback</p>
              </div>
              <div className="space-y-1 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <p className="text-xl sm:text-2xl font-bold text-primary">24/7</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 md:h-96 lg:h-full min-h-64 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center animate-scale-in">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-10 right-10 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-10 left-10 h-28 sm:h-40 w-28 sm:w-40 rounded-full bg-accent/20 blur-3xl" />
            </div>
            <div className="relative z-10 text-center space-y-4 px-4">
              <Globe className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto" />
              <p className="text-sm sm:text-base text-muted-foreground">Global Remittance Network</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
