**Testing Frameworks and Example Contracts**

---

**1. Overview**

Testing is essential for developing secure and reliable smart contracts and infrastructure on the Synergy Network. This document outlines recommended tools and techniques for writing, running, and automating contract tests using Rust, Hardhat, and Synergy-specific CLI simulation utilities.

---

**2. Supported Testing Frameworks**

| Tool         | Purpose                                  |
| ------------ | ---------------------------------------- |
| `cargo test` | Native Rust unit and integration tests   |
| Hardhat      | TypeScript testing for contract wrappers |
| CLI SimTool  | Simulate Synergy PoSy contract behavior  |
| WASM Runner  | Validate contract execution off-chain    |

---

**3. Rust Unit Testing Example**

In your contract crate:

```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_hello_world() {
    assert_eq!(get_hello(), "Hello, Synergy!");
  }
}
```

Run tests:

```bash
cargo test
```

---

**4. Hardhat Integration for JS/TS Devs**

Setup project:

```bash
npm install --save-dev hardhat
npx hardhat init
```

Add Synergy network config:

```js
module.exports = {
  networks: {
    synergyTestnet: {
      url: "https://rpc.testnet.synergy-network.io",
      accounts: ["<PRIVATE_KEY>"]
    }
  },
};
```

Run test:

```bash
npx hardhat test
```

---

**5. CLI Contract Simulator**

Simulate contract function call locally:

```bash
synergy-cli contract simulate --wasm ./my_contract.wasm --function increment --args "[1]"
```

Returns expected state change and gas usage.

---

**6. Example Contract Templates**

GitHub repo: [github.com/synergy-network/example-contracts](https://github.com/synergy-network/example-contracts)

| Contract          | Description                              |
| ----------------- | ---------------------------------------- |
| `counter.rs`      | Increment/decrement counter example      |
| `voting.rs`       | Basic governance voting interface        |
| `sns_registry.rs` | Custom name registration + mapping logic |
| `faucet.rs`       | Token distribution simulation contract   |

Clone all examples:

```bash
git clone https://github.com/synergy-network/example-contracts.git
```

---

**7. Continuous Integration Suggestions**

* Use GitHub Actions or GitLab CI
* Include:

  * `cargo check`
  * `cargo test`
  * WASM compile + gas report
  * `synergy-cli contract simulate` test suite

---

**8. Fuzzing & Audit Tools (Advanced)**

* `cargo-fuzz`: Fuzz smart contract logic for panics or overflows
* Static analyzers for Rust contracts (e.g., `cargo-audit`)
* Formal verification tools planned for future ZK contracts

---

**9. Testnet Deployment Tools**

* Use `deploy.js` script (Hardhat)
* Or Synergy CLI:

```bash
synergy-cli contract deploy --wasm ./build/my_contract.wasm
```

---

**10. Conclusion**

Testing contracts in Synergy is streamlined across Rust-native tooling and JavaScript-based test environments. Use the CLI simulators and provided templates to build, validate, and audit your contracts efficiently before mainnet deployment.
