// src/utils/umaAddresses.js

import { mnemonicToSeedSync } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { publicToAddress, toChecksumAddress } from "ethereumjs-util";
import { Buffer } from 'buffer';
import { derivePath as solDerivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { bech32 } from 'bech32';

// ---- Bitcoin (Native SegWit - Bech32) ----
export function generateBTCAddressFromMnemonic(mnemonic, passphrase = "", path = "m/84'/0'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  // Generate Native SegWit (Bech32) address
  const pubkey = child.publicKey; // Uint8Array
  const sha256 = require('js-sha256');
  const ripemd160 = require('ripemd160');

  // Create witness program: SHA256(pubkey) then RIPEMD160
  const pubkeyHash = new ripemd160().update(Buffer.from(sha256.arrayBuffer(pubkey))).digest();

  // Encode as Bech32 address (bc1q...)
  const address = bech32.encode('bc', bech32.toWords(pubkeyHash));

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'bitcoin',
    derivationPath: path,
  };
}

// ---- Ethereum (BIP44, EIP-55) ----
export function generateETHWalletFromMnemonic(mnemonic, passphrase = "", path = "m/44'/60'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  // Public key must be uncompressed, remove first byte (0x04)
  let pubkey = child.publicKey;
  if (pubkey[0] === 0x04 && pubkey.length === 65) {
    pubkey = pubkey.slice(1);
  }
  const ethAddressBuffer = publicToAddress(Buffer.from(pubkey), true); // true = ethereum
  const address = toChecksumAddress("0x" + ethAddressBuffer.toString("hex"));

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'ethereum',
    derivationPath: path,
  };
}

// ---- Solana (BIP44, ed25519, m/44'/501'/0'/0') ----
export function generateSOLWalletFromMnemonic(mnemonic, passphrase = "", path = "m/44'/501'/0'/0'") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const derived = solDerivePath(path, Buffer.from(seed).toString("hex"));
  const keypair = Keypair.fromSeed(derived.key);
  return {
    address: keypair.publicKey.toBase58(),
    pubkey: keypair.publicKey.toBase58(),
    chain: 'solana',
    derivationPath: path,
  };
}

// ---- Bitcoin Cash (BIP44) ----
export function generateBCHAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/145'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  const sha256 = require('js-sha256');
  const ripemd160 = require('ripemd160');
  const pubkeyHash = new ripemd160().update(Buffer.from(sha256.arrayBuffer(pubkey))).digest();

  // Bitcoin Cash uses legacy format with different version byte
  const bs58check = require('bs58check');
  const payload = Buffer.concat([Buffer.from([0x00]), Buffer.from(pubkeyHash)]);
  const address = bs58check.encode(payload);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'bitcoin-cash',
    derivationPath: path,
  };
}

// ---- Tron (BIP44) ----
export function generateTRXAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/195'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Tron address generation (simplified - would need proper Tron library)
  const address = "T" + Buffer.from(pubkey).toString('hex').slice(0, 33);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'tron',
    derivationPath: path,
  };
}

// ---- Cardano (BIP44) ----
export function generateADAAddressFromMnemonic(mnemonic, passphrase = "", path = "m/1852'/1815'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Cardano address generation (simplified - would need proper Cardano library)
  const address = "addr1" + Buffer.from(pubkey).toString('hex').slice(0, 50);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'cardano',
    derivationPath: path,
  };
}

// ---- Ripple (BIP44) ----
export function generateXRPAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/144'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Ripple address generation (simplified - would need proper Ripple library)
  const address = "r" + Buffer.from(pubkey).toString('hex').slice(0, 25);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'ripple',
    derivationPath: path,
  };
}

// ---- Polkadot (BIP44) ----
export function generateDOTAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/354'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Polkadot address generation (simplified - would need proper Polkadot library)
  const address = "1" + Buffer.from(pubkey).toString('hex').slice(0, 47);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'polkadot',
    derivationPath: path,
  };
}

// ---- Cosmos (BIP44) ----
export function generateATOMAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/118'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Cosmos address generation (simplified - would need proper Cosmos library)
  const address = "cosmos1" + Buffer.from(pubkey).toString('hex').slice(0, 38);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'cosmos',
    derivationPath: path,
  };
}

// ---- Near Protocol (BIP44) ----
export function generateNEARAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/397'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Near Protocol address generation (simplified - would need proper Near library)
  const address = Buffer.from(pubkey).toString('hex').slice(0, 40) + ".near";

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'near',
    derivationPath: path,
  };
}

// ---- Starknet (BIP44) ----
export function generateSTRKAddressFromMnemonic(mnemonic, passphrase = "", path = "m/44'/9004'/0'/0/0") {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const child = hdkey.derive(path);

  const pubkey = child.publicKey;
  // Starknet address generation (simplified - would need proper Starknet library)
  const address = "0x" + Buffer.from(pubkey).toString('hex').slice(0, 63);

  return {
    address,
    pubkey: Buffer.from(pubkey).toString('hex'),
    chain: 'starknet',
    derivationPath: path,
  };
}
