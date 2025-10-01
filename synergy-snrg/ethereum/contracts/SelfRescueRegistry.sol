// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*
  __                                                
 / _\_   _ _ __   ___ _ __ __ _ _   _               
 \ \| | | | '_ \ / _ \ '__/ _` | | | |              
 _\ \ |_| | | | |  __/ | | (_| | |_| |              
 \__/\__, |_| |_|\___|_|  \__, |\__, |              
     |___/                |___/ |___/               
 __      _  __         __                           
/ _\ ___| |/ _|       /__\ ___  ___  ___ _   _  ___ 
\ \ / _ \ | |_ _____ / \/// _ \/ __|/ __| | | |/ _ \
_\ \  __/ |  _|_____/ _  \  __/\__ \ (__| |_| |  __/
\__/\___|_|_|       \/ \_/\___||___/\___|\__,_|\___|
                                                    
   __            _     _                            
  /__\ ___  __ _(_)___| |_ _ __ _   _               
 / \/// _ \/ _` | / __| __| '__| | | |              
/ _  \  __/ (_| | \__ \ |_| |  | |_| |              
\/ \_/\___|\__, |_|___/\__|_|   \__, |              
           |___/                |___/               
*/

/**
 * SelfRescueRegistry
 * ------------------
 * - Users opt-in by registering a recovery address and a timelock.
 * - They can **initiate** a rescue which starts the clock.
 * - After the timelock, anyone can call `executeRescue(from)` but funds move **only to the registered recovery**.
 * - Users can **cancel** before the timelock elapses.
 * - No owner seizes funds; no centralized role invokes arbitrary transfers.
 * - Marked as a **rescue executor** for SNRG so restricted transfers allow this move.
 */

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";

interface IRestrictedToken is IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SelfRescueRegistry is Ownable {
    struct Plan {
        address recovery;
        uint64 delay;       // seconds
        uint64 eta;         // when executable (0 = none / canceled)
    }
    
    // MODIFIED: Added constant for clarity
    uint64 public constant MINIMUM_RESCUE_DELAY = 1 days;

    mapping(address => Plan) public plans;
    address public immutable token;
    mapping(address => bool) public isExecutor; // contracts allowed to call token during execute

    event PlanRegistered(address indexed user, address indexed recovery, uint64 delay);
    event RescueInitiated(address indexed user, uint64 eta);
    event RescueCanceled(address indexed user);
    event RescueExecuted(address indexed user, address indexed recovery, uint256 amount);
    event ExecutorSet(address indexed executor, bool enabled);

    constructor(address _token, address owner_) Ownable(owner_) {
        token = _token;
        isExecutor[address(this)] = true; // registry itself is an executor
        emit ExecutorSet(address(this), true);
    }

    function registerPlan(address recovery, uint64 delay) external {
        require(recovery != address(0), "recovery=0");
        // MODIFIED: Using constant
        require(delay >= MINIMUM_RESCUE_DELAY, "delay too short");
        plans[msg.sender] = Plan({recovery: recovery, delay: delay, eta: 0});
        emit PlanRegistered(msg.sender, recovery, delay);
    }

    function initiateRescue() external {
        Plan storage p = plans[msg.sender];
        require(p.recovery != address(0), "no plan");
        p.eta = uint64(block.timestamp) + p.delay;
        emit RescueInitiated(msg.sender, p.eta);
    }

    function cancelRescue() external {
        Plan storage p = plans[msg.sender];
        require(p.eta != 0, "no active");
        p.eta = 0;
        emit RescueCanceled(msg.sender);
    }

    function canExecuteRescue(address victim) external view returns (bool) {
        Plan memory p = plans[victim];
        return (p.eta != 0 && block.timestamp >= p.eta);
    }

    function isRescueExecutor(address caller) external view returns (bool) {
        return isExecutor[caller];
    }

    function setExecutor(address exec, bool enabled) external onlyOwner {
        isExecutor[exec] = enabled;
        emit ExecutorSet(exec, enabled);
    }
    
    /**
     * Executes the rescue by transferring the specified balance to the recovery address.
     * This call is permissionless once matured.
     * MODIFIED: Now accepts an `amount` for flexible rescues.
     */
    function executeRescue(address victim, uint256 amount) external {
        Plan memory p = plans[victim];
        require(p.eta != 0 && block.timestamp >= p.eta, "not matured");
        require(amount > 0, "amount=0");

        // Clear ETA to prevent re-entrancy or repeated calls for the *same* initiation
        plans[victim].eta = 0;

        uint256 balance = IERC20(token).balanceOf(victim);
        require(amount <= balance, "insufficient balance");
        
        bool ok = IRestrictedToken(token).transferFrom(victim, p.recovery, amount);
        require(ok, "transferFrom fail");

        emit RescueExecuted(victim, p.recovery, amount);
    }
}