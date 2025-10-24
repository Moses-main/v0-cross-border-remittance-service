"use client";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Send, Wallet as WalletIcon, LogOut } from "lucide-react";
import { useWeb3 } from "./web3-provider";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "./language-selector";
import { useI18n } from "./language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DIRECT_LINKS = [
  { href: "/", key: "home" },
  { href: "/dashboard/rewards", key: "rewards" },
];

export function Header() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  const handleWalletClick = async () => {
    setIsConnecting(true);
    try {
      if (isConnected) {
        disconnectWallet();
      } else {
        await connectWallet();
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
      <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg bg-primary transition-all duration-300 hover:scale-110">
            <Send className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            BetaRemit
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {DIRECT_LINKS.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
                  isActive
                    ? "text-foreground after:w-full after:bg-primary"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full hover:after:bg-muted-foreground/60"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}

          {/* Pay group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm">
                {t("pay")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">{t("transfer")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/request">{t("request")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/group-pay">{t("group_pay")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recipients">{t("recipients")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/onramp">{t("onramp")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm">
                {t("account")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/profile">{t("profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("settings")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="block">
            <LanguageSelector />
          </div>
          <ThemeToggle />

          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent"
                >
                  {displayAddress}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="text-xs">
                  {address}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(address || "")}
                >
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleWalletClick}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleWalletClick}
              disabled={isConnecting}
              className="hidden sm:inline-flex text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isConnecting ? "Connecting..." : t("connect_wallet")}
            </Button>
          )}

          {/* Mobile wallet button */}
          <Button
            onClick={handleWalletClick}
            disabled={isConnecting}
            className="sm:hidden p-2 transition-all duration-300 hover:scale-105 active:scale-95"
            variant={isConnected ? "outline" : "default"}
            size="sm"
          >
            <WalletIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
