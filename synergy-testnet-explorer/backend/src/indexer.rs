use reqwest::Client;
use serde_json::json;
use sqlx::SqlitePool;
use tokio::time::{interval, Duration};
use time::OffsetDateTime;

/// Starts the block indexer task
pub async fn start_indexer(pool: SqlitePool) {
    let client = Client::new();
    let mut poll = interval(Duration::from_secs(10));

    loop {
        poll.tick().await;

        match fetch_latest_block(&client).await {
            Ok(block_number) => {
                match fetch_block_data(&client, block_number).await {
                    Ok(Some((hash, timestamp))) => {
                        let _ = sqlx::query!(
                            r#"
                            INSERT OR IGNORE INTO blocks (block_index, hash, previous_hash, validator_id, nonce, timestamp)
                            VALUES (?, ?, NULL, NULL, NULL, ?)
                            "#,
                            block_number as i64,
                            hash,
                            timestamp
                        )
                        .execute(&pool)
                        .await;

                        println!("✅ Indexed block #{} – {}", block_number, hash);
                    }
                    Ok(None) => eprintln!("⚠️ Block returned no data"),
                    Err(err) => eprintln!("❌ Failed to fetch block data: {err}"),
                }
            }
            Err(err) => eprintln!("❌ Failed to fetch block number: {err}"),
        }
    }
}

/// Fetches the latest block number from Synergy Testnet RPC
async fn fetch_latest_block(client: &Client) -> Result<u64, reqwest::Error> {
    let res: serde_json::Value = client
        .post("https://rpc.testnet.synergy-network.io")
        .json(&json!({
            "jsonrpc": "2.0",
            "method": "eth_blockNumber",
            "params": [],
            "id": 1
        }))
        .send()
        .await?
        .json()
        .await?;

    let hex_block = res["result"].as_str().unwrap_or("0x0");
    u64::from_str_radix(hex_block.trim_start_matches("0x"), 16)
        .map_err(|_| reqwest::Error::new(reqwest::StatusCode::INTERNAL_SERVER_ERROR, "Invalid block number format"))
}

/// Fetches block details for a specific block number
async fn fetch_block_data(client: &Client, number: u64) -> Result<Option<(String, OffsetDateTime)>, reqwest::Error> {
    let res: serde_json::Value = client
        .post("https://rpc.testnet.synergy-network.io")
        .json(&json!({
            "jsonrpc": "2.0",
            "method": "eth_getBlockByNumber",
            "params": [format!("0x{:x}", number), false],
            "id": 1
        }))
        .send()
        .await?
        .json()
        .await?;

    let block = res["result"].as_object();
    if let Some(block) = block {
        let hash = block["hash"].as_str().unwrap_or("").to_string();
        let timestamp_hex = block["timestamp"].as_str().unwrap_or("0x0");
        let timestamp_int = u64::from_str_radix(timestamp_hex.trim_start_matches("0x"), 16).unwrap_or(0);
        let datetime = OffsetDateTime::from_unix_timestamp(timestamp_int as i64).unwrap_or_else(|_| OffsetDateTime::now_utc());
        Ok(Some((hash, datetime)))
    } else {
        Ok(None)
    }
}
