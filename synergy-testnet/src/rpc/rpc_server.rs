use std::net::TcpListener;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::transaction::Transaction;
use crate::block::BlockChain;
use crate::validator::ValidatorManager;
use crate::token::TOKEN_MANAGER;
use crate::wallet::{WALLET_MANAGER, WalletManager};
use crate::aivm::AIVMRuntime;
use lazy_static::lazy_static;
use serde_json::{Value, json};

lazy_static! {
    pub static ref TX_POOL: Arc<Mutex<Vec<Transaction>>> = Arc::new(Mutex::new(Vec::new()));
}

lazy_static! {
    pub static ref CHAIN: Arc<Mutex<BlockChain>> = Arc::new(Mutex::new(BlockChain::new()));
}

lazy_static! {
    pub static ref VALIDATOR_MANAGER: Arc<ValidatorManager> = Arc::new(ValidatorManager::new());
}

lazy_static! {
    pub static ref AIVM_RUNTIME: Arc<AIVMRuntime> = Arc::new(AIVMRuntime::new());
}

pub fn start_rpc_server() {
    println!("📡 RPC server running on 0.0.0.0:8545");

    for stream in TcpListener::bind("0.0.0.0:8545").expect("Failed to bind RPC server").incoming() {
        let tx_pool = Arc::clone(&TX_POOL);
        let chain = Arc::clone(&CHAIN);
        let validator_manager = Arc::clone(&VALIDATOR_MANAGER);
        let aivm_runtime = Arc::clone(&AIVM_RUNTIME);

        thread::spawn(move || {
            if let Ok(mut stream) = stream {
                let mut buffer = [0; 16384];
                if let Ok(bytes_read) = stream.read(&mut buffer) {
                    let request_str = String::from_utf8_lossy(&buffer[..bytes_read]);

                    // Split headers and body
                    let parts: Vec<&str> = request_str.split("\r\n\r\n").collect();
                    if parts.len() < 2 {
                        send_error(&mut stream, "Malformed HTTP request");
                        return;
                    }

                    let body = parts[1];

                    if request_str.starts_with("POST") {
                        match serde_json::from_str::<Value>(body) {
                            Ok(parsed) => {
                                let method = parsed.get("method").and_then(|m| m.as_str()).unwrap_or("");
                                let params = parsed.get("params").cloned().unwrap_or(json!([]));
                                let id = parsed.get("id").cloned().unwrap_or(json!(null));

                                let result = handle_json_rpc(method, params, &tx_pool, &chain, &validator_manager, &aivm_runtime);

                                let response = json!({
                                    "jsonrpc": "2.0",
                                    "id": id,
                                    "result": result
                                });

                                let response_str = format_response(&response.to_string());
                                let _ = stream.write(response_str.as_bytes());
                            }
                            Err(_) => send_error(&mut stream, "Malformed JSON in body"),
                        }
                    }
                }
            }
        });
    }
}

