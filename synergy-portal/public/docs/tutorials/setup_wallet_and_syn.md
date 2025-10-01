**How to Set Up a Wallet and Obtain SYN Tokens**

---

**1. Overview**

This tutorial walks you through setting up a Synergy Wallet (GUI and CLI), securing your seed phrase, and acquiring SYN tokens for use on the testnet or mainnet. After following these steps, you’ll be ready to send transactions, participate in staking, register SNS names, and vote in governance.

---

**2. Install the Synergy Wallet Tool**

**GUI Version:**

* Download from: [https://synergy-network.io/wallet](https://synergy-network.io/wallet)
* Supported on macOS, Windows, Linux

**CLI Version:**

```bash
git clone https://github.com/synergy-network/cli.git
cd cli
cargo build --release
./target/release/synergy-cli --help
```

---

**3. Create a New Wallet**

**GUI Steps:**

1. Launch the Wallet Tool
2. Click **Create Wallet**
3. Save your 24-word seed phrase securely (do NOT store online)
4. Set an encryption PIN
5. Your wallet is now ready — you’ll see:

   * Your address (e.g., `sYnQ1...`)
   * Public key (Dilithium PQC format)
   * Optional SNS registration prompt

**CLI Steps:**

```bash
synergy-cli wallet create
```

Follow prompts to back up the mnemonic, then set a PIN for access.

---

**4. Get SYN Tokens (Testnet Only)**

**Option 1: Web Faucet**

* Visit: [https://testnet.synergy-network.io/faucet](https://testnet.synergy-network.io/faucet)
* Enter your wallet address to request tokens (rate-limited)

**Option 2: CLI Faucet Command**

```bash
synergy-cli faucet request --address sYnQ1example...
```

You will receive a small amount of SYN for testing purposes.

---

**5. Get SYN Tokens (Mainnet)**

On mainnet, you can obtain SYN via:

* Exchanges (listed on [https://synergy-network.io](https://synergy-network.io))
* Community airdrops
* Earning rewards as a validator or participant

---

**6. Check Your Balance**

**GUI:**

* View your balance on the main dashboard

**CLI:**

```bash
synergy-cli wallet balance
```

---

**7. Optional: Register an SNS Name**

**GUI:**

* Go to **SNS** tab, search and register `.syn` name

**CLI:**

```bash
synergy-cli sns register --name yourname.syn --years 2
```

---

**8. Security Best Practices**

* Always back up your 24-word mnemonic offline
* Use a strong PIN/passphrase
* Enable auto-lock and secure storage options
* Never share your private key or seed phrase

---

**9. Troubleshooting**

| Problem               | Solution                           |
| --------------------- | ---------------------------------- |
| Faucet not responding | Wait 6 hours and retry             |
| Wallet won't open     | Reinstall app; check logs          |
| Balance not updating  | Ensure correct network is selected |

---

**10. Conclusion**

You’ve successfully created a secure Synergy Wallet and acquired testnet SYN tokens. You’re now ready to participate in transactions, staking, SNS registration, and more. Continue to the next tutorial to begin staking or deploying your first contract!
