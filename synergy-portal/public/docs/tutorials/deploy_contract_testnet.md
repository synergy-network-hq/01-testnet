**Deploying a Smart Contract to Testnet**

---

**1. Overview**

This tutorial explains how to compile, deploy, and interact with a smart contract on the Synergy Testnet using both the CLI and GUI Wallet Tool. Testnet deployment is ideal for development, testing, and audits before mainnet release.

---

**2. Prerequisites**

* Rust installed (`rustup`, `cargo`)
* Synergy Wallet (with testnet SYN)
* `cargo-contract` installed
* Smart contract `.wasm` file ready
* Access to CLI or GUI

---

**3. Compile Your Contract (Rust)**

```bash
cargo build --release --target wasm32-unknown-unknown
```

Output: `target/wasm32-unknown-unknown/release/your_contract.wasm`

---

**4. Deploying via CLI**

```bash
synergy-cli contract deploy \
  --wasm ./your_contract.wasm \
  --wallet yourwallet.syn
```

After deployment, the CLI will return your contract address.

---

**5. Deploying via GUI Wallet Tool**

1. Go to **Contracts → Deploy Contract**
2. Upload the `.wasm` file
3. Name and tag the contract
4. Confirm and sign the transaction
5. View the deployed contract and interact with its methods

---

**6. Interacting with the Contract (CLI)**

Call a method:

```bash
synergy-cli contract call \
  --contract sYnQ-CONTRACT-address \
  --function myMethod \
  --args '["value"]'
```

---

**7. Add Metadata (Optional)**

Upload ABI and tags:

```bash
synergy-cli contract metadata upload \
  --contract sYnQ-CONTRACT-address \
  --abi ./my_contract.abi.json
```

---

**8. Verify Deployment**

Check transaction status:

```bash
synergy-cli transaction status --hash <tx_hash>
```

Or use: [https://explorer.testnet.synergy-network.io](https://explorer.testnet.synergy-network.io)

---

**9. Cleanup and Redeploying**

To redeploy:

* Bump the version or hash the file to get a unique deploy ID
* GUI and CLI will prevent duplicates unless explicitly overridden

---

**10. Conclusion**

Deploying to the Synergy Testnet is straightforward and mirrors mainnet operations. Using the CLI or GUI Wallet Tool, you can iterate quickly, verify results, and prepare your contracts for production deployment.
