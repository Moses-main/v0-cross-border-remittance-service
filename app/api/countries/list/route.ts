import { NextResponse } from "next/server"
import { DUMMY_COUNTRIES, DUMMY_TOKENS } from "@/lib/dummy-data"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

export async function GET() {
  try {
    const cacheKey = "countries_tokens_list"
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    const data = {
      countries: DUMMY_COUNTRIES,
      tokens: DUMMY_TOKENS,
    }

    setCachedResponse(cacheKey, data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Countries list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch countries list" }, { status: 500 })
  }
}
