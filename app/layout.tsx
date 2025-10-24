import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import { MobileNav } from "@/components/mobile-nav";
import { LanguageProvider } from "@/components/language-provider";
import { minikitConfig } from "@/minikit.config";
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "BetaRemit - Cross-Border Remittance",
//   description: "Fast, secure, and affordable cross-border remittance service",
//   generator: "v0.app",
// };

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: minikitConfig.miniapp.name,
//     description: minikitConfig.miniapp.description,
//     other: {
//       "fc:frame": JSON.stringify({
//         version: minikitConfig.miniapp.version,
//         imageUrl: minikitConfig.miniapp.heroImageUrl,
//         // button: {
//         //   title: `Join the ${minikitConfig.miniapp.name} Waitlist`,
//         //   action: {
//         //     name: `Launch ${minikitConfig.miniapp.name}`,
//         //     type: "launch_frame",
//         //   },
//         // },
//       }),
//     },
//   };
// }

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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageProvider>
            <Web3Provider>
              <MobileNav />
              {children}
            </Web3Provider>
          </LanguageProvider>
        </ThemeProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
