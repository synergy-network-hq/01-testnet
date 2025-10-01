**Voting on a DAO Proposal**

---

**1. Overview**

This tutorial shows you how to vote on governance proposals using the Synergy Wallet (GUI or CLI). Voting influences network upgrades, treasury funding, validator policy, and other protocol-level decisions.

---

**2. Prerequisites**

* Synergy Wallet with staked SYN
* Synergy Score ≥ 50 to maximize vote weight
* Active DAO proposal listed on-chain

---

**3. Understanding the Voting Mechanism**

* Vote Weight = √(Staked SYN) × Synergy Score Multiplier
* Options: **Yes**, **No**, or **Abstain**
* Voting window: 7 days per proposal

---

**4. Voting via GUI Wallet**

1. Open Wallet → Go to **Governance → Proposals**
2. Select a live proposal
3. Review proposal details and discussion links
4. Click **Vote** and choose Yes / No / Abstain
5. Confirm transaction and view on-chain confirmation

---

**5. Voting via CLI**

Check active proposals:

```bash
synergy-cli proposal list
```

Vote on proposal:

```bash
synergy-cli proposal vote --id 48 --vote yes
```

Check your vote:

```bash
synergy-cli proposal status --id 48
```

---

**6. Delegating Your Vote (Optional)**

Delegate to an SNS identity:

```bash
synergy-cli vote delegate --to justin.syn
```

* You can revoke or reassign at any time

---

**7. View Proposal Results**

* GUI: Go to **Governance → Proposal History**
* Explorer: [https://explorer.synergy-network.io/governance](https://explorer.synergy-network.io/governance)
* CLI:

```bash
synergy-cli proposal result --id 48
```

---

**8. Vote Incentives**

* Earn micro-rewards for participating if proposal turnout ≥ 75%
* Boost your Synergy Score by consistently voting and avoiding abstentions

---

**9. Troubleshooting**

| Problem             | Solution                                     |
| ------------------- | -------------------------------------------- |
| Vote rejected       | Check your SP and staking status             |
| No proposals listed | Ensure you're on the correct network         |
| Vote not recorded   | Wait for block confirmation; retry if needed |

---

**10. Conclusion**

Voting is your voice in the Synergy Network DAO. Whether influencing upgrades, allocating funds, or approving key policies, your participation strengthens decentralization and accountability in the ecosystem.
