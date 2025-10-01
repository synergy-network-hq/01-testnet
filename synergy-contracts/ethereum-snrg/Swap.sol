// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Swap contract for presale -> mainnet swap preparation
 *
 * - Users approve this contract for the amount they want to swap (or pre-transfer tokens to the contract).
 * - User calls requestSwap(mainnetAddressString, amount)
 * - Contract transfers tokens from user to itself and then burns them (if SNRG supports burnFrom),
 *   or simply transfers to contract and calls forced burn via admin (if allowed).
 * - Emits SwapRequested event which off-chain relayers / bridge / oracle will listen for and trigger mainnet mint to `mainnetAddressString`.
 *
 * NOTE: This implementation performs:
 *   - transferFrom(user, address(this), amount)
 *   - then calls burn (requires that SNRG implements ERC20Burnable)
 *
 * The multisig must allow the Swap contract to be able to hold / burn tokens, or owner will be used to finalize.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract Swap is ReentrancyGuard {
    IERC20Burnable public immutable snrg;
    address public immutable admin; // multisig admin address to receive final confirmations/logs

    event SwapRequested(address indexed presaleWallet, string indexed mainnetAddress, uint256 amount, uint256 timestamp);

    constructor(address _snrg, address _admin) {
        require(_snrg != address(0) && _admin != address(0), "zero");
        snrg = IERC20Burnable(_snrg);
        admin = _admin;
    }

    /**
     * User approves this contract for `amount` SNRG, then calls requestSwap.
     * The contract does transferFrom -> burn to make the swap action irreversible on the presale chain.
     */
    function requestSwap(string calldata mainnetAddress, uint256 amount) external nonReentrant {
        require(bytes(mainnetAddress).length > 0, "no mainnet addr");
        require(amount > 0, "zero amount");

        // transfer tokens from user to this contract
        require(snrg.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        // burn tokens held by this contract to prevent reuse
        snrg.burn(amount);

        emit SwapRequested(msg.sender, mainnetAddress, amount, block.timestamp);
    }
}
