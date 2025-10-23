"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Gift } from "lucide-react"
import { useI18n } from "./language-provider"

export function RewardsSection() {
  const { t } = useI18n()
  return (
    <section id="rewards" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("rewards_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("rewards_subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  {t("cashback")}
                </CardTitle>
                <Badge variant="secondary">1%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>{t("cashback_desc")}</CardDescription>
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
                  {t("referrals")}
                </CardTitle>
                <Badge variant="secondary">0.5%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>{t("referrals_desc")}</CardDescription>
              <p className="text-sm text-muted-foreground">Unlimited earning potential with your referral network</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify_between">
                <CardTitle className="flex items_center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  {t("volume_bonus")}
                </CardTitle>
                <Badge variant="secondary">Tier</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>{t("volume_bonus_desc")}</CardDescription>
              <p className="text-sm text-muted-foreground">Tier 1: $10k | Tier 2: $50k | Tier 3: $100k+</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
