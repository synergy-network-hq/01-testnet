use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use sha3::{Sha3_256, Digest};
use hex;
use crate::transaction::Transaction;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub address: String,
    pub public_key: String,
    pub private_key: Option<String>, // Only stored for testing, never in production
    pub balance: HashMap<String, u64>, // token_symbol -> balance
    pub staked_balance: HashMap<String, u64>, // token_symbol -> staked amount
    pub nonce: u64,
    pub created_at: u64,
}

#[derive(Debug, Clone)]
pub struct WalletManager {
    wallets: HashMap<String, Wallet>,
    keypairs: HashMap<String, (String, String)>, // address -> (public_key, private_key)
}

impl Wallet {
    pub fn new(address: String, public_key: String) -> Self {
        Wallet {
            address,
            public_key,
            private_key: None,
            balance: HashMap::new(),
            staked_balance: HashMap::new(),
            nonce: 0,
            created_at: Self::current_timestamp(),
        }
    }

    pub fn with_private_key(address: String, public_key: String, private_key: String) -> Self {
        let mut wallet = Self::new(address, public_key);
        wallet.private_key = Some(private_key);
        wallet
    }

    pub fn update_balance(&mut self, token_symbol: String, amount: u64) {
        *self.balance.entry(token_symbol).or_insert(0) = amount;
    }

    pub fn get_balance(&self, token_symbol: &str) -> u64 {
        self.balance.get(token_symbol).copied().unwrap_or(0)
    }

    pub fn increment_nonce(&mut self) {
        self.nonce += 1;
    }

    fn current_timestamp() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }
}

impl WalletManager {
    pub fn new() -> Self {
        WalletManager {
            wallets: HashMap::new(),
            keypairs: HashMap::new(),
        }
    }

    pub fn generate_keypair() -> (String, String, String) {
        // Generate a deterministic keypair for testing
        // In production, this would use proper cryptographic key generation
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let private_key_seed = format!("synergy_private_key_{}", timestamp);
        let public_key_seed = format!("synergy_public_key_{}", timestamp);

        let private_key = hex::encode(private_key_seed.as_bytes());
        let public_key = hex::encode(public_key_seed.as_bytes());
        let address = Self::generate_address(&public_key);

        (address, public_key, private_key)
    }

    pub fn generate_address(public_key: &str) -> String {
        // Generate Bech32m address from public key
        let mut hasher = Sha3_256::new();
        hasher.update(public_key.as_bytes());
        let hash = hasher.finalize();

        // Use first 20 bytes of hash for address (like Ethereum)
        let address_bytes = &hash[..20];

        // Convert to Bech32m format with "sYn" prefix
        let address_hex = hex::encode(address_bytes);
        format!("sYn{}", &address_hex[..38]) // 38 chars to make 41 total with prefix
    }

    pub fn create_wallet(&mut self) -> String {
        let (address, public_key, private_key) = Self::generate_keypair();

        let wallet = Wallet::with_private_key(
            address.clone(),
            public_key,
            private_key,
        );

        self.wallets.insert(address.clone(), wallet);
        self.keypairs.insert(address.clone(), (public_key, private_key));

        address
    }

    pub fn create_wallet_from_keypair(&mut self, public_key: String, private_key: String) -> String {
        let address = Self::generate_address(&public_key);

        let wallet = Wallet::with_private_key(
            address.clone(),
            public_key,
            private_key,
        );

        self.wallets.insert(address.clone(), wallet);
        self.keypairs.insert(address.clone(), (public_key, private_key));

        address
    }

    pub fn get_wallet(&self, address: &str) -> Option<&Wallet> {
        self.wallets.get(address)
    }

    pub fn get_wallet_mut(&mut self, address: &str) -> Option<&mut Wallet> {
        self.wallets.get_mut(address)
    }

    pub fn sign_transaction(&self, address: &str, tx: &mut Transaction) -> Result<String, String> {
        if let Some(keypair) = self.keypairs.get(address) {
            let (_, private_key) = keypair;

            // Create signature using private key
            // In production, this would use proper ECDSA or Dilithium signatures
            let message = tx.hash();
            let signature = Self::sign_message(&message, private_key);

            tx.signature = signature;
            tx.sender = address.to_string();

            Ok("Transaction signed successfully".to_string())
        } else {
            Err("Wallet not found or no private key available".to_string())
        }
    }

    pub fn verify_signature(&self, tx: &Transaction) -> bool {
        if let Some(keypair) = self.keypairs.get(&tx.sender) {
            let (public_key, _) = keypair;
            let message = tx.hash();
            Self::verify_message(&message, &tx.signature, public_key)
        } else {
            false
        }
    }

    pub fn send_tokens(
        &mut self,
        from: &str,
        to: &str,
        token_symbol: &str,
        amount: u64,
        token_manager: &crate::token::TokenManager,
    ) -> Result<Transaction, String> {
        // Check balance
        let balance = token_manager.get_balance(from, token_symbol);
        if balance < amount {
            return Err("Insufficient balance".to_string());
        }

        // Create transaction
        let mut tx = Transaction::new(
            from.to_string(),
            to.to_string(),
            amount,
            self.get_wallet(from).map_or(0, |w| w.nonce),
            "".to_string(), // signature will be added
            1000, // gas_price
            21000, // gas_limit
            Some(format!("token_transfer:{{\"to\":\"{}\",\"token\":\"{}\",\"amount\":{}}}", to, token_symbol, amount)),
        );

        // Sign transaction
        self.sign_transaction(from, &mut tx)?;

        // Update nonce
        if let Some(wallet) = self.wallets.get_mut(from) {
            wallet.increment_nonce();
        }

        Ok(tx)
    }

    pub fn stake_tokens(
        &mut self,
        staker: &str,
        validator: &str,
        token_symbol: &str,
        amount: u64,
        token_manager: &crate::token::TokenManager,
    ) -> Result<Transaction, String> {
        // Check balance
        let balance = token_manager.get_balance(staker, token_symbol);
        if balance < amount {
            return Err("Insufficient balance for staking".to_string());
        }

        // Create staking transaction
        let mut tx = Transaction::new(
            staker.to_string(),
            validator.to_string(),
            amount,
            self.get_wallet(staker).map_or(0, |w| w.nonce),
            "".to_string(),
            1000,
            21000,
            Some(format!("stake:{{\"validator\":\"{}\",\"token\":\"{}\",\"amount\":{}}}", validator, token_symbol, amount)),
        );

        // Sign transaction
        self.sign_transaction(staker, &mut tx)?;

        // Update nonce
        if let Some(wallet) = self.wallets.get_mut(staker) {
            wallet.increment_nonce();
        }

        Ok(tx)
    }

    pub fn get_all_wallets(&self) -> Vec<&Wallet> {
        self.wallets.values().collect()
    }

    fn sign_message(message: &str, private_key: &str) -> String {
        // Simple signature for testing - in production use proper crypto
        let mut hasher = Sha3_256::new();
        hasher.update(message.as_bytes());
        hasher.update(private_key.as_bytes());
        hex::encode(hasher.finalize())
    }

    fn verify_message(message: &str, signature: &str, public_key: &str) -> bool {
        // Simple verification for testing - in production use proper crypto
        let expected_signature = Self::sign_message(message, &format!("priv_{}", public_key));
        signature == expected_signature
    }
}

// Global wallet manager instance
lazy_static::lazy_static! {
    pub static ref WALLET_MANAGER: std::sync::Mutex<WalletManager> = std::sync::Mutex::new(WalletManager::new());
}

