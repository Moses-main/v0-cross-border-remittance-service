import { type NextRequest, NextResponse } from "next/server"
import { getCachedResponse, setCachedResponse } from "@/lib/performance-utils"
import { getUserTransactions } from "@/utils/paymentService"
import { baseSepolia } from "viem/chains"
import { createPublicClient, http } from "viem"

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

    // Create a public client for blockchain interaction
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })

    // Get transactions from the smart contract
    const blockchainTransactions = await getUserTransactions(client as any, address as `0x${string}`, 0, 50)

    // Format transactions for frontend compatibility
    const transactions = blockchainTransactions.map(tx => ({
      id: tx.id.toString(),
      from: tx.from,
      to: tx.to,
      amount: tx.amount.toString(),
      token: "USDC", // TODO: Get actual token from contract
      country: "", // TODO: Get country from contract if available
      status: tx.status,
      timestamp: new Date(Number(tx.timestamp) * 1000),
      fee: "0", // TODO: Calculate fee
      cashback: "0", // TODO: Get cashback from contract
      exchangeRate: 1, // TODO: Get actual exchange rate
    }))

    setCachedResponse(cacheKey, transactions)

    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
