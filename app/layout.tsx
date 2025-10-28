import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileNav } from "@/components/mobile-nav";
import { LanguageProvider } from "@/components/language-provider";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const app = minikitConfig.miniapp;

  return {
    title: app.name,
    description: app.description,
    openGraph: {
      title: app.ogTitle || app.name,
      description: app.ogDescription || app.description,
      images: [
        {
          url: app.ogImageUrl || app.heroImageUrl,
          width: 1200,
          height: 630,
          alt: app.name,
        },
      ],
      url: app.homeUrl,
      type: "website",
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: app.version,
        imageUrl: app.ogImageUrl || app.heroImageUrl,
        button: {
          title: `Open ${app.name}`,
          action: {
            type: "launch_frame",
            name: app.name,
            url: app.homeUrl,
            splashImageUrl: app.splashImageUrl,
            splashBackgroundColor: app.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LanguageProvider>
              <MobileNav />
              <SafeArea>{children}</SafeArea>
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </RootProvider>
  );
}
