// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SNRGPresale.sol";

contract PresaleTest is Test {
    SNRGToken token;
    SNRGPresale presale;
    address treasury = address(0xBEEF);
    address buyer = address(0xA11CE);

    function setUp() public {
        token = new SNRGToken(treasury, address(0x1), address(0x2), address(0x3));
        presale = new SNRGPresale(address(token), treasury, address(this));
        vm.prank(address(this));
        presale.setOpen(true);
        vm.prank(address(this));
        presale.setPriceWei(1e9); // 1e9 wei per SNRG (decimals=9)
        vm.prank(treasury);
        token.approve(address(presale), type(uint256).max);
    }

    function test_Buy() public {
        vm.deal(buyer, 10 ether);
        vm.prank(buyer);
        presale.buy{value: 1 ether}();
        assertGt(token.balanceOf(buyer), 0);
    }
}
