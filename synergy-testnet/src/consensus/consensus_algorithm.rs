use std::collections::HashMap;
use std::sync::Arc;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use sha3::{Sha3_256, Digest};
use crate::block::{Block, BlockChain};
use crate::rpc::rpc_server::TX_POOL;
use crate::validator::{ValidatorManager, Validator, ValidatorPerformanceUpdate};
use crate::token::TOKEN_MANAGER;
use crate::wallet::WALLET_MANAGER;

const CHAIN_PATH: &str = "data/chain.json";
const VALIDATOR_REGISTRY_PATH: &str = "data/validator_registry.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynergyScores {
    pub scores: HashMap<String, f64>,
    pub last_updated: u64,
}

#[derive(Debug)]
pub struct ProofOfSynergy {
    pub chain: BlockChain,
    pub validator_manager: Arc<ValidatorManager>,
    pub synergy_scores: SynergyScores,
    pub block_time: u64,
    pub epoch_length: u64,
    pub cluster_size: usize,
    pub vrf_enabled: bool,
    pub vrf_seed_interval: u64,
    pub max_synergy_points: u64,
    pub reward_weights: RewardWeights,
}

#[derive(Debug, Clone)]
pub struct RewardWeights {
    pub task_accuracy: f64,
    pub uptime: f64,
    pub collaboration: f64,
}

impl ProofOfSynergy {
    pub fn new() -> Self {
        let chain = BlockChain::load_from_file(CHAIN_PATH).unwrap_or_else(|| {
            println!("🧱 No chain found on disk — initializing new chain.");
            let mut new_chain = BlockChain::new();
            new_chain.genesis();
            new_chain.save_to_file(CHAIN_PATH);
            new_chain
        });

        // Initialize validator manager
        let validator_manager = Arc::new(ValidatorManager::new());

        // Load validator registry from file or initialize genesis validators
        if let Err(e) = validator_manager.load_registry(VALIDATOR_REGISTRY_PATH) {
            println!("🔧 No validator registry found — initializing with genesis validators: {}", e);
            Self::initialize_genesis_validators(&validator_manager);
        }

        let synergy_scores = Self::load_synergy_scores().unwrap_or_else(|| {
            println!("🔧 No synergy scores found — initializing empty scores.");
            SynergyScores {
                scores: HashMap::new(),
                last_updated: Self::current_timestamp(),
            }
        });

        // Load configuration from genesis.json parameters
        let block_time = 5;
        let epoch_length = 30000;
        let cluster_size = 7;
        let vrf_enabled = true;
        let vrf_seed_interval = 1000;
        let max_synergy_points = 100;

        let reward_weights = RewardWeights {
            task_accuracy: 0.5,
            uptime: 0.3,
            collaboration: 0.2,
        };

        ProofOfSynergy {
            chain,
            validator_manager,
            synergy_scores,
            block_time,
            epoch_length,
            cluster_size,
            vrf_enabled,
            vrf_seed_interval,
            max_synergy_points,
            reward_weights,
        }
    }

    pub fn initialize(&mut self) {
        let active_validators = self.validator_manager.get_active_validators();
        println!("🔧 Chain loaded. Latest height: {}", self.chain.last().map_or(0, |b| b.block_index));
        println!("🔧 Validator registry loaded. Active validators: {}", active_validators.len());
        println!("🔧 Synergy scores loaded. Total entries: {}", self.synergy_scores.scores.len());
    }

