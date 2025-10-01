**Wallet User Guide**

---

**1. Overview**

The Synergy Wallet is your secure interface for managing SYN tokens, staking, governance participation, SNS names, and UMA cross-chain identity. This guide provides detailed instructions for using the wallet across both CLI and GUI interfaces.

---

**2. Key Features**

* Create and import wallets
* Send and receive SYN tokens
* Stake tokens and manage rewards
* Register and manage SNS names
* Access transaction history and logs
* UMA-compatible cross-chain mapping

---

**3. Installing the Wallet**

**3.1 GUI Version**

* Download from [https://synergy-network.io/wallet](https://synergy-network.io/wallet)
* Available for macOS, Windows, Linux
* Install via standard OS installer

**3.2 CLI Version**

```bash
git clone https://github.com/synergy-network/wallet-cli.git
cd wallet-cli
cargo build --release
```

---

**4. Creating a Wallet**

**GUI**

* Open the app and click **Create Wallet**
* Save the 24-word seed phrase securely
* Set a local PIN to encrypt your wallet

**CLI**

```bash
synergy-cli wallet create
```

---

**5. Importing a Wallet**

**GUI**

* Click **Import Wallet** and paste your 24-word seed phrase

**CLI**

```bash
synergy-cli wallet import --mnemonic "..."
```

---

**6. Viewing Balance and History**

**GUI**

* Main dashboard displays SYN balance, staked amount, and recent transactions

**CLI**

```bash
synergy-cli wallet balance
synergy-cli wallet history
```

---

**7. Sending and Receiving SYN**

**GUI**

* Go to **Send** tab, input recipient address and amount, confirm and send
* Your address (under **Receive** tab) can be copied or scanned via QR code

**CLI**

```bash
synergy-cli transaction send --to <address> --amount 10 --memo "Thanks!"
```

---

**8. Staking and Rewards**

**GUI**

* Go to **Staking** section
* Choose a validator cluster or stake directly
* Rewards accrue automatically and are viewable under **Rewards** tab

**CLI**

```bash
synergy-cli stake delegate --amount 100 --validator <address>
synergy-cli stake rewards
```

---

**9. SNS Name Registration**

**GUI**

* Go to **SNS** tab, check name availability, register desired `.syn` name

**CLI**

```bash
synergy-cli sns register --name myname.syn --years 2
```

---

**10. UMA Mapping (Cross-Chain ID)**

**GUI**

* Go to **Settings → UMA Mapping**
* Link ETH/BTC/SOL addresses to your Synergy wallet

**CLI**

```bash
synergy-cli uma map --eth 0x... --btc bc1... --sol 3F...
```

---

**11. Wallet Backup and Security**

* Backup your encrypted wallet file
* Store your 24-word seed phrase offline
* Use biometric or 2FA protection if supported (GUI only)

---

**12. Troubleshooting**

* Wallet not opening? Reinstall or check dependencies
* Missing balance? Ensure you're connected to the correct network
* Error in CLI? Run with `--verbose` and check `~/.synergy/wallet.log`

---

**13. Conclusion**

The Synergy Wallet offers powerful tools for secure digital asset management and on-chain participation. Whether you’re using the GUI or CLI, the wallet gives you full control of your keys, tokens, and reputation in the Synergy ecosystem.
