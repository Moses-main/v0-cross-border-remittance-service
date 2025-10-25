const ROOT_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_URL) ||
  (typeof process !== "undefined" && process.env?.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjk5NDM1NSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGQ3Y0I1MEFkY0U5YTA5NUVFOEVkQ2M1RTIzNDVhYzM4MTFDQ2NFRWYifQ",
    payload:
      "eyJkb21haW4iOiJ2MC1jcm9zcy1ib3JkZXItcmVtaXR0YW5jZS1zZXJ2aWNlLnZlcmNlbC5hcHAifQ",
    signature:
      "F8V+QlukHQfZAIEb2z/h8RrmvDQ++vDA3DZwMnfTwutr/Vt6zxrKXBnnBQr5PZIx2wPILEPwrYzYxNmZh3PXhBw=",
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
