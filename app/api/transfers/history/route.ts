import { type NextRequest, NextResponse } from "next/server"
import { DUMMY_TRANSACTIONS } from "@/lib/dummy-data"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const cacheKey = `history_${address}`
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json({ transactions: cached }, { status: 200 })
    }

    const transactions = DUMMY_TRANSACTIONS.filter((tx) => tx.from.toLowerCase() === address.toLowerCase())

    setCachedResponse(cacheKey, transactions)

    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
