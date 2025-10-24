import { NextResponse } from "next/server"
import { SUPPORTED_COUNTRIES, SUPPORTED_TOKENS } from "@/lib/constants"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"

export async function GET() {
  try {
    const cacheKey = "countries_tokens_list"
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }

    const data = {
      countries: SUPPORTED_COUNTRIES,
      tokens: SUPPORTED_TOKENS,
    }

    setCachedResponse(cacheKey, data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Countries list fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch countries list" }, { status: 500 })
  }
}
