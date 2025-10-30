"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, LinkIcon, QrCode } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useWalletState } from "@/providers/wallet-state-provider";
import { toast } from "sonner";
import { NETWORK_CONFIG, SUPPORTED_TOKENS } from "@/lib/constants";
import { formatUnits, parseUnits } from "viem";

type PaymentType = "address" | "erc20" | "native";

export default function ReceivePage() {
  const { address, isConnected } = useWalletState();
  const [qrUrl, setQrUrl] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [paymentType, setPaymentType] = useState<PaymentType>("address");
  const [selectedToken, setSelectedToken] = useState<string>(SUPPORTED_TOKENS[0]?.symbol || "USDC");
  const [amount, setAmount] = useState<string>("");
  const [purposeTitle, setPurposeTitle] = useState<string>("");
  const [purposeNote, setPurposeNote] = useState<string>("");

  const chainId = NETWORK_CONFIG.chainId || 84532;

  // Build a token map for decimals/address
  const tokenMap = useMemo(() => {
    const map: Record<string, { address: string; decimals: number; symbol: string }> = {};
    try {
      for (const t of SUPPORTED_TOKENS || []) {
        map[t.symbol] = { address: t.address as string, decimals: t.decimals, symbol: t.symbol };
      }
    } catch {}
    return map;
  }, []);

  // Build the data payload for QR based on payment type
  const qrData = useMemo(() => {
    if (!address) return "";
    if (paymentType === "address") {
      // Just recipient; wallet chooses asset/amount
      return `ethereum:${address}@${chainId}`;
    }
    if (paymentType === "native") {
      // Native ETH with optional amount
      let wei = "";
      try {
        wei = amount && Number(amount) > 0 ? `?value=${parseUnits(amount, 18)}` : "";
      } catch {
        wei = "";
      }
      return `ethereum:${address}@${chainId}${wei}`;
    }
    // ERC-20 transfer via EIP-681: ethereum:<tokenAddress>@chainId/transfer?address=<to>&uint256=<amountInUnits>
    const token = tokenMap[selectedToken];
    if (!token) return `ethereum:${address}@${chainId}`;
    const hasAmt = amount && Number(amount) > 0;
    let amtUnits: bigint = 0n;
    try {
      amtUnits = hasAmt ? parseUnits(amount, token.decimals) : 0n;
    } catch {
      amtUnits = 0n;
    }
    // If amount not provided, set to 0; many wallets allow editing before send
    const query = `?address=${address}&uint256=${amtUnits.toString()}`;
    return `ethereum:${token.address}@${chainId}/transfer${query}`;
  }, [address, chainId, paymentType, amount, selectedToken, tokenMap]);

  useEffect(() => {
    if (!address) {
      setQrUrl("");
      setShareUrl("");
      return;
    }
    // Use a lightweight QR code service (no dependency) – data is schema URI
    const data = encodeURIComponent(qrData || address);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${data}`;
    setQrUrl(url);

    // Shareable link back to this page that pre-fills the recipient
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const params = new URLSearchParams();
      params.set("to", address);
      params.set("type", paymentType);
      if (paymentType !== "address") {
        if (paymentType === "erc20") params.set("token", selectedToken);
        if (amount) params.set("amount", amount);
      }
      if (purposeTitle) params.set("title", purposeTitle);
      if (purposeNote) params.set("note", purposeNote);
      setShareUrl(`${origin}/receive?${params.toString()}`);
    } catch {
      setShareUrl("");
    }
  }, [address, qrData, paymentType, selectedToken, amount, purposeTitle, purposeNote]);

  // Prefill from URL params (to, type, token, amount) without crashing if absent
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const to = params.get("to");
      const type = params.get("type") as PaymentType | null;
      const token = params.get("token");
      const amt = params.get("amount");
      const title = params.get("title");
      const note = params.get("note");
      if (to && !address) {
        // No-op: we only display connected address right now; could support override if desired
      }
      if (type && (type === "address" || type === "erc20" || type === "native")) {
        setPaymentType(type);
      }
      if (token && tokenMap[token]) {
        setSelectedToken(token);
      }
      if (amt) {
        setAmount(amt);
      }
      if (title) setPurposeTitle(title);
      if (note) setPurposeNote(note);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Receive funds</CardTitle>
            <CardDescription>Share your address or QR so others can send you tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Address + Copy */}
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Your wallet address</div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={address ?? "Not connected"} />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isConnected || !address}
                    onClick={() => address && copy(address, "Address copied")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tip: This address can receive supported stablecoins (USDC/USDT) on Base Sepolia and ETH for gas.
                </div>

                {/* Payment Type */}
                <div className="mt-4 grid gap-2">
                  <div className="text-sm font-medium">Payment type</div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant={paymentType === "address" ? "default" : "outline"} onClick={() => setPaymentType("address")}>
                      Address only
                    </Button>
                    <Button type="button" variant={paymentType === "erc20" ? "default" : "outline"} onClick={() => setPaymentType("erc20")}>
                      ERC-20 transfer
                    </Button>
                    <Button type="button" variant={paymentType === "native" ? "default" : "outline"} onClick={() => setPaymentType("native")}>
                      Native ETH
                    </Button>
                  </div>
                </div>

                {/* Token + Amount (conditional) */}
                {paymentType !== "address" && (
                  <div className="mt-3 grid gap-3">
                    {paymentType === "erc20" && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm w-28">Token</label>
                        <select
                          className="flex-1 border bg-transparent rounded px-2 py-2"
                          value={selectedToken}
                          onChange={(e) => setSelectedToken(e.target.value)}
                        >
                          {SUPPORTED_TOKENS.map((t) => (
                            <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="text-sm w-28">Amount</label>
                      <Input
                        inputMode="decimal"
                        placeholder="Optional"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {paymentType === "erc20"
                        ? "QR encodes an ERC-20 transfer call (EIP-681). Some wallets prefill the transfer; others may show the address to send to."
                        : "QR encodes a native ETH payment (EIP-681) if amount provided, or just your address otherwise."}
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" /> Scan to pay
                </div>
                <div className="w-full flex items-center justify-center">
                  {isConnected && qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrUrl} alt="Wallet QR" className="h-60 w-60 rounded shadow" />
                  ) : (
                    <div className="h-60 w-60 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      Connect wallet to show QR
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  QR uses EIP-681:
                  {" "}
                  {paymentType === "address" && (
                    <span><code>ethereum:&lt;address&gt;@{chainId}</code> (address only)</span>
                  )}
                  {paymentType === "native" && (
                    <span><code>ethereum:&lt;address&gt;@{chainId}?value=&lt;wei&gt;</code> (native ETH)</span>
                  )}
                  {paymentType === "erc20" && (
                    <span><code>ethereum:&lt;tokenAddress&gt;@{chainId}/transfer?address=&lt;to&gt;&amp;uint256=&lt;amount&gt;</code> (ERC-20)</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purpose / Description Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Payment purpose</CardTitle>
            <CardDescription>Optionally add a title and note that will be included in your share link.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm w-28">Title</label>
                <Input
                  placeholder="e.g., Rent for October"
                  value={purposeTitle}
                  onChange={(e) => setPurposeTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm w-28">Note</label>
                <Input
                  placeholder="Optional message to the payer"
                  value={purposeNote}
                  onChange={(e) => setPurposeNote(e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                This information isn’t part of the on-chain transaction. It’s encoded in the shareable link so the requester sees it when they open your Receive page.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Shareable link</CardTitle>
            <CardDescription>Send this link to allow others to open a pre-filled receive page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl} placeholder="Connect wallet to generate link" />
              <Button
                type="button"
                variant="outline"
                disabled={!shareUrl}
                onClick={() => shareUrl && copy(shareUrl, "Link copied")}
                title="Copy link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              {shareUrl && (
                <Button type="button" variant="secondary" onClick={() => window.open(shareUrl, "_blank")}> 
                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Opening this link on another device shows your address and QR; it preserves the type/token/amount and your purpose fields.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
