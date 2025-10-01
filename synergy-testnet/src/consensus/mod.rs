//! Synergy Network Consensus Module
//!
//! This module handles initialization and coordination of the
//! consensus mechanism used to secure the Synergy Testnet blockchain.

pub mod consensus_algorithm;

use self::consensus_algorithm::ProofOfSynergy;

/// Starts the consensus mechanism using Proof of Synergy.
pub fn start_consensus() {
    let mut engine = ProofOfSynergy::new();
    engine.initialize();
    engine.execute(); // Starts the mining loop
}
