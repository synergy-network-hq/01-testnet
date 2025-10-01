**Smart Contract Development Guide**

---

**1. Overview**

Synergy Network supports smart contracts written in WebAssembly-compatible languages, primarily Rust. This guide walks developers through the lifecycle of contract development, deployment, testing, and interaction on both the testnet and mainnet environments.

---

**2. Supported Languages**

| Language       | Notes                         |
| -------------- | ----------------------------- |
| Rust           | Primary supported language    |
| AssemblyScript | Planned support               |
| Move           | Future compatibility (bridge) |

---

**3. Prerequisites**

* Rust (stable toolchain)
* Node.js (for frontend tools)
* `wasm-pack`, `cargo-contract`, `hardhat` (for testing)
* Synergy Wallet with testnet SYN

Install Rust:

```bash
curl https://sh.rustup.rs -sSf | sh
```

Install toolchain:

```bash
cargo install cargo-contract
```

---

**4. Writing a Contract**

Start a new Rust smart contract:

```bash
cargo new --lib my-contract
cd my-contract
```

In `Cargo.toml`:

```toml
[lib]
crate-type = ["cdylib"]
```

Basic example:

```rust
#[no_mangle]
pub fn get_hello() -> &'static str {
    "Hello, Synergy!"
}
```

---

**5. Compilation and Packaging**

Build for WASM target:

```bash
cargo build --release --target wasm32-unknown-unknown
```

Output: `target/wasm32-unknown-unknown/release/my_contract.wasm`

---

**6. Deploying to Synergy Testnet**

CLI Deployment:

```bash
synergy-cli contract deploy --wasm ./my_contract.wasm --wallet mywallet.syn
```

Hardhat Deployment (if using TypeScript):

```bash
npx hardhat run scripts/deploy.js --network synergyTestnet
```

---

**7. Interacting with Contracts**

Example function call:

```bash
synergy-cli contract call --contract <address> --function get_hello --args []
```

JS SDK:

```js
await contract.methods.get_hello().call();
```

---

**8. Testing and Simulation**

Use local emulator or testnet fork for development:

```bash
synergy-cli testnet fork --block 1000
```

Run Rust unit tests:

```bash
cargo test
```

---

**9. Contract Auditing Checklist**

* Validate gas limits and failure conditions
* Avoid unchecked math and overflow
* Do not allow `selfdestruct` or `reentrancy` without guards
* Integrate post-quantum signature verification if external inputs are verified

---

**10. Best Practices**

* Modularize logic and avoid monolithic codebases
* Use SNS-bound contracts for easy discovery
* Log events for every state change
* Include a self-destruct handler with DAO-only access

---

**11. Contract Indexing and Explorer Support**

* Contracts are auto-indexed by Synergy Explorer
* Developer tags and ABI schemas can be uploaded manually
* CLI to submit metadata:

```bash
synergy-cli contract metadata upload --contract <addr> --abi ./abi.json
```

---

**12. Conclusion**

Smart contract development on Synergy is secure, scalable, and post-quantum-ready. Using Rust + WASM provides powerful, efficient tooling with full access to SNS names, UMA cross-chain identity, and PoSy-native governance hooks.
