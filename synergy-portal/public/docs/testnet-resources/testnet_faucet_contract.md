## Testnet Faucet Contract + Web UI

### 1. Overview

This document outlines the smart contract and frontend Web UI for distributing test SYN tokens to developers building on the Synergy Testnet. The faucet enforces fair-use limits and requires human verification to prevent abuse.

---

### 2. Smart Contract Details

* **Contract Name:** `Faucet`
* **Network:** Synergy Testnet
* **Contract Address:** `sYnQ-CONTRACT-faucet1234...`
* **Token Distributed:** `tSYN` (Testnet SYN Token)
* **Faucet Rate:** 100 tSYN / request, 1 request per 24 hours

---

### 3. Contract Functions

| Function                           | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `requestTokens(address recipient)` | Sends tokens to the user if eligible                   |
| `canRequest(address user)`         | Returns true if user is eligible (24h cooldown passed) |
| `setCooldown(uint256 seconds)`     | Admin function to adjust cooldown period               |
| `withdrawUnusedTokens()`           | Admin withdrawal for resetting the faucet              |

---

### 4. Cooldown Enforcement

* Mapped per address with timestamp tracking:

```solidity
mapping(address => uint256) lastRequestTime;
```

* Default cooldown: 86400 seconds (24h)
* Rejects request if within cooldown window

---

### 5. Web UI Features

* **URL:** `https://faucet.synergy-network.io`
* Connect wallet via MetaMask or Union Wallet
* CAPTCHA integration (e.g., hCaptcha)
* Form auto-fills user address from connected wallet
* Status messages:

  * ✅ "100 tSYN sent!"
  * ⚠️ "Already claimed in the last 24 hours"
  * ❌ "Transaction failed"

---

### 6. Backend Components

* Rate limiter (IP and wallet)
* Backend verifier for CAPTCHA
* REST API: `POST /faucet/request`

```json
{
  "wallet": "sYnQ1abc...",
  "captcha": "token"
}
```

---

### 7. Frontend Tech Stack

* Framework: React + Vite
* Wallet Connect: ethers.js
* CAPTCHA: hCaptcha or Google reCAPTCHA
* Styling: TailwindCSS (dark mode default)

---

### 8. Admin Functions

* CLI Tool: `faucet-cli admin withdraw`
* Web dashboard (admin-only access) to view recent requests and token balance

---

### 9. Deployment Notes

* Smart contract deployed from `synergy-network/faucet/contracts/Faucet.sol`
* UI repo: `synergy-network/faucet-ui`
* Faucet auto-replenished by Foundation wallet as needed

---

### 10. Troubleshooting

* If no tokens received:

  * Ensure you're on Synergy Testnet RPC
  * Check wallet cooldown status via `canRequest()`
  * Try a different wallet or IP (if VPN used)

---

### 11. Future Enhancements

* On-chain CAPTCHA verification
* Discord or GitHub OAuth gate before faucet access
* CLI auto-request: `synergy-cli claim-test-tokens`
* Daily claim stats on Explorer dashboard
