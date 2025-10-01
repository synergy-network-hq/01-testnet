**Voting Mechanism (Quadratic + Synergy Score)**

---

**1. Overview**

Synergy Network utilizes a hybrid voting mechanism combining **Quadratic Voting** and **Synergy Score Multiplier** to ensure that influence in governance decisions is fairly distributed. This system rewards active participation and reduces the centralizing effect of large token holdings.

---

**2. Core Components**

* **Quadratic Voting**: Diminishing returns on vote weight as more tokens are committed
* **Synergy Score**: Behavioral and performance-based multiplier that increases trust-weighted voting power

---

**3. Quadratic Voting Explained**

In quadratic voting:

```text
Vote Weight = √(Number of SYN Tokens Committed)
```

| SYN Committed | Vote Weight |
| ------------- | ----------- |
| 1             | 1.00        |
| 4             | 2.00        |
| 9             | 3.00        |
| 16            | 4.00        |

This approach discourages plutocracy and amplifies smaller holders’ voices.

---

**4. Synergy Score Multiplier**

Each voter’s vote weight is further multiplied by their Synergy Score (SP), which reflects historical participation, validator uptime, governance activity, and more.

```text
Final Vote Weight = √(SYN) * Synergy Score Factor
```

Example:

* 16 SYN committed
* Synergy Score = 1.25
* Final Vote Weight = 4 \* 1.25 = **5.0 votes**

---

**5. Synergy Score Influence Tiers**

| SP Range | Vote Multiplier |
| -------- | --------------- |
| 0–49     | 0.75×           |
| 50–74    | 1.00×           |
| 75–89    | 1.15×           |
| 90–100+  | 1.25×           |

SP is recalculated each epoch and publicly viewable via SNS.

---

**6. Delegated Voting (Optional)**

* Users can delegate voting power to trusted SNS identities
* Delegation does not transfer tokens—only voting rights for governance

CLI:

```bash
synergy-cli vote delegate --to validator01.syn
```

---

**7. Anti-Sybil and Anti-Manipulation Features**

* Minimum SP threshold for proposal submission
* SP decay for inactive accounts
* Delegation transparency: all delegations logged on-chain
* Proposal vote audits conducted by Governance Auditors

---

**8. Voting on the GUI**

* Click a proposal under **Governance → Proposals**
* Voting options: **Yes**, **No**, **Abstain**
* UI displays expected weight and SP multiplier in real-time

---

**9. Governance Analytics Tools**

* Vote breakdown by SP tier, validator cluster, and SNS name
* Voting participation history per user and cluster
* Real-time turnout stats, vote impact simulations

---

**10. Conclusion**

The hybrid quadratic + Synergy Score voting system offers a more equitable, reputation-aware form of on-chain democracy. It encourages meaningful participation while preventing centralized dominance, ensuring that governance decisions reflect both investment and contribution to the ecosystem.
