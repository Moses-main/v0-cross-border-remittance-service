"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { SUPPORTED_TOKENS, NETWORK_CONFIG } from "@/lib/constants"
import { formatUnits } from "viem"

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  token: string
  country: string
  status: "pending" | "completed" | "failed"
  timestamp: number
  fee: string
  cashback: string
  exchangeRate: number
  txHash?: string | null
}

interface TransactionHistoryProps {
  userAddress: string
}

export function TransactionHistory({ userAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [start, setStart] = useState(0)
  const [count] = useState(10)
  const [returned, setReturned] = useState(0)
  const [polling, setPolling] = useState(false)
  const pollAttemptsRef = useRef(0)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const tokenMeta = useMemo(() => {
    const map: Record<string, { symbol: string; decimals: number; icon: string }> = {}
    for (const t of SUPPORTED_TOKENS) {
      map[t.symbol.toLowerCase()] = { symbol: t.symbol, decimals: t.decimals, icon: t.icon as string }
    }
    return map
  }, [])

  useEffect(() => {
    if (!userAddress) {
      setTransactions([])
      setIsLoading(false)
      return
    }
    setStart(0)
  }, [userAddress])

  useEffect(() => {
    if (!userAddress) return
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, start, count])

  // Live refresh: listen for transfer submissions and poll for updates briefly
  useEffect(() => {
    const onSubmitted = () => {
      // reset pagination and fetch
      setStart(0)
      void fetchTransactions(true)
      // start polling for up to ~30 seconds (6 attempts every 5s)
      setPolling(true)
      pollAttemptsRef.current = 0
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      pollTimerRef.current = setInterval(() => {
        pollAttemptsRef.current += 1
        void fetchTransactions()
        if (pollAttemptsRef.current >= 6) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current)
          pollTimerRef.current = null
          setPolling(false)
        }
      }, 5000)
    }
    window.addEventListener("remit:tx-submitted", onSubmitted as EventListener)
    return () => {
      window.removeEventListener("remit:tx-submitted", onSubmitted as EventListener)
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

  const fetchTransactions = async (forceLoading = false) => {
    try {
      if (!userAddress) return
      if (forceLoading) setIsLoading(true)
      const response = await fetch(`/api/transfers/history?address=${userAddress}&start=${start}&count=${count}`)
      if (response.ok) {
        const data = await response.json()
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions)
          setReturned(data.pagination?.returned ?? data.transactions.length)
        } else {
          setTransactions([])
          setReturned(0)
        }
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  const formatAmount = (raw: string, tokenSymbol: string) => {
    const meta = tokenMeta[tokenSymbol?.toLowerCase?.() || ""]
    if (!meta) return `${raw} ${tokenSymbol}`
    try {
      const v = formatUnits(BigInt(raw), meta.decimals)
      return `${Number(v).toFixed(2)} ${meta.symbol}`
    } catch {
      return `${raw} ${meta.symbol}`
    }
  }

  const you = userAddress?.toLowerCase?.() || ""

  const explorerFor = (txHash?: string | null) => {
    if (!txHash) return undefined
    const base = NETWORK_CONFIG.blockExplorerUrl?.replace(/\/$/, "") || "https://sepolia.basescan.org"
    return `${base}/tx/${txHash}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-auto"
    >
      {/* Mobile cards (smaller screens) */}
      <div className="md:hidden space-y-2">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded border p-3 bg-card text-card-foreground"
          >
            {/* Line 1: token icon + amount (left), direction icon (right) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Token icon (from constants) */}
                <span className="text-xl" aria-hidden>
                  {tokenMeta[tx.token.toLowerCase()]?.icon || "💰"}
                </span>
                <span className="font-semibold">{formatAmount(tx.amount, tx.token)}</span>
              </div>
              <div aria-label={tx.from?.toLowerCase() === you ? "Sent" : tx.to?.toLowerCase() === you ? "Received" : "Other"}>
                {tx.from?.toLowerCase() === you ? (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                ) : tx.to?.toLowerCase() === you ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            {/* Line 2: timestamp (left), explorer link with short hash (right) */}
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(tx.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                {tx.txHash ? (
                  <a
                    href={explorerFor(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                    aria-label="View on explorer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> {tx.txHash.slice(0, 8)}...
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop table (md and up) */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Direction</TableHead>
            <TableHead className="whitespace-nowrap">Recipient</TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">Fee</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">Cashback</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Country</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <motion.tr
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-b border-border/50 hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-sm">{new Date(tx.timestamp).toLocaleString()}</TableCell>
              <TableCell>
                {tx.from?.toLowerCase() === you ? (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Sent</Badge>
                ) : tx.to?.toLowerCase() === you ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Received</Badge>
                ) : (
                  <Badge variant="outline">Other</Badge>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{tx.to.slice(0, 10)}...</TableCell>
              <TableCell className="font-medium">{formatAmount(tx.amount, tx.token)}</TableCell>
              <TableCell className="hidden sm:table-cell text-destructive">{formatAmount(tx.fee, tx.token)}</TableCell>
              <TableCell className={`hidden sm:table-cell ${Number(tx.cashback) > 0 ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                {Number(tx.cashback) > 0 ? formatAmount(tx.cashback, tx.token) : "-"}
              </TableCell>
              <TableCell className="hidden md:table-cell">{tx.country}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(tx.status)}>
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell font-mono text-xs">
                {tx.txHash ? (
                  <a
                    href={explorerFor(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {tx.txHash.slice(0, 10)}...
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-3">
        <button
          className="px-3 py-1 text-sm rounded border hover:bg-muted disabled:opacity-50"
          onClick={() => setStart(Math.max(0, start - count))}
          disabled={start === 0}
        >
          Previous
        </button>
        <div className="text-xs text-muted-foreground">
          Showing {start + 1} - {start + returned} {returned < count ? "" : `of ~${start + returned}+`}
        </div>
        <button
          className="px-3 py-1 text-sm rounded border hover:bg-muted disabled:opacity-50"
          onClick={() => setStart(start + count)}
          disabled={returned < count}
        >
          Next
        </button>
      </div>
    </motion.div>
  )
}
