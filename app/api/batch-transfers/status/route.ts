import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

export async function GET(request: NextRequest) {
  try {
    const batchId = request.nextUrl.searchParams.get("batchId")

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID required" }, { status: 400 })
    }

    const cacheKey = `batch_${batchId}`
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    // Return not found as we're not using dummy data anymore
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  } catch (error) {
    console.error("Batch status fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch batch status" }, { status: 500 })
  }
}
