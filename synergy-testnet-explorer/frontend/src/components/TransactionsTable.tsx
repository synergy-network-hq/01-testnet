import React, { useEffect, useState } from "react";
import { fetchLatestTransactions } from "../api";
import "../styles/TransactionsTable.css";

type Transaction = {
    block_index: number | null;
    sender: string | null;
    receiver: string | null;
    amount: number | null;
    timestamp: string | null;
};

const TransactionsTable: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchLatestTransactions();
            setTransactions(data);
        };
        load();
    }, []);

    return (
        <div className="transactions-table">
            <h2>Latest Transactions</h2>
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
                    {transactions.map((tx, idx) => (
                        <tr key={idx}>
                            <td>{tx.block_index ?? "—"}</td>
                            <td className="truncate">{tx.sender ?? "—"}</td>
                            <td className="truncate">{tx.receiver ?? "—"}</td>
                            <td>{tx.amount ?? "—"}</td>
                            <td>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;
