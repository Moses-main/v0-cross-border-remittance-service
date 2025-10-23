"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransferForm } from "@/components/transfer-form"
import { useWeb3 } from "@/components/web3-provider"

export default function RequestPage() {
  const params = useSearchParams()
  const { address } = useWeb3()

  const initialData = useMemo(() => {
    const to = params.get("to") || ""
    const amount = params.get("amount") || ""
    const token = params.get("token") || undefined
    const memo = params.get("memo") || ""
    const country = params.get("country") || ""
    return {
      recipientAddress: to,
      amount,
      paymentCurrency: token,
      description: memo,
      country,
    }
  }, [params])

  const payeeName = params.get("name")

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Payment</CardTitle>
            <CardDescription>
              {payeeName ? `Sending to ${payeeName}` : "Prefilled transfer based on shared link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferForm userAddress={address || ""} initialData={initialData} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
