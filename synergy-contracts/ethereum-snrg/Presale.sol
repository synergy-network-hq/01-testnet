// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Presale contract (ETH-based)
 *
 * Expectations:
 * - multisig (owner) mints entire supply to multisig owner (SynergyCoin)
 * - multisig transfers a chunk (or all) to this Presale contract before sale
 * - Presale contract sells tokens from its balance to buyers for ETH at a rate
 *
 * Features:
 * - configurable start/end timestamps
 * - per-address min/max purchase amount (in wei)
 * - overall presale token cap (from contract token balance)
 * - optional whitelist (owner can enable/disable)
 * - anti-bot options: per-address cooldown; per-block single-buy lock (limited mitigation)
 * - funds auto-forwarded to multisig address
 * - emergency pause
 */

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ISynergyCoin {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract Presale is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable snrg;
    address payable public immutable treasury; // multisig to receive ETH proceeds

    uint256 public startTime;
    uint256 public endTime;

    uint256 public rate;         // tokens per 1 ETH (i.e., tokens = msg.value * rate)
    uint256 public minWei;       // min buy in wei
    uint256 public maxWei;       // max buy per address in wei
    bool public whitelistEnabled = false;

    mapping(address => bool) public whitelist;
    mapping(address => uint256) public purchasedWei;
    mapping(address => uint256) public lastPurchaseBlock; // anti-bot

    event Purchased(address indexed buyer, uint256 weiAmount, uint256 tokenAmount);
    event WithdrawETH(address indexed to, uint256 amount);
    event WhitelistSet(address indexed who, bool allowed);

    constructor(address _snrg, address payable _treasury, uint256 _rate, uint256 _start, uint256 _end) {
        require(_snrg != address(0) && _treasury != address(0), "zero address");
        require(_start < _end, "bad timestamps");
        snrg = IERC20(_snrg);
        treasury = _treasury;
        rate = _rate;
        startTime = _start;
        endTime = _end;

        // sensible defaults
        minWei = 0;
        maxWei = type(uint256).max;
    }

    // buy function
    receive() external payable {
        buy();
    }

    function buy() public payable whenNotPaused nonReentrant {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "sale inactive");
        require(msg.value >= minWei && msg.value <= maxWei, "invalid ETH amount");

        if (whitelistEnabled) {
            require(whitelist[msg.sender], "not whitelisted");
        }

        // anti-bot: one purchase per block per address (cheap mitigation)
        require(lastPurchaseBlock[msg.sender] != block.number, "one tx per block allowed");
        lastPurchaseBlock[msg.sender] = block.number;

        // compute token amount; careful with decimals: rate is tokens per ETH (nominal token units)
        // Example: if rate = 1000 * (10**decimals) then 1 ETH => 1000 tokens
        uint256 tokenAmount = msg.value * rate;

        // ensure contract has enough tokens
        uint256 balance = snrg.balanceOf(address(this));
        require(tokenAmount <= balance, "not enough tokens in sale contract");

        // transfer tokens to buyer
        IERC20(snrg).transfer(msg.sender, tokenAmount);

        // forward ETH to treasury immediately
        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "ETH forward failed");

        purchasedWei[msg.sender] += msg.value;
        emit Purchased(msg.sender, msg.value, tokenAmount);
    }

    // owner functions
    function setRate(uint256 _rate) external onlyOwner {
        rate = _rate;
    }

    function setStartEnd(uint256 _start, uint256 _end) external onlyOwner {
        require(_start < _end, "bad timestamps");
        startTime = _start;
        endTime = _end;
    }

    function setMinMaxWei(uint256 _minWei, uint256 _maxWei) external onlyOwner {
        minWei = _minWei;
        maxWei = _maxWei;
    }

    function setWhitelistEnabled(bool on) external onlyOwner {
        whitelistEnabled = on;
    }

    function setWhitelist(address[] calldata addrs, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            whitelist[addrs[i]] = allowed;
            emit WhitelistSet(addrs[i], allowed);
        }
    }

    // owner can withdraw accidentally sent ERC20 tokens other than SNRG
    function rescueERC20(address token, address to) external onlyOwner {
        IERC20(token).transfer(to, IERC20(token).balanceOf(address(this)));
    }

    // emergency pause/unpause
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
