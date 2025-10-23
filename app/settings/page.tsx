"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Eye, Globe } from "lucide-react"
import { useState } from "react"
import { useI18n, type LanguageCode } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    publicProfile: false,
  })
  const { t, lang, setLang } = useI18n()

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Settings Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">{t("settings")}</h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </div>

        {/* Notifications */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={() => handleToggle("notifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailAlerts">Email Alerts</Label>
              <Switch
                id="emailAlerts"
                checked={settings.emailAlerts}
                onCheckedChange={() => handleToggle("emailAlerts")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Protect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <Switch id="twoFactor" checked={settings.twoFactor} onCheckedChange={() => handleToggle("twoFactor")} />
            </div>
            <Button
              variant="outline"
              className="w-full transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control your visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="publicProfile">Public Profile</Label>
              <Switch
                id="publicProfile"
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggle("publicProfile")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-4" />
              Language & Region
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <span className="text-sm text-muted-foreground">Current: {lang.toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
