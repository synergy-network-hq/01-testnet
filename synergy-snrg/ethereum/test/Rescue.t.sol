// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SelfRescueRegistry.sol";

contract RescueTest is Test {
    SNRGToken token;
    SelfRescueRegistry registry;
    address treasury = address(0xBEEF);
    address user = address(0xC0FFEE);
    address recovery = address(0xFEED);

    function setUp() public {
        registry = new SelfRescueRegistry(address(0), address(this));
        token = new SNRGToken(treasury, address(0x1), address(0x2), address(registry));
        vm.prank(treasury);
        token.transfer(user, 1_000e9);
        vm.prank(user);
        token.approve(address(registry), type(uint256).max);
        vm.prank(user);
        registry.registerPlan(recovery, 1 days);
        vm.prank(user);
        registry.initiateRescue();
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(address(0xDEAD)); // anyone can execute
        registry.executeRescue(user);
        assertEq(token.balanceOf(recovery), 1_000e9);
    }
}
