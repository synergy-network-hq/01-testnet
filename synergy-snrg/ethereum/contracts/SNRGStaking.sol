// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*
        o__ __o                                                                           
       /v     v\                                                                          
      />       <\                                                                         
     _\o____         o      o   \o__ __o     o__  __o   \o__ __o     o__ __o/   o      o  
          \_\__o__  <|>    <|>   |     |>   /v      |>   |     |>   /v     |   <|>    <|> 
                \   < >    < >  / \   / \  />      //   / \   < >  />     / \  < >    < > 
      \         /    \o    o/   \o/   \o/  \o    o/     \o/        \      \o/   \o    o/  
       o       o      v\  /v     |     |    v\  /v __o   |          o      |     v\  /v   
       <\__ __/>       <\/>     / \   / \    <\/> __/>  / \         <\__  < >     <\/>    
                        /                                                  |       /      
                       o                                           o__     o      o       
                    __/>                                           <\__ __/>   __/>       
        o__ __o      o                    o         o                                     
       /v     v\    <|>                  <|>      _<|>_                                   
      />       <\   < >                  / \                                              
     _\o____         |         o__ __o/  \o/  o/    o    \o__ __o     o__ __o/            
          \_\__o__   o__/_    /v     |    |  /v    <|>    |     |>   /v     |             
                \    |       />     / \  / \/>     / \   / \   / \  />     / \            
      \         /    |       \      \o/  \o/\o     \o/   \o/   \o/  \      \o/            
       o       o     o        o      |    |  v\     |     |     |    o      |             
       <\__ __/>     <\__     <\__  / \  / \  <\   / \   / \   / \   <\__  < >            
                                                                            |             
                                                                    o__     o             
                                                                    <\__ __/>             
*/

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/utils/ReentrancyGuard.sol";

contract SNRGStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable snrg;
    address public immutable treasury;
    bool public isFunded; // <-- NEW: Flag to ensure it's only funded once

    // ... (Stake struct and mappings remain the same) ...
    
    struct Stake {
        uint256 amount;
        uint256 reward;
        uint256 endTime;
        bool withdrawn;
    }

    mapping(uint64 => uint256) public rewardRates;
    mapping(address => Stake[]) public userStakes;
    
    uint256 public constant EARLY_WITHDRAWAL_FEE_BPS = 150; // 1.5%

    event Staked(address indexed user, uint256 indexed stakeIndex, uint256 amount, uint256 reward, uint256 endTime);
    event Withdrawn(address indexed user, uint256 indexed stakeIndex, uint256 amount, uint256 reward);
    event WithdrawnEarly(address indexed user, uint256 indexed stakeIndex, uint256 amount, uint256 fee);
    event ContractFunded(uint256 amount); // <-- NEW: Event for funding

    constructor(address _snrg, address _treasury, address owner_) {
        // ... (constructor logic remains the same) ...
        require(_snrg != address(0), "snrg=0");
        require(_treasury != address(0), "treasury=0");

        snrg = IERC20(_snrg);
        treasury = _treasury;
        _transferOwnership(owner_);

        rewardRates[30] = 125;
        rewardRates[60] = 250;
        rewardRates[90] = 375;
        rewardRates[180] = 500;
    }

    /**
     * @notice NEW: Pulls the approved reward funds from the treasury.
     * @dev The treasury wallet must have first called `approve()` on the SNRG token contract.
     * @param amount The total amount of SNRG to pull for rewards.
     */
    function fundContract(uint256 amount) external onlyOwner {
        require(!isFunded, "already funded");
        require(amount > 0, "amount=0");
        
        isFunded = true;
        require(snrg.transferFrom(treasury, address(this), amount), "fund transfer failed");
        
        emit ContractFunded(amount);
    }
    
    // ... (All other functions like stake, withdraw, etc., remain the same) ...

    function stake(uint256 amount, uint64 duration) external nonReentrant {
        require(amount > 0, "amount=0");
        uint256 rewardBps = rewardRates[duration];
        require(rewardBps > 0, "invalid duration");

        require(snrg.transferFrom(msg.sender, address(this), amount), "transferFrom fail");

        uint256 reward = (amount * rewardBps) / 10000;
        uint256 endTime = block.timestamp + (duration * 1 days);

        uint256 stakeIndex = userStakes[msg.sender].length;
        userStakes[msg.sender].push(Stake({
            amount: amount,
            reward: reward,
            endTime: endTime,
            withdrawn: false
        }));

        emit Staked(msg.sender, stakeIndex, amount, reward, endTime);
    }

    function withdraw(uint256 stakeIndex) external nonReentrant {
        Stake storage s = userStakes[msg.sender][stakeIndex];
        
        require(!s.withdrawn, "already withdrawn");
        require(block.timestamp >= s.endTime, "stake not matured");

        s.withdrawn = true;
        uint256 totalPayout = s.amount + s.reward;
        
        require(snrg.transfer(msg.sender, totalPayout), "transfer fail");
        emit Withdrawn(msg.sender, stakeIndex, s.amount, s.reward);
    }

    function withdrawEarly(uint256 stakeIndex) external nonReentrant {
        Stake storage s = userStakes[msg.sender][stakeIndex];
        
        require(!s.withdrawn, "already withdrawn");
        require(block.timestamp < s.endTime, "stake has matured");

        s.withdrawn = true;
        
        uint256 fee = (s.amount * EARLY_WITHDRAWAL_FEE_BPS) / 10000;
        uint256 returnAmount = s.amount - fee;
        
        require(snrg.transfer(treasury, fee), "fee transfer fail");
        require(snrg.transfer(msg.sender, returnAmount), "return transfer fail");
        
        emit WithdrawnEarly(msg.sender, stakeIndex, returnAmount, fee);
    }

    function getStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    function getStake(address user, uint256 stakeIndex) external view returns (Stake memory) {
        return userStakes[user][stakeIndex];
    }
}