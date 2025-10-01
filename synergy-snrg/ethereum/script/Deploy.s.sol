// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/SNRGToken.sol";
import "../contracts/SelfRescueRegistry.sol";
import "../contracts/SNRGStaking.sol";
import "../contracts/SNRGPresale.sol";
import "../contracts/SNRGSwap.sol";

/**
 * Configure values in script/Config.json:
 * {
 *   "treasuryMultisig": "0x...",
 *   "timelock": "0x...",
 *   "multisigOwner": "0x...",
 *   "stakingAprBps": 1200
 * }
 */
contract Deploy is Script {
    function run() external {
        string memory path = string.concat(vm.projectRoot(), "/ethereum/script/Config.json");
        string memory json = vm.readFile(path);
        address treasury = vm.parseJsonAddress(json, ".treasuryMultisig");
        address timelock = vm.parseJsonAddress(json, ".timelock");
        address multisigOwner = vm.parseJsonAddress(json, ".multisigOwner");
        uint256 apr = uint256(vm.parseJsonUint(json, ".stakingAprBps"));

        vm.startBroadcast();

        // Temporary placeholders for endpoints; set properly post-deploy.
        SelfRescueRegistry registry = new SelfRescueRegistry(address(0), multisigOwner);
        SNRGStaking staking = new SNRGStaking(address(0), apr, multisigOwner);
        SNRGSwap swap = new SNRGSwap(address(0), multisigOwner);
        SNRGToken token = new SNRGToken(treasury, address(staking), address(swap), address(registry));

        // Wire addresses now that token exists
        registry = new SelfRescueRegistry(address(token), multisigOwner);
        staking = new SNRGStaking(address(token), apr, multisigOwner);
        swap = new SNRGSwap(address(token), multisigOwner);
        token.setEndpoints(address(staking), address(swap), address(registry));

        // Transfer ownerships to timelock (or multisig controlled timelock)
        token.transferOwnership(timelock);
        registry.transferOwnership(timelock);
        staking.transferOwnership(timelock);
        swap.transferOwnership(timelock);

        // Presale (owned by timelock)
        SNRGPresale presale = new SNRGPresale(address(token), treasury, multisigOwner);
        presale.transferOwnership(timelock);

        vm.stopBroadcast();
    }
}
