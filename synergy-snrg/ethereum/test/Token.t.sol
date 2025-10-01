// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SelfRescueRegistry.sol";
import "../contracts/SNRGStaking.sol";
import "../contracts/SNRGSwap.sol";

contract TokenTest is Test {
    SNRGToken token;
    SelfRescueRegistry rescue;
    SNRGStaking staking;
    SNRGSwap swap;
    address treasury = address(0xBEEF);
    address user = address(0xABCD);

    function setUp() public {
        vm.startPrank(address(this));
        rescue = new SelfRescueRegistry(address(0), address(this));
        swap = new SNRGSwap(address(0), address(this));
        staking = new SNRGStaking(address(0), 1000, address(this));
        token = new SNRGToken(treasury, address(staking), address(swap), address(rescue));
        vm.stopPrank();
        // Fund user from treasury path by simulating treasury behavior
        vm.prank(treasury);
        token.transfer(user, 1000);
    }

    function test_NoFreeTransfers() public {
        vm.prank(user);
        vm.expectRevert();
        token.transfer(address(0x1234), 1);
    }
}
