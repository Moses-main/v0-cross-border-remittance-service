"use client"

import { useWeb3 } from "@/components/web3-provider"
import { WalletConnectionGuard } from "@/components/wallet-connection-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, QrCode } from "lucide-react"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentLinkBuilder } from "@/components/payment-link-builder"
import { useI18n } from "@/components/language-provider"

export default function ProfilePage() {
  const { isConnected, address } = useWeb3()
  const { t } = useI18n()
  const [qrCode, setQrCode] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (address) {
      // Generate QR code for wallet address
      QRCode.toDataURL(address, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCode)
    }
  }, [address])

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement("a")
      link.href = qrCode
      link.download = `remitflow-qr-${address?.slice(0, 6)}.png`
      link.click()
    }
  }

  return (
    <DashboardLayout>
      <WalletConnectionGuard fallbackMessage={t("connect_wallet")}>
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">{t("your_profile")}</h1>
            <p className="text-muted-foreground">{t("manage_wallet")}</p>
          </div>

          {/* Wallet Address Card */}
          <Card className="border-primary/20 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t("wallet_address_title")}
              </CardTitle>
              <CardDescription>{t("wallet_address_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border font-mono text-sm break-all animate-pulse-subtle">
                {address}
              </div>
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="w-full transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? t("copied") : t("copy_address")}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Card - For Receiving Payments */}
          <Card className="border-accent/20 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t("receive_qr_title")}
              </CardTitle>
              <CardDescription>{t("receive_qr_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode && (
                <div className="flex justify-center p-6 bg-white rounded-lg border border-border animate-scale-in">
                  <img src={qrCode || "/placeholder.svg"} alt="Wallet QR Code" className="w-64 h-64" />
                </div>
              )}
              <div className="space-y-2">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="w-full transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("download_qr")}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {t("qr_helper")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Request Link Builder */}
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Build Payment Request Link</CardTitle>
              <CardDescription>Create a shareable link so others can pay you quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentLinkBuilder />
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <div className="grid gap-4 md:grid-cols-3 animate-slide-up" style={{ animationDelay: "250ms" }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Active</div>
                <p className="text-xs text-muted-foreground mt-1">Verified</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">Base Sepolia</div>
                <p className="text-xs text-muted-foreground mt-1">Testnet</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Supported Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">USDC/USDT</div>
                <p className="text-xs text-muted-foreground mt-1">Stablecoins</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Info */}
          <Card className="border-destructive/20 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>Keep your wallet address safe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="text-primary font-bold">•</div>
                <p>Never share your private keys with anyone</p>
              </div>
              <div className="flex gap-3">
                <div className="text-primary font-bold">•</div>
                <p>Your wallet address is public and safe to share</p>
              </div>
              <div className="flex gap-3">
                <div className="text-primary font-bold">•</div>
                <p>Always verify recipient addresses before sending funds</p>
              </div>
              <div className="flex gap-3">
                <div className="text-primary font-bold">•</div>
                <p>QR codes are safe to share - they only contain your public wallet address</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </WalletConnectionGuard>
    </DashboardLayout>
  )
}
