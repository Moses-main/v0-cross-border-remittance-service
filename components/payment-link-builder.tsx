"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Link as LinkIcon } from "lucide-react"

export function PaymentLinkBuilder() {
  const [data, setData] = useState({
    name: "",
    to: "",
    amount: "",
    token: "USDC",
    memo: "",
  })
  const link = useMemo(() => {
    if (!data.to) return ""
    const params = new URLSearchParams()
    params.set("to", data.to)
    if (data.name) params.set("name", data.name)
    if (data.amount) params.set("amount", data.amount)
    if (data.token) params.set("token", data.token)
    if (data.memo) params.set("memo", data.memo)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    return base ? `${base}/request?${params.toString()}` : `/request?${params.toString()}`
  }, [data])

  const handleCopy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
  }

  return (
    <Card className="border-border">
      <CardContent className="pt-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" value={data.name} onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Recipient Wallet</Label>
            <Input
              id="to"
              placeholder="0x..."
              value={data.to}
              onChange={(e) => setData((p) => ({ ...p, to: e.target.value }))}
              className="font-mono"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={data.amount}
              onChange={(e) => setData((p) => ({ ...p, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={data.token} onValueChange={(v) => setData((p) => ({ ...p, token: v }))}>
              <SelectTrigger id="token">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="memo">Memo</Label>
            <Input id="memo" value={data.memo} onChange={(e) => setData((p) => ({ ...p, memo: e.target.value }))} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button disabled={!data.to} onClick={handleCopy} className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground break-all">
            <LinkIcon className="h-4 w-4" />
            {link || "Link will appear here when recipient wallet is filled"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
