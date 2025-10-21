// Web3 configuration for Base Sepolia
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainName: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorerUrl: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
}

// USDC on Base Sepolia (testnet)
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

// RemittanceService contract address (deploy and update this)
export const REMITTANCE_CONTRACT_ADDRESS = "0x..." // Update after deployment

export const REMITTANCE_ABI = [
  {
    inputs: [{ internalType: "address", name: "_referrer", type: "address" }],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_recipient", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "string", name: "_recipientCountry", type: "string" },
    ],
    name: "sendRemittance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawCashback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawReferralRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_userAddress", type: "address" }],
    name: "getUser",
    outputs: [
      {
        components: [
          { internalType: "address", name: "walletAddress", type: "address" },
          { internalType: "uint256", name: "totalSent", type: "uint256" },
          { internalType: "uint256", name: "totalReceived", type: "uint256" },
          { internalType: "uint256", name: "cashbackBalance", type: "uint256" },
          { internalType: "uint256", name: "referralRewards", type: "uint256" },
          { internalType: "address", name: "referrer", type: "address" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct RemittanceService.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
