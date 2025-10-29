"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Gift,
  Home,
  Link as LinkIcon,
  Menu,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "./language-provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/providers/navigation-progress";

// Primary actions shown directly
const PRIMARY = [
  { href: "/", icon: Home, key: "home" },
  { href: "/transfer", icon: Send, key: "transfer" },
  { href: "/receive", icon: LinkIcon, key: "receive" },
  { href: "/contacts", icon: User, key: "contacts" },
];

// Secondary actions grouped under More
const SECONDARY = [
  { href: "/group-pay", key: "group_pay" },
  { href: "/dashboard/rewards", key: "rewards" },
  { href: "/onramp", key: "onramp" },
  { href: "/profile", key: "profile" },
  { href: "/settings", key: "settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { startNavigation } = useNavigation();

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    if (pathname !== href) {
      e.preventDefault();
      startNavigation();
      // Small delay to allow the loader to show before navigation
      setTimeout(() => {
        window.location.href = href;
      }, 50);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-up">
      <div className="flex items-center h-16 px-2 gap-1 justify-between">
        {/* Primary items */}
        <div className="flex items-center gap-1">
          {PRIMARY.map((item) => (
            <button
              key={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{t(item.key)}</span>
            </button>
          ))}
        </div>

        {/* More dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">{t('more')}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mb-2 w-48" align="end">
            {SECONDARY.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm"
                  onClick={(e) => handleNavigation(e, item.href)}
                >
                  {t(item.key)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
