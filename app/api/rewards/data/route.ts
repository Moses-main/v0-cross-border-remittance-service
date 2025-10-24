import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const cacheKey = `rewards_${address}`
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    // Return default values as we're not using dummy data anymore
    const rewardsData = {
      cashbackBalance: "0.00",
      referralRewards: "0.00",
      totalEarned: "0.00",
      referralCode: `REF-${address.slice(2, 8).toUpperCase()}`,
      referralCount: 0,
      tier: "Basic",
      referrals: [],
    }

    return NextResponse.json(rewardsData, { status: 200 })
  } catch (error) {
    console.error("Rewards data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards data" }, { status: 500 })
  }
}
