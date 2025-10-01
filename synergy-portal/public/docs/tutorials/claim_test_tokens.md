**Claiming Test Tokens from the Faucet**

---

**1. Overview**

This tutorial explains how to request and claim free testnet SYN tokens from the Synergy Network faucet. These tokens are used for development, contract testing, and validator simulations on the Synergy Testnet. They hold no real-world value.

---

**2. Requirements**

* Synergy Wallet with a valid testnet address (e.g., `sYnQ1...`)
* Access to web browser or CLI

---

**3. Method 1: Web Faucet (GUI)**

1. Visit: [https://testnet.synergy-network.io/faucet](https://testnet.synergy-network.io/faucet)
2. Enter your Synergy wallet address
3. Complete CAPTCHA (if enabled)
4. Click **Request Tokens**
5. Confirmation message appears; transaction shows in your wallet shortly

Limit: 1 request per address every 6 hours

---

**4. Method 2: CLI Faucet Command**

```bash
synergy-cli faucet request --address sYnQ1yourtestnetaddress
```

Returns:

* Request ID
* Estimated completion time (usually <30 seconds)

---

**5. Check Testnet Balance**

**CLI**:

```bash
synergy-cli wallet balance
```

**GUI Wallet**:

* Open wallet and refresh dashboard

---

**6. Troubleshooting Faucet Requests**

| Issue              | Solution                                     |
| ------------------ | -------------------------------------------- |
| Address rejected   | Confirm it starts with `sYnQ` and is testnet |
| No tokens received | Wait for network sync; check Explorer        |
| Rate limited       | Wait 6 hours or try a different address      |

---

**7. Explorer Verification**

* Use: [https://explorer.testnet.synergy-network.io](https://explorer.testnet.synergy-network.io)
* Search your address to view incoming faucet transaction

---

**8. Advanced: Automate Test Requests**

Example script for dev environments:

```bash
#!/bin/bash
ADDR=$(synergy-cli wallet address)
synergy-cli faucet request --address $ADDR
```

Run every 6 hours using cron or dev pipeline.

---

**9. Notes**

* Testnet tokens reset periodically with network resets
* Tokens can be used for:

  * Contract deployment
  * Governance test votes
  * Validator registration simulation

---

**10. Conclusion**

Claiming faucet tokens is the first step in testing Synergy applications. With CLI and web support, developers can easily access SYN test tokens and begin experimenting safely on the Synergy Testnet.
