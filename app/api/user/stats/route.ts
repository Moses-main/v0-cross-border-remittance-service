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

    const cacheKey = `stats_${address}`
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
      return NextResponse.json({
        totalSent: "0.00",
        totalReceived: "0.00",
        cashbackBalance: "0.00",
        referralRewards: "0.00",
        transactionCount: 0,
        referralCount: 0,
        tier: "Bronze",
        nextTierThreshold: "1000.00",
      }, { status: 200 })
    }

    // Format the stats response
    const stats = {
      totalSent: userInfo.totalTransferred.toString(),
      totalReceived: userInfo.totalReceived.toString(),
      cashbackBalance: userInfo.cashbackEarned.toString(),
      referralRewards: userInfo.referralRewards.toString(),
      transactionCount: 0, // TODO: Get from contract if available
      referralCount: userInfo.referralCount,
      tier: userInfo.referralCount >= 5 ? "Gold" : userInfo.referralCount >= 2 ? "Silver" : "Bronze",
      nextTierThreshold: userInfo.referralCount >= 5 ? "50000.00" : userInfo.referralCount >= 2 ? "10000.00" : "1000.00",
    }

    setCachedResponse(cacheKey, stats)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
