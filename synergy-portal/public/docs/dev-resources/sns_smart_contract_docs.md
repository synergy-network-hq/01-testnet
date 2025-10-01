## SNS Domain Registry Smart Contract Docs

### 1. Overview

The SNS (Synergy Naming System) Domain Registry smart contract manages the registration, resolution, and ownership of `.syn` domains. It enables human-readable names to map to UMA addresses, wallet addresses, and smart contracts across Synergy Network and supported chains.

---

### 2. Contract Details

* **Contract Name:** `SNSRegistry`
* **Network:** Synergy Mainnet
* **Contract Address:** `sYnQ-CONTRACT-snsreg123abc...`
* **Version:** SNS v1.0

---

### 3. Functions

| Function                                              | Description                                                    |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `registerName(string name, address owner)`            | Registers a new `.syn` name to the specified owner             |
| `resolveName(string name)`                            | Returns UMA or wallet address mapped to a `.syn` name          |
| `updateRecord(string name, string key, string value)` | Updates metadata record for a name (e.g., avatar, website)     |
| `transferName(string name, address newOwner)`         | Transfers ownership to another address                         |
| `setExpiration(string name, uint256 timestamp)`       | Manually set expiration time for renewals                      |
| `renewName(string name)`                              | Extends domain registration based on configured pricing policy |

---

### 4. Storage Structure

```solidity
mapping(string => Domain) domains;

struct Domain {
  address owner;
  string targetAddress;
  mapping(string => string) records;
  uint256 expires;
}
```

---

### 5. Resolution Logic

* Names are case-insensitive, ASCII-only
* `.syn` suffix auto-appended
* Resolves to:

  * UMA ID by default
  * Wallet or contract address if explicitly set

---

### 6. Expiration & Renewal

* Initial registration: 1 year (default)
* Grace period: 30 days post-expiration
* Auto-burn if not renewed after grace
* Renewal fees payable in SYN, based on name length and popularity

---

### 7. Metadata Records (Optional)

* `avatar`: Link to profile image or NFT
* `website`: Project or portfolio URL
* `bio`: Short identity summary
* `pubkey`: Public encryption key
* `discord`, `twitter`, etc.: Social handles

---

### 8. Integration Points

* Synergy Wallet: Resolves `.syn` names to UMA or wallet
* DAO Proposals: Maps proposer to readable ID
* Explorer & Block Indexer: Replaces address with `.syn` label
* Interop Bridges: Shows destination SNS name in asset logs

---

### 9. Admin Controls

* Emergency freeze via multisig
* Name registrar whitelist control
* Pricing policy contract address settable via DAO vote

---

### 10. Deployment Notes

* Deployed by SNS Core Team
* Verified and pinned on-chain
* Upgradeable via proxy pattern, subject to DAO governance approval

---

### 11. Versioning and Governance

* SNSRegistry v1.0 tagged in GitHub: `/contracts/sns/`
* Proposed changes require DAO governance approval
* ChangeLog tracked in `/docs/sns/registry-changelog.md`
