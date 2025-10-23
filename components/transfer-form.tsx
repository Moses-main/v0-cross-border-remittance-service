"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useI18n } from "./language-provider"

const COUNTRIES = [
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "MX", name: "Mexico", currency: "MXN" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "VN", name: "Vietnam", currency: "VND" },
  { code: "TH", name: "Thailand", currency: "THB" },
  { code: "ID", name: "Indonesia", currency: "IDR" },
]

const PAYMENT_CURRENCIES = [
  { code: "USDC", name: "USD Coin (USDC)", symbol: "USDC" },
  { code: "USDT", name: "Tether (USDT)", symbol: "USDT" },
]

interface TransferFormProps {
  userAddress: string
  initialData?: Partial<{
    recipientAddress: string
    amount: string
    country: string
    paymentCurrency: string
    description: string
  }>
}

export function TransferForm({ userAddress, initialData }: TransferFormProps) {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    recipientAddress: "",
    amount: "",
    country: "",
    paymentCurrency: "USDC",
    description: "",
  })
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        paymentCurrency: (initialData.paymentCurrency as string) || prev.paymentCurrency,
      }))
    }
  }, [initialData])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [savedRecipients, setSavedRecipients] = useState<Array<{ id: string; name: string; address: string }>>([])
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("recipients") : null
      setSavedRecipients(raw ? JSON.parse(raw) : [])
    } catch {
      setSavedRecipients([])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }))
  }

  const handlePaymentCurrencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentCurrency: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/transfers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          senderAddress: userAddress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Transfer initiated successfully! Transaction hash: " + data.txHash)
        setFormData({ recipientAddress: "", amount: "", country: "", paymentCurrency: "USDC", description: "" })
        // Prompt to save recipient if not already saved
        const exists = savedRecipients.some((r) => r.address.toLowerCase() === (formData.recipientAddress || "").toLowerCase())
        setShowSavePrompt(!exists && !!formData.recipientAddress)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to create transfer")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
      console.error("Transfer error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCountry = COUNTRIES.find((c) => c.code === formData.country)
  const amount = Number.parseFloat(formData.amount) || 0
  const fee = amount * 0.005
  const cashback = amount * 0.01
  const total = amount + fee

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Quick pick recipient */}
      {savedRecipients.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="savedRecipient">{t("quick_pick_recipient")}</Label>
          <Select onValueChange={(val) => setFormData((p) => ({ ...p, recipientAddress: val }))}>
            <SelectTrigger id="savedRecipient" className="transition-all duration-300">
              <SelectValue placeholder={t("select_saved_recipient")} />
            </SelectTrigger>
            <SelectContent>
              {savedRecipients.map((r) => (
                <SelectItem key={r.id} value={r.address}>
                  {r.name} — {r.address.slice(0, 6)}...{r.address.slice(-4)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="recipientAddress">{t("label_recipient_wallet")}</Label>
        <Input
          id="recipientAddress"
          name="recipientAddress"
          placeholder="0x..."
          value={formData.recipientAddress}
          onChange={handleChange}
          required
          className="font-mono text-sm transition-all duration-300 hover:border-primary/50 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">{t("label_amount")}</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            required
            min="10"
            step="0.01"
            className="transition-all duration-300 hover:border-primary/50 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentCurrency">{t("label_payment_currency")}</Label>
          <Select value={formData.paymentCurrency} onValueChange={handlePaymentCurrencyChange}>
            <SelectTrigger id="paymentCurrency" className="transition-all duration-300">
              <SelectValue placeholder={t("label_payment_currency")} />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">{t("label_destination_country")}</Label>
          <Select value={formData.country} onValueChange={handleCountryChange}>
            <SelectTrigger id="country" className="transition-all duration-300">
              <SelectValue placeholder={t("label_destination_country")} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name} ({country.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Display selected country currency */}
        {selectedCountry && (
          <div className="space-y-2">
            <Label>{t("label_recipient_currency")}</Label>
            <div className="flex items-center justify-center h-10 px-3 border border-border rounded-md bg-secondary/30 animate-pulse-subtle">
              <span className="font-medium text-sm">{selectedCountry.currency}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("label_description_optional")}</Label>
        <textarea
          id="description"
          name="description"
          placeholder={t("label_description_optional")}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
          rows={3}
        />
      </div>

      {/* Fee Breakdown */}
      {amount > 0 && (
        <Card className="bg-secondary/30 border-primary/20 animate-slide-up">
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("breakdown_amount")}</span>
              <span className="font-medium">
                {formData.paymentCurrency} {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("breakdown_fee")}</span>
              <span className="font-medium text-destructive">
                -{formData.paymentCurrency} {fee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("breakdown_cashback")}</span>
              <span className="font-medium text-accent">
                +{formData.paymentCurrency} {cashback.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-medium">{t("breakdown_total")}</span>
              <span className="font-bold text-primary">
                {formData.paymentCurrency} {total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "success" && (
        <Alert className="border-green-500/50 bg-green-500/10 animate-slide-down">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="border-destructive/50 bg-destructive/10 animate-slide-down">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{message}</AlertDescription>
        </Alert>
      )}

      {/* Save recipient prompt */}
      {showSavePrompt && (
        <div className="flex items-center justify-between gap-2 p-3 border border-border rounded-md bg-secondary/30 animate-slide-up">
          <div className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Save this recipient for future payments?</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowSavePrompt(false)}
            >
              Not now
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                try {
                  const list = savedRecipients.length ? [...savedRecipients] : []
                  list.push({ id: crypto.randomUUID(), name: formData.description || "Recipient", address: formData.recipientAddress })
                  localStorage.setItem("recipients", JSON.stringify(list))
                  setSavedRecipients(list)
                } catch {}
                setShowSavePrompt(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          t("btn_send_remittance")
        )}
      </Button>
    </form>
  )
}
