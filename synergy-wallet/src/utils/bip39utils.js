import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import { Keypair as SolanaKeypair } from '@solana/web3.js';
import { payments } from 'bitcoinjs-lib';

// Generates a BIP-39 mnemonic and seed buffer (default: 12 words)
export function generateMnemonicAndSeed() {
  const mnemonic = generateMnemonic(128, wordlist);  // 128 bits = 12 words, 256 = 24 words
  const seed = mnemonicToSeedSync(mnemonic);         // Uint8Array
  return { mnemonic, seed: Buffer.from(seed) };
}

// Validates a mnemonic
export function isValidMnemonic(mnemonic) {
  return validateMnemonic(mnemonic, wordlist);
}

// Derive Bitcoin (Bech32/P2WPKH) address
export function deriveBTC(seed) {
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive("m/44'/0'/0'/0/0");
  return payments.p2wpkh({ pubkey: Buffer.from(child.publicKey) }).address;
}

// Derive Ethereum address
export function deriveETH(seed) {
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive("m/44'/60'/0'/0/0");
  const wallet = new ethers.Wallet(child.privateKey);
  return wallet.address;
}

// Derive Solana address
export function deriveSOL(seed) {
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive("m/44'/501'/0'/0'");
  return SolanaKeypair.fromSeed(child.privateKey.slice(0, 32)).publicKey.toBase58();
}
