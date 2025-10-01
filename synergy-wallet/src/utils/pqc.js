import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

const PQC_SALT = 'SynergyWallet-Dilithium3';

// Deterministic Dilithium keypair from mnemonic
export async function generateDeterministicDilithiumKeypair(mnemonic) {
  const encoder = new TextEncoder();
  // 1. Derive entropy using PBKDF2-SHA256
  const entropy = pbkdf2(
    sha256,
    encoder.encode(mnemonic),
    encoder.encode(PQC_SALT),
    { c: 100_000, dkLen: 32 }
  );

  // 2. Call the WASM keygen wrapper
  if (!window.dilithium || !window.dilithium.generateKeypairFromSeed) {
    throw new Error("Dilithium WASM module with deterministic keygen not loaded");
  }

  // NOTE: our wrapper expects a Uint8Array, pbkdf2 returns that
  const { publicKey, privateKey } = window.dilithium.generateKeypairFromSeed(entropy);

  return { publicKey, privateKey };
}
