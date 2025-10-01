## Address Format Specification (Bech32m + PQC): Synergy Network

### 1. Overview

This document defines the official address format of the Synergy Network, prioritizing uniqueness, human readability, and post-quantum cryptographic compatibility. The standard applies to all Synergy wallet addresses, smart contract addresses, transaction identifiers, and Universal Meta-Addresses (UMAs).

---

### 2. Format Summary

* **Encoding Standard:** Bech32m
* **Prefix:** Randomly selected between `sYnQ` and `sYnU`
* **Length:** Target fixed length of 41 characters (variable from 30 to 42 if required)
* **Cryptography:** Post-quantum safe (Dilithium-3 or Kyber key origin)
* **Hash Algorithm:** SHA3-256 or BLAKE3

---

### 3. Address Types & Examples

| Address Type           | Example Format                                   | Notes                                 |
| ---------------------- | ------------------------------------------------ | ------------------------------------- |
| Wallet Address         | `sYnQ1zxy8qhj4j59xp5lwkwpd5qws9aygz8pl9m3kmjx3`  | Primary user-controlled address       |
| Smart Contract Address | `sYnQ-CONTRACT-8a7b5c9f3d6e1a2b4c7d8f9e0a5b6c3d` | Includes `-CONTRACT-` for distinction |
| Transaction Identifier | `Txn-sYnQ-abcdef1234567890abcdef1234567890`      | For hash-identified transactions      |
| Synergy Naming System  | `alice.syn`                                      | Resolved to a Synergy address via SNS |

---

### 4. Address Structure

```
sYnX + Bech32m Encoded Hash
```

* `sYnX`: Prefix to denote network type (`Q` or `U`)
* Encoded hash derived from post-quantum public key

#### Hashing & Encoding Steps

1. Generate public key (Dilithium-3 default)
2. Apply SHA3-256 or BLAKE3 hashing
3. Encode result using Bech32m
4. Randomly assign prefix `sYnQ` or `sYnU`

---

### 5. Supported Key Types

| Key Type    | Use Case                         | PQ-Safe | Notes                                |
| ----------- | -------------------------------- | ------- | ------------------------------------ |
| Dilithium-3 | Default wallet keypair           | ✅       | CRYSTALS PQC standard                |
| Kyber       | Optional hybrid encryption layer | ✅       | Used for UMA and multisig encryption |

---

### 6. Use Cases

* **Wallet Addresses:** User accounts, recovery-compatible
* **Smart Contracts:** Prefixed for clarity and registry validation
* **Transaction IDs:** Unique hashes for referencing operations
* **SNS Domains:** Public, readable aliases (e.g., `myname.syn`)
* **UMA Addresses:** Cross-chain mapped identities

---

### 7. Encoding Rationale

* **Bech32m Advantages:**

  * Error-detection and correction capabilities
  * Case-insensitive, QR-code optimized
  * Improved entropy and readability over Base58
* **Post-Quantum Cryptography (PQC):**

  * Immunity to Shor’s algorithm (quantum attacks)
  * Long-term viability and NIST-backed standards

---

### 8. Security Considerations

* High-entropy public key hash reduces collision risk
* Bech32m checksum integrity detection
* Private keys must be stored with quantum-secure tools
* SNS and UMA mappings subject to expiration and re-validation

---

### 9. Implementation Plan

* Bech32m encoding integrated in all wallet generation libraries
* Dilithium-3 set as default for CLI and GUI wallets
* UMA address registry to validate Bech32m addresses before linking
* SNS resolvers validate syntax before DNS-style resolution

---

### 10. Conclusion

The Synergy Network address format is built for the future. With Bech32m encoding and PQC-aligned cryptographic primitives, it ensures address uniqueness, readability, and interoperability in a quantum-resistant environment.
