**Running a Full Node**

---

**1. Overview**

Running a full node on the Synergy Network enables you to independently verify the blockchain, propagate transactions, and support decentralized infrastructure. Full nodes are essential to the health, security, and censorship resistance of the network.

---

**2. Node Roles**

* **Full Node**: Stores the complete blockchain, validates blocks, and relays data
* **Validator Node**: Participates in consensus and block production (must stake SYN and maintain uptime)
* **Archive Node (optional)**: Maintains full historical state, useful for explorers and analytics

---

**3. System Requirements**

| Component | Minimum                    | Recommended               |
| --------- | -------------------------- | ------------------------- |
| CPU       | 4 cores                    | 8+ cores                  |
| RAM       | 16 GB                      | 32 GB                     |
| Storage   | 500 GB SSD                 | 1 TB NVMe                 |
| Network   | 100 Mbps symmetrical       | 500 Mbps+ for validators  |
| OS        | Ubuntu 20.04+ / Debian 11+ | Linux-based server distro |

---

**4. Software Requirements**

* Docker & Docker Compose (or manual binary build)
* Go (for contract testing)
* Rust (for validator compilation)
* Git, curl, jq, systemd

---

**5. Installation (Dockerized Setup)**

```bash
git clone https://github.com/synergy-network/testnet.git
cd testnet
./setup.sh
./start-node.sh
```

This installs and runs the node using predefined configurations. Nodes sync from genesis block or snapshot.

---

**6. Manual Installation (Non-Docker)**

1. Install dependencies
2. Compile node binary

```bash
cargo build --release
```

3. Create config files under `~/.synergy/config/`
4. Start node manually

```bash
./target/release/synergy-node start
```

---

**7. Syncing the Chain**

* Initial sync may take several hours
* Use snapshot to speed up:

```bash
./scripts/apply-snapshot.sh
```

* Check sync status:

```bash
./check-sync.sh
```

---

**8. Port Configuration**

* Default P2P Port: `26656`
* RPC: `26657`
* WebSocket: `8546`
* Ensure ports are open in your firewall or VPS provider

---

**9. Monitoring Node Health**

* CLI: `synergy-cli node status`
* Logs:

```bash
tail -f ~/.synergy/logs/synergy-node.log
```

* Optional: Enable Prometheus + Grafana dashboard

---

**10. Keeping the Node Updated**

* Pull latest from GitHub

```bash
git pull origin main
./update.sh
```

* Restart node after upgrade

---

**11. Common Issues**

| Issue             | Solution                                  |
| ----------------- | ----------------------------------------- |
| Sync stuck        | Check peers, reinit from snapshot         |
| High CPU usage    | Tune RocksDB config, use better hardware  |
| RPC not reachable | Confirm firewall and port bindings        |
| Out of disk space | Enable pruning or upgrade to larger drive |

---

**12. Conclusion**

Running a full node on the Synergy Network enhances decentralization and gives you direct, censorship-resistant access to the blockchain. Whether you're supporting governance, deploying contracts, or building applications, operating a node is a cornerstone of participation.
