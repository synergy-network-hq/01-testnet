## API Test Scripts and Sample Calls

### 1. Overview

This document provides developers with ready-made scripts and API call examples for interacting with Synergy Network’s RPC and WebSocket interfaces. It includes cURL snippets, CLI invocations, and Postman configuration for automated testing.

---

### 2. Environment

* Network: Synergy Testnet
* RPC: `https://rpc.testnet.synergy-network.io`
* WebSocket: `wss://ws.testnet.synergy-network.io`
* Chain ID: 338638

---

### 3. Prerequisites

* `curl`, `jq`, `node`, or `python`
* Installed: `synergy-cli` (optional)
* Optional tools: Postman, VSCode REST client

---

### 4. Basic JSON-RPC Calls (via cURL)

#### 4.1 Get Block Number

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc.testnet.synergy-network.io | jq
```

#### 4.2 Get Wallet Balance

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["sYnQ1abc...", "latest"],"id":2}' \
  https://rpc.testnet.synergy-network.io | jq
```

---

### 5. Transaction Broadcast

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x...signed_tx"],"id":3}' \
  https://rpc.testnet.synergy-network.io
```

---

### 6. WebSocket Subscription (Node.js Example)

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.testnet.synergy-network.io');

ws.on('open', () => {
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_subscribe',
    params: ['newHeads'],
    id: 1
  }));
});

ws.on('message', (data) => {
  console.log('New Block Header:', data);
});
```

---

### 7. synergy-cli Sample Commands

```bash
synergy-cli status
synergy-cli send --from sYnQ1abc... --to sYnQ1def... --amount 25
synergy-cli call --method eth_blockNumber
```

---

### 8. Postman Collection

* File: `/api/examples/synergy.postman_collection.json`
* Includes:

  * Get Block Number
  * Get Transaction by Hash
  * Send Raw Transaction
  * Get Logs by Filter
* Import using Postman > File > Import > Raw JSON

---

### 9. Python Script (eth\_blockNumber)

```python
import requests
payload = {
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
response = requests.post("https://rpc.testnet.synergy-network.io", json=payload)
print(response.json())
```

---

### 10. Useful Resources

* Docs: `https://docs.synergy-network.io/api/json-rpc`
* Postman: `https://postman.com/synergy-network`
* Discord: `#api-test-support`
* Status: `https://status.synergy-network.io`

---

### 11. Notes

* Always check rate limits (60 req/sec public)
* For contract interaction, encode ABI using `ethers.js` or `web3.py`
* Use WS for efficient real-time data (e.g., new blocks, tx pool)
