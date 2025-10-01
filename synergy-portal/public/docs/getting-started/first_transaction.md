**Making Your First Transaction**

---

**1. Overview**

Once you’ve created a Synergy Wallet and obtained SYN tokens, you’re ready to make your first transaction. This guide will walk you through the process using both the GUI and CLI versions of the Synergy Wallet Tool. You’ll learn how to send SYN tokens, verify transaction status, and troubleshoot common issues.

---

**2. Transaction Requirements**

* A funded Synergy Wallet (testnet or mainnet)
* Recipient Synergy address (Bech32m format, e.g., `sYnQ1zxy...`)
* Access to the Synergy Wallet Tool (CLI or GUI)

---

**3. Sending SYN Using the GUI Wallet**

1. Open the Synergy Wallet Tool
2. Navigate to the **Send** tab
3. Enter the recipient address
4. Input the amount of SYN to send
5. Optional: Add a memo or note (visible in the explorer)
6. Review transaction summary and fees
7. Click **Confirm & Send**
8. Wait for transaction confirmation (you will see a success screen with the transaction hash)

---

**4. Sending SYN Using the CLI Wallet**

Run the following command:

```bash
synergy-cli transaction send --to <recipient_address> --amount 100 --memo "First transaction"
```

You’ll be prompted to:

* Enter your wallet PIN
* Confirm transaction summary
* View transaction hash after success

---

**5. Understanding Transaction Fees**

* Synergy uses a dynamic fee system based on network activity
* Standard transfer fees are minimal (e.g., \~0.0005 SYN)
* Fees are automatically calculated during the send process

---

**6. Verifying the Transaction**

**6.1 Using the Synergy Explorer**

* Go to: [https://explorer.synergy-network.io](https://explorer.synergy-network.io)
* Enter your wallet address or transaction hash
* Confirm transaction status: `Pending`, `Confirmed`, or `Failed`

**6.2 Using the CLI**

```bash
synergy-cli transaction status --hash <transaction_hash>
```

**6.3 Using JSON-RPC**

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionReceipt",
  "params": ["<transaction_hash>"],
  "id": 1
}
```

---

**7. Troubleshooting Common Issues**

* **Invalid address**: Make sure the recipient address is a valid Bech32m-encoded Synergy address.
* **Insufficient funds**: Check balance before initiating a transfer.
* **Stuck transaction**: May occur on congested testnet; recheck later or try with higher fee (if supported).
* **Transaction not found**: Ensure you copied the full, correct transaction hash.

---

**8. Best Practices**

* Always double-check the recipient address before confirming
* Test small transfers before sending large amounts
* Keep a copy of your transaction hash for verification or support requests

---

**9. Conclusion**

Sending SYN tokens is a straightforward process, whether you're using the CLI or GUI tool. This first transaction represents your entry into the Synergy economy—enabling you to participate in dApps, governance, and validator staking with confidence.
