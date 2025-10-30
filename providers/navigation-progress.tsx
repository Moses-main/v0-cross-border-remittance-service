"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/page-loader";

// Create a context to track loading state
export const NavigationContext = React.createContext<{
  isLoading: boolean;
  startNavigation: () => void;
}>({
  isLoading: false,
  startNavigation: () => {},
});

export function NavigationProgress({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle route changes
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Handle Next.js App Router navigation events
    window.addEventListener("routeChangeStart", handleStart);
    window.addEventListener("routeChangeComplete", handleComplete);
    window.addEventListener("routeChangeError", handleComplete);

    // Fallback for direct URL changes
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener("routeChangeStart", handleStart);
      window.removeEventListener("routeChangeComplete", handleComplete);
      window.removeEventListener("routeChangeError", handleComplete);
      clearTimeout(timer);
    };
  }, [isLoading, pathname, searchParams]);

  // Function to manually start navigation
  const startNavigation = () => {
    setIsLoading(true);
  };

  return (
    <NavigationContext.Provider value={{ isLoading, startNavigation }}>
      <PageLoader isLoading={isLoading} />
      <div
        className={
          isLoading
            ? "opacity-80"
            : "opacity-100 transition-opacity duration-300"
        }
      >
        {children}
      </div>
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => React.useContext(NavigationContext);
