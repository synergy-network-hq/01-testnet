use std::env;
use std::fs;
use std::path::Path;
use std::error::Error;
use serde::{Deserialize, Serialize};
use serde_json;
use toml;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct NodeConfig {
    pub network: NetworkConfig,
    pub blockchain: BlockchainConfig,
    pub consensus: ConsensusConfig,
    pub logging: LoggingConfig,
    pub rpc: RPCConfig,
    pub p2p: P2PConfig,
    pub storage: StorageConfig,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct NetworkConfig {
    pub id: u64,
    pub name: String,
    pub p2p_port: u16,
    pub rpc_port: u16,
    pub ws_port: u16,
    pub max_peers: u32,
    pub bootnodes: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BlockchainConfig {
    pub block_time: u64,
    pub max_gas_limit: String,
    pub chain_id: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ConsensusConfig {
    pub algorithm: String,
    pub block_time_secs: u64,
    pub epoch_length: u64,
    pub validator_cluster_size: usize,
    pub max_validators: usize,
    pub synergy_score_decay_rate: f64,
    pub vrf_enabled: bool,
    pub vrf_seed_epoch_interval: u64,
    pub max_synergy_points_per_epoch: u64,
    pub max_tasks_per_validator: u32,
    pub reward_weighting: RewardWeighting,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RewardWeighting {
    pub task_accuracy: f64,
    pub uptime: f64,
    pub collaboration: f64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LoggingConfig {
    pub log_level: String,
    pub log_file: String,
    pub enable_console: bool,
    pub max_file_size: u64,
    pub max_files: u32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RPCConfig {
    pub enable_http: bool,
    pub http_port: u16,
    pub enable_ws: bool,
    pub ws_port: u16,
    pub enable_grpc: bool,
    pub grpc_port: u16,
    pub cors_enabled: bool,
    pub cors_origins: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct P2PConfig {
    pub listen_address: String,
    pub public_address: String,
    pub node_name: String,
    pub enable_discovery: bool,
    pub discovery_port: u16,
    pub heartbeat_interval: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StorageConfig {
    pub database: String,
    pub path: String,
    pub enable_pruning: bool,
    pub pruning_interval: u64,
}

impl Default for NodeConfig {
    fn default() -> Self {
        NodeConfig {
            network: NetworkConfig {
                id: 7963749,
                name: "Synergy Testnet".to_string(),
                p2p_port: 30303,
                rpc_port: 8545,
                ws_port: 8546,
                max_peers: 50,
                bootnodes: vec![
                    "enode://d18491c5a94ef758b6a15478818a1903054c830afdc2cc6b8d04d30d7c8e94b5bcd9c98f33c7ff5a02f7e4c7a5394fc5a4a41d1552d9e43c0e4745a3127c93d4@testnet.synergy.network:30303".to_string(),
                ],
            },
            blockchain: BlockchainConfig {
                block_time: 5,
                max_gas_limit: "0x2fefd8".to_string(),
                chain_id: 7963749,
            },
            consensus: ConsensusConfig {
                algorithm: "Proof of Synergy".to_string(),
                block_time_secs: 5,
                epoch_length: 30000,
                validator_cluster_size: 7,
                max_validators: 21,
                synergy_score_decay_rate: 0.05,
                vrf_enabled: true,
                vrf_seed_epoch_interval: 1000,
                max_synergy_points_per_epoch: 100,
                max_tasks_per_validator: 10,
                reward_weighting: RewardWeighting {
                    task_accuracy: 0.5,
                    uptime: 0.3,
                    collaboration: 0.2,
                },
            },
            logging: LoggingConfig {
                log_level: "info".to_string(),
                log_file: "data/logs/synergy-node.log".to_string(),
                enable_console: true,
                max_file_size: 10485760, // 10MB
                max_files: 5,
            },
            rpc: RPCConfig {
                enable_http: true,
                http_port: 8545,
                enable_ws: true,
                ws_port: 8546,
                enable_grpc: true,
                grpc_port: 50051,
                cors_enabled: true,
                cors_origins: vec!["*".to_string()],
            },
            p2p: P2PConfig {
                listen_address: "0.0.0.0:30303".to_string(),
                public_address: "127.0.0.1:30303".to_string(),
                node_name: "synergy-node-01".to_string(),
                enable_discovery: true,
                discovery_port: 30301,
                heartbeat_interval: 30,
            },
            storage: StorageConfig {
                database: "rocksdb".to_string(),
                path: "data/chain".to_string(),
                enable_pruning: true,
                pruning_interval: 86400, // 24 hours
            },
        }
    }
}

/// Loads the configuration from multiple sources with priority:
/// 1. Environment variables
/// 2. TOML config file
/// 3. Default values
pub fn load_node_config(path: Option<&str>) -> Result<NodeConfig, Box<dyn Error>> {
    let mut config = NodeConfig::default();

    // Load from TOML file if provided
    if let Some(config_path) = path {
        if Path::new(config_path).exists() {
            let content = fs::read_to_string(config_path)?;
            let file_config: NodeConfig = toml::from_str(&content)?;
            config = merge_configs(config, file_config);
        }
    } else if let Ok(config_path) = env::var("SYNERGY_CONFIG_PATH") {
        if Path::new(&config_path).exists() {
            let content = fs::read_to_string(&config_path)?;
            let file_config: NodeConfig = toml::from_str(&content)?;
            config = merge_configs(config, file_config);
        }
    }

    // Override with environment variables
    config = apply_env_overrides(config)?;

    Ok(config)
}

/// Merges two configurations, with the second taking precedence
fn merge_configs(mut base: NodeConfig, override_config: NodeConfig) -> NodeConfig {
    base.network = override_config.network;
    base.blockchain = override_config.blockchain;
    base.consensus = override_config.consensus;
    base.logging = override_config.logging;
    base.rpc = override_config.rpc;
    base.p2p = override_config.p2p;
    base.storage = override_config.storage;
    base
}

/// Applies environment variable overrides
fn apply_env_overrides(mut config: NodeConfig) -> Result<NodeConfig, Box<dyn Error>> {
    // Network overrides
    if let Ok(val) = env::var("SYNERGY_NETWORK_ID") {
        config.network.id = val.parse()?;
    }
    if let Ok(val) = env::var("SYNERGY_P2P_PORT") {
        config.network.p2p_port = val.parse()?;
    }
    if let Ok(val) = env::var("SYNERGY_RPC_PORT") {
        config.network.rpc_port = val.parse()?;
        config.rpc.http_port = val.parse()?;
    }
    if let Ok(val) = env::var("SYNERGY_WS_PORT") {
        config.network.ws_port = val.parse()?;
        config.rpc.ws_port = val.parse()?;
    }
    if let Ok(val) = env::var("SYNERGY_BOOTNODES") {
        config.network.bootnodes = val.split(',').map(|s| s.trim().to_string()).collect();
    }

    // Logging overrides
    if let Ok(val) = env::var("SYNERGY_LOG_LEVEL") {
        config.logging.log_level = val;
    }
    if let Ok(val) = env::var("SYNERGY_LOG_FILE") {
        config.logging.log_file = val;
    }

    // Storage overrides
    if let Ok(val) = env::var("SYNERGY_DATA_PATH") {
        config.storage.path = val;
    }

    Ok(config)
}

/// Loads genesis configuration from genesis.json
pub fn load_genesis_config() -> Result<serde_json::Value, Box<dyn Error>> {
    let genesis_path = "config/genesis.json";
    if !Path::new(genesis_path).exists() {
        return Err(format!("Genesis file not found: {}", genesis_path).into());
    }

    let content = fs::read_to_string(genesis_path)?;
    let genesis: serde_json::Value = serde_json::from_str(&content)?;
    Ok(genesis)
}

/// Saves current configuration to a file
pub fn save_config(config: &NodeConfig, path: &str) -> Result<(), Box<dyn Error>> {
    let content = toml::to_string_pretty(config)?;
    fs::write(path, content)?;
    Ok(())
}
