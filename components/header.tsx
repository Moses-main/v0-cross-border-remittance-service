"use client";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { ThemeToggle } from "./theme-toggle";
import {
  ConnectWallet,
  Wallet,
  useGetETHBalance,
  useGetTokenBalance,
} from "@coinbase/onchainkit/wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Wallet as WalletIcon,
  LogOut,
  ChevronDown,
  Copy,
  Gift,
  Zap,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CONTRACTS, CHAIN_CONFIG, formatAddress } from "@/lib/utils";
import { TOKEN_ADDRESSES } from "@/lib/constants";
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";
import { useBalance, useDisconnect } from "wagmi";
import { useWalletState } from "@/providers/wallet-state-provider";

const PRIMARY_NAV = [
  { href: "/dashboard", key: "transfer", icon: Send },
  { href: "/request", key: "request", icon: WalletIcon },
  { href: "/dashboard/rewards", key: "rewards", icon: Gift },
];

const SECONDARY_NAV = [
  { href: "/recipients", key: "recipients" },
  { href: "/group-pay", key: "group_pay" },
  { href: "/onramp", key: "onramp" },
  { href: "/profile", key: "profile" },
  { href: "/settings", key: "settings" },
];

export function Header() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected, chain } = useWalletState();
  const [walletState, setWalletState] = useState();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const pathname = usePathname();
  const { roundedBalance: ethBalance } = useGetETHBalance(address);
  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.USDC as `0x${string}`,
    chainId: baseSepolia.id,
  });
  const { t } = useI18n();
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      //
      // try connecting wallet here
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
      setShowWalletMenu(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
      setShowWalletMenu(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  const displayAddress = address ? formatAddress(address) : "Connect Wallet";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg bg-primary transition-all duration-300 hover:scale-110">
            <Send className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            BetaRemit
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}

          {/* Secondary Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <span>More</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SECONDARY_NAV.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full">
                    {t(item.key)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <div className="h-2 w-2 rounded-full bg-blue-700" />
                  {displayAddress}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => address && copyToClipboard(address)}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDisconnect}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>

                <div className="mt-4 space-y-3">
                  {/* Wallet Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Gas Free
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {chain?.name}
                      </Badge>
                    </div>
                  </div>

                  {/* Balances */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded border bg-blue-50/60">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>USDC Balance</span>
                      </p>
                      <p className="font-semibold text-blue-700">
                        {usdcBalance?.formatted
                          ? `${parseFloat(usdcBalance.formatted).toFixed(
                              2
                            )} USDC`
                          : "0.00 USDC"}
                      </p>
                    </div>
                    <div className="p-3 rounded border bg-muted/50">
                      <p className="text-xs text-muted-foreground">
                        ETH Balance
                      </p>
                      <p className="font-semibold">
                        {ethBalance
                          ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                          : "0.0000 ETH"}
                      </p>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>Connected to {CHAIN_CONFIG.name}</span>
                      <a
                        href={CHAIN_CONFIG.blockExplorer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-700">
                      <Zap className="w-3 h-3" />
                      <span>Gasless enabled</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu
              open={showWalletMenu}
              onOpenChange={setShowWalletMenu}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <WalletIcon className="h-4 w-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="md">
                <Wallet />
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="relative"
            >
              <WalletIcon className="h-5 w-5" />
              <span className="sr-only">Wallet</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
