"use client"

import { Header } from "./header"
import { Footer } from "./footer"
import type React from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-7xl px-4 md:px-6 py-8 pb-20 md:pb-8">{children}</main>
      <Footer />
    </div>
  )
}
