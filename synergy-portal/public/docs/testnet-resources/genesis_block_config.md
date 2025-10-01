## Genesis Block Parameters and Configuration

### 1. Overview

This document details the genesis block parameters and initial configuration for Synergy Network’s Testnet. The genesis block defines the network’s initial state, validator set, token distribution, and protocol rules.

---

### 2. File Location

* File Name: `genesis.json`
* Path: `config/genesis.json`
* Format: JSON (compatible with Synergy runtime parser)

---

### 3. Key Genesis Fields

| Field               | Description                                     |
| ------------------- | ----------------------------------------------- |
| `chainId`           | Unique network identifier (e.g., 338638)        |
| `genesisTime`       | UTC timestamp of genesis block creation         |
| `initialValidators` | Array of validator nodes with metadata          |
| `alloc`             | Initial token distribution (address → balance)  |
| `consensusParams`   | PoSy parameters including clustering logic      |
| `pqc`               | Enabled post-quantum cryptography settings      |
| `governance`        | Initial DAO roles, proposals, and parameters    |
| `sns`               | Pre-registered `.syn` names and UMA mappings    |
| `contracts`         | Pre-deployed contracts (SYN, DAO, Faucet, etc.) |

---

### 4. Example Snippet

```json
{
  "chainId": 338638,
  "genesisTime": "2025-04-01T00:00:00Z",
  "initialValidators": [
    {
      "address": "sYnQ1...",
      "stake": 1000000,
      "synergyScore": 85
    }
  ],
  "alloc": {
    "sYnQ1foundation...": 500000000,
    "sYnQ1user1...": 100000
  },
  "consensusParams": {
    "minSynergyScore": 50,
    "maxClusterSize": 12
  },
  "pqc": {
    "enabled": true,
    "defaultAlgorithm": "dilithium3"
  }
}
```

---

### 5. Consensus Configuration

* Consensus Mechanism: Proof of Synergy (PoSy)
* Minimum Synergy Score to Validate: 50
* Max Validators per Cluster: 12
* Epoch Duration: 1440 blocks

---

### 6. Token Distribution

* Total Supply: 1,000,000,000 tSYN (Testnet)
* Foundation: 500M tSYN
* Test Accounts: 100k–10M tSYN allocated for faucet/test scripts
* DAO Treasury: 150M tSYN (locked, unlock proposal required)

---

### 7. Pre-Deployed Smart Contracts

| Contract Name       | Address                 |
| ------------------- | ----------------------- |
| SYN Token (Testnet) | `sYnQ-CONTRACT-syn1...` |
| DAO Governance      | `sYnQ-CONTRACT-dao1...` |
| Staking Module      | `sYnQ-CONTRACT-stk1...` |
| Faucet              | `sYnQ-CONTRACT-ftc1...` |

---

### 8. UMA and SNS Preloads

* Predefined UMA ↔ Wallet mappings for core team
* SNS names:

  * `foundation.syn → sYnQ1foundation...`
  * `admin.syn → sYnQ1admin...`

---

### 9. Deployment Verification

* Genesis hash: auto-generated at boot
* Verified by all validators via signature
* Snapshot exported to `/config/snapshots/genesis_snapshot.json`

---

### 10. Updates & Governance

* Genesis is immutable post-deployment
* All changes must be enacted via DAO governance
* Future forks reference this document in `fork-spec.json`

---

### 11. Resources

* Template: `/templates/genesis.template.json`
* Synergy CLI Command: `synergy-cli init --genesis config/genesis.json`
* Validator Setup Docs: `/node-operations/`
