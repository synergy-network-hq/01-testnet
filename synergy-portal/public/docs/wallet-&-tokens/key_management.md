**Key Management**

---

**1. Overview**

Key management in the Synergy Network ensures users maintain full control and security over their wallets, transactions, and identity. This guide explains how keys are generated, stored, recovered, and used across wallets, SNS names, and UMA mappings. Synergy uses post-quantum secure keypairs by default.

---

**2. Types of Keys**

| Key Type        | Description                                        |
| --------------- | -------------------------------------------------- |
| **Private Key** | Used to sign transactions; must be kept secret     |
| **Public Key**  | Used to derive your wallet address and verify sigs |
| **Seed Phrase** | 24-word mnemonic used to regenerate keys           |
| **PQC Keypair** | Dilithium-3 keys for quantum-safe security         |
| **UMA Mapping** | External chain keys mapped to your Synergy wallet  |

---

**3. Key Generation**

* Keys are derived from a BIP-39-compatible 24-word mnemonic
* Uses SHA3-256 hash of Dilithium-3 public key
* Address is generated using Bech32m encoding

CLI:

```bash
synergy-cli wallet create
```

GUI:

* Click **Create Wallet** and securely save your 24-word phrase

---

**4. Key Backup & Storage**

* **Seed Phrase**: Offline, written copy recommended (do not store digitally)
* **Encrypted Key File**:

  * CLI default path: `~/.synergy/wallets/wallet.dat`
  * GUI export option: Settings → Export Wallet Backup
* Optional: Use cold storage or hardware wallets for long-term key safety

---

**5. Recovery & Import**

CLI:

```bash
synergy-cli wallet import --mnemonic "..."
```

GUI:

* On launch, click **Import Wallet** and enter mnemonic phrase

All addresses, balances, SNS names, and UMA mappings restore from the same phrase

---

**6. PIN Encryption and Security**

* Local key access is protected via PIN (GUI) or passphrase (CLI)
* Wallet will lock after timeout period
* CLI unlock:

```bash
synergy-cli wallet unlock --timeout 600
```

---

**7. Key Usage**

* **Transaction Signing**: All sends, contract calls, and staking actions
* **SNS Registration**: Proof of ownership required
* **UMA Bridge Signatures**: Delegated via validator consensus, internally secured

---

**8. Multi-Key Management (Advanced)**

* Users can manage multiple wallets:

```bash
synergy-cli wallet list
synergy-cli wallet switch --name wallet2
```

* GUI supports tabs for each wallet instance
* Recommended to separate hot wallet (frequent use) from cold wallet (long-term funds)

---

**9. Post-Quantum Key Info**

| Property       | Dilithium-3                         |
| -------------- | ----------------------------------- |
| Signature Size | \~2.4 KB                            |
| Key Size       | Public: \~1.3 KB, Private: \~2.5 KB |
| Security Level | NIST Level 3                        |
| Format         | Binary, encoded in Base64 or Hex    |

---

**10. Conclusion**

Secure key management is essential for operating safely within the Synergy Network. Always back up your seed phrase, understand where your keys are stored, and use multi-key strategies for enhanced protection. Post-quantum security means your assets are resilient for the long term—if your keys are properly secured.
