const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "BetaRemit",
    homeUrl: ROOT_URL,
    iconUrl: `${ROOT_URL}/beta.png`,
    splashImageUrl: `${ROOT_URL}/betaRemit.png`,
    splashBackgroundColor: "#000000",
    webhookUrl: `${ROOT_URL}/api/webhook`,
    subtitle: "pay, finance, currency",
    description:
      "BetaRemit is a blockchain-powered cross-border remittance platform offering fast, low-cost money transfers with cashback rewards and a seamless user experience.",
    screenshotUrls: [
      `${ROOT_URL}/s1.png`,
      `${ROOT_URL}/s2.png`,
      `${ROOT_URL}/s3.png`,
    ],
    primaryCategory: "finance",
    tags: ["payment", "remittance", "baseapp", "base", "multi-lingual"],
    heroImageUrl: `${ROOT_URL}/og.png`,
    tagline: "Pay instantly",
    ogTitle: "BetaRemit Mini App",
    ogDescription:
      "BetaRemit is a blockchain-powered cross-border remittance platform.",
    ogImageUrl: "https://v0-cross-border-remittance-service.vercel.app/og.png",
    noindex: true,
  },
} as const;
