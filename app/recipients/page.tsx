"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipientsBook } from "@/components/recipients-book"

export default function RecipientsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientsBook />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
