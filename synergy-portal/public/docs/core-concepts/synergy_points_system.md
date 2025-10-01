**Synergy Points System**

---

**1. Overview**

The Synergy Points (SP) System is the core performance and reputation engine behind validator behavior and participation incentives in the Synergy Network. SP scores influence clustering, reward eligibility, governance weight, and validator trust ranking. This system ensures that contributions are measured by quality and collaboration—not merely token holdings.

---

**2. What Are Synergy Points?**

* Synergy Points are earned by validators and contributors for completing network tasks, maintaining uptime, submitting valid blocks, and supporting governance.
* SP is recalculated at the end of each epoch.
* Points are non-transferable and decay over time if the validator becomes inactive.

---

**3. SP Earning Mechanisms**

Validators earn SP through the following activities:

| Activity                                  | SP Weight |
| ----------------------------------------- | --------- |
| Block Proposal Accepted                   | +10       |
| Block Validation Participation            | +5        |
| Governance Vote Cast                      | +3        |
| Uptime > 99%                              | +7        |
| Cluster Role Fulfilled (Auditor/Endorser) | +4        |
| Flagging Malicious Activity               | +8        |
| Submitting Optimization Proposals         | +6        |

---

**4. SP Penalties**

Validators are penalized SP for the following behaviors:

| Violation                      | SP Penalty |
| ------------------------------ | ---------- |
| Missed Proposal Opportunity    | -6         |
| Offline > 1 Hour               | -5         |
| Validated Faulty Block         | -8         |
| Unjustified Proposal Rejection | -3         |
| Failed Audit Verification      | -4         |

Penalties may be coupled with stake slashing in severe cases.

---

**5. Decay & Inactivity**

To prevent hoarding or passive advantage:

* SP decays at a rate of 10% per inactive epoch
* Validators with 0 SP are deprioritized in clustering

---

**6. SP and Governance Influence**

SP acts as a multiplier for governance voting:

* Final Vote Weight = staked SYN \* SP multiplier
* High SP validators have greater influence but must maintain performance to retain it

---

**7. SP and Clustering**

Validator clusters are formed based on SP profiles:

* Balanced clusters = higher overall SP
* Validators with similar SP scores grouped for role rotation fairness

---

**8. Monitoring and Transparency**

* SP Leaderboards displayed on Synergy Explorer
* APIs and CLI tools available:

```bash
synergy-cli validator sp-score --address <validator_address>
```

* Live decay, accrual, and reward rate shown in GUI wallet and Explorer dashboards

---

**9. Future Enhancements**

* zk-SP: Use zero-knowledge proofs to protect validator privacy while proving performance
* SP Delegation: Allow delegators to lend SP score to trusted validators (future proposal)
* Predictive Metrics: ML-enhanced SP prediction for proactive validator ranking

---

**10. Conclusion**

The Synergy Points System introduces a new dimension of fairness and performance-based incentives in blockchain consensus. It allows the Synergy Network to reward collaboration, discourage bad behavior, and ensure that power in the ecosystem is earned through contribution, not accumulation.
