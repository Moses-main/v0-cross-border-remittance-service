"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Wallet, Gift, Upload } from "lucide-react"
import { useState } from "react"

export function DashboardSection() {
  const [activeTab, setActiveTab] = useState("send")

  return (
    <section id="dashboard" className="py-20 md:py-32">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cashback Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Referral Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Transfer Card */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Send Remittance</CardTitle>
                <CardDescription>Send money to recipients worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="send">Single Transfer</TabsTrigger>
                    <TabsTrigger value="batch">Batch Upload</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="send" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipient Address</label>
                      <Input placeholder="0x..." className="bg-input border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (USDC)</label>
                        <Input placeholder="0.00" type="number" className="bg-input border-border" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input placeholder="Select country" className="bg-input border-border" />
                      </div>
                    </div>
                    <Button className="w-full">Send Remittance</Button>
                  </TabsContent>

                  <TabsContent value="batch" className="space-y-4 mt-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Upload CSV File</p>
                        <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
                      </div>
                      <Input type="file" accept=".csv" className="hidden" />
                      <Button variant="outline">Choose File</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 mt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
