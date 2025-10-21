"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import { useState } from "react"

interface CashbackWidgetProps {
  balance: string
  onWithdraw?: () => void
}

export function CashbackWidget({ balance, onWithdraw }: CashbackWidgetProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    try {
      if (onWithdraw) {
        await onWithdraw()
      }
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent" />
            Cashback Available
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-accent">${balance}</p>
          <CardDescription>Ready to withdraw</CardDescription>
        </div>
        <Button onClick={handleWithdraw} disabled={isWithdrawing} className="w-full">
          {isWithdrawing ? "Processing..." : "Withdraw Now"}
        </Button>
      </CardContent>
    </Card>
  )
}
