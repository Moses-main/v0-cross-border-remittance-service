import { NextResponse } from "next/server"
import { getCachedResponse } from "@/lib/performance-utils"

export async function GET() {
  try {
    const cacheKey = "countries_tokens_list"
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    // Return empty arrays as we're not using dummy data anymore
    const data = {
      countries: [],
      tokens: [],
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Countries list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch countries list" }, { status: 500 })
  }
}
