**Using JSON-RPC Calls with cURL**

---

**1. Overview**

This tutorial shows how to use cURL to send raw JSON-RPC requests to Synergy Network endpoints. JSON-RPC is the primary protocol used to interact with Synergy nodes for transactions, block data, account balances, and contract calls.

---

**2. Endpoints**

| Network | RPC URL                                                                          |
| ------- | -------------------------------------------------------------------------------- |
| Mainnet | [https://rpc.synergy-network.io](https://rpc.synergy-network.io)                 |
| Testnet | [https://rpc.testnet.synergy-network.io](https://rpc.testnet.synergy-network.io) |

---

**3. Get Current Block Number**

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

**4. Get Account Balance**

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["sYnQ1youraddress", "latest"],"id":1}'
```

---

**5. Send Signed Transaction**

You must sign the transaction using SDK or CLI before broadcasting:

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0xSignedTxHex"],"id":1}'
```

---

**6. Query Transaction Receipt**

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xTxHash"],"id":1}'
```

---

**7. Interact with Smart Contracts**

Example: read-only call to a method

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
      "to": "0xContractAddress",
      "data": "0xFunctionSignature"
    }, "latest"],
    "id":1
  }'
```

Use [eth-converter.com](https://eth-converter.com) or `web3.eth.abi.encodeFunctionCall()` to generate encoded data.

---

**8. Batch Request Format**

```bash
curl -X POST https://rpc.testnet.synergy-network.io \
  -H "Content-Type: application/json" \
  -d '[
    {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1},
    {"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":2}
  ]'
```

---

**9. Troubleshooting**

| Error Code | Meaning               | Fix                                |
| ---------- | --------------------- | ---------------------------------- |
| -32000     | Insufficient funds    | Check wallet balance               |
| -32602     | Invalid params        | Double-check formatting            |
| -32601     | Method not found      | Use supported JSON-RPC method      |
| Timeout    | No response from node | Retry or check node/network status |

---

**10. Conclusion**

Using cURL with JSON-RPC gives developers powerful, scriptable access to Synergy node functions. It’s ideal for debugging, scripting, and testing dApp behavior without needing full SDK integration.
