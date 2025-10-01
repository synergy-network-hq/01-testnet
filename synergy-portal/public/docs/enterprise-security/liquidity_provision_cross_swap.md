## Bridge Node Operation Manual (Cross-Chain)

### 1. Overview

This manual provides instructions for setting up and operating a Synergy Network bridge node to enable cross-chain asset transfers between Synergy, Ethereum, and Solana. Bridge nodes are responsible for validating, signing, and relaying atomic swap transactions.

---

### 2. Bridge Node Role

* Monitor bridge contracts on source and destination chains
* Validate UMA identity and transaction proofs
* Participate in threshold signature generation (FROST)
* Relay finalized transactions to target networks

---

### 3. Hardware & Network Requirements

* 8-core CPU
* 32GB RAM
* 1TB SSD
* Static IP recommended
* Reliable connection to all 3 chains (Synergy, Ethereum, Solana)

---

### 4. Repository

* GitHub: `synergy-network/bridges`
* Directory: `/node/`
* Components:

  * `bridge-daemon/`
  * `validator-plugin/`
  * `threshold-sign/`

---

### 5. Setup Steps

#### Step 1: Clone Repo

```bash
git clone https://github.com/synergy-network/bridges
cd bridges/node
```

#### Step 2: Install Dependencies

```bash
cargo build --release
```

#### Step 3: Generate Bridge Key

```bash
./bridge-daemon keygen --out bridge.key
```

#### Step 4: Register as Bridge Node

```bash
synergy-cli register-bridge-node --pubkey $(cat bridge.key.pub)
```

#### Step 5: Configure RPCs

Edit `config.toml`:

```toml
[networks]
synergy = "https://rpc.testnet.synergy-network.io"
ethereum = "https://rpc.ankr.com/eth"
solana = "https://api.testnet.solana.com"
```

#### Step 6: Start the Node

```bash
./bridge-daemon start --config config.toml
```

---

### 6. Key Functions

| Task                    | CLI Command or Log Reference       |                |
| ----------------------- | ---------------------------------- | -------------- |
| View bridge requests    | \`bridge-daemon logs               | grep Request\` |
| Sign transaction bundle | `threshold-sign sign --tx tx.json` |                |
| Submit to destination   | Auto-relayed once threshold met    |                |
| Rotate bridge key       | `bridge-daemon rotate-key`         |                |

---

### 7. Monitoring

* Logs: `/logs/bridge.log`
* Metrics:

  * Relayed TXs per hour
  * Signature participation rate
  * Latency: request → execution
* Dashboard: `https://monitor.synergy-network.io/bridge`

---

### 8. FROST Signature Participation

* Threshold: 5-of-7
* Penalty for missed signing: Slashing
* Contribution weight used in validator rewards

---

### 9. Security Practices

* Store `bridge.key` securely (HSM preferred)
* Rotate keys monthly or after compromise
* Validate chain RPCs to avoid hijack
* Enable firewall on exposed ports

---

### 10. Troubleshooting

* `Bridge stalled:` Check peer sync and gossip propagation
* `Signature threshold not met:` Contact other bridge operators
* `RPC failure:` Test endpoints manually with `curl`

---

### 11. Governance Control

* Bridge activation/deactivation via DAO proposal
* Slashing thresholds and bridge policies defined by governance

---

### 12. Future Support

* Cosmos, Polkadot bridges in roadmap
* zkBridge validation for wrapped assets
* Mobile relay client under development
