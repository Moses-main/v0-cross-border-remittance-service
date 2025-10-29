// import type React from "react";
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import { MobileNav } from "@/components/mobile-nav";
// import { LanguageProvider } from "@/components/language-provider";
// import { minikitConfig } from "@/minikit.config";
// import { RootProvider } from "./rootProvider";
// import { NavigationProgress } from "@/providers/navigation-progress";

// const geist = Geist({ subsets: ["latin"] });
// const geistMono = Geist_Mono({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: minikitConfig.miniapp.name,
//   description: minikitConfig.miniapp.description,
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${geist.className} min-h-screen`}>
//         <RootProvider>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="dark"
//             enableSystem
//             disableTransitionOnChange
//           >
//             <LanguageProvider>
//               <NavigationProgress>
//                 <div className="relative flex min-h-screen flex-col">
//                   <main className="flex-1">{children}</main>
//                   <MobileNav />
//                 </div>
//               </NavigationProgress>
//             </LanguageProvider>
//           </ThemeProvider>
//         </RootProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { minikitConfig } from "@/minikit.config";
import { OptimizedLayout } from "@/components/optimized-layout";
import { Providers } from "@/providers/wagmi-provider"; // 👈 import here

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: minikitConfig.miniapp.name,
  description: minikitConfig.miniapp.description,
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen antialiased`}>
        {/* 👇 Wrap OptimizedLayout with Wagmi Provider */}
        <Providers>
          <OptimizedLayout>{children}</OptimizedLayout>
        </Providers>
      </body>
    </html>
  );
}
