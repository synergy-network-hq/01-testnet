**Transaction Fees**

---

**1. Overview**

Transaction fees in the Synergy Network serve as an economic mechanism to prevent spam, prioritize processing, and incentivize validators. The fee system is dynamic, designed to balance affordability and sustainability through congestion-aware pricing and partial token burns.

---

**2. Fee Structure Overview**

* **Base Fee**: Minimum required for any transaction (0.0001 SYN)
* **Dynamic Multiplier**: Adjusts based on network congestion
* **Burn Percentage**: % of base fee is permanently removed from supply
* **Validator Tip**: Optional incentive paid directly to block proposers

---

**3. Transaction Types & Fees**

| Type                     | Estimated Fee (SYN) | Notes                         |
| ------------------------ | ------------------- | ----------------------------- |
| Token Transfer           | 0.0002–0.001        | Most common type              |
| Smart Contract Execution | 0.001–0.01          | Scales with complexity        |
| SNS Registration         | 0.5–5.0             | Based on name length          |
| UMA Mapping              | 0.1–0.3             | Once per external address     |
| Governance Proposal      | 1.0–10.0            | Refundable if proposal passes |

---

**4. Fee Calculation Logic**

* Modeled after EIP-1559 with adaptive block-level base fee
* 50% of base fee is burned
* Tip is set by sender and used to prioritize transaction in mempool

Example calculation:

```text
Base Fee: 0.0004 SYN
Tip: 0.0002 SYN
Total Paid: 0.0006 SYN (0.0002 burned, 0.0002 to validator, 0.0002 to treasury)
```

---

**5. Setting Fees (CLI & GUI)**

**CLI**

```bash
synergy-cli transaction send --to <addr> --amount 50 --gas-tip 0.0003
```

**GUI**

* Click gear icon on send screen
* Choose **Standard**, **High Priority**, or **Custom**
* Preview estimated fee and tip allocation

---

**6. Gas Estimation Tools**

* CLI Command:

```bash
synergy-cli gas estimate --type contract --complexity high
```

* Web interface at [https://gas.synergy-network.io](https://gas.synergy-network.io)
* Explorer live feed shows recent block fee ranges

---

**7. Fee Redistribution**

| Portion        | Destination                 |
| -------------- | --------------------------- |
| 50% Burned     | Reduces total SYN supply    |
| 25% Validators | Rewarded for inclusion work |
| 25% Treasury   | Used for DAO development    |

---

**8. Future Fee Model Enhancements**

* Predictive fee UI using historical gas data
* Synergy Score-based discounts for contributors
* Fee batching: Bundle multiple low-value tx into one

---

**9. Monitoring Fee Usage**

* Per-wallet spending analytics in GUI wallet
* Global fee burn tracker in explorer dashboard
* CLI:

```bash
synergy-cli wallet fees-stats
```

---

**10. Conclusion**

Synergy Network’s transaction fee model is structured to promote long-term token utility and economic stability. Through dynamic pricing, partial burning, and transparent redistribution, users are incentivized to contribute to a healthy, scalable ecosystem while supporting validator operations and DAO growth.
