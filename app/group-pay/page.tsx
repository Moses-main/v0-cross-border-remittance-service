"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// Lightweight checkbox; if not present in UI library, define a simple one
function SimpleCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 accent-current"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  )
}

type Recipient = { id: string; name: string; address: string }

type Row = Recipient & { selected: boolean; amount: string }

export default function GroupPayPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [token, setToken] = useState("USDC")
  const [sharedAmount, setSharedAmount] = useState("")

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("recipients") : null
      const list: Recipient[] = raw ? JSON.parse(raw) : []
      setRows(list.map((r) => ({ ...r, selected: false, amount: "" })))
    } catch {
      setRows([])
    }
  }, [])

  const selected = useMemo(() => rows.filter((r) => r.selected), [rows])
  const canSend = selected.length > 0 && selected.every((r) => Number.parseFloat(r.amount) > 0)

  const applySharedAmount = () => {
    if (!sharedAmount) return
    setRows((prev) => prev.map((r) => (r.selected ? { ...r, amount: sharedAmount } : r)))
  }

  const handleSend = async () => {
    // Placeholder: iterate and call your existing API per recipient.
    // You can optimize with a batch endpoint later.
    alert(
      `Would send ${token} to ${selected.length} recipients:\n` +
        selected.map((r) => `${r.name} (${r.address}): ${r.amount} ${token}`).join("\n"),
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Payment</CardTitle>
            <CardDescription>Select multiple recipients and pay them at once</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger id="token">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shared">Shared amount (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="shared"
                    type="number"
                    placeholder="0.00"
                    value={sharedAmount}
                    onChange={(e) => setSharedAmount(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={applySharedAmount}>
                    Apply to selected
                  </Button>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-md divide-y divide-border">
              {rows.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No saved recipients yet. Add some on the Recipients page.</div>
              )}
              {rows.map((r, idx) => (
                <div key={r.id} className="p-4 grid grid-cols-12 items-center gap-3">
                  <div className="col-span-1 flex items-center">
                    <SimpleCheckbox
                      checked={r.selected}
                      onChange={(v) => setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, selected: v } : x)))}
                    />
                  </div>
                  <div className="col-span-5">
                    <div className="font-medium flex items-center gap-2">
                      <Badge variant="secondary">{r.name}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{r.address}</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <div className="space-y-1">
                      <Label className="text-xs">Amount ({token})</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={r.amount}
                        onChange={(e) =>
                          setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, amount: e.target.value } : x)))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={!canSend}>
                Send to {selected.length} recipient{selected.length === 1 ? "" : "s"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
