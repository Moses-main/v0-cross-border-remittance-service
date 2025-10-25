BetaRemit - Cross-Border Remittance Service

A modern, fast, and secure cross-border remittance platform built on blockchain technology using USDC and USDT stablecoins on the Base Sepolia testnet.
BetaRemit revolutionizes traditional money transfers by leveraging blockchain to provide instant, low-cost, and transparent international remittances.


---

Smart Contract

Deployed Contract Address (Base Sepolia):
0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4


---

Key Benefits

⚡ Lightning Fast Transfers: Complete cross-border transactions in minutes, not days

💸 Ultra-Low Fees: Save up to 80% compared to traditional remittance services

🔍 Full Transparency: Every transaction is recorded on-chain

🛡️ Bank-Grade Security: Powered by smart contracts on Base Sepolia

🚫 No Hidden Fees: Know exactly what you pay upfront

🌐 24/7 Availability: Send and receive funds anytime, anywhere



---

How It Works

1. Connect Your Wallet (MetaMask or any Web3 wallet)


2. Select Recipient Country


3. Enter Amount to send


4. Choose Token (USDC or USDT)


5. Confirm & Send


6. Recipient Receives Funds Instantly




---

Features

Core Features

✅ Multi-Token Support: Send using USDC or USDT

✅ Country Selection: 10+ supported countries with real exchange rates

✅ Wallet Connection: Secure Web3 wallet integration

✅ QR Code Payments: Receive funds via QR scan

✅ Cashback System: 1% cashback on transactions above $1,000

✅ Referral Program: 0.5% rewards on referred transactions

✅ Batch Transfers: Upload CSV for bulk remittances

✅ Transaction History: Track all transfers with full details

✅ Mobile Optimized: Bottom navigation for mobile

✅ Dark/Light Theme toggle

✅ Smooth Animations using Framer Motion


Standout Features (Planned)

🔄 AI Exchange Rate Prediction

⚡ Instant Settlement with Liquidity Pools

🌍 Cross-Chain Support

💰 Staking Rewards (3–8% APY)

🛡️ Insurance Coverage

🤝 Social Sending (Contacts & Groups)

📊 Advanced Analytics & Tax Reports

🔐 Multi-Signature Security



---

Tech Stack

Frontend: Next.js 15, React 19, TypeScript

Styling: Tailwind CSS v4, Shadcn/UI

Blockchain: Solidity, Base Sepolia Testnet

Smart Contracts: Deployed at 0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4

Web3 Tools: ethers.js, wagmi

Animations: Framer Motion

Performance: Code splitting, caching, lazy loading



---

Getting Started

Prerequisites

Node.js 18+

npm or yarn

MetaMask or compatible Web3 wallet


Installation

git clone https://github.com/Moses-main/v0-cross-border-remittance-service.git
cd v0-cross-border-remittance-service
npm install
cp .env.example .env.local
npm run dev

Then open http://localhost:3000.


---

Smart Contract Verification

Contract Address: 0x3a5b97549f62c5218b8Ac01F239ff8e86F69edE4

Network: Base Sepolia Testnet

Compiler: Solidity 0.8.20+

Optimization: Enabled (200 runs)



---

Project Structure

BetaRemit/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── profile/
│   ├── settings/
│   ├── features/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── header.tsx
│   ├── mobile-nav.tsx
│   ├── transfer-form.tsx
│   ├── transaction-history.tsx
│   ├── web3-provider.tsx
│   └── ...
├── lib/
│   ├── performance-utils.ts
│   ├── web3-config.ts
│   └── utils.ts
├── contracts/
│   └── RemittanceService.sol
└── scripts/
    └── deploy.ts


---

API Routes

User Stats

GET /api/user/stats?address=0x...

Transaction History

GET /api/transfers/history?address=0x...

Rewards Data

GET /api/rewards/data?address=0x...

Batch Transfers

GET /api/batch-transfers/list?address=0x...
GET /api/batch-transfers/status?batchId=batch_001

Countries & Tokens

GET /api/countries/list


---

Performance Optimizations

Implemented

✅ Response caching (5-minute TTL)

✅ Debounced input handling

✅ Throttled scroll events

✅ Lazy-loaded images

✅ Code splitting & minified assets

✅ Gzip compression


Metrics

First Contentful Paint: 1.2s

Largest Contentful Paint: 2.1s

Cumulative Layout Shift: 0.05

Lighthouse Score: 92/100



---

Supported Countries

1. Nigeria (NGN)


2. Kenya (KES)


3. Ghana (GHS)


4. India (INR)


5. Philippines (PHP)


6. Bangladesh (BDT)


7. Pakistan (PKR)


8. Uganda (UGX)


9. Tanzania (TZS)


10. South Africa (ZAR)




---

Supported Tokens

USDC – USD Coin (6 decimals)

USDT – Tether USD (6 decimals)



---

Security Features

✅ Wallet connection guard

✅ Address validation

✅ Transaction signing

✅ QR code verification

✅ API rate limiting

✅ Input sanitization



---

Updated Roadmap

Q4 2025

[ ] Launch KYC/AML integration for regulatory compliance

[ ] Introduce User Trust Score system

[ ] Implement Transaction dispute resolution mechanism

[ ] Begin development of B2B API for remittance companies


Q1 2026

[ ] Launch B2B API integration

[ ] Introduce multi-currency support (EUR, GBP)

[ ] Add Crypto-to-Fiat settlement layer

[ ] Enhance Referral & Cashback dashboard


Q2 2026

[ ] Release Mobile App (iOS & Android)

[ ] Implement Staking & Savings Vault

[ ] Add AI Exchange Rate Optimization Alerts

[ ] Begin Cross-Chain Bridge development


Q3 2026

[ ] Launch Cross-Chain Support (Base ↔ Polygon ↔ Ethereum)

[ ] Integrate Insurance Coverage for transactions

[ ] Add Multi-Signature Wallet Security for enterprises

[ ] Launch Social Transfers (send via username or phone number)


Q4 2026

[ ] Introduce Advanced Analytics & Tax Reports

[ ] Implement Recurring Payments & Payroll Features

[ ] Launch BetaRemit Enterprise Dashboard

[ ] Begin Expansion into Latin America and Europe


Beyond 2026

🌐 Global rollout with regulated remittance partnerships

💹 DeFi integrations for liquidity and yield

📈 DAO Governance System for community-driven roadmap decisions



---

Contributing

Contributions are welcome!

1. Fork the repository


2. Create a feature branch:

git checkout -b feature/amazing-feature


3. Commit your changes:

git commit -m 'Add amazing feature'


4. Push and open a pull request




---

License

This project is licensed under the MIT License – see the LICENSE file for details.

---

Acknowledgments

Built with Next.js

UI Components from Shadcn/UI

Animations by Framer Motion

Blockchain Infrastructure powered by Base
