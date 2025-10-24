import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const cacheKey = `batch_list_${address}`
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json({ batches: cached }, { status: 200 })
    }

    // TODO: Implement batch transfers functionality in smart contract
    // For now, return empty array as batch transfers are not implemented yet
    const batches: any[] = []

    setCachedResponse(cacheKey, batches)

    return NextResponse.json({ batches }, { status: 200 })
  } catch (error) {
    console.error("Batch list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch batch list" }, { status: 500 })
  }
}