fn handle_json_rpc(
    method: &str,
    params: Value,
    tx_pool: &Arc<Mutex<Vec<Transaction>>>,
    chain: &Arc<Mutex<BlockChain>>,
    validator_manager: &Arc<ValidatorManager>,
    aivm_runtime: &Arc<AIVMRuntime>,
) -> Value {
    match method {
        // Blockchain queries
        "synergy_blockNumber" => {
            let chain = chain.lock().unwrap();
            json!(chain.last().map_or(0, |b| b.block_index))
        }

        "synergy_getBlockByNumber" => {
            if let Some(block_num) = params.get(0).and_then(|v| v.as_u64()) {
                let chain = chain.lock().unwrap();
                if let Some(block) = chain.chain.iter().find(|b| b.block_index == block_num) {
                    json!(block)
                } else {
                    json!(null)
                }
            } else {
                json!("Invalid block number")
            }
        }

        "synergy_getLatestBlock" => {
            let chain = chain.lock().unwrap();
            if let Some(block) = chain.last() {
                json!(block)
            } else {
                json!(null)
            }
        }

        // Transaction methods
        "synergy_sendTransaction" => {
            if let Some(tx_data) = params.get(0) {
                match serde_json::from_value::<Transaction>(tx_data.clone()) {
                    Ok(tx) => {
                        match tx.validate() {
                            crate::transaction::TransactionValidationResult { is_valid: true, .. } => {
                                let mut pool = tx_pool.lock().unwrap();
                                pool.push(tx);
                                json!("Transaction submitted successfully")
                            }
                            crate::transaction::TransactionValidationResult { error_message: Some(msg), .. } => {
                                json!({"error": msg})
                            }
                            _ => {
                                json!("Invalid transaction")
                            }
                        }
                    }
                    Err(_) => json!("Invalid transaction format"),
                }
            } else {
                json!("Missing transaction data")
            }
        }

        "synergy_getTransactionPool" => {
            let pool = tx_pool.lock().unwrap();
            json!(*pool)
        }

        // Node status
        "synergy_nodeInfo" => {
            json!({
                "name": "Synergy Testnet Node",
                "version": "1.0.0",
                "protocolVersion": 1,
                "networkId": 7963749,
                "chainId": 7963749,
                "consensus": "Proof of Synergy",
                "syncing": false,
                "currentBlock": chain.lock().unwrap().last().map_or(0, |b| b.block_index),
                "timestamp": current_timestamp()
            })
        }

        // Validator management
        "synergy_getValidators" => {
            let validators = validator_manager.get_active_validators();
            json!(validators)
        }

        "synergy_getValidator" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                match validator_manager.get_validator(address) {
                    Some(validator) => json!(validator),
                    None => json!(null),
                }
            } else {
                json!("Missing validator address")
            }
        }

        // Token methods
        "synergy_getTokenBalance" => {
            if let (Some(address), Some(token)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                json!(token_manager.get_balance(address, token))
            } else {
                json!("Missing address or token symbol")
            }
        }

        "synergy_getTokens" => {
            let token_manager = TOKEN_MANAGER.clone();
            json!(token_manager.get_all_tokens())
        }

        "synergy_createWallet" => {
            if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                let address = wallet_manager.create_wallet();
                json!({"address": address, "message": "Wallet created successfully"})
            } else {
                json!({"error": "Failed to create wallet"})
            }
        }

        "synergy_getWallet" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                if let Ok(wallet_manager) = WALLET_MANAGER.lock() {
                    match wallet_manager.get_wallet(address) {
                        Some(wallet) => json!(wallet),
                        None => json!(null),
                    }
                } else {
                    json!({"error": "Failed to access wallet"})
                }
            } else {
                json!("Missing address")
            }
        }

        "synergy_createWalletFromKeypair" => {
            if let (Some(public_key), Some(private_key)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                    let address = wallet_manager.create_wallet_from_keypair(public_key.to_string(), private_key.to_string());
                    json!({"success": true, "address": address, "message": "Wallet created successfully"})
                } else {
                    json!({"success": false, "error": "Failed to access wallet manager"})
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: public_key, private_key"})
            }
        }

        "synergy_getAllWallets" => {
            if let Ok(wallet_manager) = WALLET_MANAGER.lock() {
                json!(wallet_manager.get_all_wallets())
            } else {
                json!({"error": "Failed to access wallet manager"})
            }
        }

        "synergy_signTransaction" => {
            if let (Some(address), Some(tx_data)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1),
            ) {
                if let Ok(mut transaction) = serde_json::from_value::<Transaction>(tx_data.clone()) {
                    if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                        match wallet_manager.sign_transaction(address, &mut transaction) {
                            Ok(result) => json!({"success": true, "message": result, "transaction": transaction}),
                            Err(error) => json!({"success": false, "error": error}),
                        }
                    } else {
                        json!({"success": false, "error": "Failed to access wallet manager"})
                    }
                } else {
                    json!({"success": false, "error": "Invalid transaction format"})
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: address, transaction"})
            }
        }

        "synergy_sendTokens" => {
            if let (Some(from), Some(to), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                    let token_manager = TOKEN_MANAGER.clone();
                    match wallet_manager.send_tokens(from, to, token_symbol, amount, &token_manager) {
                        Ok(transaction) => json!({"success": true, "transaction": transaction, "message": "Transaction created successfully"}),
                        Err(error) => json!({"success": false, "error": error}),
                    }
                } else {
                    json!({"success": false, "error": "Failed to access wallet manager"})
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: from, to, token_symbol, amount"})
            }
        }

        "synergy_stakeTokens" => {
            if let (Some(staker), Some(validator), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                if let Ok(mut wallet_manager) = WALLET_MANAGER.lock() {
                    let token_manager = TOKEN_MANAGER.clone();
                    match wallet_manager.stake_tokens(staker, validator, token_symbol, amount, &token_manager) {
                        Ok(transaction) => json!({"success": true, "transaction": transaction, "message": "Staking transaction created successfully"}),
                        Err(error) => json!({"success": false, "error": error}),
                    }
                } else {
                    json!({"success": false, "error": "Failed to access wallet manager"})
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: staker, validator, token_symbol, amount"})
            }
        }

        "synergy_stakeTokensDirect" => {
            if let (Some(staker), Some(validator), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.stake_tokens(staker, validator, token_symbol, amount) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: staker, validator, token_symbol, amount"})
            }
        }

        "synergy_unstakeTokens" => {
            if let (Some(staker), Some(validator), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.unstake_tokens(staker, validator, token_symbol, amount) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: staker, validator, token_symbol, amount"})
            }
        }

        "synergy_getStakedBalance" => {
            if let (Some(address), Some(token_symbol)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                json!({"balance": token_manager.get_staked_balance(address, token_symbol)})
            } else {
                json!("Missing address or token_symbol parameter")
            }
        }

        "synergy_getStakingInfo" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                let token_manager = TOKEN_MANAGER.clone();
                json!(token_manager.get_staking_info(address))
            } else {
                json!("Missing address parameter")
            }
        }

        "synergy_registerValidator" => {
            if let (Some(address), Some(public_key), Some(name), Some(stake_amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                let registration = crate::validator::ValidatorRegistration {
                    address: address.to_string(),
                    public_key: public_key.to_string(),
                    name: name.to_string(),
                    stake_amount,
                    submitted_at: current_timestamp(),
                    registration_tx_hash: format!("reg_{}", current_timestamp()),
                };

                match validator_manager.register_validator(registration) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: address, public_key, name, stake_amount"})
            }
        }

        "synergy_approveValidator" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                match validator_manager.approve_validator(address) {
                    Ok(_) => json!({"success": true, "message": "Validator approved successfully"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!("Missing address parameter")
            }
        }

        "synergy_getTopValidators" => {
            let count = params.get(0).and_then(|v| v.as_u64()).unwrap_or(10) as usize;
            json!(validator_manager.get_top_validators(count))
        }

        "synergy_slashValidator" => {
            if let (Some(address), Some(reason)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                match validator_manager.slash_validator(address, reason) {
                    Ok(_) => json!({"success": true, "message": "Validator slashed successfully"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: address, reason"})
            }
        }

        "synergy_getBlockRange" => {
            if let (Some(start), Some(end)) = (
                params.get(0).and_then(|v| v.as_u64()),
                params.get(1).and_then(|v| v.as_u64()),
            ) {
                let chain = chain.lock().unwrap();
                let blocks: Vec<_> = chain.chain.iter()
                    .filter(|block| block.block_index >= start && block.block_index <= end)
                    .collect();

                json!(blocks)
            } else {
                json!("Missing start or end parameter")
            }
        }

        "synergy_getTransactionByHash" => {
            if let Some(tx_hash) = params.get(0).and_then(|v| v.as_str()) {
                let chain = chain.lock().unwrap();
                for block in &chain.chain {
                    for tx in &block.transactions {
                        if tx.hash() == tx_hash {
                            return json!(tx);
                        }
                    }
                }
                json!(null)
            } else {
                json!("Missing transaction hash parameter")
            }
        }

        "synergy_getTransactionsInBlock" => {
            if let Some(block_number) = params.get(0).and_then(|v| v.as_u64()) {
                let chain = chain.lock().unwrap();
                if let Some(block) = chain.chain.iter().find(|b| b.block_index == block_number) {
                    json!(block.transactions.clone())
                } else {
                    json!([])
                }
            } else {
                json!("Missing block number parameter")
            }
        }

        "synergy_getValidatorStats" => {
            let active_validators = validator_manager.get_active_validators();
            let top_validators = validator_manager.get_top_validators(20);

            json!({
                "total_validators": active_validators.len(),
                "active_validators": active_validators,
                "top_validators": top_validators,
                "epoch_rewards": validator_manager.calculate_epoch_rewards(0)
            })
        }

        "synergy_getTokenStats" => {
            let token_manager = TOKEN_MANAGER.clone();
            let tokens = token_manager.get_all_tokens();

            let mut token_stats = Vec::new();
            for token in tokens {
                let total_staked = token_manager.get_staked_balance("*", &token.symbol);
                token_stats.push(json!({
                    "symbol": token.symbol,
                    "name": token.name,
                    "total_supply": token.total_supply,
                    "total_staked": total_staked,
                    "holders": token_manager.balances.lock().unwrap().keys()
                        .filter(|addr| token_manager.get_balance(addr, &token.symbol) > 0)
                        .count()
                }));
            }

            json!(token_stats)
        }

        // AIVM - Artificial Intelligence Virtual Machine Methods
        "synergy_deployAIVMContract" => {
            if let (Some(bytecode), Some(abi), Some(contract_type)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
            ) {
                let bytecode_vec = hex::decode(bytecode).unwrap_or_default();
                let contract_type_enum = match contract_type {
                    "ai" => crate::aivm::ContractType::AIEnhanced,
                    "cross_chain" => crate::aivm::ContractType::CrossChain,
                    "oracle" => crate::aivm::ContractType::Oracle,
                    _ => crate::aivm::ContractType::Standard,
                };

                match aivm_runtime.deploy_contract(
                    bytecode_vec,
                    abi.to_string(),
                    "system".to_string(),
                    contract_type_enum,
                ) {
                    Ok(address) => json!({"success": true, "contract_address": address, "message": "AIVM contract deployed successfully"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: bytecode, abi, contract_type"})
            }
        }

        "synergy_executeAIVMContract" => {
            if let (Some(contract_address), Some(input_data)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                let input_bytes = hex::decode(input_data).unwrap_or_default();
                let context = crate::aivm::AIVMExecutionContext {
                    transaction_hash: "manual_execution".to_string(),
                    block_height: 0,
                    timestamp: current_timestamp(),
                    sender: "manual".to_string(),
                    contract_address: Some(contract_address.to_string()),
                    input_data: input_bytes,
                    gas_limit: 1000000,
                    gas_price: 1000,
                };

                match aivm_runtime.execute_contract(contract_address, context) {
                    Ok(result) => json!({"success": true, "result": result, "message": "AIVM contract executed successfully"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: contract_address, input_data"})
            }
        }

        "synergy_initiateDistributedAI" => {
            if let (Some(model_id), Some(input_data)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
            ) {
                let input_bytes = hex::decode(input_data).unwrap_or_default();
                let cluster_id = params.get(2).and_then(|v| v.as_u64());

                match aivm_runtime.distributed_ai.initiate_distributed_computation(
                    model_id.to_string(),
                    input_bytes,
                    cluster_id,
                ) {
                    Ok(computation_id) => json!({"success": true, "computation_id": computation_id, "message": "Distributed AI computation initiated"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: model_id, input_data"})
            }
        }

        "synergy_getDistributedAIStatus" => {
            if let Some(computation_id) = params.get(0).and_then(|v| v.as_str()) {
                match aivm_runtime.distributed_ai.get_computation_status(computation_id) {
                    Some(status) => json!({"status": format!("{:?}", status), "computation_id": computation_id}),
                    None => json!({"error": "Computation not found"}),
                }
            } else {
                json!("Missing computation_id parameter")
            }
        }

        "synergy_getDistributedAIResult" => {
            if let Some(computation_id) = params.get(0).and_then(|v| v.as_str()) {
                match aivm_runtime.distributed_ai.get_computation_result(computation_id) {
                    Some(result) => json!({"success": true, "result": hex::encode(result), "computation_id": computation_id}),
                    None => json!({"error": "Result not available or computation not completed"}),
                }
            } else {
                json!("Missing computation_id parameter")
            }
        }

        "synergy_submitAIPartialResult" => {
            if let (Some(task_id), Some(validator_address), Some(partial_result)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
            ) {
                let result_bytes = hex::decode(partial_result).unwrap_or_default();

                match aivm_runtime.distributed_ai.submit_partial_result(
                    task_id,
                    validator_address,
                    result_bytes,
                ) {
                    Ok(_) => json!({"success": true, "message": "Partial result submitted successfully"}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: task_id, validator_address, partial_result"})
            }
        }

        "synergy_getValidatorAITasks" => {
            if let Some(validator_address) = params.get(0).and_then(|v| v.as_str()) {
                let tasks = aivm_runtime.distributed_ai.get_pending_tasks_for_validator(validator_address);
                json!(tasks)
            } else {
                json!("Missing validator_address parameter")
            }
        }

        "synergy_getValidatorAIRewards" => {
            if let Some(validator_address) = params.get(0).and_then(|v| v.as_str()) {
                let rewards = aivm_runtime.distributed_ai.get_validator_ai_rewards(validator_address);
                json!({"validator_address": validator_address, "total_rewards": rewards})
            } else {
                json!("Missing validator_address parameter")
            }
        }

        "synergy_getAIDistributedStats" => {
            json!(aivm_runtime.distributed_ai.get_ai_network_stats())
        }

        "synergy_chatWithAIVM" => {
            if let Some(message) = params.get(0).and_then(|v| v.as_str()) {
                let context = crate::aivm::AIVMExecutionContext {
                    transaction_hash: "chat_interaction".to_string(),
                    block_height: 0,
                    timestamp: current_timestamp(),
                    sender: "user".to_string(),
                    contract_address: None,
                    input_data: message.as_bytes().to_vec(),
                    gas_limit: 10000,
                    gas_price: 100,
                };

                // This would need async support in the RPC handler
                json!({"success": true, "message": "Chat functionality requires async support - use direct AIVM runtime calls", "context": context})
            } else {
                json!({"success": false, "error": "Missing message parameter"})
            }
        }

        "synergy_getAIVMContracts" => {
            json!(aivm_runtime.get_all_contracts())
        }

        "synergy_getAIVMContract" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                match aivm_runtime.get_contract(address) {
                    Some(contract) => json!(contract),
                    None => json!(null),
                }
            } else {
                json!("Missing contract address parameter")
            }
        }

        "synergy_getAIVMStats" => {
            let distributed_stats = aivm_runtime.distributed_ai.get_ai_network_stats();
            json!({
                "total_contracts": aivm_runtime.get_all_contracts().len(),
                "supported_features": ["ai_enhanced", "cross_chain", "oracle", "standard", "distributed_ai"],
                "ai_models": ["distributed_ai_model"],
                "supported_chains": ["ethereum", "polygon", "solana"],
                "distributed_computations": distributed_stats.get("total_computations").and_then(|v| v.parse::<u64>().ok()).unwrap_or(0),
                "completed_computations": distributed_stats.get("completed_computations").and_then(|v| v.parse::<u64>().ok()).unwrap_or(0),
                "active_validators": distributed_stats.get("active_validators").unwrap_or(&"0".to_string()).parse::<u64>().unwrap_or(0),
                "total_ai_rewards_distributed": distributed_stats.get("total_ai_rewards_distributed").and_then(|v| v.parse::<u64>().ok()).unwrap_or(0)
            })
        }

        "synergy_getNetworkStats" => {
            let chain = chain.lock().unwrap();
            let token_manager = TOKEN_MANAGER.clone();

            let total_supply = token_manager.get_all_tokens().iter()
                .map(|token| token.total_supply)
                .sum::<u64>();

            json!({
                "block_height": chain.last().map_or(0, |b| b.block_index),
                "total_transactions": chain.chain.iter().map(|b| b.transactions.len()).sum::<usize>(),
                "active_validators": validator_manager.get_active_validators().len(),
                "total_supply": total_supply,
                "tokens": token_manager.get_all_tokens().len(),
                "network_uptime": "99.9%",
                "current_epoch": validator_manager.calculate_epoch_rewards(0).len(),
                "total_staked": token_manager.get_all_tokens().iter().map(|t| t.symbol.clone()).collect::<Vec<_>>()
                    .iter().map(|symbol| token_manager.get_staked_balance("*", symbol)).sum::<u64>()
            })
        }

        // Enhanced Token Operations
        "synergy_createToken" => {
            if let (Some(symbol), Some(name), Some(decimals), Some(total_supply), Some(creator)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_u64()),
                params.get(3).and_then(|v| v.as_u64()),
                params.get(4).and_then(|v| v.as_str()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.create_token(
                    symbol.to_string(),
                    name.to_string(),
                    decimals as u8,
                    total_supply,
                    Some(total_supply * 2), // max_supply = 2x total_supply
                    true, // mintable
                    true, // burnable
                    creator.to_string(),
                ) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: symbol, name, decimals, total_supply, creator"})
            }
        }

        "synergy_mintTokens" => {
            if let (Some(to), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_u64()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.mint_tokens(to, token_symbol, amount) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: to, token_symbol, amount"})
            }
        }

        "synergy_burnTokens" => {
            if let (Some(from), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_u64()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.burn_tokens(from, token_symbol, amount) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: from, token_symbol, amount"})
            }
        }

        "synergy_transferTokens" => {
            if let (Some(from), Some(to), Some(token_symbol), Some(amount)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_str()),
                params.get(2).and_then(|v| v.as_str()),
                params.get(3).and_then(|v| v.as_u64()),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                match token_manager.transfer_tokens(from, to, token_symbol, amount, 1000) {
                    Ok(result) => json!({"success": true, "message": result}),
                    Err(error) => json!({"success": false, "error": error}),
                }
            } else {
                json!({"success": false, "error": "Missing required parameters: from, to, token_symbol, amount"})
            }
        }

        "synergy_getAllBalances" => {
            if let Some(address) = params.get(0).and_then(|v| v.as_str()) {
                let token_manager = TOKEN_MANAGER.clone();
                json!(token_manager.get_all_balances(address))
            } else {
                json!("Missing address parameter")
            }
        }

        "synergy_getTransferHistory" => {
            if let (Some(address), Some(limit)) = (
                params.get(0).and_then(|v| v.as_str()),
                params.get(1).and_then(|v| v.as_u64()).unwrap_or(50),
            ) {
                let token_manager = TOKEN_MANAGER.clone();
                json!(token_manager.get_transfer_history(address, limit as usize))
            } else {
                json!("Missing address parameter")
            }
        }

        // Legacy support
        "synergy_status" => {
            json!("ok")
        }

        _ => {
            json!("Unknown method")
        }
    }
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn format_response(body: &str) -> String {
    format!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        body.len(),
        body
    )
}

fn send_error(stream: &mut std::net::TcpStream, msg: &str) {
    let body = format!("{{\"error\": \"{}\"}}", msg);
    let response = format_response(&body);
    let _ = stream.write(response.as_bytes());
}
