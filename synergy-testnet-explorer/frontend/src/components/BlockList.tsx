import React, { useEffect, useState } from "react";
import { fetchBlocks } from "../api";

const BlockList: React.FC = () => {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBlocks() {
            const data = await fetchBlocks();
            setBlocks(data);
            setLoading(false);
        }
        loadBlocks();
    }, []);

    if (loading) return <p>Loading blocks...</p>;

    return (
        <div>
            <h2>Blockchain Blocks</h2>
            <ul>
                {blocks.map((block) => (
                    <li key={block.id}>
                        <strong>Block #{block.id}</strong> - Hash: {block.hash}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlockList;
