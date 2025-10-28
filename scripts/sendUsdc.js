const { ethers } = require('ethers');
require('dotenv').config();

// Minimal ERC20 ABI for transfer + decimals
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

// Config
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// Base Sepolia USDC test token (from lib/constants.ts)
const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Defaults per user request
const DEFAULT_TO = '0xAA35312cFD2ff9DFe7A03B765354E12DB8c29D34';
const DEFAULT_AMOUNT = '0.02'; // 0.02 USDC

async function main() {
  if (!RPC_URL) throw new Error('Missing NEXT_PUBLIC_BASE_RPC_URL (or NEXT_PUBLIC_RPC_URL)');
  if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY');

  // Allow CLI overrides
  const args = process.argv.slice(2);
  const toFlagIndex = args.indexOf('--to');
  const amountFlagIndex = args.indexOf('--amount');
  const to = toFlagIndex !== -1 ? args[toFlagIndex + 1] : DEFAULT_TO;
  const amountStr = amountFlagIndex !== -1 ? args[amountFlagIndex + 1] : DEFAULT_AMOUNT;

  const isV6 = !!ethers.JsonRpcProvider && typeof ethers.formatUnits === 'function';
  const provider = isV6
    ? new ethers.JsonRpcProvider(RPC_URL) // ethers v6
    : new ethers.providers.JsonRpcProvider(RPC_URL); // ethers v5
  const wallet = new (isV6 ? ethers.Wallet : ethers.Wallet)(PRIVATE_KEY, provider);

  // Retry helper
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const withRetry = async (fn, label, attempts = 3, delayMs = 1500) => {
    let lastErr;
    for (let i = 1; i <= attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        console.warn(`[retry ${i}/${attempts}] ${label} failed:`, e.message || e);
        if (i < attempts) await sleep(delayMs * i);
      }
    }
    throw lastErr;
  };

  const net = await withRetry(() => provider.getNetwork(), 'getNetwork');
  console.log('Network:', net.name || net.chainId || 'unknown');
  console.log('From   :', wallet.address);
  console.log('USDC   :', USDC_ADDRESS);
  console.log('To     :', to);
  console.log('Amount :', amountStr, 'USDC');

  const erc20 = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
  const decimals = await erc20.decimals();
  const amount = isV6
    ? ethers.parseUnits(amountStr, decimals)
    : ethers.utils.parseUnits(amountStr, decimals);

  const balance = await withRetry(() => erc20.balanceOf(wallet.address), 'balanceOf');
  const formattedBal = isV6
    ? ethers.formatUnits(balance, decimals)
    : ethers.utils.formatUnits(balance, decimals);
  console.log('Current USDC balance:', formattedBal);
  const hasEnough = isV6 ? (balance >= amount) : !balance.lt(amount);
  if (!hasEnough) throw new Error('Insufficient USDC balance');

  console.log('Sending...');
  const tx = await withRetry(() => erc20.transfer(to, amount), 'erc20.transfer');
  console.log('Tx hash:', tx.hash);
  const receipt = await withRetry(() => tx.wait(), 'wait for receipt');
  console.log('Confirmed in block:', receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
