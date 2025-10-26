

"use client";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Send,
  Wallet as WalletIcon,
  LogOut,
  ChevronDown,
  Copy,
  Gift,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { walletService } from "@/utils/walletServiceV2";
import { baseSepolia } from "viem/chains";
import { formatAddress } from "@/lib/utils";
import { toast } from "sonner";

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
  const [walletState, setWalletState] = useState(walletService.getState());
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const unsubscribe = walletService.addListener((state) => {
      setWalletState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleConnect = async (
    walletType: "metamask" | "base" | "coinbase" = "metamask"
  ) => {
    setIsConnecting(true);
    try {
      await walletService.connect(walletType);
      if (walletState.chainId !== baseSepolia.id) {
        await walletService.switchToBaseSepolia();
      }
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
      await walletService.disconnect();
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  const displayAddress = walletState.address
    ? formatAddress(walletState.address)
    : "Connect Wallet";

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

          {walletState.isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  {displayAddress}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">
                      {walletState.walletType}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {walletState.address}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    walletState.address && copyToClipboard(walletState.address)
                  }
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
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu open={showWalletMenu} onOpenChange={setShowWalletMenu}>
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleConnect("metamask")}>
                  MetaMask
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleConnect("base")}>
                  Base Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleConnect("coinbase")}>
                  Coinbase Wallet
                </DropdownMenuItem>
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
// "use client";

// import { ThemeToggle } from "./theme-toggle";
// import { Button } from "@/components/ui/button";
// import { Send, Wallet as WalletIcon, LogOut, ChevronDown, Copy, Gift, Menu, X } from "lucide-react";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { LanguageSelector } from "./language-selector";
// import { useI18n } from "./language-provider";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu";
// import { walletService } from "@/utils/walletServiceV2";
// import { baseSepolia } from "viem/chains";
// import { formatAddress } from "@/lib/utils";
// import { toast } from "sonner";

// // Primary navigation items shown in the main nav
// const PRIMARY_NAV = [
//   { href: "/dashboard", key: "transfer", icon: Send },
//   { href: "/request", key: "request", icon: WalletIcon },
//   { href: "/dashboard/rewards", key: "rewards", icon: Gift },
// ];

// // Secondary navigation items shown in a dropdown
// const SECONDARY_NAV = [
//   { href: "/recipients", key: "recipients" },
//   { href: "/group-pay", key: "group_pay" },
//   { href: "/onramp", key: "onramp" },
//   { href: "/profile", key: "profile" },
//   { href: "/settings", key: "settings" },
// ];

// export function Header() {
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [walletState, setWalletState] = useState(walletService.getState());
//   const [showWalletMenu, setShowWalletMenu] = useState(false);
//   const pathname = usePathname();
//   const { t } = useI18n();

//   // Subscribe to wallet state changes
//   useEffect(() => {
//     const unsubscribe = walletService.addListener((state) => {
//       setWalletState(state);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleConnect = async (walletType: 'metamask' | 'base' | 'coinbase' = 'metamask') => {
//     setIsConnecting(true);
//     try {
//       await walletService.connect(walletType);
//       // Ensure we're on the right network
//       if (walletState.chainId !== baseSepolia.id) {
//         await walletService.switchToBaseSepolia();
//       }
//     } catch (error) {
//       console.error('Error connecting wallet:', error);
//       toast.error('Failed to connect wallet');
//     } finally {
//       setIsConnecting(false);
//       setShowWalletMenu(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       await walletService.disconnect();
//       toast.success('Wallet disconnected');
//     } catch (error) {
//       console.error('Error disconnecting wallet:', error);
//       toast.error('Failed to disconnect wallet');
//     }
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Address copied to clipboard');
//   };

//   const displayAddress = walletState.address
//     ? formatAddress(walletState.address)
//     : "Connect Wallet";

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2">
//           <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg bg-primary transition-all duration-300 hover:scale-110">
//             <Send className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
//           </div>
//           <h1 className="text-lg sm:text-xl font-bold text-foreground">
//             BetaRemit
//           </h1>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-1">
//           {/* Primary Navigation */}
//           {PRIMARY_NAV.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                   isActive
//                     ? 'bg-accent text-accent-foreground' 
//                     : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
//                 }`}
//               >
//                 <Icon className="h-4 w-4" />
//                 <span>{t(item.key)}</span>
//               </Link>
//             );
//           })}

//           {/* Secondary Navigation Dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
//                 <span>More</span>
//                 <ChevronDown className="ml-1 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               {SECONDARY_NAV.map((item) => (
//                 <DropdownMenuItem key={item.href} asChild>
//                   <Link href={item.href} className="w-full">
//                     {t(item.key)}
//                   </Link>
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </nav>

//         {/* Right side controls */}
//         <div className="flex items-center gap-2">
//           <div className="hidden md:flex items-center gap-2">
//             <LanguageSelector />
//             <ThemeToggle />
//           </div>
//           {walletState.isConnected ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="gap-2 hidden sm:flex">
//                   <div className="h-2 w-2 rounded-full bg-green-500" />
//                   {displayAddress}
//                   <ChevronDown className="h-4 w-4 opacity-50" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56">
//                 <DropdownMenuLabel className="font-normal">
//                   <div className="grid gap-0.5">
//                     <p className="text-sm font-medium">
//                       {walletState.walletType}
//                     </p>
//                     <p className="text-xs text-muted-foreground break-all">
//                       {walletState.address}
//                     </p>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem 
//                   onClick={() => walletState.address && copyToClipboard(walletState.address)}
//                   className="cursor-pointer"
//                 >
//                   <Copy className="mr-2 h-4 w-4" />
//                   Copy Address
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem 
//                   onClick={handleDisconnect} 
//                   className="cursor-pointer text-destructive"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Disconnect
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <DropdownMenu open={showWalletMenu} onOpenChange={setShowWalletMenu}>
//               <DropdownMenuTrigger asChild>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="gap-2"
//                   disabled={isConnecting}
//                 >
//                   {isConnecting ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Connecting...
//                     </>
//                   ) : (
//                     <>
//                       <WalletIcon className="h-4 w-4" />
//                       Connect Wallet
//                     </>
//                   )}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-48">
//                 <DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => handleConnect('metamask')}>
//                   MetaMask
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleConnect('base')}>
//                   Base Wallet
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleConnect('coinbase')}>
//                   Coinbase Wallet
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}

//           {/* Mobile Menu Button */}
//           <div className="md:hidden flex items-center gap-2">
//             <LanguageSelector />
//             <ThemeToggle />
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setShowWalletMenu(!showWalletMenu)}
//               className="relative"
//             >
//               <WalletIcon className="h-5 w-5" />
//               <span className="sr-only">Wallet</span>
//             </Button>
//           </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     onClick={() => walletState.address && copyToClipboard(walletState.address)}
//                     className="cursor-pointer"
//                   >
//                     <Copy className="mr-2 h-4 w-4" />
//                     Copy Address
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     onClick={handleDisconnect} 
//                     className="cursor-pointer text-destructive"
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     Disconnect
//                   </DropdownMenuItem>
//                 </>
//               ) : (
//                 <div className="grid gap-1 p-1">
//                   <div className="px-2 py-1.5 text-sm font-semibold">
//                     Connect Wallet
//                   </div>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => handleConnect('metamask')}>
//                     MetaMask
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => handleConnect('base')}>
//                     Base Wallet
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => handleConnect('coinbase')}>
//                     Coinbase Wallet
//                   </DropdownMenuItem>
//                 </div>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </header>
//   );
// }
