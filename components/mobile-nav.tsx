"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Send, Wallet, Gift, Settings, Home, Link as LinkIcon, Users, CreditCard, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "./language-provider"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// Primary actions shown directly
const PRIMARY = [
  { href: "/", icon: Home, key: "home" },
  { href: "/dashboard", icon: Send, key: "transfer" },
  { href: "/request", icon: LinkIcon, key: "request" },
  { href: "/dashboard/rewards", icon: Gift, key: "rewards" },
]

// Secondary actions grouped under More
const SECONDARY = [
  { href: "/recipients", key: "recipients" },
  { href: "/group-pay", key: "group_pay" },
  { href: "/onramp", key: "onramp" },
  { href: "/profile", key: "profile" },
  { href: "/settings", key: "settings" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-up">
      <div className="flex items-center h-16 px-2 gap-1 justify-between">
        {/* Primary items */}
        <div className="flex items-center gap-1">
          {PRIMARY.map((item) => {
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

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-[60px] flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-300 active:scale-95">
              <Menu className="h-5 w-5" />
              <span className="text-xs font-medium">{t("more")}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SECONDARY.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{t(item.key as any)}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
