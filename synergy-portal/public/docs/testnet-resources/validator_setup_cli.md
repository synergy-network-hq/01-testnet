## Validator Setup Scripts and CLI Tools

### 1. Overview

This document outlines the setup process for Synergy Network validator nodes using official shell scripts and CLI tools. It includes installation, configuration, startup, and validator registration steps.

---

### 2. Repository Location

* GitHub: `synergy-network/testnet`
* Folder: `/deployment_scripts/`
* CLI Tool: `synergy-cli`

---

### 3. Prerequisites

* OS: Ubuntu 20.04+
* Hardware:

  * 4-core CPU
  * 16GB RAM
  * 500GB SSD
  * 100 Mbps network
* Dependencies:

  * Docker & Docker Compose
  * Go 1.21+
  * Node.js & npm (for utilities)

---

### 4. Setup Scripts

#### 4.1 `setup.sh`

* Initializes directory structure
* Downloads required binaries
* Prepares `genesis.json`
* Registers local config

#### 4.2 `start-node.sh`

* Launches validator node
* Background process via systemd or tmux
* Auto-start flag available

#### 4.3 `check-sync.sh`

* Verifies sync status with peers
* Shows latest block height

---

### 5. CLI Tool: `synergy-cli`

* Install: `cargo install synergy-cli` or use binary from release

#### Key Commands

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `init`               | Initializes node with `genesis.json`          |
| `start`              | Starts local validator node                   |
| `status`             | Checks node status and logs                   |
| `register-validator` | Registers node as validator with staking info |
| `submit-heartbeat`   | Sends proof-of-life signal to cluster         |
| `stake`              | Stakes SYN tokens for validation rights       |

---

### 6. Validator Registration Workflow

1. Generate wallet (or import existing)
2. Stake minimum SYN required (via CLI or GUI)
3. Submit validator metadata:

```bash
synergy-cli register-validator \
  --address sYnQ1abc... \
  --name "Validator #7" \
  --cluster-id 2 \
  --stake 100000
```

4. Wait for cluster sync and confirmation

---

### 7. Configuration Files

* `config.toml`: node settings, logging, peers
* `validator.key`: private key for signing blocks
* `network-config.toml`: enode, IP, port info

---

### 8. Log Monitoring

* View real-time logs:

```bash
tail -f logs/synergy-node.log
```

* Check block sync: `synergy-cli status`

---

### 9. Security Best Practices

* Store private keys offline or in secure vaults
* Monitor system resource usage
* Enable firewall and UFW for node ports
* Use fail2ban for brute-force protection

---

### 10. Automation Options

* Enable auto-restart using systemd:

```bash
sudo systemctl enable synergy-node
```

* Cron job for heartbeat submission every 15 mins

---

### 11. Resources

* Validator Guide: `/node-operations/becoming_validator.md`
* Cluster Formation: `/consensus/validator_clusters.md`
* Testnet Explorer: `https://explorer.testnet.synergy-network.io`
