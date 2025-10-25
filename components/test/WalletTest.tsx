"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/use-web3";

export default function WalletTest() {
  const {
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    balance,
    usdcBalance,
  } = useWeb3();

  const [status, setStatus] = useState<string>("Disconnected");

  useEffect(() => {
    if (isConnected && account) {
      setStatus(
        `Connected: ${account.substring(0, 6)}...${account.substring(
          account.length - 4
        )}`
      );
    } else if (isLoading) {
      setStatus("Connecting...");
    } else {
      setStatus("Disconnected");
    }
  }, [isConnected, account, isLoading]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Wallet Connection Test</h2>

      <div className="space-y-4">
        <div>
          <p className="font-medium">Status:</p>
          <p className="text-sm text-gray-600">{status}</p>
        </div>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            Error: {error}
          </div>
        )}

        {isConnected ? (
          <>
            <div>
              <p className="font-medium">ETH Balance:</p>
              <p className="text-sm text-gray-600">{balance} ETH</p>
            </div>
            <div>
              <p className="font-medium">USDC Balance:</p>
              <p className="text-sm text-gray-600">{usdcBalance} USDC</p>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              disabled={isLoading}
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );
}
