// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 ______     __  __     __   __     ______     ______     ______     __  __     
/\  ___\   /\ \_\ \   /\ "-.\ \   /\  ___\   /\  == \   /\  ___\   /\ \_\ \    
\ \___  \  \ \____ \  \ \ \-.  \  \ \  __\   \ \  __<   \ \ \__ \  \ \____ \   
 \/\_____\  \/\_____\  \ \_\\"\_\  \ \_____\  \ \_\ \_\  \ \_____\  \/\_____\  
  \/_____/   \/_____/   \/_/ \/_/   \/_____/   \/_/ /_/   \/_____/   \/_____/  
                                                                               
 __   __     ______     ______   __     __     ______     ______     __  __    
/\ "-.\ \   /\  ___\   /\__  _\ /\ \  _ \ \   /\  __ \   /\  == \   /\ \/ /    
\ \ \-.  \  \ \  __\   \/_/\ \/ \ \ \/ ".\ \  \ \ \/\ \  \ \  __<   \ \  _"-.  
 \ \_\\"\_\  \ \_____\    \ \_\  \ \__/".~\_\  \ \_____\  \ \_\ \_\  \ \_\ \_\ 
  \/_/ \/_/   \/_____/     \/_/   \/_/   \/_/   \/_____/   \/_/ /_/   \/_/\/_/ 
                                                                               
*/               

/**
 * SynergyCoin (SNRG)
 * - decimals = 9
 * - MAX_SUPPLY = 6,000,000,000 * 10^9
 * - DEFAULT_ADMIN_ROLE => multisig owner (set in constructor)
 *
 * Features:
 * - ERC20 with snapshot capability
 * - AccessControl roles (MINTER_ROLE, PAUSER_ROLE, SNAPSHOT_ROLE, FREEZER_ROLE)
 * - Burnable (holders can burn)
 * - globalLock + per-wallet unlock semantics (used to lock transfers until mainnet)
 * - freeze individual accounts
 * - adminForceTransfer(from, to, amount) callable only by DEFAULT_ADMIN_ROLE for recovery
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SynergyCoin is ERC20, ERC20Burnable, ERC20Snapshot, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant FREEZER_ROLE  = keccak256("FREEZER_ROLE");

    uint8 private constant _DECIMALS = 9;
    uint256 public constant MAX_SUPPLY = 6_000_000_000 * 10 ** _DECIMALS;

    bool public globalLocked = true;
    mapping(address => bool) public walletUnlocked;
    mapping(address => bool) public frozen;

    bool private _inAdminForce = false;

    event GlobalLockChanged(bool locked);
    event WalletUnlocked(address indexed who, bool unlocked);
    event WalletFrozen(address indexed who, bool frozen);
    event AdminForceTransfer(address indexed from, address indexed to, uint256 amount);

    constructor(address multisigOwner) ERC20("Synergy Coin", "SNRG") {
        require(multisigOwner != address(0), "owner zero");

        // Setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, multisigOwner);
        _setupRole(MINTER_ROLE, multisigOwner);
        _setupRole(PAUSER_ROLE, multisigOwner);
        _setupRole(SNAPSHOT_ROLE, multisigOwner);
        _setupRole(FREEZER_ROLE, multisigOwner);

        // Mint full supply to multisig
        _mint(multisigOwner, MAX_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    // Roleed helpers
    function snapshot() external onlyRole(SNAPSHOT_ROLE) returns (uint256) {
        return _snapshot();
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "cap exceeded");
        _mint(to, amount);
    }

    function setFrozen(address account, bool isFrozen) external onlyRole(FREEZER_ROLE) {
        frozen[account] = isFrozen;
        emit WalletFrozen(account, isFrozen);
    }

    function setGlobalLock(bool locked) external onlyRole(DEFAULT_ADMIN_ROLE) {
        globalLocked = locked;
        emit GlobalLockChanged(locked);
    }

    function setWalletUnlocked(address who, bool unlocked) external onlyRole(DEFAULT_ADMIN_ROLE) {
        walletUnlocked[who] = unlocked;
        emit WalletUnlocked(who, unlocked);
    }

    function adminForceTransfer(address from, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(from != address(0) && to != address(0), "zero address");
        _inAdminForce = true;
        _transfer(from, to, amount);
        _inAdminForce = false;
        emit AdminForceTransfer(from, to, amount);
    }

    function forcedBurnFrom(address account, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(account, amount);
    }

    // Hook
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);

        require(!paused(), "token paused");

        if (_inAdminForce) return;
        if (from == address(0) || to == address(0)) return;

        require(!frozen[from] && !frozen[to], "account frozen");

        if (globalLocked) {
            require(walletUnlocked[from] || walletUnlocked[to], "transfers locked until mainnet");
        }
    }
}
