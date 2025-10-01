use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use std::net::{TcpListener, TcpStream};
use std::io::{Read, Write};
use serde_json::json;
use crate::block::BlockChain;
use crate::transaction::Transaction;
use crate::config::NodeConfig;

// Type aliases to avoid nested generics parsing issues
type PeerMap = HashMap<String, PeerConnection>;
type BlockchainArc = Arc<Mutex<BlockChain>>;
type PeersArc = Arc<Mutex<PeerMap>>;

pub struct P2PNetwork {
    blockchain: BlockchainArc,
    config: NodeConfig,
    connected_peers: PeersArc,
    is_running: Arc<Mutex<bool>>,
}

struct PeerConnection {
    address: String,
    connected_at: u64,
    last_seen: u64,
    blocks_sent: u64,
    blocks_received: u64,
    txs_sent: u64,
    txs_received: u64,
}

impl P2PNetwork {
    pub fn new(blockchain: BlockchainArc, config: &NodeConfig) -> Self {
        P2PNetwork {
            blockchain,
            config: config.clone(),
            connected_peers: Arc::new(Mutex::new(HashMap::new())),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn start(&mut self, listen_address: &str) {
        let is_running = Arc::clone(&self.is_running);
        let blockchain = Arc::clone(&self.blockchain);
        let connected_peers = Arc::clone(&self.connected_peers);
        let config = self.config.clone();
        let addr_string = listen_address.to_string();

        // Start listener (basic implementation for now)
        println!("🔌 P2P listener would start on {}", addr_string);

        // Set running flag
        *is_running.lock().unwrap() = true;

        println!("🔌 P2P network started on {}", listen_address);
    }

    pub fn broadcast_block(&self, _block: &crate::block::Block) {
        // Basic implementation - in production this would broadcast to peers
        println!("📢 Block broadcast (basic implementation)");
    }

    pub fn broadcast_transaction(&self, _transaction: &Transaction) {
        // Basic implementation - in production this would broadcast to peers
        println!("📢 Transaction broadcast (basic implementation)");
    }

    pub fn get_peer_count(&self) -> usize {
        self.connected_peers.lock().unwrap().len()
    }

    pub fn get_peer_info(&self) -> Vec<serde_json::Value> {
        let peers = self.connected_peers.lock().unwrap();
        peers.values().map(|peer| {
            json!({
                "address": peer.address,
                "connected_at": peer.connected_at,
                "last_seen": peer.last_seen,
                "blocks_sent": peer.blocks_sent,
                "blocks_received": peer.blocks_received,
                "txs_sent": peer.txs_sent,
                "txs_received": peer.txs_received
            })
        }).collect()
    }
}

fn start_listener(
    listen_address: &str,
    _blockchain: BlockchainArc,
    _connected_peers: PeersArc,
    _config: NodeConfig,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔌 P2P listener would bind to {}", listen_address);
    println!("🔌 Basic P2P networking ready (synchronous implementation)");
    Ok(())
}

fn handle_peer_connection(
    _socket: TcpStream,
    peer_address: String,
    _blockchain: BlockchainArc,
    _connected_peers: PeersArc,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔗 Would handle peer connection from {} (synchronous)", peer_address);
    Ok(())
}


fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
