use serde::{Deserialize, Serialize};
use blake3::Hasher;
use bincode::{encode_to_vec, decode_from_slice};
use bincode::config::standard;
use bincode::{Decode, Encode};
use sha3::{Sha3_256, Digest};
use hex;

#[derive(Debug, Clone, Serialize, Deserialize, Encode, Decode)]
pub struct Transaction {
    pub sender: String,
    pub receiver: String,
    pub amount: u64,
    pub nonce: u64,
    pub signature: String,
    pub timestamp: u64,
    pub gas_price: u64,
    pub gas_limit: u64,
    pub data: Option<String>,
}

#[derive(Debug, Clone)]
pub struct TransactionValidationResult {
    pub is_valid: bool,
    pub error_message: Option<String>,
}

impl Transaction {
    pub fn new(
        sender: String,
        receiver: String,
        amount: u64,
        nonce: u64,
        signature: String,
        gas_price: u64,
        gas_limit: u64,
        data: Option<String>,
    ) -> Self {
        Transaction {
            sender,
            receiver,
            amount,
            nonce,
            signature,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            gas_price,
            gas_limit,
            data,
        }
    }

    pub fn hash(&self) -> String {
        let mut hasher = Hasher::new();
        hasher.update(self.sender.as_bytes());
        hasher.update(self.receiver.as_bytes());
        hasher.update(&self.amount.to_le_bytes());
        hasher.update(&self.nonce.to_le_bytes());
        hasher.update(&self.timestamp.to_le_bytes());
        hasher.update(&self.gas_price.to_le_bytes());
        hasher.update(&self.gas_limit.to_le_bytes());

        if let Some(ref data) = self.data {
            hasher.update(data.as_bytes());
        }

        // Note: signature is NOT included in the hash for verification
        hasher.finalize().to_hex().to_string()
    }

    pub fn validate(&self) -> TransactionValidationResult {
        // Basic field validation
        if self.sender.is_empty() {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Sender address cannot be empty".to_string()),
            };
        }

        if self.receiver.is_empty() {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Receiver address cannot be empty".to_string()),
            };
        }

        if self.amount == 0 {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Transaction amount must be greater than 0".to_string()),
            };
        }

        if self.nonce == 0 {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Transaction nonce must be greater than 0".to_string()),
            };
        }

        if self.gas_price == 0 {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Gas price must be greater than 0".to_string()),
            };
        }

        if self.gas_limit == 0 {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Gas limit must be greater than 0".to_string()),
            };
        }

        // Address format validation (Bech32m format)
        if !self.is_valid_address(&self.sender) {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Invalid sender address format".to_string()),
            };
        }

        if !self.is_valid_address(&self.receiver) {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Invalid receiver address format".to_string()),
            };
        }

        // Signature validation
        if !self.verify_signature() {
            return TransactionValidationResult {
                is_valid: false,
                error_message: Some("Invalid transaction signature".to_string()),
            };
        }

        TransactionValidationResult {
            is_valid: true,
            error_message: None,
        }
    }

    pub fn verify_signature(&self) -> bool {
        // For now, we'll implement a basic signature verification
        // In production, this would verify Dilithium-3 signatures

        if self.signature.is_empty() {
            return false;
        }

        // Basic check: signature should be at least 64 characters
        if self.signature.len() < 64 {
            return false;
        }

        // Verify signature against transaction hash
        let message_hash = self.hash();
        let signature_hash = self.generate_signature_hash();

        // This is a simplified verification - in production you'd use proper crypto
        message_hash.starts_with(&signature_hash[..8])
    }

    fn generate_signature_hash(&self) -> String {
        let mut hasher = Sha3_256::new();
        hasher.update(self.sender.as_bytes());
        hasher.update(&self.nonce.to_le_bytes());
        hex::encode(hasher.finalize())
    }

    fn is_valid_address(&self, address: &str) -> bool {
        // Basic Bech32m validation for Synergy addresses
        if address.len() != 41 {
            return false;
        }

        if !address.starts_with("sYn") {
            return false;
        }

        // Check if it contains only valid Bech32m characters
        let valid_chars = "023456789acdefghjklmnpqrstuvwxyz";
        for c in address.chars().skip(3) {
            if !valid_chars.contains(c) {
                return false;
            }
        }

        true
    }

    pub fn calculate_fee(&self) -> u64 {
        self.gas_price * self.gas_limit
    }

    pub fn total_cost(&self) -> u64 {
        self.amount + self.calculate_fee()
    }

    pub fn check_nonce(&self, expected_nonce: u64) -> bool {
        self.nonce == expected_nonce
    }

    pub fn is_expired(&self, current_time: u64, timeout_seconds: u64) -> bool {
        current_time > self.timestamp + timeout_seconds
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap()
    }

    pub fn from_json(data: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(data)
    }

    pub fn to_yaml(&self) -> String {
        serde_yaml::to_string(self).unwrap()
    }

    pub fn from_yaml(data: &str) -> Result<Self, serde_yaml::Error> {
        serde_yaml::from_str(data)
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let config = standard();
        encode_to_vec(self, config).unwrap()
    }

    pub fn from_bytes(data: &[u8]) -> Self {
        let config = standard();
        decode_from_slice(data, config).unwrap().0
    }
}
