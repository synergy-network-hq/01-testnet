## Troubleshooting Testnet Deployment

### 1. Overview

This document provides guidance for resolving common issues encountered while deploying, initializing, or interacting with Synergy Network Testnet nodes, smart contracts, and related tooling.

---

### 2. Node Fails to Start

**Symptom:** `panic: unable to parse genesis.json`

* Ensure `genesis.json` is valid JSON and schema-compliant
* Run validator: `synergy-cli validate-genesis config/genesis.json`

**Symptom:** `bind: address already in use`

* Port conflict with other processes (default: 30303, 8545, 30304)
* Kill conflicting process or change port in `config.toml`

---

### 3. Node Stuck on Syncing

**Symptom:** Height does not increase

* Ensure you are connected to peers (check `peers.log`)
* Restart node with `--bootnodes` flag set
* Enable verbose logs: `RUST_LOG=debug`

**Symptom:** Sync error: `mismatch genesis hash`

* Confirm your genesis file matches the network
* Clear `/data` and re-initialize with `synergy-cli init`

---

### 4. Smart Contract Deployment Issues

**Symptom:** `gas limit exceeded`

* Adjust `--gas` flag to `6000000` or higher
* Ensure your contract is optimized

**Symptom:** `invalid opcode` or `revert`

* Verify ABI matches deployed bytecode
* Check constructor arguments

---

### 5. Wallet / Faucet Errors

**Symptom:** `already claimed in last 24 hours`

* Faucet uses IP + wallet cooldowns
* Wait or switch wallet for dev testing

**Symptom:** `nonce too low`

* Query latest nonce with `eth_getTransactionCount`
* Resend TX with incremented nonce

---

### 6. Validator Cluster Issues

**Symptom:** Node not included in cluster

* Ensure Synergy Score > required minimum (default: 50)
* Check that validator registration succeeded

**Symptom:** Heartbeats not received

* Verify `submit-heartbeat` cron or systemd job is running

---

### 7. Explorer or API Unavailable

**Symptom:** `connection refused`

* Confirm `synergy-rpcd` is running
* Check firewall rules on ports `8545`, `8546`
* Restart node with `--rpc` and `--ws` flags enabled

---

### 8. Snapshot Restore Failures

**Symptom:** `snapshot hash mismatch`

* Download snapshot from trusted source
* Validate SHA256 checksum against published hash

**Symptom:** `unable to decompress archive`

* Use `tar -xvzf snapshot.tar.gz` manually to check integrity

---

### 9. Logs and Diagnostics

* Logs: `/logs/synergy-node.log`
* Sync status: `synergy-cli status`
* System metrics: `top`, `htop`, `iotop`

---

### 10. Support Channels

* Docs: [https://docs.synergy-network.io/testnet](https://docs.synergy-network.io/testnet)
* Discord: `#testnet-support`
* Email: [support@synergy-network.io](mailto:support@synergy-network.io)

---

### 11. Future Improvements

* CLI diagnostics command: `synergy-cli doctor`
* Auto-detect bad peers and suggest fixes
* Interactive config validator UI

---

### 12. Quick Commands Reference

```bash
# Restart node cleanly
./stop.sh && rm -rf /data && ./setup.sh && ./start-node.sh

# View latest block
synergy-cli status | grep block

# Verify genesis integrity
sha256sum config/genesis.json
```
