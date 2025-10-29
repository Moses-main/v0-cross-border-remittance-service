"use client";

import { GroupPayForm } from "@/components/group-pay-form";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/language-provider";

export default function GroupPayPage() {
  const { t } = useI18n();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("group_pay")}</h2>
          <p className="text-muted-foreground">
            Send payments to multiple recipients in a single transaction
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Group Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupPayForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
