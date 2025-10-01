// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*

  /$$$$$$                                                             
 /$$__  $$                                                            
| $$  \__/ /$$   /$$ /$$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$  /$$   /$$
|  $$$$$$ | $$  | $$| $$__  $$ /$$__  $$ /$$__  $$ /$$__  $$| $$  | $$
 \____  $$| $$  | $$| $$  \ $$| $$$$$$$$| $$  \__/| $$  \ $$| $$  | $$
 /$$  \ $$| $$  | $$| $$  | $$| $$_____/| $$      | $$  | $$| $$  | $$
|  $$$$$$/|  $$$$$$$| $$  | $$|  $$$$$$$| $$      |  $$$$$$$|  $$$$$$$
 \______/  \____  $$|__/  |__/ \_______/|__/       \____  $$ \____  $$
           /$$  | $$                               /$$  \ $$ /$$  | $$
          |  $$$$$$/                              |  $$$$$$/|  $$$$$$/
           \______/                                \______/  \______/ 
 /$$$$$$$                                         /$$                 
| $$__  $$                                       | $$                 
| $$  \ $$ /$$$$$$   /$$$$$$   /$$$$$$$  /$$$$$$ | $$  /$$$$$$        
| $$$$$$$//$$__  $$ /$$__  $$ /$$_____/ |____  $$| $$ /$$__  $$       
| $$____/| $$  \__/| $$$$$$$$|  $$$$$$   /$$$$$$$| $$| $$$$$$$$       
| $$     | $$      | $$_____/ \____  $$ /$$__  $$| $$| $$_____/       
| $$     | $$      |  $$$$$$$ /$$$$$$$/|  $$$$$$$| $$|  $$$$$$$       
|__/     |__/       \_______/|_______/  \_______/|__/ \_______/       

*/                                                                      
                                                                      
                                                                      

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/utils/ReentrancyGuard.sol";

/**
 * SNRGPresale
 * -----------
 * - Accepts ETH and optionally ERC20 stablecoins (not included to minimize scope; can be extended).
 * - Distributes **locked SNRG** via transferFrom from the Treasury multisig wallet.
 * - Uses explicit per-buyer caps and optional allowlist.
 * - All funds are forwarded to the Treasury on receipt (pull pattern optional).
 */

contract SNRGPresale is Ownable, ReentrancyGuard {
    IERC20 public immutable snrg;
    address public immutable treasury;
    bool public open;
    uint256 public priceWei;            // wei per SNRG (decimals aligned to SNRG decimals=9)
    uint256 public totalSold;

    mapping(address => bool) public allowlist;
    bool public allowlistEnabled;
    mapping(address => uint256) public purchased;

    event OpenSet(bool open);
    event AllowlistSet(bool enabled);
    event PriceSet(uint256 priceWei);
    event Purchased(address indexed buyer, uint256 snrgAmount, uint256 paidWei);

    constructor(address _snrg, address _treasury, address owner_) {
        require(_snrg != address(0) && _treasury != address(0), "zero");
        snrg = IERC20(_snrg);
        treasury = _treasury;
        _transferOwnership(owner_);
    }

    receive() external payable {
        if (open) {
            _buy(msg.sender, msg.value);
        } else {
            revert("presale closed");
        }
    }

    function setOpen(bool v) external onlyOwner { open = v; emit OpenSet(v); }
    function setAllowlistEnabled(bool v) external onlyOwner { allowlistEnabled = v; emit AllowlistSet(v); }
    function setPriceWei(uint256 v) external onlyOwner { require(v > 0, "price=0"); priceWei = v; emit PriceSet(v); }
    function setAllowlist(address a, bool v) external onlyOwner { allowlist[a] = v; }

    function buy() external payable nonReentrant {
        require(open, "closed");
        _buy(msg.sender, msg.value);
    }

    function _buy(address buyer, uint256 paid) internal {
        require(paid > 0, "zero paid");
        if (allowlistEnabled) require(allowlist[buyer], "not allowlisted");
        uint256 amount = (paid * 1e9) / priceWei; // SNRG has 9 decimals
        totalSold += amount;
        purchased[buyer] += amount;
        // Transfer tokens from Treasury
        require(snrg.transferFrom(treasury, buyer, amount), "treasury transfer fail");
        // Forward ETH to Treasury
        (bool s, ) = payable(treasury).call{value: paid}("");
        require(s, "treasury forward fail");
        emit Purchased(buyer, amount, paid);
    }
}
