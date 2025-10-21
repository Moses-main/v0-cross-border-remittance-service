"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ReferralWidgetProps {
  referralCode: string
  referralCount: number
  earnings: string
}

export function ReferralWidget({ referralCode, referralCount, earnings }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Referral Program
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Your Code</p>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0 bg-transparent">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Referrals</p>
            <p className="text-2xl font-bold">{referralCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Earnings</p>
            <p className="text-2xl font-bold text-primary">${earnings}</p>
          </div>
        </div>
        <Button className="w-full bg-transparent" variant="outline">
          Share Code
        </Button>
      </CardContent>
    </Card>
  )
}
