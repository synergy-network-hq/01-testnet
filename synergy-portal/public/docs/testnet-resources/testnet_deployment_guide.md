**Testnet Deployment Guide**

---

**1. Overview**

This guide explains how to deploy and run a Synergy Testnet node. It includes node setup, syncing, validator onboarding, and optional explorer integration. The Testnet replicates the full feature set of mainnet in a sandbox environment for developers and validators.

---

**2. Prerequisites**

* Linux-based system (Ubuntu 20.04+ recommended)
* Rust toolchain installed
* Git, curl, Docker (optional), systemd
* Open ports: 26656 (P2P), 26657 (RPC), 8546 (WebSocket)

---

**3. Clone the Testnet Repository**

```bash
git clone https://github.com/synergy-network/testnet.git
cd testnet
```

---

**4. Build and Launch Node**

```bash
cargo build --release
./target/release/synergy-node start
```

To run in the background:

```bash
nohup ./target/release/synergy-node start &
```

---

**5. Using the Setup Script (Optional)**

```bash
chmod +x ./setup.sh
./setup.sh
```

Installs configs, generates wallet, and connects to bootstrap peers.

---

**6. Genesis File & Configurations**

* Located at: `config/genesis.json`
* Customize:

  * `initial_validators`
  * `chain_id = "synergy-testnet-01"`
  * `bootnodes`, `network_id`, `block_time`

---

**7. Verify Node Is Running**

```bash
synergy-cli node status
```

Expected Output:

* Latest block
* Peer count
* Syncing: false

---

**8. Join Existing Testnet Network**

Edit `config/node.toml`:

```toml
[network]
bootnodes = ["enode://...@IP:26656"]
```

Sync using:

```bash
./target/release/synergy-node start
```

---

**9. Apply Snapshot (Optional)**

```bash
./scripts/apply-snapshot.sh
```

Speeds up sync by importing verified chain state.

---

**10. Add Validator to Testnet**

```bash
synergy-cli validator register --bond 25000 --name "TestnetNode01"
```

Validator must be synced and online to enter cluster rotation.

---

**11. Monitoring Testnet Node**

```bash
tail -f ~/.synergy/logs/synergy-node.log
```

Or use Prometheus + Grafana:

* Prometheus port: `9000`
* Dashboard: [http://localhost:3000](http://localhost:3000)

---

**12. Explorer Connection (Optional)**

* Run Synergy Explorer backend:

```bash
cd explorer-backend && docker-compose up -d
```

* Connect to testnet node using `.env`:

```env
RPC_URL=https://rpc.testnet.synergy-network.io
```

---

**13. Firewall & Security Notes**

* Open ports: 26656 (P2P), 26657 (RPC), 9000 (metrics)
* Use UFW:

```bash
sudo ufw allow 26656
sudo ufw allow 26657
```

---

**14. Common Issues**

| Issue                | Fix                                       |
| -------------------- | ----------------------------------------- |
| Sync stuck           | Apply snapshot or verify peers list       |
| Port in use          | Kill process or change config ports       |
| Validator not active | Check uptime, SP, and cluster assignments |

---

**15. Conclusion**

Deploying on the Synergy Testnet is the best way to validate your infrastructure, test smart contracts, and earn early validator reputation. This environment is designed to replicate mainnet behavior in a safe, developer-friendly sandbox.
