**Creating an SNS Name and Mapping It**

---

**1. Overview**

This tutorial shows you how to register a human-readable Synergy Naming System (SNS) identity (e.g., `yourname.syn`) and link it to your wallet and UMA cross-chain addresses. SNS makes transactions and governance participation easier and more intuitive.

---

**2. Prerequisites**

* Synergy Wallet with at least 1 SYN
* Optional: UMA mappings for ETH, BTC, SOL
* SNS-enabled wallet type (GUI or CLI)

---

**3. Registering an SNS Name (GUI)**

1. Go to **SNS → Register Name**
2. Search for an available `.syn` name
3. Choose registration period (1–5 years)
4. Confirm the SYN fee and sign transaction
5. Name is now linked to your wallet address

---

**4. Registering an SNS Name (CLI)**

```bash
synergy-cli sns register --name yourname.syn --years 2
```

---

**5. Link Your SNS to UMA (Optional)**

GUI:

* Settings → UMA Mapping → Enable SNS Resolution
* Your `yourname.syn` will now resolve to your linked ETH, BTC, and SOL addresses

CLI:

```bash
synergy-cli uma map --eth 0xYourEth --btc bc1... --sol ...
```

SNS will auto-reference these mappings

---

**6. Verifying an SNS Name**

**CLI**:

```bash
synergy-cli sns resolve --name yourname.syn
```

Returns:

```json
{
  "address": "sYnQ1...",
  "eth": "0x...",
  "btc": "bc1...",
  "sol": "..."
}
```

Explorer:

* [https://explorer.synergy-network.io/sns/yourname.syn](https://explorer.synergy-network.io/sns/yourname.syn)

---

**7. Renew or Extend SNS**

GUI:

* Go to **SNS → Manage → Renew**

CLI:

```bash
synergy-cli sns renew --name yourname.syn --years 3
```

---

**8. Transfer or Release Name**

Currently, SNS names are non-transferable. You may choose to release your name:

```bash
synergy-cli sns release --name yourname.syn
```

---

**9. Use Cases for SNS**

* Send/receive SYN to `justin.syn`
* Use as voting identity for DAO proposals
* Public identity across dApps
* Enables mapped UMA integration from a single root identity

---

**10. Conclusion**

The Synergy Naming System simplifies blockchain interaction and enhances cross-chain identity by linking a readable `.syn` name to wallet and UMA metadata. Registering an SNS name makes your address easier to remember, share, and govern with.
