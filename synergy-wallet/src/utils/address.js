// src/utils/address.js

import { bech32m } from 'bech32';

// Use PQC pubkey as input. Prefix: sYnQ for mainnet, sYnU for testnet.
export async function synergyBech32Address(pubKey, prefix = 'sYnQ') {
  // pubKey: Uint8Array or Buffer
  // Hash to 32 bytes (SHA-256), encode with bech32m, cut to 41 chars
  const hash = await window.crypto.subtle.digest('SHA-256', pubKey);
  const hashArr = new Uint8Array(hash);
  const words = bech32m.toWords(hashArr);
  return bech32m.encode(prefix, words).slice(0, 41); // Enforce 41 chars
}
