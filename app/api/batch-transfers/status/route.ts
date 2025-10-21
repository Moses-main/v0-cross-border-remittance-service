import { type NextRequest, NextResponse } from "next/server"
import { DUMMY_BATCH_TRANSFERS } from "@/lib/dummy-data"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

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

    const batch = DUMMY_BATCH_TRANSFERS.find((b) => b.id === batchId)

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    const batchStatus = {
      batchId,
      status: batch.status,
      totalTransactions: batch.totalTransfers,
      completed: batch.completedCount,
      failed: batch.failedCount,
      processing: batch.totalTransfers - batch.completedCount - batch.failedCount,
      createdAt: batch.uploadDate.toISOString(),
      totalAmount: batch.totalAmount,
      token: batch.token,
    }

    setCachedResponse(cacheKey, batchStatus)

    return NextResponse.json(batchStatus, { status: 200 })
  } catch (error) {
    console.error("Batch status fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch batch status" }, { status: 500 })
  }
}
