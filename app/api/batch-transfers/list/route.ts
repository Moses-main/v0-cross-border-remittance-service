import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

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

    // Return empty array as we're not using dummy data anymore
    const batches: any[] = []
    return NextResponse.json({ batches }, { status: 200 })
  } catch (error) {
    console.error("Batch list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch batch list" }, { status: 500 })
  }
}
