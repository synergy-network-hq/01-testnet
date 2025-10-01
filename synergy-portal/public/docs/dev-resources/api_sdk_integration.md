## Developer API and SDK Integration Guide

### 1. Overview

This guide provides developers with instructions on integrating with Synergy Network’s core blockchain infrastructure using official APIs and SDKs. It includes authentication, request formatting, error handling, and example use cases for Web3 and REST interactions.

---

### 2. API Access and Authentication

* **Base RPC Endpoint:** `https://rpc.testnet.synergy-network.io`
* **WebSocket Endpoint:** `wss://ws.testnet.synergy-network.io`
* **API Key (optional):** For rate-limited or analytics-enabled APIs. Issued via [developer portal](https://developers.synergy-network.io).

---

### 3. JSON-RPC Method Reference

| Method                  | Description                 | Example Request                                                                                   |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| eth\_blockNumber        | Get the latest block number | `{ "method": "eth_blockNumber", "params": [], "id": 1, "jsonrpc": "2.0" }`                        |
| eth\_getBalance         | Get wallet balance          | `{ "method": "eth_getBalance", "params": ["<address>", "latest"], "id": 2, "jsonrpc": "2.0" }`    |
| eth\_sendRawTransaction | Submit signed transaction   | `{ "method": "eth_sendRawTransaction", "params": ["0x...signed_tx"], "id": 3, "jsonrpc": "2.0" }` |

Full API reference: [docs.synergy-network.io/api/json-rpc](https://docs.synergy-network.io/api/json-rpc)

---

### 4. SDK Libraries

#### 4.1 JavaScript SDK

* Install: `npm install @synergy-network/sdk`
* Initialize:

```js
import { SynergySDK } from '@synergy-network/sdk';
const sdk = new SynergySDK('https://rpc.testnet.synergy-network.io');
```

#### 4.2 Python SDK

* Install: `pip install synergy-sdk`
* Example:

```python
from synergy_sdk import Synergy
client = Synergy(endpoint='https://rpc.testnet.synergy-network.io')
block = client.get_latest_block()
```

#### 4.3 Rust SDK *(Experimental)*

* Crate: `synergy-sdk`
* Docs: [crates.io/crates/synergy-sdk](https://crates.io/crates/synergy-sdk)

---

### 5. Smart Contract Interaction

* ABI parsing and encoding supported by SDKs.
* Gas estimation via `eth_estimateGas`.
* Example:

```js
sdk.contracts.load('MyContract', abi, address).methods.myFunction(arg1).send({ from: userAddress });
```

---

### 6. Error Handling and Rate Limits

* Rate limit: 60 requests/second (unauthenticated), 200/sec (with key)
* Common error codes:

  * `-32000`: insufficient funds
  * `-32601`: method not found
  * `-32602`: invalid params
  * `-32603`: internal error

---

### 7. Use Case Examples

* Fetch token balances
* Create and send SYN token transfers
* Monitor block events (via WebSockets)
* Deploy and verify smart contracts

---

### 8. Resources

* Developer Portal: [developers.synergy-network.io](https://developers.synergy-network.io)
* GitHub SDKs: [github.com/synergy-network/sdk](https://github.com/synergy-network/sdk)
* Tutorials: See `/tutorials/` folder
* Support: Discord `#sdk-help` or email [dev-support@synergy-network.io](mailto:dev-support@synergy-network.io)
