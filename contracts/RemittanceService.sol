// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RemittanceService
 * @dev Cross-border remittance service with cashback and referral rewards
 */
contract RemittanceService is Ownable, ReentrancyGuard {
    IERC20 public stablecoin;
    
    // Fee structure (in basis points, 100 = 1%)
    uint256 public transferFeePercentage = 50; // 0.5%
    uint256 public cashbackPercentage = 100; // 1% cashback for large transactions
    uint256 public largeTransactionThreshold = 1000 * 10**6; // $1000 in USDC
    uint256 public referralRewardPercentage = 50; // 0.5% referral reward
    
    // User data structures
    struct User {
        address walletAddress;
        uint256 totalSent;
        uint256 totalReceived;
        uint256 cashbackBalance;
        uint256 referralRewards;
        address referrer;
        bool isActive;
    }
    
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        uint256 cashback;
        uint256 timestamp;
        string recipientCountry;
        bool completed;
    }
    
    struct ReferralReward {
        address referrer;
        address referred;
        uint256 rewardAmount;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => address[]) public referrals;
    mapping(address => ReferralReward[]) public referralHistory;
    
    uint256 public transactionCount;
    uint256 public totalVolumeProcessed;
    
    // Events
    event TransferInitiated(
        uint256 indexed txId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        string recipientCountry
    );
    
    event CashbackAwarded(address indexed user, uint256 amount);
    event ReferralRewardAwarded(address indexed referrer, address indexed referred, uint256 amount);
    event UserRegistered(address indexed user, address indexed referrer);
    event FeeUpdated(uint256 newFeePercentage);
    
    constructor(address _stablecoinAddress) {
        stablecoin = IERC20(_stablecoinAddress);
    }
    
    /**
     * @dev Register a new user with optional referral
     */
    function registerUser(address _referrer) external {
        require(!users[msg.sender].isActive, "User already registered");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            totalSent: 0,
            totalReceived: 0,
            cashbackBalance: 0,
            referralRewards: 0,
            referrer: _referrer,
            isActive: true
        });
        
        if (_referrer != address(0) && users[_referrer].isActive) {
            referrals[_referrer].push(msg.sender);
        }
        
        emit UserRegistered(msg.sender, _referrer);
    }
    
    /**
     * @dev Send remittance to recipient
     */
    function sendRemittance(
        address _recipient,
        uint256 _amount,
        string memory _recipientCountry
    ) external nonReentrant returns (uint256) {
        require(users[msg.sender].isActive, "Sender not registered");
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient");
        
        // Calculate fees
        uint256 fee = (_amount * transferFeePercentage) / 10000;
        uint256 totalDebit = _amount + fee;
        
        // Transfer from sender to contract
        require(
            stablecoin.transferFrom(msg.sender, address(this), totalDebit),
            "Transfer failed"
        );
        
        // Register recipient if not already registered
        if (!users[_recipient].isActive) {
            users[_recipient] = User({
                walletAddress: _recipient,
                totalSent: 0,
                totalReceived: 0,
                cashbackBalance: 0,
                referralRewards: 0,
                referrer: address(0),
                isActive: true
            });
        }
        
        // Create transaction record
        uint256 txId = transactionCount++;
        uint256 cashback = 0;
        
        // Award cashback for large transactions
        if (_amount >= largeTransactionThreshold) {
            cashback = (_amount * cashbackPercentage) / 10000;
            users[msg.sender].cashbackBalance += cashback;
            emit CashbackAwarded(msg.sender, cashback);
        }
        
        transactions[txId] = Transaction({
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            fee: fee,
            cashback: cashback,
            timestamp: block.timestamp,
            recipientCountry: _recipientCountry,
            completed: false
        });
        
        userTransactions[msg.sender].push(txId);
        userTransactions[_recipient].push(txId);
        
        // Update user stats
        users[msg.sender].totalSent += _amount;
        users[_recipient].totalReceived += _amount;
        totalVolumeProcessed += _amount;
        
        // Award referral rewards
        if (users[msg.sender].referrer != address(0)) {
            uint256 referralReward = (_amount * referralRewardPercentage) / 10000;
            users[users[msg.sender].referrer].referralRewards += referralReward;
            
            referralHistory[users[msg.sender].referrer].push(
                ReferralReward({
                    referrer: users[msg.sender].referrer,
                    referred: msg.sender,
                    rewardAmount: referralReward,
                    timestamp: block.timestamp
                })
            );
            
            emit ReferralRewardAwarded(users[msg.sender].referrer, msg.sender, referralReward);
        }
        
        emit TransferInitiated(txId, msg.sender, _recipient, _amount, fee, _recipientCountry);
        
        return txId;
    }
    
    /**
     * @dev Complete a remittance transfer
     */
    function completeTransfer(uint256 _txId) external onlyOwner nonReentrant {
        Transaction storage tx = transactions[_txId];
        require(!tx.completed, "Transaction already completed");
        
        uint256 amountToTransfer = tx.amount;
        require(
            stablecoin.transfer(tx.recipient, amountToTransfer),
            "Transfer to recipient failed"
        );
        
        tx.completed = true;
    }
    
    /**
     * @dev Withdraw cashback balance
     */
    function withdrawCashback() external nonReentrant {
        uint256 cashbackAmount = users[msg.sender].cashbackBalance;
        require(cashbackAmount > 0, "No cashback available");
        
        users[msg.sender].cashbackBalance = 0;
        require(stablecoin.transfer(msg.sender, cashbackAmount), "Cashback withdrawal failed");
    }
    
    /**
     * @dev Withdraw referral rewards
     */
    function withdrawReferralRewards() external nonReentrant {
        uint256 rewardAmount = users[msg.sender].referralRewards;
        require(rewardAmount > 0, "No referral rewards available");
        
        users[msg.sender].referralRewards = 0;
        require(stablecoin.transfer(msg.sender, rewardAmount), "Reward withdrawal failed");
    }
    
    /**
     * @dev Get user information
     */
    function getUser(address _userAddress) external view returns (User memory) {
        return users[_userAddress];
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 _txId) external view returns (Transaction memory) {
        return transactions[_txId];
    }
    
    /**
     * @dev Get user transaction history
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get referral count
     */
    function getReferralCount(address _user) external view returns (uint256) {
        return referrals[_user].length;
    }
    
    /**
     * @dev Update transfer fee (owner only)
     */
    function setTransferFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee too high"); // Max 10%
        transferFeePercentage = _newFeePercentage;
        emit FeeUpdated(_newFeePercentage);
    }
    
    /**
     * @dev Update cashback percentage
     */
    function setCashbackPercentage(uint256 _newPercentage) external onlyOwner {
        require(_newPercentage <= 1000, "Percentage too high");
        cashbackPercentage = _newPercentage;
    }
    
    /**
     * @dev Update large transaction threshold
     */
    function setLargeTransactionThreshold(uint256 _newThreshold) external onlyOwner {
        largeTransactionThreshold = _newThreshold;
    }
    
    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdrawFees(uint256 _amount) external onlyOwner nonReentrant {
        require(stablecoin.transfer(owner(), _amount), "Fee withdrawal failed");
    }
}
