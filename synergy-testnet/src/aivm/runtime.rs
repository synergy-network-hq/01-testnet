use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use tokio::runtime::Runtime;
use hex;
use crate::transaction::Transaction;
use crate::block::Block;
use super::distributed_ai::DistributedAIProtocol;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIVMExecutionContext {
    pub transaction_hash: String,
    pub block_height: u64,
    pub timestamp: u64,
    pub sender: String,
    pub contract_address: Option<String>,
    pub input_data: Vec<u8>,
    pub gas_limit: u64,
    pub gas_price: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIVMExecutionResult {
    pub success: bool,
    pub output: Vec<u8>,
    pub gas_used: u64,
    pub logs: Vec<String>,
    pub return_value: Option<String>,
    pub error_message: Option<String>,
    pub ai_responses: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIVMContract {
    pub address: String,
    pub bytecode: Vec<u8>,
    pub abi: String,
    pub creator: String,
    pub created_at: u64,
    pub contract_type: ContractType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ContractType {
    Standard,
    AIEnhanced,
    CrossChain,
    Oracle,
}

#[derive(Debug)]
pub struct AIVMRuntime {
    contracts: Arc<Mutex<HashMap<String, AIVMContract>>>,
    execution_cache: Arc<Mutex<HashMap<String, AIVMExecutionResult>>>,
    model_registry: Arc<ModelRegistry>,
    chat_interface: Arc<ChatInterface>,
    distributed_ai: Arc<DistributedAIProtocol>,
    runtime: Runtime,
}

impl AIVMRuntime {
    pub fn new() -> Self {
        let runtime = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");

        // Initialize distributed AI protocol
        let consensus_engine = Arc::new(crate::consensus::consensus_algorithm::ProofOfSynergy::new());
        let validator_manager = crate::validator::VALIDATOR_MANAGER.clone();
        let model_registry = Arc::new(ModelRegistry::new());
        let chat_interface = Arc::new(ChatInterface::new());

        let distributed_ai = Arc::new(DistributedAIProtocol::new(
            consensus_engine,
            validator_manager,
            model_registry.clone(),
            chat_interface.clone(),
        ));

        AIVMRuntime {
            contracts: Arc::new(Mutex::new(HashMap::new())),
            execution_cache: Arc::new(Mutex::new(HashMap::new())),
            model_registry,
            chat_interface,
            distributed_ai,
            runtime,
        }
    }

    pub fn deploy_contract(
        &self,
        bytecode: Vec<u8>,
        abi: String,
        creator: String,
        contract_type: ContractType,
    ) -> Result<String, String> {
        let contract_address = self.generate_contract_address(&creator, &bytecode);

        let contract = AIVMContract {
            address: contract_address.clone(),
            bytecode,
            abi,
            creator,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            contract_type,
        };

        if let Ok(mut contracts) = self.contracts.lock() {
            contracts.insert(contract_address.clone(), contract);
            Ok(contract_address)
        } else {
            Err("Failed to acquire contracts lock".to_string())
        }
    }

    pub fn execute_contract(
        &self,
        contract_address: &str,
        context: AIVMExecutionContext,
    ) -> Result<AIVMExecutionResult, String> {
        // Check cache first
        let cache_key = format!("{}:{}", contract_address, context.transaction_hash);
        if let Ok(cache) = self.execution_cache.lock() {
            if let Some(cached_result) = cache.get(&cache_key) {
                return Ok(cached_result.clone());
            }
        }

        // Get contract
        let contract = {
            if let Ok(contracts) = self.contracts.lock() {
                match contracts.get(contract_address) {
                    Some(contract) => contract.clone(),
                    None => return Err(format!("Contract {} not found", contract_address)),
                }
            } else {
                return Err("Failed to acquire contracts lock".to_string());
            }
        };

        // Execute based on contract type
        let result = match contract.contract_type {
            ContractType::AIEnhanced => self.execute_ai_enhanced_contract(&contract, &context)?,
            ContractType::CrossChain => self.execute_cross_chain_contract(&contract, &context)?,
            ContractType::Oracle => self.execute_oracle_contract(&contract, &context)?,
            ContractType::Standard => self.execute_standard_contract(&contract, &context)?,
        };

        // Cache the result
        if let Ok(mut cache) = self.execution_cache.lock() {
            cache.insert(cache_key, result.clone());
        }

        Ok(result)
    }

    fn execute_standard_contract(
        &self,
        contract: &AIVMContract,
        context: &AIVMExecutionContext,
    ) -> Result<AIVMExecutionResult, String> {
        // Standard contract execution logic
        // This would typically involve WASM execution or similar
        Ok(AIVMExecutionResult {
            success: true,
            output: vec![],
            gas_used: 21000,
            logs: vec!["Standard contract executed".to_string()],
            return_value: Some("success".to_string()),
            error_message: None,
            ai_responses: vec![],
        })
    }

    fn execute_ai_enhanced_contract(
        &self,
        contract: &AIVMContract,
        context: &AIVMExecutionContext,
    ) -> Result<AIVMExecutionResult, String> {
        // Use distributed AI computation instead of centralized GPT calls
        let model_id = "distributed_ai_model".to_string(); // Would be derived from contract
        let input_data = context.input_data.clone();

        // Initiate distributed AI computation
        let computation_id = match self.distributed_ai.initiate_distributed_computation(
            model_id,
            input_data,
            None, // Let the system choose optimal cluster
        ) {
            Ok(id) => id,
            Err(e) => return Err(format!("Failed to initiate distributed AI computation: {}", e)),
        };

        // Wait for computation to complete (in a real implementation, this would be async)
        let max_wait_iterations = 100;
        let mut iterations = 0;

        while iterations < max_wait_iterations {
            if let Some(status) = self.distributed_ai.get_computation_status(&computation_id) {
                match status {
                    super::distributed_ai::ComputationStatus::Completed => {
                        if let Some(result) = self.distributed_ai.get_computation_result(&computation_id) {
                            return Ok(AIVMExecutionResult {
                                success: true,
                                output: result,
                                gas_used: 100000, // Higher gas cost for distributed computation
                                logs: vec![
                                    "Distributed AI computation completed".to_string(),
                                    format!("Computation ID: {}", computation_id),
                                ],
                                return_value: Some("distributed_ai_success".to_string()),
                                error_message: None,
                                ai_responses: vec![format!("Distributed computation completed via {} validators",
                                                         context.block_height)],
                            });
                        }
                    },
                    super::distributed_ai::ComputationStatus::Failed => {
                        return Err("Distributed AI computation failed".to_string());
                    },
                    super::distributed_ai::ComputationStatus::Timeout => {
                        return Err("Distributed AI computation timed out".to_string());
                    },
                    _ => {
                        // Still in progress, continue waiting
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        iterations += 1;
                        continue;
                    }
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(100));
            iterations += 1;
        }

        Err("Distributed AI computation did not complete within timeout".to_string())
    }

    fn execute_cross_chain_contract(
        &self,
        contract: &AIVMContract,
        context: &AIVMExecutionContext,
    ) -> Result<AIVMExecutionResult, String> {
        // Cross-chain contract execution logic
        Ok(AIVMExecutionResult {
            success: true,
            output: vec![],
            gas_used: 75000,
            logs: vec!["Cross-chain contract executed".to_string()],
            return_value: Some("cross_chain_success".to_string()),
            error_message: None,
            ai_responses: vec![],
        })
    }

    fn execute_oracle_contract(
        &self,
        contract: &AIVMContract,
        context: &AIVMExecutionContext,
    ) -> Result<AIVMExecutionResult, String> {
        // Oracle contract execution with external data
        Ok(AIVMExecutionResult {
            success: true,
            output: vec![],
            gas_used: 30000,
            logs: vec!["Oracle contract executed".to_string()],
            return_value: Some("oracle_success".to_string()),
            error_message: None,
            ai_responses: vec![],
        })
    }

    pub fn get_contract(&self, address: &str) -> Option<AIVMContract> {
        if let Ok(contracts) = self.contracts.lock() {
            contracts.get(address).cloned()
        } else {
            None
        }
    }

    pub fn get_all_contracts(&self) -> Vec<AIVMContract> {
        if let Ok(contracts) = self.contracts.lock() {
            contracts.values().cloned().collect()
        } else {
            Vec::new()
        }
    }

    fn generate_contract_address(&self, creator: &str, bytecode: &[u8]) -> String {
        use sha3::{Sha3_256, Digest};
        let mut hasher = Sha3_256::new();
        hasher.update(creator.as_bytes());
        hasher.update(bytecode);
        hasher.update(&std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_le_bytes());
        format!("aivm_{}", hex::encode(hasher.finalize())[..40].to_string())
    }

    pub fn process_transaction(&self, tx: &Transaction) -> Result<AIVMExecutionResult, String> {
        if let Some(contract_data) = &tx.data {
            if contract_data.starts_with("aivm_deploy:") {
                let deploy_data = contract_data.strip_prefix("aivm_deploy:").unwrap();
                let parts: Vec<&str> = deploy_data.split(':').collect();

                if parts.len() >= 3 {
                    let bytecode = hex::decode(parts[0]).map_err(|e| format!("Invalid bytecode: {}", e))?;
                    let abi = parts[1].to_string();
                    let contract_type = match parts[2] {
                        "ai" => ContractType::AIEnhanced,
                        "cross_chain" => ContractType::CrossChain,
                        "oracle" => ContractType::Oracle,
                        _ => ContractType::Standard,
                    };

                    return self.deploy_contract(bytecode, abi, tx.sender.clone(), contract_type)
                        .map(|addr| AIVMExecutionResult {
                            success: true,
                            output: addr.as_bytes().to_vec(),
                            gas_used: 100000,
                            logs: vec![format!("Contract deployed at {}", addr)],
                            return_value: Some(addr),
                            error_message: None,
                            ai_responses: vec![],
                        });
                }
            } else if contract_data.starts_with("aivm_execute:") {
                let execute_data = contract_data.strip_prefix("aivm_execute:").unwrap();
                let parts: Vec<&str> = execute_data.split(':').collect();

                if parts.len() >= 2 {
                    let contract_address = parts[0].to_string();
                    let input_data = hex::decode(parts[1]).unwrap_or_default();

                    let context = AIVMExecutionContext {
                        transaction_hash: tx.hash(),
                        block_height: 0, // Will be set when included in block
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs(),
                        sender: tx.sender.clone(),
                        contract_address: Some(contract_address.clone()),
                        input_data,
                        gas_limit: tx.gas_limit,
                        gas_price: tx.gas_price,
                    };

                    return self.execute_contract(&contract_address, context);
                }
            }
        }

        Err("Not an AIVM transaction".to_string())
    }
}
