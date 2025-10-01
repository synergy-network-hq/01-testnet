//! Synergy Network P2P Module
//!
//! This module handles peer-to-peer networking for the Synergy Network,
//! including peer discovery, block synchronization, and transaction propagation.

pub mod networking;

use std::sync::Arc;
use crate::block::BlockChain;
use crate::config::NodeConfig;
use self::networking::P2PNetwork;

pub fn start_p2p_network(
    blockchain: Arc<std::sync::Mutex<BlockChain>>,
    listen_address: &str,
    config: &NodeConfig
) -> Arc<P2PNetwork> {
    let mut network = P2PNetwork::new(blockchain, config);
    network.start(listen_address);
    Arc::new(network)
}
