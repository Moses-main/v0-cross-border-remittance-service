import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

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

    // Return placeholder stats without blockchain calls
    const stats = {
      totalSent: "0.00",
      totalReceived: "0.00",
      cashbackBalance: "0.00",
      referralRewards: "0.00",
      transactionCount: 0,
      referralCount: 0,
      tier: "Bronze",
      nextTierThreshold: "1000.00",
    }

    setCachedResponse(cacheKey, stats)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
