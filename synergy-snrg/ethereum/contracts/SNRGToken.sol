// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*
            ___     _  _                            __ _    _  _  
    o O O  / __|   | || |  _ _      ___      _ _   / _` |  | || | 
   o       \__ \    \_, | | ' \    / -_)    | '_|  \__, |   \_, | 
  TS__[O]  |___/   _|__/  |_||_|   \___|   _|_|_   |___/   _|__/  
 {======|_|"""""|_| """"|_|"""""|_|"""""|_|"""""|_|"""""|_| """"| 
./o--000'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
           _____            _                                     
    o O O |_   _|   ___    | |__    ___    _ _                    
   o        | |    / _ \   | / /   / -_)  | ' \                   
  TS__[O]  _|_|_   \___/   |_\_\   \___|  |_||_|                  
 {======|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|                 
./o--000'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'                 
*/

/**
 * SNRGToken
 * ----------
 * - ERC20 + Permit (OZ v5) with restricted transfers:
 * Only allowed to/from: staking, swap, and the SelfRescueRegistry when executing a matured rescue.
 * - Fixed 6B supply minted to Treasury multisig.
 * - Burnable (for swap redemption receipts).
 * - No further minting; owner cannot seize or move user funds.
 * - Ownable -> transfer ownership to Timelock+Multisig immediately after deploy.
 */

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "openzeppelin-contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Burnable} from "openzeppelin-contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";

interface IRescueRegistry {
    function isRescueExecutor(address caller) external view returns (bool);
    function canExecuteRescue(address from) external view returns (bool);
}

contract SNRGToken is ERC20, ERC20Permit, ERC20Burnable, Ownable {
    error TransfersDisabled();
    error NotAuthorized();

    // Allowed endpoints (now immutable)
    address public immutable staking;
    address public immutable swap;
    IRescueRegistry public immutable rescueRegistry;

    // Immutable decimals = 9 on both chains for parity with Solana
    uint8 private constant _DECIMALS = 9;

    constructor(
        address treasuryMultisig,
        address _staking,
        address _swap,
        address _rescueRegistry
    ) ERC20("Synergy Presale Coin", "SNRG") ERC20Permit("SNRG") Ownable(msg.sender) {
        require(treasuryMultisig != address(0), "treasury=0");
        require(_staking != address(0), "staking=0");
        require(_swap != address(0), "swap=0");
        require(_rescueRegistry != address(0), "registry=0");

        _mint(treasuryMultisig, 6_000_000_000 * 10 ** _DECIMALS);
        staking = _staking;
        swap = _swap;
        rescueRegistry = IRescueRegistry(_rescueRegistry);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * OZ v5 uses _update for transfer hooks.
     * We block **all** transfers unless they hit/come from explicitly allowed endpoints,
     * or the call originates from the RescueRegistry when executing a matured rescue for `from`.
     */
    function _update(address from, address to, uint256 amount) internal override {
        // Minting or burning are handled by ERC20/ ERC20Burnable hooks.
        // Allow burn at swap.
        bool isMint = from == address(0);
        bool isBurn = to == address(0);

        if (!isMint && !isBurn) {
            bool fromAllowed = (from == staking) || (from == swap);
            bool toAllowed   = (to == staking)   || (to == swap);

            // Rescue path: registry may orchestrate a transfer FROM a victim after timelock
            bool rescueMove = false;
            if (address(rescueRegistry) != address(0)) {
                // The rescue executor calls into token.transferFrom via registry (or direct transfer with allowance),
                // and we recognize the executor by msg.sender plus matured state for `from`.
                if (rescueRegistry.isRescueExecutor(msg.sender) && rescueRegistry.canExecuteRescue(from)) {
                    rescueMove = true;
                }
            }

            if (!(fromAllowed || toAllowed || rescueMove)) {
                revert TransfersDisabled();
            }
        }

        super._update(from, to, amount);
    }
}