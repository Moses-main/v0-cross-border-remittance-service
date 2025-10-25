import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"
import { getUserInfo } from "@/utils/paymentService"
import { baseSepolia } from "viem/chains"
import { createPublicClient, http } from "viem"

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

    // Create a public client for blockchain interaction
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })

    // Get user info from the smart contract
    const userInfo = await getUserInfo(client as any, address as `0x${string}`)

    if (!userInfo) {
      const rewardsData = {
        cashbackBalance: "0.00",
        referralRewards: "0.00",
        totalEarned: "0.00",
        referralCode: `REF-${address.slice(2, 8).toUpperCase()}`,
        referralCount: 0,
        tier: "Bronze",
        referrals: [],
      }
      setCachedResponse(cacheKey, rewardsData)
      return NextResponse.json(rewardsData, { status: 200 })
    }

    // Calculate total earned
    const cashbackFloat = parseFloat(userInfo.cashbackEarned.toString()) / 1e6 // Convert from wei to USDC
    const referralFloat = parseFloat(userInfo.referralRewards.toString()) / 1e6 // Convert from wei to USDC
    const totalEarned = (cashbackFloat + referralFloat).toFixed(2)

    // Generate referral code
    const referralCode = `REF-${address.slice(2, 8).toUpperCase()}`

    // Determine tier based on referral count
    const tier = userInfo.referralCount >= 5 ? "Gold" : userInfo.referralCount >= 2 ? "Silver" : "Bronze"

    const rewardsData = {
      cashbackBalance: cashbackFloat.toFixed(2),
      referralRewards: referralFloat.toFixed(2),
      totalEarned,
      referralCode,
      referralCount: userInfo.referralCount,
      tier,
      referrals: [], // TODO: Get actual referrals from contract if available
    }

    return NextResponse.json(rewardsData, { status: 200 })
  } catch (error) {
    console.error("Rewards data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards data" }, { status: 500 })
  }
}
