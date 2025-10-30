// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Remittance
 * @dev Cross-border remittance contract that allows users to send and receive funds
 * with support for stablecoins, referral rewards, and cashback.
 */
contract Remittance is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // State variables
    mapping(address => bool) public supportedStablecoins;
    address[] public allSupportedStablecoins;
    
    // Fee tracking per token
    mapping(address => uint256) public collectedFees;
    
    // Fee structure (in basis points, 100 = 1%)
    uint256 public transferFeePercentage = 50; // 0.5%
    uint256 public cashbackPercentage = 100; // 1% cashback for large transactions
    uint256 public largeTransactionThreshold = 1000 * 10**6; // $1000 in stablecoin (6 decimals)
    uint256 public referralRewardPercentage = 50; // 0.5% referral reward
    
    // Group payment state
    struct GroupPayment {
        address creator;
        uint256 totalAmount;
        uint256 recipientCount;
        uint256 completedTransfers;
        bool isCompleted;
        address token;
    }
    
    mapping(uint256 => GroupPayment) public groupPayments;
    mapping(uint256 => mapping(address => bool)) public groupPaymentRecipients;
    
    // User data structures
    struct User {
        address walletAddress;
        uint256 totalSent;
        uint256 totalReceived;
        mapping(address => uint256) cashbackBalance; // Per token
        mapping(address => uint256) referralRewards; // Per token
        address referrer;
        bool isActive;
    }
    
    // Transaction data structure
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        uint256 cashback;
        uint256 timestamp;
        string recipientCountry;
        address token;
        uint256 groupId;
        bool completed;
    }
    
    // Referral reward structure
    struct ReferralReward {
        address referrer;
        address referred;
        uint256 rewardAmount;
        uint256 timestamp;
        address token;
    }
    
    // Mappings
    mapping(address => User) private users;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => address[]) public referrals;
    mapping(address => ReferralReward[]) public referralHistory;
    
    // State variables
    uint256 public transactionCount;
    uint256 public totalVolumeProcessed;
    
    // Events
    event UserRegistered(address indexed user, address indexed referrer);
    event TransferInitiated(
        uint256 indexed txId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        string recipientCountry
    );
    event TransferCompleted(
        uint256 indexed txId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee
    );
    event BatchTransferInitiated(
        uint256 indexed groupId,
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount
    );
    event BatchTransferCompleted(
        uint256 indexed groupId,
        address indexed sender,
        uint256 totalAmount,
        uint256 completedTransfers
    );
    event CashbackAwarded(address indexed user, uint256 amount, address token);
    event CashbackWithdrawn(address indexed user, uint256 amount, address token);
    event ReferralRewardAwarded(address indexed referrer, address indexed referred, uint256 amount, address token);
    event ReferralRewardWithdrawn(address indexed user, uint256 amount, address token);
    event FeeUpdated(uint256 newFeePercentage);
    event StablecoinAdded(address indexed token);
    event StablecoinRemoved(address indexed token);
    event FeesWithdrawn(address indexed token, uint256 amount);
    
    /**
     * @dev Constructor that sets the initial stablecoin addresses
     * @param _stablecoinAddresses Array of supported stablecoin addresses
     */
    constructor(address[] memory _stablecoinAddresses) Ownable(msg.sender) {
        require(_stablecoinAddresses.length > 0, "At least one stablecoin required");
        
        for (uint i = 0; i < _stablecoinAddresses.length; i++) {
            require(_stablecoinAddresses[i] != address(0), "Invalid stablecoin address");
            supportedStablecoins[_stablecoinAddresses[i]] = true;
            allSupportedStablecoins.push(_stablecoinAddresses[i]);
        }
    }
    
    /**
     * @dev Register a new user with an optional referrer
     * @param _referrer Address of the referrer (can be zero address)
     */
    function registerUser(address _referrer) external {
        require(!users[msg.sender].isActive, "User already registered");
        
        User storage newUser = users[msg.sender];
        newUser.walletAddress = msg.sender;
        newUser.totalSent = 0;
        newUser.totalReceived = 0;
        newUser.referrer = _referrer;
        newUser.isActive = true;
        
        // If referrer is provided and is an active user, add to referrals
        if (_referrer != address(0) && users[_referrer].isActive) {
            referrals[_referrer].push(msg.sender);
        }
        
        emit UserRegistered(msg.sender, _referrer);
    }
    
    /**
     * @dev Initiates a batch of cross-border transfers (group payment)
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of amounts to transfer (in stablecoin decimals)
     * @param _recipientCountries Array of country codes for each recipient
     * @param _token Address of the stablecoin to use for the transfer
     */
    function initiateBatchTransfer(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string[] calldata _recipientCountries,
        address _token
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        require(_recipients.length == _amounts.length && _recipients.length == _recipientCountries.length, "Array length mismatch");
        require(_recipients.length > 0, "No recipients provided");
        require(_recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        // Transfer tokens from sender to contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), totalAmount);
        
        // Create group payment with correct recipient count
        uint256 groupId = transactionCount;
        groupPayments[groupId] = GroupPayment({
            creator: msg.sender,
            totalAmount: totalAmount,
            recipientCount: _recipients.length,
            completedTransfers: 0,
            isCompleted: false,
            token: _token
        });
        
        // Create individual transactions for each recipient
        for (uint i = 0; i < _recipients.length; i++) {
            _createTransaction(
                msg.sender,
                _recipients[i],
                _amounts[i],
                _recipientCountries[i],
                _token,
                groupId
            );
            groupPaymentRecipients[groupId][_recipients[i]] = true;
        }
        
        emit BatchTransferInitiated(groupId, msg.sender, totalAmount, _recipients.length);
        
        return groupId;
    }
    
    /**
     * @dev Initiates a cross-border transfer
     * @param _recipient Address of the recipient
     * @param _amount Amount to transfer (in stablecoin decimals)
     * @param _recipientCountry Country code of the recipient (e.g., "US", "NG")
     * @param _token Address of the stablecoin to use for the transfer
     */
    function initiateTransfer(
        address _recipient,
        uint256 _amount,
        string calldata _recipientCountry,
        address _token
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        
        // Transfer tokens from sender to contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        return _createTransaction(
            msg.sender,
            _recipient,
            _amount,
            _recipientCountry,
            _token,
            type(uint256).max // No group
        );
    }
    
    /**
     * @dev Internal function to create a transaction
     */
    function _createTransaction(
        address _sender,
        address _recipient,
        uint256 _amount,
        string memory _recipientCountry,
        address _token,
        uint256 _groupId
    ) internal returns (uint256) {
        require(users[_sender].isActive, "Sender not registered");
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient");
        
        // Calculate fee and net amount
        uint256 fee = (_amount * transferFeePercentage) / 10000;
        uint256 netAmount = _amount - fee;
        
        // Track collected fees
        collectedFees[_token] += fee;
        
        // Check for large transaction cashback (paid from fees)
        uint256 cashback = 0;
        if (_amount >= largeTransactionThreshold) {
            cashback = (_amount * cashbackPercentage) / 10000;
            require(collectedFees[_token] >= cashback, "Insufficient fees for cashback");
            collectedFees[_token] -= cashback;
            users[_sender].cashbackBalance[_token] += cashback;
            emit CashbackAwarded(_sender, cashback, _token);
        }
        
        // Process referral reward if applicable (paid from fees)
        if (users[_recipient].referrer != address(0)) {
            uint256 reward = (_amount * referralRewardPercentage) / 10000;
            require(collectedFees[_token] >= reward, "Insufficient fees for referral");
            collectedFees[_token] -= reward;
            address referrer = users[_recipient].referrer;
            users[referrer].referralRewards[_token] += reward;
            
            // Record referral history
            referralHistory[referrer].push(ReferralReward({
                referrer: referrer,
                referred: _recipient,
                rewardAmount: reward,
                timestamp: block.timestamp,
                token: _token
            }));
            
            emit ReferralRewardAwarded(referrer, _recipient, reward, _token);
        }
        
        // Create transaction
        uint256 txId = transactionCount++;
        transactions[txId] = Transaction({
            sender: _sender,
            recipient: _recipient,
            amount: netAmount,
            fee: fee,
            cashback: cashback,
            timestamp: block.timestamp,
            recipientCountry: _recipientCountry,
            completed: false,
            token: _token,
            groupId: _groupId
        });
        
        userTransactions[_sender].push(txId);
        userTransactions[_recipient].push(txId);
        
        emit TransferInitiated(txId, _sender, _recipient, netAmount, fee, _recipientCountry);
        
        return txId;
    }
    
    /**
     * @dev Completes a pending transfer
     * @param _txId ID of the transaction to complete
     */
    function completeTransfer(uint256 _txId) external nonReentrant whenNotPaused {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.completed, "Transfer already completed");
        require(msg.sender == transaction.recipient, "Not the recipient");
        
        // Mark as completed
        transaction.completed = true;
        
        // Transfer funds to recipient
        IERC20(transaction.token).safeTransfer(transaction.recipient, transaction.amount);
        
        // Update user stats
        uint256 totalAmount = transaction.amount + transaction.fee;
        users[transaction.sender].totalSent += totalAmount;
        users[transaction.recipient].totalReceived += transaction.amount;
        
        // Update group payment status if this is part of a group
        if (transaction.groupId != type(uint256).max) {
            GroupPayment storage group = groupPayments[transaction.groupId];
            group.completedTransfers++;
            
            // Check if all transfers in the group are completed
            if (group.completedTransfers >= group.recipientCount) {
                group.isCompleted = true;
                emit BatchTransferCompleted(
                    transaction.groupId,
                    group.creator,
                    group.totalAmount,
                    group.completedTransfers
                );
            }
        }
        
        emit TransferCompleted(
            _txId,
            transaction.sender,
            transaction.recipient,
            transaction.amount,
            transaction.fee
        );
    }
    
    /**
     * @dev Withdraw cashback balance
     * @param _token Address of the token to withdraw
     */
    function withdrawCashback(address _token) external nonReentrant {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        uint256 amount = users[msg.sender].cashbackBalance[_token];
        require(amount > 0, "No cashback to withdraw");
        
        users[msg.sender].cashbackBalance[_token] = 0;
        IERC20(_token).safeTransfer(msg.sender, amount);
        
        emit CashbackWithdrawn(msg.sender, amount, _token);
    }
    
    /**
     * @dev Withdraw referral rewards
     * @param _token Address of the token to withdraw
     */
    function withdrawReferralRewards(address _token) external nonReentrant {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        uint256 amount = users[msg.sender].referralRewards[_token];
        require(amount > 0, "No referral rewards to withdraw");
        
        users[msg.sender].referralRewards[_token] = 0;
        IERC20(_token).safeTransfer(msg.sender, amount);
        
        emit ReferralRewardWithdrawn(msg.sender, amount, _token);
    }
    
    /**
     * @dev Withdraws collected fees to the owner (only actual fees, not user funds)
     * @param _token Address of the token to withdraw fees from
     */
    function withdrawFees(address _token) external onlyOwner nonReentrant {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        
        uint256 amount = collectedFees[_token];
        require(amount > 0, "No fees to withdraw");
        
        collectedFees[_token] = 0;
        IERC20(_token).safeTransfer(owner(), amount);
        
        emit FeesWithdrawn(_token, amount);
    }
    
    /**
     * @dev Updates the transfer fee percentage
     * @param _newFee New fee percentage in basis points (100 = 1%)
     */
    function updateTransferFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high (max 10%)");
        transferFeePercentage = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    /**
     * @dev Add a new supported stablecoin
     * @param _token Address of the stablecoin to add
     */
    function addStablecoin(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!supportedStablecoins[_token], "Token already supported");
        
        supportedStablecoins[_token] = true;
        allSupportedStablecoins.push(_token);
        
        emit StablecoinAdded(_token);
    }
    
    /**
     * @dev Remove a supported stablecoin
     * @param _token Address of the stablecoin to remove
     */
    function removeStablecoin(address _token) external onlyOwner {
        require(supportedStablecoins[_token], "Token not supported");
        require(IERC20(_token).balanceOf(address(this)) == 0, "Contract still holds tokens");
        
        supportedStablecoins[_token] = false;
        
        // Remove from array
        for (uint i = 0; i < allSupportedStablecoins.length; i++) {
            if (allSupportedStablecoins[i] == _token) {
                allSupportedStablecoins[i] = allSupportedStablecoins[allSupportedStablecoins.length - 1];
                allSupportedStablecoins.pop();
                break;
            }
        }
        
        emit StablecoinRemoved(_token);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Returns transaction details by ID
     * @param _txId ID of the transaction
     */
    function getTransaction(uint256 _txId) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint256 fee,
        uint256 cashback,
        uint256 timestamp,
        string memory recipientCountry,
        address token,
        uint256 groupId,
        bool completed
    ) {
        Transaction storage t = transactions[_txId];
        return (
            t.sender,
            t.recipient,
            t.amount,
            t.fee,
            t.cashback,
            t.timestamp,
            t.recipientCountry,
            t.token,
            t.groupId,
            t.completed
        );
    }
    
    /**
     * @dev Get user information
     * @param _user Address of the user
     */
    function getUserInfo(address _user) external view returns (
        address walletAddress,
        uint256 totalSent,
        uint256 totalReceived,
        address referrer,
        bool isActive
    ) {
        User storage user = users[_user];
        return (
            user.walletAddress,
            user.totalSent,
            user.totalReceived,
            user.referrer,
            user.isActive
        );
    }
    
    /**
     * @dev Get user's cashback balance for a token
     * @param _user Address of the user
     * @param _token Address of the token
     */
    function getCashbackBalance(address _user, address _token) external view returns (uint256) {
        return users[_user].cashbackBalance[_token];
    }
    
    /**
     * @dev Get user's referral rewards for a token
     * @param _user Address of the user
     * @param _token Address of the token
     */
    function getReferralRewardsBalance(address _user, address _token) external view returns (uint256) {
        return users[_user].referralRewards[_token];
    }
    
    /**
     * @dev Returns all transaction IDs for a user
     * @param _user Address of the user
     * @return count Number of transactions
     */
    function getUserTransactionCount(address _user) external view returns (uint256) {
        return userTransactions[_user].length;
    }
    
    /**
     * @dev Get user's transaction IDs
     * @param _user Address of the user
     * @param _start Starting index
     * @param _count Number of transactions to return
     * @return Array of transaction IDs
     */
    function getUserTransactionIds(
        address _user,
        uint256 _start,
        uint256 _count
    ) external view returns (uint256[] memory) {
        uint256[] storage allTxs = userTransactions[_user];
        uint256 end = _start + _count;
        
        if (end > allTxs.length) {
            end = allTxs.length;
        }
        
        uint256[] memory result = new uint256[](end - _start);
        
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = allTxs[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get user's referral count
     * @param _user Address of the user
     * @return count Number of referrals
     */
    function getReferralCount(address _user) external view returns (uint256) {
        return referrals[_user].length;
    }
    
    /**
     * @dev Get user's referral rewards history
     * @param _user Address of the user
     * @param _start Starting index
     * @param _count Number of records to return
     * @return rewards Array of referral rewards
     */
    function getReferralRewardsHistory(
        address _user,
        uint256 _start,
        uint256 _count
    ) external view returns (ReferralReward[] memory) {
        ReferralReward[] storage allRewards = referralHistory[_user];
        uint256 end = _start + _count;
        
        if (end > allRewards.length) {
            end = allRewards.length;
        }
        
        ReferralReward[] memory result = new ReferralReward[](end - _start);
        
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = allRewards[i];
        }
        
        return result;
    }
    
    /**
     * @dev Returns the contract's balance of a specific token
     * @param _token Address of the token
     * @return balance Current balance of the contract for the specified token
     */
    function getContractBalance(address _token) external view returns (uint256) {
        require(supportedStablecoins[_token], "Unsupported token");
        return IERC20(_token).balanceOf(address(this));
    }

    /**
     * @dev Returns array of all supported stablecoin addresses
     * @return Array of token addresses
     */
    function getAllSupportedStablecoins() external view returns (address[] memory) {
        return allSupportedStablecoins;
    }

    /**
     * @dev Calculate the fee for a given amount
     * @param _amount Amount to calculate fee for
     * @return feeAmount Calculated fee amount
     */
    function calculateFee(uint256 _amount) public view returns (uint256) {
        return (_amount * transferFeePercentage) / 10000;
    }

    /**
     * @dev Calculate the net amount after fees
     * @param _amount Amount to calculate net amount for
     * @return netAmount Amount after deducting fees
     */
    function calculateNetAmount(uint256 _amount) public view returns (uint256) {
        return _amount - calculateFee(_amount);
    }

    /**
     * @dev Get all pending transaction IDs for a user
     * @param _user Address of the user
     * @return pendingTxs Array of pending transaction IDs
     */
    function getPendingTransactions(address _user) external view returns (uint256[] memory) {
        uint256[] storage userTxs = userTransactions[_user];
        uint256 pendingCount = 0;
        
        // First pass: count pending transactions
        for (uint256 i = 0; i < userTxs.length; i++) {
            if (!transactions[userTxs[i]].completed) {
                pendingCount++;
            }
        }
        
        // Second pass: populate result array
        uint256[] memory result = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userTxs.length; i++) {
            if (!transactions[userTxs[i]].completed) {
                result[index] = userTxs[i];
                index++;
            }
        }
        
        return result;
    }
}
