**Staking Guide**

---

**1. Overview**

Staking SYN tokens helps secure the Synergy Network, support validator operations, and earn rewards. This guide explains how to stake, monitor your earnings, and understand validator roles. Both delegators and validator operators can stake to participate in consensus and governance.

---

**2. Staking Basics**

* **Stakers**: Token holders who lock SYN to support network validators
* **Validators**: Nodes that propose/validate blocks and require self-bonded SYN
* **Delegators**: Users who stake SYN with a validator of their choice

---

**3. Rewards Overview**

* Distributed every epoch (roughly every 24 hours)
* Based on:

  * Validator uptime
  * Validator cluster performance (via Synergy Points)
  * Amount staked
  * Reward tier (dynamic APY)
* Rewards auto-compound (optional via wallet toggle)

---

**4. Staking via GUI Wallet**

1. Open the Synergy Wallet Tool
2. Go to **Staking** tab
3. Browse validator list
4. Choose a validator and click **Delegate**
5. Enter amount and confirm
6. View staked SYN and projected APY in dashboard

---

**5. Staking via CLI**

```bash
synergy-cli stake delegate --amount 1000 --validator <validator_address>
```

Check rewards:

```bash
synergy-cli stake rewards
```

Withdraw rewards:

```bash
synergy-cli stake claim
```

---

**6. Becoming a Validator**

* Requires:

  * Minimum SYN bond (set by governance, e.g., 25,000 SYN)
  * High Synergy Score
  * Node uptime and correct setup

Register via CLI:

```bash
synergy-cli validator register --name "MyNode" --bond 25000
```

---

**7. Unstaking and Lock Periods**

* Unstaking requires 7-day cooldown period
* Tokens remain visible but are locked during cooldown
* Early slashing can occur if validator misbehaves during cooldown

---

**8. Monitoring Staking Activity**

* GUI: Live rewards graph, historical reward chart, validator health
* CLI:

```bash
synergy-cli stake history
```

* Explorer: Search your address under [https://explorer.synergy-network.io](https://explorer.synergy-network.io)

---

**9. Risks and Safeguards**

* Delegated SYN is subject to slashing if validator acts maliciously
* Always research validator history and Synergy Score before delegating
* Use multiple validators to diversify risk

---

**10. Conclusion**

Staking is a critical function of the Synergy Network’s collaborative consensus. It provides security, enables reward distribution, and grants governance power. By participating in staking, you actively contribute to the growth, decentralization, and resilience of the Synergy ecosystem.
