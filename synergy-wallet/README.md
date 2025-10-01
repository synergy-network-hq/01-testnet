# Synergy Wallet

A post-quantum-safe, cross-chain web wallet for the Synergy Network.
**Create, manage, and transact using Dilithium-3 quantum-safe keys, Bech32m Synergy addresses, and the official testnet. Includes support for SNS and UMA.**

---

## Features

- Quantum-safe wallet generation (Dilithium-3/Kyber)
- Bech32m Synergy address support (random sYnQ/sYnU prefix, 41 chars)
- Synergy testnet connectivity (JSON-RPC)
- Send/receive SYN tokens (real transactions, no stubs)
- SNS (Synergy Naming System) registration and resolution
- UMA (Universal Meta-Address) support
- Encrypted local storage (never plain-text keys)
- Easy backup, export/import (mnemonic or PQC serialization)
- Modern React UI, dark theme

---

## Architecture Overview

public/
index.html
synergy_logo.png
src/
api/
synergyRpc.js # Real Synergy RPC (getBalance, sendTx, SNS, UMA)
pqcCrypto.js # PQC key management (Dilithium-3/Kyber)
components/
WalletCreate.js
WalletView.js
SendToken.js
ReceiveToken.js
SNSManage.js
UMASection.js
Settings.js
LoadingSpinner.js
context/
WalletProvider.js
utils/
addressFormat.js # Bech32m address utilities
bip39.js
storage.js # Encrypted local storage
App.js
index.js
styles/
main.css
package.json
README.md
.env # Add REACT_APP_SYNERGY_RPC=https://rpc.testnet.synergy-network.io


---

## Quick Start (Mac)

1. **Clone the repo and install dependencies:**
    ```bash
    git clone https://github.com/synergy-network/synergy-wallet.git
    cd synergy-wallet
    npm install
    ```

2. **Add the RPC endpoint to `.env`:**
    ```
    REACT_APP_SYNERGY_RPC=https://rpc.testnet.synergy-network.io
    ```

3. **Start the dev server:**
    ```bash
    npm start
    ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Building for Production

```bash
npm run build

Build artifacts will be in the build/ folder.

Wallet Security
All keys are generated locally in your browser using Dilithium-3/Kyber.

Keys are encrypted with your password using Web Crypto.

No keys, mnemonics, or sensitive info ever leaves your device.

Testnet Instructions
All wallet addresses must be Bech32m, starting with sYnQ or sYnU, and be 41 characters long.

All test transactions are sent to the Synergy Network public testnet at https://rpc.testnet.synergy-network.io.

To receive SYN, use the included testnet faucet or request from Discord.

Contribution Guide
Fork and clone the repo.

Create a feature branch (git checkout -b feature/your-feature).

Make changes, ensure lint passes (npm run lint), and add tests if needed.

Submit a pull request with a clear description.

All code must use real cryptography (no stubs) and adhere to Synergy address/transaction standards.

Project License
MIT

