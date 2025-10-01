use serde::{Deserialize, Serialize};
use crate::transaction::Transaction;
use std::fs::{File};
use std::io::{Write, Read};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub block_index: u64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub validator_id: String,
    pub nonce: u64,
    pub hash: String,
}

impl Block {
    pub fn new(
        block_index: u64,
        transactions: Vec<Transaction>,
        previous_hash: String,
        validator_id: String,
        nonce: u64,
    ) -> Self {
        let data = format!("{:?}{:?}{}{}{}", block_index, transactions, previous_hash, validator_id, nonce);
        let hash = blake3::hash(data.as_bytes()).to_hex().to_string();
        Block {
            block_index,
            transactions,
            previous_hash,
            validator_id,
            nonce,
            hash,
        }
    }

    pub fn validate(&self) -> bool {
        true
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockChain {
    pub chain: Vec<Block>,
}

impl BlockChain {
    pub fn new() -> Self {
        BlockChain { chain: vec![] }
    }

    pub fn add_block(&mut self, block: Block) {
        self.chain.push(block);
    }

    pub fn last(&self) -> Option<&Block> {
        self.chain.last()
    }

    pub fn genesis(&mut self) {
        let genesis_block = Block::new(
            0,
            vec![],
            "0".to_string(),
            "genesis".to_string(),
            0,
        );
        self.chain.push(genesis_block);
    }

    pub fn save_to_file(&self, path: &str) {
        if let Ok(json) = serde_json::to_string_pretty(&self.chain) {
            if let Ok(mut file) = File::create(path) {
                let _ = file.write_all(json.as_bytes());
            }
        }
    }

    pub fn load_from_file(path: &str) -> Option<Self> {
        if Path::new(path).exists() {
            if let Ok(mut file) = File::open(path) {
                let mut contents = String::new();
                if file.read_to_string(&mut contents).is_ok() {
                    if let Ok(blocks) = serde_json::from_str::<Vec<Block>>(&contents) {
                        return Some(BlockChain { chain: blocks });
                    }
                }
            }
        }
        None
    }
}
