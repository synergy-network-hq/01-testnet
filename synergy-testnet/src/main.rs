
use synergy_testnet::consensus::consensus_algorithm::ProofOfSynergy;
use synergy_testnet::rpc;
use synergy_testnet::logging::{LogLevel, init_logger};
use synergy_testnet::{info, logging};
use synergy_testnet::config::load_node_config;
// use synergy_testnet::p2p; // Temporarily disabled
use synergy_testnet::block::BlockChain;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: synergy-testnet <subcommand>");
        process::exit(1);
    }

    let subcommand = &args[1];

    match subcommand.as_str() {
        "init" => {
            let config_dir = PathBuf::from("config");
            if !config_dir.exists() {
                fs::create_dir_all(&config_dir).expect("Failed to create config directory");
                println!("Created config directory.");
            } else {
                println!("Config directory already exists.");
            }
        }

        "start" => {
            // Load configuration
            let config = match load_node_config(None) {
                Ok(config) => config,
                Err(e) => {
                    eprintln!("Failed to load configuration: {}", e);
                    process::exit(1);
                }
            };

            // Initialize logger
            let log_level = LogLevel::from_str(&config.logging.log_level).unwrap_or(LogLevel::Info);
            init_logger(
                log_level,
                config.logging.enable_console,
                config.logging.log_file.clone(),
                config.logging.max_file_size,
                config.logging.max_files,
            );

            info!("main", "Synergy Testnet Node Starting...");
            info!("main", "Configuration loaded successfully", "network" => config.network.name.clone(), "consensus" => config.consensus.algorithm.clone());

            // Create data directories
            std::fs::create_dir_all("data").expect("Failed to create data directory");
            std::fs::create_dir_all("data/logs").expect("Failed to create logs directory");
            std::fs::create_dir_all("data/chain").expect("Failed to create chain directory");

            info!("main", "Starting the node...");

            // Start RPC server in a separate thread
            let rpc_handle = std::thread::spawn(|| {
                rpc::rpc_server::start_rpc_server();
            });

            // Node initialized with core systems
            info!("main", "Node initialized with RPC and consensus systems", "rpc_port" => config.rpc.http_port, "consensus" => config.consensus.algorithm.clone());

            let mut consensus = ProofOfSynergy::new();
            consensus.initialize();
            consensus.execute();

            info!("main", "Node shutdown gracefully");

            // Keep the main thread alive after consensus by joining the RPC thread
            rpc_handle.join().unwrap();
        }

        "status" => {
            // Load configuration
            let config = match load_node_config(None) {
                Ok(config) => config,
                Err(e) => {
                    eprintln!("Failed to load configuration: {}", e);
                    process::exit(1);
                }
            };

            // Initialize logger
            let log_level = LogLevel::from_str(&config.logging.log_level).unwrap_or(LogLevel::Info);
            init_logger(
                log_level,
                config.logging.enable_console,
                config.logging.log_file.clone(),
                config.logging.max_file_size,
                config.logging.max_files,
            );

            info!("main", "Node status: Online");
        }

        _ => {
            eprintln!("Unknown subcommand: {}", subcommand);
            process::exit(1);
        }
    }
}
