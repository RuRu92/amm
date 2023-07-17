// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

struct AmmPool {
    uint256 ID;
    uint256 totalToken1;  // Stores the amount of Token1 locked in the pool
    uint256 totalToken2;  // Stores the amount of Token2 locked in the pool
    uint256 totalShares;
    uint256 K;
}

struct UserAccount {
    uint256 slippage;
    uint256 token1Balance;
    uint256 token2Balance;
    uint256 totalShares;
}

contract AMM {
    using SafeMath for uint256;

    address admin;

    uint256 totalShares;  // Stores the total amount of share issued for the pool
    uint256 totalToken1;  // Stores the amount of Token1 locked in the pool
    uint256 totalToken2;  // Stores the amount of Token2 locked in the pool
    uint256 K;            // Algorithmic constant used to determine price (K = totalToken1 * totalToken2)

    constructor() {
        admin = msg.sender;
    }

    uint256 constant PRECISION = 100;  // Precision of 6 decimal places
    uint256 constant PERCENTAGE = 100;  // Precision of 6 decimal places

    mapping(address => uint256) slippages;

    mapping(address => uint256) shares;  // Stores the share holding of each provider

    mapping(address => uint256) token1Balance;  // Stores the available balance of user outside of the AMM
    mapping(address => uint256) token2Balance;

    mapping(address => UserAccount) accounts;


    // Ensures that the _qty is non-zero and the user has enough balance
    modifier validAmountCheck(mapping(address => uint256) storage _balance, uint256 _qty) {
        require(_qty > 0, "Amount cannot be zero!");
        require(_qty <= _balance[msg.sender], "Insufficient amount");
        _;
    }

    modifier isAdmin() {
        require(msg.sender == admin);
        _;
    }

    // Restricts withdraw, swap feature till liquidity is added to the pool
    modifier activePool() {
        require(totalShares > 0, "Zero Liquidity");
        _;
    }

    function getUserAccountHoldings()external view returns (uint256 amountToken1, uint256 amountToken2, uint256 accountShare) {
        uint account = accounts[msg.sender];
        amountToken1 = account.token1Balance();
        amountToken2 = account.token2Balance;
        accountShare = account.share;

    }

    // Returns the balance of the user
    function getMyHoldings() external view returns (uint256 amountToken1, uint256 amountToken2, uint256 myShare) {
        amountToken1 = token1Balance[msg.sender];
        amountToken2 = token2Balance[msg.sender];
        myShare = shares[msg.sender];
    }

    // Returns the total amount of tokens locked in the pool and the total shares issued corresponding to it
    function getPoolDetails() external view returns (uint256, uint256, uint256) {
        return (totalToken1, totalToken2, totalShares);
    }

    // Sends free token(s) to the invoker
    function faucet(uint256 _amountToken1, uint256 _amountToken2) external {
        token1Balance[msg.sender] = token1Balance[msg.sender].add(_amountToken1);
        token2Balance[msg.sender] = token2Balance[msg.sender].add(_amountToken2);
    }

    // Adding new liquidity in the pool
    // Returns the amount of share issued for locking given assets
    function provide(uint256 _amountToken1, uint256 _amountToken2) external validAmountCheck(token1Balance, _amountToken1) validAmountCheck(token2Balance, _amountToken2) returns (uint256 share) {
        if (totalShares == 0) {// Genesis liquidity is issued 100 Shares
            share = 100 * PRECISION;
        } else {
            uint256 share1 = totalShares.mul(_amountToken1).div(totalToken1);
            uint256 share2 = totalShares.mul(_amountToken2).div(totalToken2);
            require(share1 == share2, "Equivalent value of tokens not provided...");
            share = share1;
        }

        require(share > 0, "Asset value less than threshold for contribution!");
        token1Balance[msg.sender] -= _amountToken1;
        token2Balance[msg.sender] -= _amountToken2;

        totalToken1 += _amountToken1;
        totalToken2 += _amountToken2;
        K = totalToken1.mul(totalToken2);

        totalShares += share;
        shares[msg.sender] += share;
    }

    // Returns amount of Token1 required when providing liquidity with _amountToken2 quantity of Token2
    function getEquivalentToken1Estimate(uint256 _amountToken2) public view activePool returns (uint256 reqToken1) {
        reqToken1 = totalToken1.mul(_amountToken2).div(totalToken2);
    }

    // Returns amount of Token2 required when providing liquidity with _amountToken1 quantity of Token1
    function getEquivalentToken2Estimate(uint256 _amountToken1) public view activePool returns (uint256 reqToken2) {
        reqToken2 = totalToken2.mul(_amountToken1).div(totalToken1);
    }

    // Returns the estimate of Token1 & Token2 that will be released on burning given _share
    function getWithdrawEstimate(uint256 _share) public view activePool returns (uint256 amountToken1, uint256 amountToken2) {
        require(_share <= totalShares, "Share should be less than totalShare");
        amountToken1 = _share.mul(totalToken1).div(totalShares);
        amountToken2 = _share.mul(totalToken2).div(totalShares);
    }

    // Removes liquidity from the pool and releases corresponding Token1 & Token2 to the withdrawer
    function withdraw(uint256 _share) external activePool validAmountCheck(shares, _share) returns (uint256 amountToken1, uint256 amountToken2) {
        (amountToken1, amountToken2) = getWithdrawEstimate(_share);

        shares[msg.sender] -= _share;
        totalShares -= _share;

        totalToken1 -= amountToken1;
        totalToken2 -= amountToken2;
        K = totalToken1.mul(totalToken2);

        token1Balance[msg.sender] += amountToken1;
        token2Balance[msg.sender] += amountToken2;
    }

    // Returns the amount of Token2 that the user will get when swapping a given amount of Token1 for Token2
    function getSwapToken1Estimate(uint256 _amountToken1) public view activePool returns (uint256 amountToken2) {
        uint256 token1After = totalToken1.add(_amountToken1); // 100 + 10 = 110
        uint256 token2After = K.div(token1After); // 10000 / 110 = 90
        amountToken2 = totalToken2.sub(token2After);

        // To ensure that Token2's pool is not completely depleted leading to inf:0 ratio
        if (amountToken2 == totalToken2) amountToken2--;
    }

    function getSwapToken1EstimateV2(uint256 _amountToken1) public view activePool returns (uint256 amountToken2, uint256 token2After) {
        uint256 token1After = totalToken1.add(_amountToken1); // 100 + 10 = 110
        token2After = K.div(token1After); // 10000 / 110 = 90
        amountToken2 = totalToken2.sub(token2After);

        // To ensure that Token2's pool is not completely depleted leading to inf:0 ratio
        if (amountToken2 == totalToken2) amountToken2--;
    }

    // Returns the amount of Token1 that the user should swap to get _amountToken2 in return
    function getSwapToken1EstimateGivenToken2(uint256 _amountToken2) public view activePool returns (uint256 amountToken1) {
        require(_amountToken2 < totalToken2, "Insufficient pool balance");
        uint256 token2After = totalToken2.sub(_amountToken2);
        uint256 token1After = K.div(token2After);
        amountToken1 = token1After.sub(totalToken1);
    }

    function calculateSlippage(uint actualAmount, uint estimatedAmount) public view returns (uint slippage) {
        uint256 tokenAfter = actualAmount.sub(estimatedAmount);
        tokenAfter = tokenAfter.mul(PERCENTAGE);
        slippage = tokenAfter.div(estimatedAmount);
        return slippage;
    }

    // Swaps given amount of Token1 to Token2 using algorithmic price determination
    function swapToken1(uint256 _amountToken1) external activePool validAmountCheck(token1Balance, _amountToken1) returns (uint256 amountToken2, uint256 slippage) {
        amountToken2 = getSwapToken1Estimate(_amountToken1);

        uint userSlippage = slippages[msg.sender];
        slippage = calculateSlippage(_amountToken1, amountToken2);

        require(userSlippage.mul(PERCENTAGE) >= slippage.mul(PERCENTAGE), "User set slippage has been surpassed");

        token1Balance[msg.sender] -= _amountToken1;
        totalToken1 += _amountToken1;
        totalToken2 -= amountToken2;
        token2Balance[msg.sender] += amountToken2;
    }

    function checkSlippageAndSwapToken1(uint256 _amountToken1, uint256 estimatedAmountToken2) external activePool validAmountCheck(token1Balance, _amountToken1) returns (uint256 amountToken2, uint256 slippage) {
        amountToken2 = getSwapToken1Estimate(_amountToken1);
        slippage = calculateSlippage(amountToken2, estimatedAmountToken2);

        uint userSlippage = slippages[msg.sender];
        require(userSlippage < slippage, "User set slippage has been surpassed");

        token1Balance[msg.sender] -= _amountToken1;
        totalToken1 += _amountToken1;
        totalToken2 -= amountToken2;
        token2Balance[msg.sender] += amountToken2;
    }

    // Returns the amount of Token2 that the user will get when swapping a given amount of Token1 for Token2
    function getSwapToken2Estimate(uint256 _amountToken2) public view activePool returns (uint256 amountToken1) {
        uint256 token2After = totalToken2.add(_amountToken2);
        uint256 token1After = K.div(token2After);
        amountToken1 = totalToken1.sub(token1After);

        // To ensure that Token1's pool is not completely depleted leading to inf:0 ratio
        if (amountToken1 == totalToken1) amountToken1--;
    }

    // Returns the amount of Token2 that the user should swap to get _amountToken1 in return
    function getSwapToken2EstimateGivenToken1(uint256 _amountToken1) public view activePool returns (uint256 amountToken2) {
        require(_amountToken1 < totalToken1, "Insufficient pool balance");
        uint256 token1After = totalToken1.sub(_amountToken1);
        uint256 token2After = K.div(token1After);
        amountToken2 = token2After.sub(totalToken2);
    }

    // Swaps given amount of Token2 to Token1 using algorithmic price determination
    function swapToken2(uint256 _amountToken2) external activePool validAmountCheck(token2Balance, _amountToken2) returns (uint256 amountToken1) {
        amountToken1 = getSwapToken2Estimate(_amountToken2);

        token2Balance[msg.sender] -= _amountToken2;
        totalToken2 += _amountToken2;
        totalToken1 -= amountToken1;
        token1Balance[msg.sender] += amountToken1;
    }

    // 0.05 * 100
    function setSlippage(uint slp) public {
        slippages[msg.sender] = slp;
    }

    // 0.05 * 100
    function getSlippage() public view returns (uint256 slippage) {
        slippage = slippages[msg.sender];
    }
}