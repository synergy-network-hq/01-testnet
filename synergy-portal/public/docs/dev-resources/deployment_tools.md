**Deployment Tools (CLI + GUI)**

---

**1. Overview**

Deploying smart contracts and managing network components on the Synergy Network can be done using a feature-rich CLI and an intuitive GUI interface. This guide covers how to use both tools for deployment tasks, validator operations, contract interaction, and more.

---

**2. Synergy CLI Overview**

Install from source:

```bash
git clone https://github.com/synergy-network/cli.git
cd cli && cargo build --release
```

Run:

```bash
./target/release/synergy-cli --help
```

Key Functions:

* Wallet creation, import, recovery
* Contract deployment and method calls
* Validator setup and monitoring
* Governance voting and proposal creation

---

**3. CLI: Deploying a Contract**

```bash
synergy-cli contract deploy --wasm ./my_contract.wasm --wallet mywallet.syn
```

Interact with method:

```bash
synergy-cli contract call --contract <address> --function get_hello --args []
```

Upload contract metadata:

```bash
synergy-cli contract metadata upload --contract <addr> --abi ./abi.json
```

---

**4. CLI: Validator Registration**

```bash
synergy-cli validator register \
  --name "ClusterAlpha" \
  --commission 3 --bond 25000 --website "https://validator.alpha"
```

---

**5. CLI: Governance Participation**

Submit proposal:

```bash
synergy-cli proposal submit --type funding --title "Wallet Grants" --amount 100000 --description "Fund wallet development."
```

Vote:

```bash
synergy-cli proposal vote --id 52 --vote yes
```

---

**6. Synergy GUI Wallet Tool**

Download from: [https://synergy-network.io/wallet](https://synergy-network.io/wallet)

Key Features:

* Create, import, and manage wallets
* Deploy and interact with contracts
* Register SNS names and link UMA
* Stake SYN and track rewards
* Vote on proposals with real-time impact previews

---

**7. Deploy via GUI**

1. Navigate to **Contracts → Deploy Contract**
2. Upload `.wasm` file
3. Name and tag the contract
4. Confirm deployment and pay gas in SYN
5. Interact with methods in the live UI after deployment

---

**8. Developer Convenience Tools**

| Tool                  | Purpose                            |
| --------------------- | ---------------------------------- |
| `deploy.js` (Hardhat) | Automated JS deployment scripts    |
| `scripts/cli-tools`   | Bash helpers for testnet operators |
| Snapshot Restore      | Resync testnet node after restart  |
| Gas Estimator         | CLI and explorer estimation tools  |

---

**9. Deployment Best Practices**

* Always simulate with `synergy-cli contract simulate` before deploying
* Upload ABI to explorer for discoverability
* Use SNS to register contract name (e.g., `voting.syn`)
* Monitor transaction on Explorer after deploy

---

**10. Conclusion**

With robust CLI commands and an intuitive GUI Wallet Tool, Synergy developers and operators can securely deploy smart contracts, interact with applications, and manage governance roles. Both interfaces are optimized for fast, secure, and post-quantum-compatible execution.
