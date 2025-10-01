**Synergy Naming System (SNS)**

---

**1. Overview**

The Synergy Naming System (SNS) is a decentralized identity protocol built into the Synergy Network that allows users, smart contracts, and validator nodes to register human-readable names mapped to their Synergy addresses. SNS names end in `.syn` and provide a secure and user-friendly way to interact across wallets, dApps, and governance.

---

**2. Key Benefits**

* **Readable Addresses**: Replaces long public keys with memorable `.syn` names
* **Identity Mapping**: Binds SNS names to UMA cross-chain identifiers
* **Governance Profiles**: Display validator and user reputations alongside names
* **Smart Contract Integration**: Enables readable function calls and permission control

---

**3. Structure of an SNS Name**

* Format: `username.syn`
* Example: `justin.syn`, `dao-fund.syn`, `nala.syn`
* Each name is unique and immutable unless released or expired

---

**4. Registration Process**

**4.1 Using the GUI Wallet**

1. Navigate to the **SNS** tab
2. Search availability of desired name
3. Select registration period (1–5 years)
4. Pay fee in SYN and confirm transaction
5. SNS name is minted and mapped to your wallet address

**4.2 Using the CLI**

```bash
synergy-cli sns register --name justin.syn --years 3
```

---

**5. SNS Smart Contract Mechanics**

* Each name is a non-transferable NFT linked to the owner address
* Mapped data includes:

  * Synergy address
  * UMA mapping (ETH, BTC, SOL addresses)
  * Reputation metrics (SP, validator rank)
  * Associated metadata (optional: avatar, description, contact URL)
* Name resolution is done on-chain and cached by indexing nodes for performance

---

**6. SNS Lookups**

**6.1 Web & Wallet UI**

* Type in `.syn` name to send tokens, stake, or vote

**6.2 Explorer & CLI**

```bash
synergy-cli sns resolve --name justin.syn
```

```json
{
  "sns": "justin.syn",
  "address": "sYnQ1zxy8qhj4j59xp...",
  "eth": "0x4f8...",
  "sol": "4F8GJ...",
  "reputation": 92.1
}
```

---

**7. Fees & Expiration**

* Cost scales by name length (shorter = higher fee)
* Names expire unless renewed
* Renewal fees may be reduced based on SP reputation score

---

**8. Governance Use Cases**

* SNS names can be used to:

  * Delegate or receive votes
  * Submit proposals
  * Display validator dashboards in explorer

---

**9. Security Considerations**

* SNS contracts enforce name uniqueness and prevent squatting
* Disputes resolved via on-chain governance appeal mechanism
* SNS metadata is verified and tamper-resistant

---

**10. Conclusion**

SNS improves usability, identity management, and social coordination on the Synergy Network. It bridges human and machine-readable systems while embedding trust and reputation into the core naming layer—unlocking a secure, accessible, and expressive way to interact on-chain.
