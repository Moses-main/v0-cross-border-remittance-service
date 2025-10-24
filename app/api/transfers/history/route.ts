import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

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

    // Return empty array as we're not using dummy data anymore
    const transactions: any[] = []
    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
