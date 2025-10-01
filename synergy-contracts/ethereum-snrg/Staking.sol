// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Simple staking contract for SNRG presale tokens
 *
 * - Users stake SNRG tokens (which may be globally locked for transfers).
 * - Staked tokens are held in this contract until unstake (unstake allowed only after `withdrawUnlocked` is true OR after mainnet when tokens unlocked).
 * - Rewards accrue linearly by time with configured APR (expressed in basis points, e.g., 1000 = 10% APR).
 * - The reward pool must be funded by owner (transfer SNRG to this contract).
 *
 * Security notes:
 * - Use ReentrancyGuard
 * - Owner is multisig; owner can set APR and withdraw unallocated reward tokens.
 */

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISNRG {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable snrg;

    // APR in basis points. e.g., 1000 = 10% per year
    uint256 public aprBasisPoints;
    uint256 public constant BASIS = 10000;
    uint256 public constant YEAR_SECONDS = 365 days;

    bool public withdrawalsEnabled = false; // can be toggled (typically after mainnet launch or admin decision)

    struct StakeInfo {
        uint256 amount;
        uint256 lastTimestamp; // last time rewards counted
        uint256 rewardEarned;  // accumulated rewards not yet claimed
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public totalRewardPool; // tokens owner funded as rewards that are not yet paid out

    event Staked(address indexed who, uint256 amount);
    event Unstaked(address indexed who, uint256 amount);
    event RewardClaimed(address indexed who, uint256 amount);
    event APRUpdated(uint256 newAprBps);
    event WithdrawalsEnabled(bool enabled);

    constructor(address _snrg, uint256 _aprBasisPoints) {
        require(_snrg != address(0), "zero");
        snrg = IERC20(_snrg);
        aprBasisPoints = _aprBasisPoints;
    }

    // FUND the reward pool by owner (transfer SNRG to this contract)
    function fundRewards(uint256 amount) external onlyOwner {
        IERC20(snrg).transferFrom(msg.sender, address(this), amount);
        totalRewardPool += amount;
    }

    // stake tokens: user must first approve this contract for amount
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        // update rewards for user
        _updateRewards(msg.sender);
        // transfer tokens into this contract
        IERC20(snrg).transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    // internal update reward bookkeeping
    function _updateRewards(address user) internal {
        StakeInfo storage s = stakes[user];
        if (s.amount > 0) {
            uint256 elapsed = block.timestamp - s.lastTimestamp;
            if (elapsed > 0) {
                uint256 reward = (s.amount * aprBasisPoints * elapsed) / (BASIS * YEAR_SECONDS);
                s.rewardEarned += reward;
            }
        }
        s.lastTimestamp = block.timestamp;
    }

    // claim rewards (pays from reward pool)
    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);
        uint256 reward = stakes[msg.sender].rewardEarned;
        require(reward > 0, "no rewards");
        require(totalRewardPool >= reward, "insufficient reward pool");
        stakes[msg.sender].rewardEarned = 0;
        totalRewardPool -= reward;
        IERC20(snrg).transfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    // unstake: users can request to unstake, but withdrawal may be gated by withdrawalsEnabled flag
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        require(stakes[msg.sender].amount >= amount, "not enough staked");
        _updateRewards(msg.sender);

        // require withdrawals enabled OR owner override (for emergency)
        require(withdrawalsEnabled, "withdrawals disabled");

        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        IERC20(snrg).transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    // owner functions
    function setAPR(uint256 _aprBasisPoints) external onlyOwner {
        aprBasisPoints = _aprBasisPoints;
        emit APRUpdated(_aprBasisPoints);
    }

    function setWithdrawalsEnabled(bool enabled) external onlyOwner {
        withdrawalsEnabled = enabled;
        emit WithdrawalsEnabled(enabled);
    }

    // owner can rescue tokens accidentally sent (other than reward tokens should be allowed)
    function rescueERC20(address token, address to) external onlyOwner {
        IERC20(token).transfer(to, IERC20(token).balanceOf(address(this)));
    }

    // read-only helper returning pending rewards for user (not auto-updating)
    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo memory s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 elapsed = block.timestamp - s.lastTimestamp;
        uint256 reward = (s.amount * aprBasisPoints * elapsed) / (BASIS * YEAR_SECONDS);
        return s.rewardEarned + reward;
    }
}
