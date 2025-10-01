**Obtaining SYN Tokens**

---

**1. Overview**

SYN is the native utility token of the Synergy Network. It’s used for staking, governance, transactions, and powering decentralized applications within the ecosystem. This guide explains the different methods to acquire SYN tokens on both the testnet and mainnet.

---

**2. Methods to Obtain SYN (Mainnet)**

**2.1 Token Exchanges**

* SYN will be available on supported decentralized and centralized exchanges.
* Check Synergy Network’s official site for a list of verified listings.

**2.2 Synergy uDEX (Upcoming)**

* The native decentralized exchange (uDEX) will allow users to swap supported assets (ETH, USDC, etc.) for SYN directly.

**2.3 Validator Rewards**

* Earn SYN by running a validator node and participating in block validation.

**2.4 Community Grants & Incentives**

* Periodic airdrops, bounty programs, and community-driven campaigns reward participants with SYN.

**2.5 Partner Platforms**

* Earn SYN by engaging with ecosystem partners (e.g., through NFT mints, DAOs, educational events).

---

**3. Methods to Obtain SYN (Testnet)**

Testnet SYN tokens have no monetary value and are intended solely for development and testing.

**3.1 Developer Faucet**

* Visit: [https://testnet.synergy-network.io/faucet](https://testnet.synergy-network.io/faucet)
* Enter your Synergy testnet address to claim tokens.
* Rate limits may apply (e.g., 1 claim every 6 hours).

**3.2 CLI Faucet Claim**

```bash
synergy-cli faucet request --address <your_testnet_address>
```

**3.3 Genesis Allocations (Advanced)**

* Developers running private testnets can manually allocate SYN in the `genesis.json` file.

---

**4. Checking SYN Balances**

**4.1 CLI**

```bash
synergy-cli wallet balance
```

**4.2 GUI Wallet**

* Open your wallet
* Balance is displayed in the main dashboard alongside your staking and rewards info

**4.3 JSON-RPC Call**

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBalance",
  "params": ["<your_address>", "latest"],
  "id": 1
}
```

---

**5. Security and Caution**

* Only obtain SYN from trusted sources.
* Never share your wallet seed phrase or private key to receive tokens.
* Report phishing websites or scam airdrops to the Synergy Network community moderation team.

---

**6. Common Issues & Solutions**

* **Faucet not responding**: Check rate limit or try again later.
* **Tokens not showing up**: Ensure the wallet is connected to the correct network.
* **Balance = 0 after transaction**: Check transaction status using the Synergy Explorer.

---

**7. Conclusion**

Obtaining SYN is a gateway to full participation in the Synergy Network. Whether you're testing in the devnet or preparing for mainnet staking and governance, SYN is the cornerstone of all Synergy ecosystem activity. Acquire it safely and use it to power collaboration, security, and decentralized innovation.
