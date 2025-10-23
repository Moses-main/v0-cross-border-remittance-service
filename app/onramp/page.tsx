"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const PROVIDERS = [
  {
    name: "Transak",
    url: "https://global.transak.com/",
    desc: "Buy and sell crypto with cards, bank transfer, and more.",
  },
  { name: "MoonPay", url: "https://www.moonpay.com/buy", desc: "Global onramp to buy crypto in minutes." },
  { name: "Ramp", url: "https://ramp.network/buy", desc: "Fast onramp/offramp with great UX." },
]

export default function OnrampPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>On/Off Ramp</CardTitle>
            <CardDescription>Convert between fiat and crypto using a trusted provider</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {PROVIDERS.map((p) => (
              <div key={p.name} className="p-4 rounded-lg border border-border bg-secondary/20">
                <div className="font-medium mb-1">{p.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{p.desc}</div>
                <a href={p.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full">
                    Visit {p.name} <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
