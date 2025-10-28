import { type NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import REMITTANCE_ABI, { REMITTANCE_CONTRACT_ADDRESS } from "@/lib/web3-config";
import { SUPPORTED_TOKENS } from "@/lib/constants";

const TOKEN_SYMBOL_BY_ADDRESS: Record<string, string> = Object.fromEntries(
  SUPPORTED_TOKENS.map((t) => [t.address.toLowerCase(), t.symbol])
);

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const startParam = request.nextUrl.searchParams.get("start");
    const countParam = request.nextUrl.searchParams.get("count");

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 });
    }

    const start = Math.max(parseInt(startParam || "0", 10) || 0, 0);
    const count = Math.min(Math.max(parseInt(countParam || "50", 10) || 50, 1), 100);

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Fetch the user's transaction IDs (both sent and received are pushed per contract)
    const txIds = (await client.readContract({
      abi: REMITTANCE_ABI as any,
      address: REMITTANCE_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "getUserTransactionIds",
      args: [address as `0x${string}`, BigInt(start), BigInt(count)],
    })) as bigint[];

    // Build a map of txId -> txHash by querying decoded events
    let txHashById = new Map<string, string>();
    try {
      const logsSender = await client.getContractEvents({
        address: REMITTANCE_CONTRACT_ADDRESS as `0x${string}`,
        abi: REMITTANCE_ABI as any,
        eventName: 'TransferInitiated',
        args: { sender: address as `0x${string}` },
        fromBlock: 0n,
        toBlock: 'latest',
      });
      const logsRecipient = await client.getContractEvents({
        address: REMITTANCE_CONTRACT_ADDRESS as `0x${string}`,
        abi: REMITTANCE_ABI as any,
        eventName: 'TransferInitiated',
        args: { recipient: address as `0x${string}` },
        fromBlock: 0n,
        toBlock: 'latest',
      });
      for (const log of [...logsSender, ...logsRecipient]) {
        const anyLog = log as any;
        const idHex = anyLog?.args?.txId as bigint | undefined;
        if (typeof idHex === 'bigint') {
          txHashById.set(idHex.toString(), anyLog.transactionHash as string);
        }
      }
    } catch (e) {
      // Non-fatal: continue without tx hashes
    }

    // Fetch each transaction details
    const transactions = await Promise.all(
      txIds.map(async (id) => {
        const [sender, recipient, amount, fee, cashback, timestamp, country, token, groupId, completed] =
          (await client.readContract({
            abi: REMITTANCE_ABI as any,
            address: REMITTANCE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: "getTransaction",
            args: [id],
          })) as [
            `0x${string}`,
            `0x${string}`,
            bigint,
            bigint,
            bigint,
            bigint,
            string,
            `0x${string}`,
            bigint,
            boolean
          ];

        const tokenSymbol = TOKEN_SYMBOL_BY_ADDRESS[String(token).toLowerCase()] || "TOKEN";

        return {
          id: String(id),
          from: sender,
          to: recipient,
          amount: amount.toString(),
          token: tokenSymbol,
          country,
          status: completed ? "completed" : "pending",
          timestamp: Number(timestamp) * 1000,
          fee: fee.toString(),
          cashback: cashback.toString(),
          exchangeRate: 1,
          txHash: txHashById.get(String(id)) || null,
        };
      })
    );

    return new NextResponse(
      JSON.stringify({
        transactions,
        pagination: { start, count, returned: transactions.length },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
