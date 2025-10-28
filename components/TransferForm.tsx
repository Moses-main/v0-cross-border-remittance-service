"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useWalletState } from "@/providers/wallet-state-provider";
import { SUPPORTED_TOKENS, SUPPORTED_COUNTRIES, NETWORK_CONFIG } from "@/lib/constants";
import { initiateRemittance } from "@/services/remittanceService";
import type { Address } from "viem";
import { createPublicClient, http, parseAbi, parseUnits, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";
import REMITTANCE_ABI, { REMITTANCE_CONTRACT_ADDRESS, ERC20_ABI } from "@/lib/web3-config";



type TokenSymbol = typeof SUPPORTED_TOKENS[number]["symbol"]; // e.g., "USDC" | "USDT"

export function TransferForm() {
  const { isConnected, address } = useWalletState();
  const supportedTokens = SUPPORTED_TOKENS.map((t) => t.symbol) as TokenSymbol[];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feePreview, setFeePreview] = useState<string>("");
  const [totalPreview, setTotalPreview] = useState<string>("");
  const [balancePreview, setBalancePreview] = useState<string>("");
  const [hasShortfall, setHasShortfall] = useState(false);

  const [formData, setFormData] = useState<{ recipient: string; amount: string; token: TokenSymbol; country: string }>(
    {
      recipient: "",
      amount: "",
      token: supportedTokens[0] || "USDC",
      country: "NG",
    }
  );

  // No dynamic token loading; static tokens are used

  // Live fee/balance preview
  useEffect(() => {
    const run = async () => {
      try {
        setHasShortfall(false);
        setFeePreview("");
        setTotalPreview("");
        setBalancePreview("");

        if (!isConnected || !address) return;
        if (!formData.amount || Number(formData.amount) <= 0) return;

        const tokenInfo = SUPPORTED_TOKENS.find((t) => t.symbol === formData.token);
        if (!tokenInfo) return;

        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
        });

        const valueInUnits = parseUnits(formData.amount, tokenInfo.decimals);

        // Read fee from contract
        const fee = (await client.readContract({
          abi: REMITTANCE_ABI as any,
          address: REMITTANCE_CONTRACT_ADDRESS,
          functionName: "calculateFee",
          args: [valueInUnits],
        })) as bigint;

        const total = valueInUnits + fee;

        // Read balance from token
        const erc20Abi = parseAbi(ERC20_ABI as readonly string[]);
        const balance = (await client.readContract({
          abi: erc20Abi,
          address: tokenInfo.address as Address,
          functionName: "balanceOf",
          args: [address as Address],
        })) as bigint;

        setFeePreview(`${formatUnits(fee, tokenInfo.decimals)} ${tokenInfo.symbol}`);
        setTotalPreview(`${formatUnits(total, tokenInfo.decimals)} ${tokenInfo.symbol}`);
        setBalancePreview(`${formatUnits(balance, tokenInfo.decimals)} ${tokenInfo.symbol}`);
        setHasShortfall(balance < total);
      } catch (e) {
        // Silent fail for preview; don't block form
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, formData.amount, formData.token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTokenChange = (value: TokenSymbol) => {
    setFormData((prev) => ({ ...prev, token: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.recipient || !formData.amount || !formData.token || !formData.country) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!formData.recipient.startsWith("0x") || formData.recipient.length !== 42) {
      toast.error("Invalid recipient address");
      return;
    }

    try {
      setIsSubmitting(true);

      // Find token details
      const tokenInfo = SUPPORTED_TOKENS.find((t) => t.symbol === formData.token);
      if (!tokenInfo) {
        toast.error("Unsupported token selected");
        return;
      }

      const { address: tokenAddress, decimals } = tokenInfo;

      if (hasShortfall) {
        toast.error("Insufficient balance for amount + fee");
        return;
      }

      const result = await initiateRemittance({
        recipient: formData.recipient as Address,
        amount: formData.amount,
        country: formData.country,
        token: tokenAddress as Address,
        decimals,
        owner: address as Address,
      });

      const tx = typeof result.txHash === "string" ? result.txHash : String(result.txHash);
      const explorerBase = NETWORK_CONFIG.blockExplorerUrl?.replace(/\/$/, "") || "https://sepolia.basescan.org";
      const href = `${explorerBase}/tx/${tx}`;
      // Notify other components (e.g., history) to refresh
      try {
        window.dispatchEvent(new CustomEvent("remit:tx-submitted", { detail: { txHash: tx } }));
      } catch {}
      toast.success("Transfer submitted", {
        description: (
          <span>
            Tx Hash: <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{tx.slice(0, 10)}...</a>
          </span>
        ),
        action: {
          label: "View on BaseScan",
          onClick: () => window.open(href, "_blank", "noopener,noreferrer"),
        },
        position: "top-center",
      });

      // Reset form
      setFormData({
        recipient: "",
        amount: "",
        token: supportedTokens[0] || "USDC",
        country: "NG",
      });
      setFeePreview("");
      setTotalPreview("");
      setBalancePreview("");
      setHasShortfall(false);
    } catch (err: any) {
      console.error("Transfer error:", err);
      toast.error("Transfer failed", {
        description: err.message || "An error occurred during the transfer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Render UI regardless of wallet connection

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Money</CardTitle>
        <CardDescription>Transfer funds to any country</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0x..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Recipient Country</Label>
            <Select
              value={formData.country}
              onValueChange={(val) => setFormData((p) => ({ ...p, country: val }))}
              required
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Country selection removed per request; default is applied internally */}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.000000000000000001"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="flex-1"
              />
              <Select value={formData.token} onValueChange={handleTokenChange} required>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {supportedTokens.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {feePreview && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Fee: {feePreview}</div>
                <div>Total (amount + fee): {totalPreview}</div>
                <div>Your balance: {balancePreview}</div>
                {hasShortfall && (
                  <div className="text-red-600">
                    Insufficient balance for total. Reduce amount or fund your wallet.
                  </div>
                )}
              </div>
            )}
          </div>

        
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isSubmitting || !formData.token || !isConnected || hasShortfall}
          >
            {isSubmitting ? "Processing..." : isConnected ? "Send Money" : "Connect wallet to send"}
          </Button>

          {/* {contractError && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
              {contractError}
            </div>
          )} */}
        </form>
      </CardContent>
    </Card>
  );
}
