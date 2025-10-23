"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Send, Wallet, Gift, Settings, Home, Link as LinkIcon, Users, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "./language-provider"

const NAV_ITEMS = [
  { href: "/", icon: Home, key: "home" },
  { href: "/dashboard", icon: Send, key: "transfer" },
  { href: "/request", icon: LinkIcon, key: "request" },
  { href: "/recipients", icon: Users, key: "recipients" },
  { href: "/group-pay", icon: Users, key: "group_pay" },
  { href: "/onramp", icon: CreditCard, key: "onramp" },
  { href: "/dashboard/rewards", icon: Gift, key: "rewards" },
  { href: "/profile", icon: Wallet, key: "profile" },
  { href: "/settings", icon: Settings, key: "settings" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-up">
      <div className="flex items-center h-16 px-2 overflow-x-auto no-scrollbar gap-1 justify-between">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[60px] flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t(item.key)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
