import { type NextRequest, NextResponse } from "next/server"
import { DUMMY_BATCH_TRANSFERS } from "@/lib/dummy-data"
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

    const batches = DUMMY_BATCH_TRANSFERS

    setCachedResponse(cacheKey, batches)

    return NextResponse.json({ batches }, { status: 200 })
  } catch (error) {
    console.error("Batch list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch batch list" }, { status: 500 })
  }
}
