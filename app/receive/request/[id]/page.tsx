import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUPPORTED_TOKENS, TOKEN_ADDRESSES, NETWORK_CONFIG } from "@/lib/constants";
import { formatUnits, parseUnits } from "viem";
import { QrCode, Copy, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// This page is public and doesn't require auth
// It shows payment request details and allows sending to the recipient

export default function PaymentRequestPage({
  params,
  searchParams,
}: {
  params: { id: string }; // Request ID (not used yet, but could be for DB lookups)
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract params from URL
  const recipient = searchParams.to as string;
  const tokenSymbol = (searchParams.token as string) || "USDC";
  const amount = searchParams.amount as string;
  const title = searchParams.title as string;
  const note = searchParams.note as string;

  const tokenInfo = SUPPORTED_TOKENS.find((t) => t.symbol === tokenSymbol);
  
  // Format amount with token decimals if available
  const formatAmount = (amt: string, decimals: number = 6) => {
    try {
      return parseFloat(amt).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
      });
    } catch {
      return amt;
    }
  };

  const copy = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Generate QR code URL for the payment
  const getQrData = () => {
    if (!recipient) return "";
    
    const chainId = NETWORK_CONFIG.chainId || 84532;
    
    // If it's a token transfer
    if (tokenInfo && amount) {
      try {
        const amountWei = parseUnits(amount, tokenInfo.decimals);
        return `ethereum:${tokenInfo.address}@${chainId}/transfer?address=${recipient}&uint256=${amountWei}`;
      } catch {
        // Fallback to just address if amount parsing fails
        return `ethereum:${recipient}@${chainId}`;
      }
    }
    
    // Default: Just the address
    return `ethereum:${recipient}@${chainId}`;
  };

  const qrData = getQrData();
  const qrUrl = qrData 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    : "";

  // If no recipient, show error
  if (!recipient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Invalid Payment Request</h1>
        <p className="text-muted-foreground mb-6">This payment link is missing required information.</p>
        <Link href="/" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to app
          </Link>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {title || 'Payment Request'}
          </h1>
          {note && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {note}
            </p>
          )}
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Send {amount ? `${formatAmount(amount)} ${tokenSymbol}` : `crypto`} to the address below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border border-border">
                  {qrUrl ? (
                    <img 
                      src={qrUrl} 
                      alt="Payment QR Code" 
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-muted flex items-center justify-center text-muted-foreground">
                      QR Code Unavailable
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Recipient Address</div>
                <div className="flex items-center gap-2">
                  <Input 
                    readOnly 
                    value={recipient} 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copy(recipient, 'Address copied!')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {formatAmount(amount, tokenInfo?.decimals)} {tokenSymbol}
                    </span>
                  </div>
                )}
                {tokenInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-medium">{tokenInfo.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">Base Sepolia</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            <Button size="lg" className="w-full" asChild>
              <a 
                href={`https://sepolia.basescan.org/address/${recipient}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </a>
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              Powered by Remit
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>This is a payment request. Only send funds to addresses you trust.</p>
          <p className="mt-1">
            <Link href="/" className="text-primary hover:underline">
              Create your own payment request
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
