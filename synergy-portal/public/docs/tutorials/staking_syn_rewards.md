**Staking SYN and Monitoring Rewards**

---

**1. Overview**

This tutorial explains how to stake your SYN tokens using the Synergy Wallet GUI or CLI, and how to monitor your rewards over time. Staking contributes to the network's security and earns you recurring SYN rewards.

---

**2. Prerequisites**

* A Synergy Wallet with SYN tokens
* Access to GUI Wallet Tool or CLI Utility
* Network synced (Testnet or Mainnet)

---

**3. Staking via the GUI Wallet**

1. Open your wallet and go to the **Staking** tab
2. Browse the list of available validators (ranked by Synergy Score)
3. Click **Delegate** on your chosen validator
4. Enter the amount of SYN to stake
5. Confirm transaction — rewards begin accruing automatically

---

**4. Staking via the CLI**

Stake to a validator:

```bash
synergy-cli stake delegate --amount 1000 --validator sYnQ-validator-address
```

Check current rewards:

```bash
synergy-cli stake rewards
```

Claim rewards manually:

```bash
synergy-cli stake claim
```

---

**5. Understanding Reward Timing**

* Rewards are calculated and distributed **per epoch** (\~24 hours)
* Auto-compounding is available in GUI (toggle setting)
* Rewards depend on:

  * Amount staked
  * Validator uptime and Synergy Score
  * Network participation rate

---

**6. Unstaking Your SYN**

**GUI:**

* Navigate to **Staking → Manage Stake**
* Click **Unstake** and confirm
* Tokens are locked in cooldown for 7 days

**CLI:**

```bash
synergy-cli stake undelegate --amount 500 --validator sYnQ-validator-address
```

---

**7. Monitoring Performance**

**GUI Dashboard:**

* Real-time APY and cumulative reward tracker
* Validator health, missed blocks, and commission rate

**CLI Commands:**

```bash
synergy-cli stake history
synergy-cli validator uptime
```

---

**8. Tips for Maximizing Rewards**

* Choose validators with high SP, low downtime, and fair commission
* Split stake across multiple validators for redundancy
* Use SNS for staking via `yourname.syn`

---

**9. Troubleshooting**

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| No rewards showing  | Wait for next epoch or check validator health |
| Unstake not working | Ensure cooldown not already active            |
| Staking failed      | Check SYN balance and validator status        |

---

**10. Conclusion**

Staking SYN helps secure the network and gives you access to regular, performance-based rewards. With multiple ways to stake and real-time reward monitoring, it’s easy to grow your holdings while participating in Synergy governance and consensus.
