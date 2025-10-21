"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
}

export function TransferForm({ userAddress }: TransferFormProps) {
  const [formData, setFormData] = useState({
    recipientAddress: "",
    amount: "",
    country: "",
    paymentCurrency: "USDC",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

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
      <div className="space-y-2">
        <Label htmlFor="recipientAddress">Recipient Wallet Address</Label>
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
          <Label htmlFor="amount">Amount</Label>
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
          <Label htmlFor="paymentCurrency">Payment Currency</Label>
          <Select value={formData.paymentCurrency} onValueChange={handlePaymentCurrencyChange}>
            <SelectTrigger id="paymentCurrency" className="transition-all duration-300">
              <SelectValue placeholder="Select currency" />
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
          <Label htmlFor="country">Destination Country</Label>
          <Select value={formData.country} onValueChange={handleCountryChange}>
            <SelectTrigger id="country" className="transition-all duration-300">
              <SelectValue placeholder="Select country" />
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
            <Label>Recipient Currency</Label>
            <div className="flex items-center justify-center h-10 px-3 border border-border rounded-md bg-secondary/30 animate-pulse-subtle">
              <span className="font-medium text-sm">{selectedCountry.currency}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Add a note for the recipient"
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
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {formData.paymentCurrency} {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transfer Fee (0.5%)</span>
              <span className="font-medium text-destructive">
                -{formData.paymentCurrency} {fee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cashback (1%)</span>
              <span className="font-medium text-accent">
                +{formData.paymentCurrency} {cashback.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-medium">Total to Send</span>
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Send Remittance"
        )}
      </Button>
    </form>
  )
}
