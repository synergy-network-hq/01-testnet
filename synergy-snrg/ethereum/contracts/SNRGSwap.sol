// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*
  (                                        
  )\ )                                     
 (()/( (              (   (    (  (  (     
  /(_)))\ )   (      ))\  )(   )\))( )\ )  
 (_)) (()/(   )\ )  /((_)(()\ ((_))\(()/(  
 / __| )(_)) _(_/( (_))   ((_) (()(_))(_)) 
 \__ \| || || ' \))/ -_) | '_|/ _` || || | 
 |___/ \_, ||_||(| \___| |_|  \__, | \_, | 
    )  |__/ )   )\ )          |___/  |__/  
 ( /(    ( /(  (()/( (  (       )          
 )\())   )\())  /(_)))\))(   ( /(  `  )    
((_)\  _((_)\  (_)) ((_)()\  )(_)) /(/(    
 / (_)(_)/ (_) / __|_(()((_)((_)_ ((_)_\   
 | |   _ | |   \__ \\ V  V // _` || '_ \)  
 |_|  (_)|_|   |___/ \_/\_/ \__,_|| .__/   
                                  |_|         
*/

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/utils/ReentrancyGuard.sol";

/**
 * SNRGSwap (Burn-to-Receipt)
 * --------------------------
 * - Users burn SNRG to receive an on-chain receipt.
 * - Finalization seals the contract and publishes a Merkle root for mainnet claims.
 * - No further changes after `finalized = true`.
 */

interface IBurnable is IERC20 {
    function burnFrom(address account, uint256 amount) external;
    function allowance(address owner, address spender) external view returns (uint256);
}

contract SNRGSwap is Ownable, ReentrancyGuard {
    IBurnable public immutable snrg;
    bool public finalized;
    bytes32 public merkleRoot; // of (address, amount) receipts exported for mainnet claimers

    mapping(address => uint256) public burned;

    event Burned(address indexed user, uint256 amount);
    event Finalized(bytes32 merkleRoot);

    constructor(address _snrg, address owner_) {
        require(_snrg != address(0), "snrg=0");
        snrg = IBurnable(_snrg);
        _transferOwnership(owner_);
    }

    function burnForReceipt(uint256 amount) external nonReentrant {
        require(!finalized, "finalized");
        require(amount > 0, "amount=0");
        require(snrg.allowance(msg.sender, address(this)) >= amount, "approve");
        snrg.burnFrom(msg.sender, amount);
        burned[msg.sender] += amount;
        emit Burned(msg.sender, amount);
    }

    function finalize(bytes32 _merkleRoot) external onlyOwner {
        require(!finalized, "already");
        require(_merkleRoot != bytes32(0), "zero root"); // MODIFIED: Added check
        finalized = true;
        merkleRoot = _merkleRoot;
        emit Finalized(_merkleRoot);
    }
}