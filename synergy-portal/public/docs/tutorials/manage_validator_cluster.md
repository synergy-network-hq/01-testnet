**Creating and Managing a Validator Cluster**

---

**1. Overview**

This tutorial explains how to create and manage a validator cluster on the Synergy Network. Validator clusters are the core operational unit in the Proof of Synergy (PoSy) consensus model, enabling distributed, cooperative block validation.

---

**2. Prerequisites**

* 5+ active validator nodes
* Each validator must have:

  * Self-bonded SYN (e.g., 25,000+)
  * High Synergy Score (≥70 recommended)
  * Uptime ≥ 99% over the last epoch

---

**3. Forming a Cluster (Manual Registration)**

```bash
synergy-cli cluster create \
  --name "ClusterNova" \
  --members validator01,validator02,validator03,validator04,validator05
```

* Minimum: 5 validators per cluster
* Optional: SNS identity for cluster (`clusternova.syn`)

---

**4. Cluster Roles**

Each cluster auto-assigns roles:

* **Proposer**: Rotates per block, creates proposal
* **Endorsers**: Sign valid proposals
* **Auditors**: Flag misbehavior or invalid logic
* **Backup Nodes**: Replace offline peers

---

**5. Monitoring Cluster Health**

```bash
synergy-cli cluster status --name ClusterNova
```

Returns:

* Role assignments
* Proposal success rate
* SP-weighted participation chart

---

**6. Managing Members**

Add validator:

```bash
synergy-cli cluster add-member --cluster ClusterNova --validator validator06
```

Remove validator:

```bash
synergy-cli cluster remove-member --cluster ClusterNova --validator validator02
```

---

**7. Rewards Distribution**

* Cluster rewards divided by Synergy Score share
* Commission fee set during cluster creation
* Auto-distributed at epoch end unless paused

---

**8. Rotation and Reshuffling**

* Cluster membership is evaluated every epoch
* Validators can be reshuffled based on:

  * Performance degradation
  * SP penalties
  * Cluster proposal conflict frequency

Force re-cluster:

```bash
synergy-cli cluster reshuffle --cluster ClusterNova
```

---

**9. Snapshot and Failover Handling**

* Each cluster can export its state snapshot:

```bash
synergy-cli cluster snapshot export --cluster ClusterNova
```

* Use snapshots to restore in case of multi-node failure

---

**10. Conclusion**

Validator clusters are the engine of consensus in Synergy Network. By actively managing cluster health, participation, and reward dynamics, operators ensure a resilient, fair, and scalable environment for securing the chain.
