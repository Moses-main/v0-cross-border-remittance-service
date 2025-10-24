"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  token: string
  country: string
  status: "pending" | "completed" | "failed"
  timestamp: Date
  fee: string
  cashback: string
  exchangeRate: number
}

interface TransactionHistoryProps {
  userAddress: string
}

export function TransactionHistory({ userAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [userAddress])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transfers/history?address=${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions)
        } else {
          setTransactions([])
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-auto"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Cashback</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell className="text-sm">{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
              <TableCell className="font-mono text-xs">{tx.to.slice(0, 10)}...</TableCell>
              <TableCell className="font-medium">${tx.amount}</TableCell>
              <TableCell className="font-medium text-primary">{tx.token}</TableCell>
              <TableCell className="text-destructive">${tx.fee}</TableCell>
              <TableCell className="text-accent">${tx.cashback}</TableCell>
              <TableCell>{tx.country}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(tx.status)}>
                  {tx.status}
                </Badge>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )
}
