"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, Save, Trash2, User } from "lucide-react"
import { useI18n } from "./language-provider"

export type Recipient = {
  id: string
  name: string
  address: string
}

function loadRecipients(): Recipient[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("recipients")
    return raw ? (JSON.parse(raw) as Recipient[]) : []
  } catch {
    return []
  }
}

function saveRecipients(list: Recipient[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("recipients", JSON.stringify(list))
}

export function RecipientsBook() {
  const { t } = useI18n()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [draft, setDraft] = useState<Partial<Recipient>>({ name: "", address: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setRecipients(loadRecipients())
  }, [])

  useEffect(() => {
    saveRecipients(recipients)
  }, [recipients])

  const isValid = useMemo(() => !!draft.name && !!draft.address, [draft])

  const addRecipient = () => {
    if (!isValid) return
    setRecipients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: draft.name!.trim(), address: draft.address!.trim() },
    ])
    setDraft({ name: "", address: "" })
  }

  const updateRecipient = (id: string) => {
    if (!isValid) return
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, name: draft.name!, address: draft.address! } : r)))
    setDraft({ name: "", address: "" })
    setEditingId(null)
  }

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  const startEdit = (r: Recipient) => {
    setEditingId(r.id)
    setDraft({ name: r.name, address: r.address })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("saved_recipients_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" value={draft.name || ""} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("wallet_address")}</Label>
              <Input
                id="address"
                value={draft.address || ""}
                onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
                placeholder="0x..."
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {editingId ? (
              <Button onClick={() => updateRecipient(editingId)} disabled={!isValid}>
                <Save className="mr-2 h-4 w-4" /> {t("save_changes")}
              </Button>
            ) : (
              <Button onClick={addRecipient} disabled={!isValid}>
                <Plus className="mr-2 h-4 w-4" /> {t("add_recipient_btn")}
              </Button>
            )}
            {editingId && (
              <Button variant="outline" onClick={() => (setEditingId(null), setDraft({ name: "", address: "" }))}>
                {t("cancel_edit")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipients.map((r) => (
          <Card key={r.id} className="border-border/60">
            <CardContent className="pt-6 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-primary" /> {r.name}
                </div>
                <div className="text-xs text-muted-foreground break-all font-mono">{r.address}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeRecipient(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
