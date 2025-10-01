## Developer RPC/WS Endpoints

### 1. Overview

This document provides the official Remote Procedure Call (RPC) and WebSocket (WS) endpoints for the Synergy Network Testnet and Mainnet. Developers should use these for querying blockchain data, submitting transactions, and subscribing to real-time updates.

---

### 2. Testnet Endpoints

#### 2.1 JSON-RPC Endpoint

* URL: `https://rpc.testnet.synergy-network.io`
* Protocol: HTTP POST
* Supported Methods: JSON-RPC 2.0

Example:

```json
{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
```

#### 2.2 WebSocket Endpoint

* URL: `wss://ws.testnet.synergy-network.io`
* Protocol: WebSocket Subscriptions
* Supported Channels:

  * `newHeads`
  * `logs`
  * `newPendingTransactions`

Example Subscription:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_subscribe",
  "params": ["newHeads"]
}
```

---

### 3. Mainnet Endpoints (Post-Launch)

* JSON-RPC: `https://rpc.mainnet.synergy-network.io`
* WebSocket: `wss://ws.mainnet.synergy-network.io`
* Status Page: `https://status.synergy-network.io`

---

### 4. Supported RPC Methods

* Ethereum JSON-RPC compatible methods:

  * `eth_blockNumber`
  * `eth_getBalance`
  * `eth_getTransactionByHash`
  * `eth_sendRawTransaction`
  * `eth_call`
  * `eth_estimateGas`
  * `eth_subscribe`

---

### 5. Rate Limits and Guidelines

* Anonymous: 60 requests/sec
* API Key Holders: 200 requests/sec
* WS Connections: Max 3 concurrent per IP
* Abuse will trigger automatic IP blacklisting

---

### 6. API Key Registration

* Developer Portal: [https://developers.synergy-network.io](https://developers.synergy-network.io)
* Required for:

  * Rate limit increases
  * Access to debug trace methods
  * Faucet endpoint integration

---

### 7. Tools & Libraries

* **JavaScript:** `ethers.js`, `web3.js`
* **Python:** `web3.py`
* **Rust:** `ethers-rs`
* Postman Collection: `/api/examples/synergy.postman_collection.json`
* Curl test scripts in `/scripts/rpc-calls/`

---

### 8. Troubleshooting

* Check response headers for rate-limit status.
* Use `eth_syncing` to verify node sync status.
* Join Discord `#dev-support` for live help.

---

### 9. Versioning

* Endpoint spec version: v1.2
* ChangeLog available in `/docs/api/rpc-changelog.md`
