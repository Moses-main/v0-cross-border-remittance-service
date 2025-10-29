"use client";

import { ReactNode, memo } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { WalletStateProvider } from "@/providers/wallet-state-provider";
import { NavigationProgress } from "@/providers/navigation-progress";

type OptimizedLayoutProps = {
  children: ReactNode;
};

// Memoize the layout to prevent unnecessary re-renders
const OptimizedLayout = memo(function OptimizedLayout({
  children,
}: OptimizedLayoutProps) {
  return (
    <WalletStateProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider>
          <NavigationProgress>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
              <MobileNav />
            </div>
          </NavigationProgress>
        </LanguageProvider>
      </ThemeProvider>
    </WalletStateProvider>
  );
});

export { OptimizedLayout };
