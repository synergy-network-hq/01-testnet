// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SNRGStaking.sol";

contract StakingTest is Test {
    SNRGToken token;
    SNRGStaking staking;
    address treasury = address(0xBEEF);
    address user = address(0xABCD);

    function setUp() public {
        staking = new SNRGStaking(address(0), 1200, address(this));
        token = new SNRGToken(treasury, address(staking), address(0x2), address(0x3));
        vm.prank(treasury);
        token.transfer(user, 1_000e9);
        vm.prank(user);
        token.approve(address(staking), type(uint256).max);
    }

    function test_StakeAccrueUnstake() public {
        vm.prank(user);
        staking.stake(1_000e9);
        vm.warp(block.timestamp + 30 days);
        vm.prank(user);
        staking.claim();
        // Not checking value, only path and no reverts.
        vm.prank(user);
        staking.unstake(1_000e9);
        assertEq(token.balanceOf(user) > 1_000e9, true);
    }
}