    pub fn execute(&mut self) {
        println!("⚙️ Executing Proof of Synergy consensus engine...");

        let mut chain = self.chain.clone();
        let validator_manager = Arc::clone(&self.validator_manager);
        let mut synergy_scores = self.synergy_scores.clone();

        thread::spawn(move || {
            let mut last_block_time = SystemTime::now();
            let mut consecutive_failures = 0;

            loop {
                let current_time = SystemTime::now();
                let elapsed = current_time.duration_since(last_block_time).unwrap_or_default();

                if elapsed >= Duration::from_secs(5) {
                    let mut pool = TX_POOL.lock().unwrap();

                    if let Some(latest_block) = chain.last() {
                        // Get active validators
                        let active_validators = validator_manager.get_active_validators();

                        if active_validators.is_empty() {
                            println!("⏳ No active validators available for block production.");
                            thread::sleep(Duration::from_secs(1));
                            continue;
                        }

                        // Select validator using synergy score and VRF
                        let selected_validator = Self::select_validator_for_block(&active_validators, latest_block.block_index);

                        let transactions = if pool.is_empty() {
                            vec![]
                        } else {
                            pool.clone()
                        };

                        let mut processed_transactions = Vec::new();

                        // Process transactions for token operations
                        for tx in &transactions {
                            if let Ok(result) = TOKEN_MANAGER.process_transaction(tx) {
                                println!("✅ Processed transaction: {}", result);
                                processed_transactions.push(tx.clone());

                                // Update wallet nonce
                                if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                                    if let Some(wallet) = wallet_manager.get_wallet_mut(&tx.sender) {
                                        wallet.increment_nonce();
                                    }
                                }
                            } else {
                                println!("❌ Failed to process transaction from {}: {}", tx.sender, result.unwrap_err());
                            }
                        }

                        let new_block = Block::new(
                            latest_block.block_index + 1,
                            processed_transactions,
                            latest_block.hash.clone(),
                            selected_validator.address.clone(),
                            Self::calculate_nonce(&latest_block.hash, &selected_validator.address),
                        );

                        // Update validator performance
                        let performance_update = ValidatorPerformanceUpdate {
                            validator_address: selected_validator.address.clone(),
                            update_type: "block_produced".to_string(),
                            value: None,
                            timestamp: Self::current_timestamp(),
                        };
                        validator_manager.update_performance(performance_update.clone());

                        // Distribute validator rewards in SNRG
                        let token_manager = TOKEN_MANAGER.clone();
                        let _ = token_manager.distribute_validator_rewards(&selected_validator.address, 1000 * 10u64.pow(18)); // 1000 SNRG reward

                        // Update synergy scores
                        Self::distribute_rewards(&mut synergy_scores, &selected_validator.address, &validator_manager);

                        chain.add_block(new_block.clone());
                        chain.save_to_file(CHAIN_PATH);

                        // Save validator registry
                        if let Err(e) = validator_manager.save_registry(VALIDATOR_REGISTRY_PATH) {
                            println!("⚠️ Failed to save validator registry: {}", e);
                        }

                        if !pool.is_empty() {
                            pool.clear();
                        }

                        last_block_time = current_time;
                        consecutive_failures = 0;

                        println!("🧱 New Block Mined!");
                        println!("   Block Height: {}", new_block.block_index);
                        println!("   Validator: {}", selected_validator.address);
                        println!("   Validator Name: {}", selected_validator.name);
                        println!("   Synergy Score: {:.2}", selected_validator.synergy_score);
                        println!("   Tx Count: {}", new_block.transactions.len());
                        println!("   Block Hash: {}", new_block.hash);
                    } else {
                        consecutive_failures += 1;
                        if consecutive_failures > 10 {
                            println!("⚠️ No genesis block found. Please check blockchain initialization.");
                            thread::sleep(Duration::from_secs(5));
                        }
                    }
                }

                thread::sleep(Duration::from_millis(100));
            }
        });
    }

    fn initialize_genesis_validators(validator_manager: &Arc<ValidatorManager>) {
        // Load genesis validators from genesis.json
        if let Ok(genesis_content) = std::fs::read_to_string("config/genesis.json") {
            if let Ok(genesis) = serde_json::from_str::<serde_json::Value>(&genesis_content) {
                if let Some(validator_array) = genesis["validators"]["initialValidators"].as_array() {
                    for validator_data in validator_array {
                        if let (Some(address), Some(pubkey)) = (
                            validator_data["address"].as_str(),
                            validator_data["pubKey"].as_str()
                        ) {
                            let stake_amount = validator_data["weight"].as_u64().unwrap_or(1000);

                            let registration = crate::validator::ValidatorRegistration {
                                address: address.to_string(),
                                public_key: pubkey.to_string(),
                                name: format!("Genesis Validator {}", address),
                                stake_amount,
                                submitted_at: Self::current_timestamp(),
                                registration_tx_hash: "genesis".to_string(),
                            };

                            if let Err(e) = validator_manager.register_validator(registration) {
                                println!("⚠️ Failed to register genesis validator {}: {}", address, e);
                            } else {
                                // Auto-approve genesis validators
                                if let Err(e) = validator_manager.approve_validator(address) {
                                    println!("⚠️ Failed to approve genesis validator {}: {}", address, e);
                                } else {
                                    println!("✅ Genesis validator {} registered and approved", address);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    fn load_synergy_scores() -> Option<SynergyScores> {
        let scores_path = "data/synergy_scores.json";
        if std::path::Path::new(scores_path).exists() {
            if let Ok(contents) = std::fs::read_to_string(scores_path) {
                if let Ok(scores) = serde_json::from_str::<SynergyScores>(&contents) {
                    return Some(scores);
                }
            }
        }
        None
    }

    fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn select_validator_for_block(validators: &[Validator], block_height: u64) -> Validator {
        if validators.is_empty() {
            // Fallback genesis validator
            return Validator::new(
                "sYnQ1genesis11111111111111111111111111111".to_string(),
                "genesis_key".to_string(),
                "Genesis Validator".to_string(),
                1000,
            );
        }

        // Select validator based on synergy score and block height
        // Use block height as a simple entropy source for now
        // In production, this would use VRF with proper randomness
        let total_score: f64 = validators.iter().map(|v| v.synergy_score).sum();
        let mut cumulative_weight = 0.0;

        let random_value = (block_height % 1000) as f64 / 1000.0; // Simple pseudo-random
        let target = random_value * total_score;

        for validator in validators {
            cumulative_weight += validator.synergy_score;
            if cumulative_weight >= target {
                return validator.clone();
            }
        }

        // Fallback to first validator
        validators[0].clone()
    }

    fn calculate_nonce(previous_hash: &str, validator: &str) -> u64 {
        let mut hasher = Sha3_256::new();
        hasher.update(previous_hash.as_bytes());
        hasher.update(validator.as_bytes());
        let result = hasher.finalize();
        u64::from_be_bytes(result[..8].try_into().unwrap())
    }

    fn distribute_rewards(synergy_scores: &mut SynergyScores, validator_address: &str, validator_manager: &Arc<ValidatorManager>) {
        if let Some(validator) = validator_manager.get_validator(validator_address) {
            let reward = Self::calculate_reward(&validator);
            let current_score = synergy_scores.scores.get(validator_address).unwrap_or(&0.0);
            let new_score = (current_score + reward).min(100.0);
            synergy_scores.scores.insert(validator_address.to_string(), new_score);

            // Save synergy scores
            synergy_scores.last_updated = Self::current_timestamp();
            Self::save_synergy_scores(synergy_scores);
        }
    }

    fn calculate_reward(validator: &Validator) -> f64 {
        let task_reward = validator.task_accuracy * 0.5;
        let uptime_reward = validator.uptime_percentage * 0.3;
        let collaboration_reward = validator.collaboration_score * 0.2;

        task_reward + uptime_reward + collaboration_reward
    }

    fn save_synergy_scores(scores: &SynergyScores) {
        let scores_path = "data/synergy_scores.json";
        if let Ok(json) = serde_json::to_string_pretty(scores) {
            let _ = std::fs::create_dir_all("data");
            let _ = std::fs::write(scores_path, json);
        }
    }
}
