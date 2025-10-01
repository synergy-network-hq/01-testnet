import React, { useEffect, useState } from "react";
import { fetchLatestBlocks } from "../api";
import "../styles/BlocksTable.css";

type Block = {
    block_index: number | null;
    hash: string | null;
    timestamp: string | null;
};

const BlocksTable: React.FC = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchLatestBlocks();
            setBlocks(data);
        };
        load();
    }, []);

    return (
        <div className="blocks-table">
            <h2>Recent Blocks</h2>
            <table>
                <thead>
                    <tr>
                        <th>Block #</th>
                        <th>Hash</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {blocks.map((block, idx) => (
                        <tr key={idx}>
                            <td>{block.block_index ?? "—"}</td>
                            <td className="truncate">{block.hash?.slice(0, 16) ?? "—"}</td>
                            <td>{block.timestamp ? new Date(block.timestamp).toLocaleString() : "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BlocksTable;
