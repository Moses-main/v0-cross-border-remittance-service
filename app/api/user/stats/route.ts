import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const cacheKey = `stats_${address}`
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    // Return default values as we're not using dummy data anymore
    const stats = {
      totalSent: "0.00",
      totalReceived: "0.00",
      cashbackBalance: "0.00",
      referralRewards: "0.00",
      transactionCount: 0,
      referralCount: 0,
      tier: "Basic",
      nextTierThreshold: "10000.00"
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
