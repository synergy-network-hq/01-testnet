## Sample Testnet Transactions

### 1. Overview

This document provides example transaction payloads for common operations on the Synergy Network Testnet. These samples are useful for developers, testers, and validators during integration or simulation workflows.

---

### 2. Transaction Format

* All transactions are encoded as JSON
* Use `eth_sendRawTransaction` for signed TX
* Use `eth_call` for read-only state queries
* Chain ID (Testnet): `338638`

---

### 3. Transfer SYN Tokens

```json
{
  "from": "sYnQ1sender...",
  "to": "sYnQ1recipient...",
  "value": "0x2386f26fc10000", // 0.01 SYN
  "gas": "0x5208",
  "gasPrice": "0x3b9aca00",
  "nonce": "0x0"
}
```

---

### 4. Stake SYN Tokens

```json
{
  "from": "sYnQ1wallet...",
  "to": "sYnQ-CONTRACT-staking123...",
  "data": "0xa694fc3a0000000000000000000000000000000000000000000000000000000000989680", // stake(10000000)
  "gas": "0x100000",
  "gasPrice": "0x3b9aca00",
  "nonce": "0x1"
}
```

---

### 5. DAO Proposal Submission

```json
{
  "from": "sYnQ1proposer...",
  "to": "sYnQ-CONTRACT-dao...",
  "data": "0x01b22f86<encoded-proposal>",
  "gas": "0x200000",
  "nonce": "0x2"
}
```

---

### 6. Vote on Proposal

```json
{
  "from": "sYnQ1voter...",
  "to": "sYnQ-CONTRACT-dao...",
  "data": "0x2c4e722e0000000000000000000000000000000000000000000000000000000000000005", // vote(5)
  "gas": "0x80000",
  "nonce": "0x3"
}
```

---

### 7. SNS Name Registration

```json
{
  "from": "sYnQ1wallet...",
  "to": "sYnQ-CONTRACT-sns...",
  "data": "0x3f52a81f0000000000000000000000000000000000000000000000000000000000000065616c696365", // registerName("alice")
  "gas": "0x70000",
  "nonce": "0x4"
}
```

---

### 8. UMA Address Binding

```json
{
  "from": "sYnQ1wallet...",
  "to": "sYnQ-CONTRACT-uma...",
  "data": "0xabcde123000000000000000000000000...", // bind UMA ↔ ETH address
  "gas": "0x75000",
  "nonce": "0x5"
}
```

---

### 9. Testnet Faucet Claim (CLI)

```bash
synergy-cli claim-test-tokens --wallet sYnQ1abc... --captcha token123
```

---

### 10. Notes

* All `data` fields must be encoded using the contract’s ABI.
* Transactions must be signed with valid keys before sending.
* Use `gasPrice` of `0x3b9aca00` (1 Gwei) unless overridden.
* Use `nonce` tracking per account.

---

### 11. Tools for Testing

* Remix IDE + injected provider
* Hardhat scripts + `ethers.js`
* `synergy-cli` broadcast tool
* `curl` JSON-RPC commands

---

### 12. References

* ABI Files: `/contracts/abi/*.json`
* Contract Addresses: `/deployment/contracts-testnet.json`
* Explorer: `https://explorer.testnet.synergy-network.io`
* Faucet: `https://faucet.synergy-network.io`
