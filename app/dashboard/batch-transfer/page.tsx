"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"
import { useState } from "react"
import { BatchUploadForm } from "@/components/batch-upload-form"

interface BatchTransaction {
  id: string
  recipientAddress: string
  amount: string
  country: string
  description: string
  status: "pending" | "processing" | "completed" | "failed"
  error?: string
}

export default function BatchTransferPage() {
  const { isConnected, address } = useWeb3()
  const [transactions, setTransactions] = useState<BatchTransaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setUploadStatus("idle")

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      // Parse CSV
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const recipientIndex = headers.indexOf("recipient")
      const amountIndex = headers.indexOf("amount")
      const countryIndex = headers.indexOf("country")
      const descriptionIndex = headers.indexOf("description")

      if (recipientIndex === -1 || amountIndex === -1 || countryIndex === -1) {
        setUploadStatus("error")
        setUploadMessage("CSV must contain: recipient, amount, country columns")
        setIsProcessing(false)
        return
      }

      // Parse transactions
      const parsedTransactions: BatchTransaction[] = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim())
        return {
          id: `batch-${Date.now()}-${index}`,
          recipientAddress: values[recipientIndex],
          amount: values[amountIndex],
          country: values[countryIndex],
          description: descriptionIndex !== -1 ? values[descriptionIndex] : "",
          status: "pending",
        }
      })

      setTransactions(parsedTransactions)
      setUploadStatus("success")
      setUploadMessage(`Successfully loaded ${parsedTransactions.length} transactions`)
    } catch (error) {
      setUploadStatus("error")
      setUploadMessage("Failed to parse CSV file")
      console.error("CSV parsing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessBatch = async () => {
    if (!address) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/batch-transfers/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: address,
          transactions,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus("success")
        setUploadMessage(`Batch processing started. ${data.processedCount} transactions queued.`)
        // Update transaction statuses
        setTransactions((prev) =>
          prev.map((tx) => ({
            ...tx,
            status: "processing",
          })),
        )
      } else {
        setUploadStatus("error")
        setUploadMessage(data.error || "Failed to process batch")
      }
    } catch (error) {
      setUploadStatus("error")
      setUploadMessage("An error occurred while processing batch")
      console.error("Batch processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template = "recipient,amount,country,description\n0x...,100,PH,Payment for services\n"
    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "batch-transfer-template.csv"
    a.click()
  }

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Please connect your wallet to use batch transfers</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "pending").length,
    processing: transactions.filter((t) => t.status === "processing").length,
    completed: transactions.filter((t) => t.status === "completed").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    totalAmount: transactions.reduce((sum, t) => sum + (Number.parseFloat(t.amount) || 0), 0),
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Batch Transfers</h1>
          <p className="text-muted-foreground mt-2">Upload and process multiple remittances at once</p>
        </div>

        {/* Stats */}
        {transactions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-5 animate-slide-up">
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card
              className="transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ animationDelay: "50ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </CardContent>
            </Card>

            <Card
              className="transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </CardContent>
            </Card>

            <Card
              className="transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ animationDelay: "150ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </CardContent>
            </Card>

            <Card
              className="transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="upload" className="w-full animate-slide-up" style={{ animationDelay: "100ms" }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Batch File</CardTitle>
                <CardDescription>Upload a CSV file with recipient details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <BatchUploadForm onFileUpload={handleFileUpload} isLoading={isProcessing} />

                {uploadStatus === "success" && (
                  <Alert className="border-green-500/50 bg-green-500/10 animate-slide-down">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">{uploadMessage}</AlertDescription>
                  </Alert>
                )}

                {uploadStatus === "error" && (
                  <Alert className="border-destructive/50 bg-destructive/10 animate-slide-down">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">{uploadMessage}</AlertDescription>
                  </Alert>
                )}

                {transactions.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProcessBatch}
                      disabled={isProcessing}
                      className="flex-1 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Process Batch"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTransactions([])
                        setUploadStatus("idle")
                      }}
                      className="transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Preview</CardTitle>
                <CardDescription>Review transactions before processing</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No transactions loaded. Upload a CSV file to preview.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx, index) => (
                          <TableRow
                            key={tx.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-mono text-xs">{tx.recipientAddress.slice(0, 10)}...</TableCell>
                            <TableCell>${tx.amount}</TableCell>
                            <TableCell>{tx.country}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{tx.description || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  tx.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                                    : tx.status === "processing"
                                      ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                      : tx.status === "completed"
                                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                                        : "bg-red-500/10 text-red-700 border-red-500/20"
                                }
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CSV Template</CardTitle>
                <CardDescription>Download a template to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`recipient,amount,country,description
0x742d35Cc6634C0532925a3b844Bc9e7595f42bE,100,PH,Payment for services
0x8ba1f109551bD432803012645Ac136ddd64DBA72,250,IN,Monthly salary
0x1234567890123456789012345678901234567890,500,MX,Invoice payment`}</pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Column Requirements:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      <strong>recipient</strong> - Wallet address (0x...)
                    </li>
                    <li>
                      <strong>amount</strong> - Transfer amount in USDC
                    </li>
                    <li>
                      <strong>country</strong> - Destination country code (PH, IN, MX, etc.)
                    </li>
                    <li>
                      <strong>description</strong> - Optional note for recipient
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={downloadTemplate}
                  className="w-full transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
