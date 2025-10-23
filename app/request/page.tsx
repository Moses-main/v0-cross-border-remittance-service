"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransferForm } from "@/components/transfer-form"
import { useWeb3 } from "@/components/web3-provider"
import { useI18n } from "@/components/language-provider"

function RequestContent() {
  const params = useSearchParams()
  const { address } = useWeb3()
  const { t } = useI18n()

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
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("request_payment")}</CardTitle>
          <CardDescription>{payeeName ? `${t("sending_to")} ${payeeName}` : t("prefilled_transfer")}</CardDescription>
        </CardHeader>
        <CardContent>
          <TransferForm userAddress={address || ""} initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function RequestPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
        <RequestContent />
      </Suspense>
    </DashboardLayout>
  )
}
