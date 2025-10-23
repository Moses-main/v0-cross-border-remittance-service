function withValidProperties(
  properties: Record<string, undefined | string | string[]>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      // these will be added in step 5
      header: "",
      payload: "",
      signature: "",
    },
    baseBuilder: {
      allowedAddresses: [""], // add your Base Account address here
    },
    miniapp: {
      version: "1",
      name: "Beta Remittance",
      homeUrl: "htthttps://v0-cross-border-remittance-service.vercel.app",
      iconUrl: "https://v0-cross-border-remittance-service.vercel.app/beta.png",
      splashImageUrl:
        "https://v0-cross-border-remittance-service.vercel.app/splash.png",
      splashBackgroundColor: "#000000",
      webhookUrl:
        "https://v0-cross-border-remittance-service.vercel.app/api/webhook",
      subtitle: "Fast, fun, social",
      description: "A fast, fun way to challenge friends in real time.",
      screenshotUrls: [
        "https://v0-cross-border-remittance-service.vercel.app/s1.png",
        "https://v0-cross-border-remittance-service.vercel.app/s2.png",
        "https://v0-cross-border-remittance-service.vercel.app/s3.png",
      ],
      primaryCategory: "social",
      tags: ["payment", "remittance", "baseapp", "base", "multi-lingual"],
      heroImageUrl:
        "https://v0-cross-border-remittance-service.vercel.app/og.png",
      tagline: "Play instantly",
      ogTitle: "Example Mini App",
      ogDescription: "Challenge friends in real time.",
      ogImageUrl:
        "https://v0-cross-border-remittance-service.vercel.app/og.png",
      noindex: true,
    },
  }); // see the next step for the manifest_json_object
}
