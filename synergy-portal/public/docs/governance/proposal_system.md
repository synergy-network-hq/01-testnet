**Proposal System and Lifecycle**

---

**1. Overview**

The Synergy Network’s proposal system is a formalized process for enacting changes to the protocol, allocating treasury funds, modifying validator policies, or triggering network responses. It ensures that meaningful decisions arise through transparent, democratic procedures weighted by community participation and Synergy Score.

---

**2. Proposal Types**

| Type                | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| Protocol Upgrade    | Deploy software upgrades or version changes              |
| Treasury Allocation | Disburse funds for grants, audits, or infrastructure     |
| Parameter Change    | Adjust fees, staking rewards, slashing thresholds        |
| Governance Motion   | Elect council members or modify governance framework     |
| Emergency Proposal  | Freeze operations or trigger rollback in critical events |

---

**3. Lifecycle Stages**

| Stage               | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Draft               | Proposal authored and formatted by eligible participant     |
| Endorsement         | Requires backing from 5% of active token holders            |
| Voting Period       | Open 7 days; quadratic + Synergy Score-weighted voting      |
| Execution           | Passed proposals auto-execute via governance smart contract |
| Post-Implementation | Audited by Governance Auditors within 14 days               |

---

**4. Proposal Requirements**

* **Minimum Stake**: 1,000 SYN
* **Synergy Score Threshold**: 50+
* **SNS Identity**: Required for submitter traceability
* **Smart Contract Payload** (if applicable): Must be verifiable and simulated prior to submission

---

**5. Voting Parameters**

* **Duration**: 7 days
* **Quorum**: 30% minimum of eligible voters
* **Pass Threshold**: Simple majority > 50%
* **Emergency Proposals**: 60% approval + 10% voter turnout minimum

---

**6. Voting Methods**

| Method        | Mechanics                                      |
| ------------- | ---------------------------------------------- |
| Quadratic     | Vote cost scales with square root of SYN spent |
| SP Multiplier | Weight multiplied by voter’s Synergy Score     |
| Delegated     | Voters can delegate to trusted SNS identities  |

---

**7. CLI and GUI Commands**

**CLI**:

```bash
synergy-cli proposal submit --type funding --title "Hackathon Grants" --amount 100000 --description "Allocate funds to dev grant pool."
synergy-cli proposal vote --id 42 --vote yes
```

**GUI**:

* Navigate to **Governance → Proposals**
* Submit or review active proposals
* Vote with a single click, preview impact and quorum

---

**8. Proposal Explorer**

* Located at: [https://explorer.synergy-network.io/governance](https://explorer.synergy-network.io/governance)
* Displays:

  * Current and historical proposals
  * Voting breakdown by SNS and validator cluster
  * Proposal outcomes and audit logs

---

**9. Proposal History & Transparency**

* All proposals are permanently stored on-chain
* Voting activity is publicly attributed to SNS identities
* Governance Auditors issue monthly reports on system integrity

---

**10. Conclusion**

The proposal system is the heartbeat of Synergy Network’s self-governance. By blending quadratic voting, performance incentives, and automation, Synergy empowers its community to shape the network’s future efficiently and equitably.
