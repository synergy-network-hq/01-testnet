import React, { useEffect, useState } from "react";
import { fetchLatestTransactions } from "../api";
import "./TransactionsTable.css";

type Transaction = {
  block_index: number | null;
  sender: string | null;
  receiver: string | null;
  amount: number | null;
  timestamp: string | null;
};

const TransactionTracker: React.FC = () => {
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const poll = async () => {
      const txs = await fetchLatestTransactions();
      if (txs && txs.length > 0) setLatestTx(txs[0]);
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transactions-table">
      <h2>Live Transaction Tracker</h2>
      {latestTx ? (
        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{latestTx.block_index ?? "—"}</td>
              <td className="truncate">{latestTx.sender ?? "—"}</td>
              <td className="truncate">{latestTx.receiver ?? "—"}</td>
              <td>{latestTx.amount ?? "—"}</td>
              <td>{latestTx.timestamp ? new Date(latestTx.timestamp).toLocaleString() : "—"}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading latest transaction...</p>
      )}
    </div>
  );
};

export default TransactionTracker;
