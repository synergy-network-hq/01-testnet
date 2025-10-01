use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// Define your Block and Transaction structs here without Diesel derives
// Example:
#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct Block {
    pub block_index: i64,
    pub hash: String,
    pub previous_hash: Option<String>,
    pub validator: Option<String>,
    pub signature: Option<String>,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct Transaction {
    pub id: i64,
    pub block_index: i64,
    pub sender: String,
    pub receiver: String,
    pub amount: f64,
    pub timestamp: String,
}
