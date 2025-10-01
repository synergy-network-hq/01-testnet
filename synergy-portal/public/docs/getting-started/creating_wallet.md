**Creating a Wallet**

---

**1. Overview**

This guide walks you through creating a Synergy Wallet, which is essential for interacting with the Synergy Network, including receiving and sending SYN tokens, participating in governance, and staking.

Synergy Wallets are post-quantum secure and support Universal Meta-Addresses (UMA) and Synergy Naming System (SNS) identifiers.

---

**2. Requirements**

* Synergy Wallet Tool (CLI or GUI)
* Optional: Hardware wallet support (Ledger, Trezor integration planned)
* Secure environment to store your seed phrase

---

**3. Wallet Types Supported**

* **Standard Wallet**: Post-quantum cryptography (Dilithium-3)
* **UMA Wallet**: Universal Meta-Address compatible across BTC, ETH, SOL
* **SNS Wallet**: Configured with human-readable `.syn` name (optional)

---

**4. Steps to Create a Wallet (GUI)**

1. Launch the Synergy Wallet Tool (desktop app).
2. Click "Create Wallet".
3. Choose wallet type:

   * Standard
   * UMA-enabled
   * SNS + UMA (optional mapping)
4. Generate new seed phrase (24-word BIP-39 variant).
5. Save seed phrase in a secure location — this is your only recovery method.
6. Set encryption PIN for local wallet access.
7. (Optional) Register `.syn` name and map to wallet.
8. Wallet is now ready. You will see your:

   * Public Address (Bech32m format, e.g. `sYnQ1zxy...`)
   * Public Key (PQC Dilithium3)
   * SNS name (if registered)

---

**5. Steps to Create a Wallet (CLI)**

1. Run `synergy-cli wallet create`
2. Follow prompts:

   * Choose wallet type (standard/UMA/SNS)
   * Accept terms and security warnings
   * Backup 24-word seed phrase
3. PIN encryption setup
4. Wallet saved to local `.synergy/wallets/` directory

---

**6. Address Format Details**

* Wallet addresses follow Bech32m encoding
* Prefix randomly selected between `sYnQ` and `sYnU`
* Example: `sYnQ1zxy8qhj4j59xp5lwkwpd5qws9aygz8pl9m3kmjx3`

---

**7. Backup and Recovery**

* Use seed phrase to recover wallet via GUI or CLI
* Optional: Export encrypted backup file from wallet tool
* Seed phrase recovery command (CLI):

  ```bash
  synergy-cli wallet recover
  ```

---

**8. Security Considerations**

* Never share your seed phrase or private key
* Always use offline or hardware options when possible for cold storage
* Use strong PINs and enable biometric security if available (GUI only)

---

**9. Troubleshooting**

* **Seed phrase rejected?** Ensure all 24 words are typed correctly from the BIP-39 list.
* **Address not visible?** Wallet may not be synced or selected network is incorrect.
* **CLI errors?** Run with `--verbose` for logs or consult the `wallet.log` file.

---

**10. Conclusion**

Creating a Synergy Wallet is your first step toward full participation in the Synergy Network. By securing your private key and using UMA + SNS features, you ensure seamless interaction across chains and services. Always prioritize security when handling wallets or seed phrases.
