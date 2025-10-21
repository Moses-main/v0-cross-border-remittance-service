import { type NextRequest, NextResponse } from "next/server"
import { DUMMY_USER_STATS, DUMMY_REFERRALS } from "@/lib/dummy-data"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

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

    const rewardsData = {
      cashbackBalance: DUMMY_USER_STATS.cashbackBalance,
      referralRewards: DUMMY_USER_STATS.referralRewards,
      totalEarned: (
        Number.parseFloat(DUMMY_USER_STATS.cashbackBalance) + Number.parseFloat(DUMMY_USER_STATS.referralRewards)
      ).toFixed(2),
      referralCode: `REF-${address.slice(2, 8).toUpperCase()}`,
      referralCount: DUMMY_REFERRALS.length,
      tier: DUMMY_USER_STATS.tier,
      referrals: DUMMY_REFERRALS,
    }

    setCachedResponse(cacheKey, rewardsData)

    return NextResponse.json(rewardsData, { status: 200 })
  } catch (error) {
    console.error("Rewards data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards data" }, { status: 500 })
  }
}
