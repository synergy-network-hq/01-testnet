import React, { useEffect, useState } from "react";
import { fetchLatestBlocks, fetchLatestTransactions } from "../api";
import "./RealTimeData.css";

const RealTimeData: React.FC = () => {
  const [lastBlockHash, setLastBlockHash] = useState<string>("—");
  const [lastTxHash, setLastTxHash] = useState<string>("—");

  useEffect(() => {
    const poll = async () => {
      const blocks = await fetchLatestBlocks();
      const txs = await fetchLatestTransactions();

      const blockHash = blocks?.[0]?.hash ?? "—";
      const txHash = txs?.[0]?.sender
        ? `${txs[0].sender?.slice(0, 6)}... → ${txs[0].receiver?.slice(0, 6)}`
        : "—";

      setLastBlockHash(blockHash);
      setLastTxHash(txHash);
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="realtime-data">
      <h2>Chain Activity</h2>
      <p><strong>Last Block Hash:</strong> {lastBlockHash}</p>
      <p><strong>Last TX:</strong> {lastTxHash}</p>
    </div>
  );
};

export default RealTimeData;
