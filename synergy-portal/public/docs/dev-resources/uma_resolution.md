## UMA Resolution Specification

### 1. Overview

This document defines the Universal Meta-Address (UMA) resolution process for Synergy Network, including address mapping, key derivation, and cross-chain resolution. UMA allows a single identity to manage assets and identities across multiple blockchains.

---

### 2. UMA Structure

* **UMA ID:** `uma:<chain>:<address>`
* **Example:** `uma:eth:0xabcdef...`, `uma:syn:sYnQ1zxy...`, `uma:sol:9wAX...`

Each UMA maps to a public key and supports:

* Forward and reverse resolution
* Association with SNS names
* Post-quantum cryptographic proof of control

---

### 3. Key Derivation Process

* **BIP-39 Mnemonic → BIP-44 HD Path** for each target chain
* Supported Chains:

  * Ethereum: `m/44'/60'/0'/0/0`
  * Solana: `m/44'/501'/0'/0'`
  * Synergy: `m/5353'/0'/0'/0` (custom path)
* UMA Key: derived using master entropy and purpose-built index

---

### 4. Registration Workflow

1. User generates a Synergy wallet and UMA seed.
2. System derives corresponding keys for ETH and SOL.
3. Submit registration on-chain: `RegisterUMA(umaID, chain, publicKey)`
4. Smart contract stores UMA ↔ key mapping.

---

### 5. Resolution Logic

* **Forward Resolution:** `getAddress(umaID)`
* **Reverse Resolution:** `getUMA(chain, address)`
* Contracts enforce unique UMA↔Address mapping.
* SNS names link directly to UMAs (e.g., `alice.syn → uma:syn:sYnQ...`)

---

### 6. Security Features

* All UMA keys use Dilithium-3 PQ signatures
* Smart contract enforces replay and collision protection
* 2FA optional layer (hardware wallet + UMA sig)

---

### 7. Cross-Chain Compatibility

* UMA identities used for:

  * Token migration
  * Staking delegation
  * Bridge validations
  * DAO role verification

* UMA contracts deployed on:

  * Ethereum (UMARegistry.sol)
  * Solana (uma\_registry.rs)
  * Synergy Mainnet (uma\_module.rs)

---

### 8. CLI/SDK Support

* `synergy-cli register-uma --chain eth --address <0x...>`
* JS SDK: `sdk.uma.resolve('uma:syn:...')`
* Python SDK: `resolve_uma('uma:sol:...')`

---

### 9. Federation and DNS Compatibility (Future Phase)

* UMA + SNS to support `.syn` domain integration
* Federated UMA resolution via Web3 DNS (IPNS, ENS compatibility)

---

### 10. Versioning

* UMA v1.0 launched with Synergy Testnet
* Future revisions stored at `/specs/uma/`
* Governance proposal required for updates to UMA format
