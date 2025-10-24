const { ethers } = require('ethers');
require('dotenv').config();

// Remittance contract ABI with registerUser function
const REMITTANCE_ABI = [
    "function registerUser(address _referrer) external",
    "function getUserInfo(address _user) external view returns (address, uint256, uint256, address, bool)"
];

// Configuration
const config = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT_ADDRESS
};

async function main() {
    try {
        // Initialize provider and wallet
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.privateKey, provider);
        
        console.log('Connected to network:', (await provider.getNetwork()).name);
        console.log('Account:', wallet.address);
        console.log('Contract address:', config.contractAddress);
        
        // Initialize contract
        const remittance = new ethers.Contract(
            config.contractAddress,
            REMITTANCE_ABI,
            wallet
        );
        
        // Check if user is already registered
        console.log('Checking if user is already registered...');
        const [walletAddress, totalSent, totalReceived, referrer, isActive] = 
            await remittance.getUserInfo(wallet.address);
            
        if (isActive) {
            console.log('User is already registered:');
            console.log('Wallet:', walletAddress);
            console.log('Total Sent:', ethers.formatEther(totalSent), 'tokens');
            console.log('Total Received:', ethers.formatEther(totalReceived), 'tokens');
            console.log('Referrer:', referrer);
            process.exit(0);
        }
        
        // Register user (with zero address as referrer for now)
        console.log('\nRegistering user...');
        const tx = await remittance.registerUser(ethers.ZeroAddress);
        
        console.log('Transaction hash:', tx.hash);
        console.log('Waiting for confirmation...');
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('\nTransaction confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        
        // Verify registration
        const [_, newTotalSent, newTotalReceived, newReferrer, newIsActive] = 
            await remittance.getUserInfo(wallet.address);
            
        if (newIsActive) {
            console.log('\n✅ User registered successfully!');
            console.log('Total Sent:', ethers.formatEther(newTotalSent), 'tokens');
            console.log('Total Received:', ethers.formatEther(newTotalReceived), 'tokens');
            console.log('Referrer:', newReferrer);
        } else {
            console.log('\n❌ Registration failed');
        }
        
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
        console.log('\n✅ Script completed successfully!');
        console.log('Transaction hash:', hash);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
