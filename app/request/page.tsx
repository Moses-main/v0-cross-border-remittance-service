"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransferForm } from "@/components/TransferForm"
import { useI18n } from "@/components/language-provider"

function RequestContent() {
  const params = useSearchParams()
  const { t } = useI18n()

  // Prefill is not wired without web3; showing static form

  const payeeName = params.get("name")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("request_payment")}</CardTitle>
          <CardDescription>{payeeName ? `${t("sending_to")} ${payeeName}` : t("prefilled_transfer")}</CardDescription>
        </CardHeader>
        <CardContent>
          <TransferForm />
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
