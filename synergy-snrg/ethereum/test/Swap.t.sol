// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SNRGSwap.sol";

contract SwapTest is Test {
    SNRGToken token;
    SNRGSwap swap;
    address treasury = address(0xBEEF);
    address user = address(0xF00D);

    function setUp() public {
        swap = new SNRGSwap(address(0), address(this));
        token = new SNRGToken(treasury, address(0x1), address(swap), address(0x3));
        vm.prank(treasury);
        token.transfer(user, 500e9);
        vm.prank(user);
        token.approve(address(swap), type(uint256).max);
    }

    function test_BurnReceipt() public {
        vm.prank(user);
        swap.burnForReceipt(100e9);
        assertEq(swap.burned(user), 100e9);
        vm.prank(address(this));
        swap.finalize(bytes32("root"));
        assertEq(swap.finalized(), true);
    }
}
