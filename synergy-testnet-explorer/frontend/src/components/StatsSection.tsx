import React, { useEffect, useState } from "react";
import { fetchLatestBlocks, fetchLatestTransactions } from "../api";
import "../styles/StatsSection.css";

const StatsSection: React.FC = () => {
    const [blockHeight, setBlockHeight] = useState<number | null>(null);
    const [txCount, setTxCount] = useState<number | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            const blocks = await fetchLatestBlocks();
            const txs = await fetchLatestTransactions();

            const latestBlock = blocks?.[0];
            setBlockHeight(latestBlock?.block_index ?? null);
            setTxCount(txs?.length ?? null);
        };

        loadStats();
        const interval = setInterval(loadStats, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="stats-section">
            <h2>Network Stats</h2>
            <ul>
                <li><strong>Block Height:</strong> {blockHeight ?? "Loading..."}</li>
                <li><strong>Recent TX Count:</strong> {txCount ?? "Loading..."}</li>
                <li><strong>Chain:</strong> Synergy Testnet</li>
            </ul>
        </div>
    );
};

export default StatsSection;
