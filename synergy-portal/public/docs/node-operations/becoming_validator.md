**Becoming a Validator**

---

**1. Overview**

Validators play a critical role in securing the Synergy Network by proposing and validating blocks under the Proof of Synergy (PoSy) consensus mechanism. This guide explains how to become a validator, including setup, bonding requirements, registration, and responsibilities.

---

**2. Prerequisites**

* Run a fully synced Synergy full node
* Stake minimum bond amount (e.g., 25,000 SYN)
* Maintain high uptime, network reliability, and good performance
* Generate and secure validator keys

---

**3. Hardware Recommendations**

| Component | Specification            |
| --------- | ------------------------ |
| CPU       | 8+ cores                 |
| RAM       | 32+ GB                   |
| Storage   | 1 TB NVMe SSD            |
| Bandwidth | 500 Mbps+ symmetrical    |
| Uptime    | 99.9%+ with auto-restart |

---

**4. Validator Key Generation**

CLI:

```bash
synergy-cli validator keygen --name "validator01"
```

This generates a validator keypair stored under `~/.synergy/validators/validator01.key`

---

**5. Self-Bonding SYN Tokens**

Transfer SYN to your wallet and run:

```bash
synergy-cli stake bond --amount 25000 --validator validator01
```

---

**6. Registering as a Validator**

CLI:

```bash
synergy-cli validator register \
  --name "MyValidator" \
  --website "https://myvalidator.com" \
  --description "High-uptime PoSy validator" \
  --commission 5 --max-commission 20 --bond 25000
```

Fields:

* **Commission**: % of rewards kept by validator (rest goes to delegators)
* **Max Commission**: Upper limit you may set in future

---

**7. Responsibilities of Validators**

* Propose and validate blocks within your cluster
* Maintain node uptime and performance
* Respond to alerts and penalization warnings
* Engage in governance voting
* Submit reports for cluster health and optimizations

---

**8. Reward Distribution**

* Validators receive:

  * Base block reward
  * Transaction fees (shared with cluster)
  * Commission on delegator rewards
* Synergy Points (SP) boost reward calculation based on performance

---

**9. Slashing and Penalties**

Validators can be penalized for:

* Downtime (offline during consensus)
* Double-signing blocks
* Failing to endorse cluster proposals

Penalties:

* SP score reduction
* Partial stake slashing
* Blacklisting for repeated violations

---

**10. Monitoring & Maintenance**

* Use built-in CLI tools:

```bash
synergy-cli validator status
synergy-cli validator uptime
```

* Log tracking:

```bash
tail -f ~/.synergy/logs/synergy-node.log
```

* Optional: Use Prometheus and Grafana for real-time dashboards

---

**11. Deregistration**

To retire your validator:

```bash
synergy-cli validator deregister --validator validator01
```

* Bonded funds enter 7-day unbonding period
* SNS and reputation are preserved for future reactivation

---

**12. Conclusion**

Becoming a validator on Synergy Network allows you to actively contribute to network security, consensus, and governance. With a combination of technical setup, performance accountability, and collaboration, validator roles are both impactful and rewarding in the long-term health of the ecosystem.
