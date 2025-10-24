import { type NextRequest, NextResponse } from "next/server"
import { initiateTransfer } from "@/utils/paymentService"
import { SUPPORTED_TOKENS } from "@/lib/constants"
import { baseSepolia } from "viem/chains"
import { createPublicClient, http } from "viem"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderAddress, recipientAddress, amount, country, paymentCurrency, description } = body

    // Validate inputs
    if (!senderAddress || !recipientAddress || !amount || !country || !paymentCurrency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (Number.parseFloat(amount) < 10) {
      return NextResponse.json({ error: "Minimum transfer amount is $10" }, { status: 400 })
    }

    // Get the token address for the selected payment currency
    const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === paymentCurrency)
    if (!tokenInfo) {
      return NextResponse.json({ error: "Invalid payment currency" }, { status: 400 })
    }

    // Convert amount to proper units (assuming USDC/USDT with 6 decimals)
    const amountInUnits = BigInt(Math.floor(Number.parseFloat(amount) * 10 ** tokenInfo.decimals))

    // This API route is deprecated - transfers should be initiated through the frontend
    // with a connected wallet using the Web3 context
    return NextResponse.json({
      error: "This API endpoint is deprecated. Please use the frontend TransferForm component with a connected wallet.",
      instruction: "The frontend now connects directly to the smart contract via Web3 context for security and real-time interaction."
    }, { status: 410 }) // 410 Gone - indicates the resource is no longer available
  } catch (error) {
    console.error("Transfer creation error:", error)
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 })
  }
}
