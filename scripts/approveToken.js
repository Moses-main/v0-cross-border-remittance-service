const { ethers } = require('ethers');
require('dotenv').config();

// ERC20 ABI with only the approve function
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
];

// Configuration
const config = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    remittanceContract: process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS,
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // TOKEN_1
    amount: ethers.MaxUint256 // Approve max amount
};

async function main() {
    try {
        // Initialize provider and wallet
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.privateKey, provider);
        
        console.log('Connected to network:', (await provider.getNetwork()).name);
        console.log('Account:', wallet.address);
        console.log('Token:', config.tokenAddress);
        console.log('Spender (Remittance Contract):', config.remittanceContract);
        
        // Initialize token contract
        const token = new ethers.Contract(
            config.tokenAddress,
            ERC20_ABI,
            wallet
        );
        
        // Check current allowance
        const currentAllowance = await token.allowance(wallet.address, config.remittanceContract);
        console.log('Current allowance:', ethers.formatUnits(currentAllowance, 18), 'tokens');
        
        if (currentAllowance > 0n) {
            console.log('Token already approved. Proceeding with transfer...');
            process.exit(0);
        }
        
        // Approve token transfer
        console.log('Approving token transfer...');
        const tx = await token.approve(
            config.remittanceContract,
            config.amount
        );
        
        console.log('Transaction hash:', tx.hash);
        console.log('Waiting for confirmation...');
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('\nTransaction confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        
        // Verify new allowance
        const newAllowance = await token.allowance(wallet.address, config.remittanceContract);
        console.log('New allowance:', ethers.formatUnits(newAllowance, 18), 'tokens');
        
        return tx.hash;
        
    } catch (error) {
        console.error('Error:', error);
        if (error.reason) console.error('Reason:', error.reason);
        if (error.transaction) console.error('Transaction:', error.transaction);
        process.exit(1);
    }
}

// Run the script
main()
    .then(hash => {
        console.log('\n✅ Token approval successful!');
        console.log('Transaction hash:', hash);
        console.log('\nYou can now run the transfer script.');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
