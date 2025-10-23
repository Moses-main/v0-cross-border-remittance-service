"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import { useI18n } from "./language-provider";
import Image from "next/image";
export function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden py-16 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                {t("hero_title")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg">
                {t("hero_subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="gap-2 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                {t("cta_get_started")} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto bg-transparent"
              >
                {t("cta_learn_more")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
              <div
                className="space-y-1 animate-slide-up"
                style={{ animationDelay: "100ms" }}
              >
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  0.5%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("stat_fee_label")}
                </p>
              </div>
              <div
                className="space-y-1 animate-slide-up"
                style={{ animationDelay: "150ms" }}
              >
                <p className="text-xl sm:text-2xl font-bold text-accent">1%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("stat_cashback_label")}
                </p>
              </div>
              <div
                className="space-y-1 animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  24/7
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("stat_available_label")}
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 md:h-96 lg:h-full min-h-64 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center animate-scale-in">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-10 right-10 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-10 left-10 h-28 sm:h-40 w-28 sm:w-40 rounded-full bg-accent/20 blur-3xl" />
            </div>
            <div className="relative z-10 text-center space-y-4 px-4">
                <Image
                  src="/betaRemit.png"
                  alt="RemitFlow Beta Logo"
                  width={200} // adjust as needed
                  height={200} // adjust as needed
                  priority
                  className="mx-auto rounded-lg"
                />
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("hero_network_label")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
