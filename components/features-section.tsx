"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gift, Users, Upload, TrendingUp, Lock } from "lucide-react"
import { useI18n } from "./language-provider"

function useFeatures() {
  const { t } = useI18n()
  return [
    { icon: Zap, title: t("feat_fast_title"), description: t("feat_fast_desc") },
    { icon: Gift, title: t("feat_cashback_title"), description: t("feat_cashback_desc") },
    { icon: Users, title: t("feat_referral_title"), description: t("feat_referral_desc") },
    { icon: Upload, title: t("feat_batch_title"), description: t("feat_batch_desc") },
    { icon: TrendingUp, title: t("feat_tracking_title"), description: t("feat_tracking_desc") },
    { icon: Lock, title: t("feat_secure_title"), description: t("feat_secure_desc") },
  ]
}

export function FeaturesSection() {
  const { t } = useI18n()
  const features = useFeatures()
  return (
    <section id="features" className="py-16 md:py-32 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance">{t("features_title")}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">{t("features_subtitle")}</p>
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
