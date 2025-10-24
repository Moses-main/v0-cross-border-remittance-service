const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI - This is a simplified version of the ABI containing only the functions we need
const REMITTANCE_ABI = [
  "function initiateTransfer(address _recipient, uint256 _amount, string memory _recipientCountry, address _token) external returns (uint256)",
  "function calculateFee(uint256 _amount) external view returns (uint256)",
  "function calculateNetAmount(uint256 _amount) external view returns (uint256)"
];

// Configuration
const config = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS,
  // Token addresses from your environment
  token1: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  token2: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
};

async function main() {
  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.privateKey, provider);
    
    console.log('Connected to network:', (await provider.getNetwork()).name);
    console.log('Sending from:', wallet.address);
    console.log('Contract address:', config.contractAddress);
    
    // Initialize contract
    const remittance = new ethers.Contract(
      config.contractAddress,
      REMITTANCE_ABI,
      wallet
    );
    
    // Transfer parameters
    const recipient = '0xb85a24c83E01F47DC9aF4B05b587a2B91862a735';
    const amount = ethers.parseUnits('0.1', 6); // 0.1 USDC (6 decimals)
    const recipientCountry = 'NG'; // Example country code
    const tokenAddress = config.token1; // Using the first token from your env (USDC)
    
    console.log('\nTransfer Details:');
    console.log('Recipient:', recipient);
    console.log('Amount:', ethers.formatUnits(amount, 18), 'tokens');
    console.log('Token:', tokenAddress);
    
    // Calculate fee and net amount
    const fee = await remittance.calculateFee(amount);
    const netAmount = await remittance.calculateNetAmount(amount);
    
    console.log('\nFee:', ethers.formatUnits(fee, 18), 'tokens');
    console.log('Net amount:', ethers.formatUnits(netAmount, 18), 'tokens');
    
    // Send transaction
    console.log('\nSending transaction...');
    const tx = await remittance.initiateTransfer(
      recipient,
      amount,
      recipientCountry,
      tokenAddress
    );
    
    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('\nTransaction confirmed in block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Find the TransferInitiated event in the transaction receipt
    const transferEvent = receipt.logs.find(
      log => 
        log.address.toLowerCase() === config.contractAddress.toLowerCase() &&
        log.topics[0] === ethers.id('TransferInitiated(uint256,address,address,uint256,uint256,uint256,string,address,uint256)')
    );
    
    if (transferEvent) {
      const event = remittance.interface.parseLog(transferEvent);
      console.log('\nTransfer Details:');
      console.log('Transaction ID:', event.args[0].toString());
      console.log('From:', event.args[1]);
      console.log('To:', event.args[2]);
      console.log('Amount:', ethers.formatUnits(event.args[3], 18), 'tokens');
      console.log('Fee:', ethers.formatUnits(event.args[4], 18), 'tokens');
      console.log('Cashback:', ethers.formatUnits(event.args[5], 18), 'tokens');
      console.log('Country:', event.args[6]);
      console.log('Token:', event.args[7]);
      console.log('Group ID:', event.args[8].toString());
    }
    
    return tx.hash;
    
  } catch (error) {
    console.error('Error:', error);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    if (error.transaction) {
      console.error('Transaction:', error.transaction);
    }
    process.exit(1);
  }
}

// Run the script
main()
  .then(hash => {
    console.log('\n✅ Transfer initiated successfully!');
    console.log('Transaction hash:', hash);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
