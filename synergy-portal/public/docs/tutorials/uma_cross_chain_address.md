**Using the UMA to Create a Cross-Chain Address**

---

**1. Overview**

This tutorial explains how to use the Universal Meta-Address (UMA) system to map your Synergy wallet to compatible addresses on other blockchains (Ethereum, Bitcoin, Solana). UMA allows cross-chain identity under one Synergy-managed namespace.

---

**2. Requirements**

* Synergy Wallet with SYN
* UMA-enabled wallet type
* Access to GUI or CLI

---

**3. UMA Overview**

* UMA = single identity mapped to multiple networks
* Address format: `sYnQ1...` maps to BTC, ETH, SOL via internal signing logic
* Uses threshold signatures for external networks (FROST/TSS clusters)

---

**4. UMA Mapping via GUI**

1. Open Synergy Wallet → Go to **Settings → UMA Mapping**
2. Click **Add Chain Mapping**
3. Choose target chain (e.g., Ethereum)
4. Enter external address you wish to map
5. Confirm and sign transaction

---

**5. UMA Mapping via CLI**

```bash
synergy-cli uma map --eth 0xYourEthereumAddress \
                     --btc bc1YourBTC \
                     --sol YourSolanaAddress
```

---

**6. Verify Mappings**

GUI:

* Settings → UMA Mappings → View linked addresses

CLI:

```bash
synergy-cli uma view --address sYnQ1...
```

Explorer:

* [https://explorer.synergy-network.io/uma](https://explorer.synergy-network.io/uma)

---

**7. Updating UMA Mapping**

* You may update mappings once per epoch
* GUI will show a cooldown timer
* CLI update:

```bash
synergy-cli uma update --sol NewSolAddress
```

---

**8. UMA and SNS Integration**

If you own an SNS name (e.g., `justin.syn`), it will reflect your UMA mappings automatically:

```bash
synergy-cli sns resolve --name justin.syn
```

Returns:

```json
{
  "eth": "0x...",
  "btc": "bc1...",
  "sol": "..."
}
```

---

**9. Use Cases for UMA**

* Sign into Synergy-based dApps with external wallets
* Enable cross-chain swaps using one identity
* Receive assets or reputation via synced external chain mappings

---

**10. Conclusion**

UMA gives Synergy users a cross-chain identity framework that simplifies interactions across blockchains. With secure on-chain mapping and SNS resolution, it’s easy to manage your decentralized presence from a single wallet.
