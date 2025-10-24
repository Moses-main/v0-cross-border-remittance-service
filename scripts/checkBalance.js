const { ethers } = require('ethers');
require('dotenv').config();

// ERC20 ABI with balanceOf function
const ERC20_ABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function decimals() public view returns (uint8)",
    "function symbol() public view returns (string)",
    "function name() public view returns (string)"
];

// Configuration
const config = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // TOKEN_1
};

async function main() {
    try {
        // Initialize provider and wallet
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.privateKey, provider);
        
        console.log('Connected to network:', (await provider.getNetwork()).name);
        console.log('Account:', wallet.address);
        
        // Initialize token contract
        const token = new ethers.Contract(
            config.tokenAddress,
            ERC20_ABI,
            provider
        );
        
        // Get token info
        const [balance, decimals, symbol, name] = await Promise.all([
            token.balanceOf(wallet.address),
            token.decimals(),
            token.symbol(),
            token.name()
        ]);
        
        console.log('\nToken Info:');
        console.log('Name:', name);
        console.log('Symbol:', symbol);
        console.log('Decimals:', decimals);
        console.log('Balance:', ethers.formatUnits(balance, decimals), symbol);
        
        return { balance, decimals, symbol, name };
        
    } catch (error) {
        console.error('Error:', error);
        if (error.reason) console.error('Reason:', error.reason);
        process.exit(1);
    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
