import { bech32m } from 'bech32';
import sha3 from 'js-sha3';
const { sha3_256 } = sha3;

const PREFIXES = ['sYnQ', 'sYnU', 'sYnX', 'sYnZ'];

function hashSha3(buf) {
  return new Uint8Array(sha3_256.arrayBuffer(buf));
}

function randomPrefix() {
  // Pick a prefix at random
  const idx = Math.floor(Math.random() * PREFIXES.length);
  return PREFIXES[idx];
}

export async function pubkeyToSynergyAddress(pubkey, prefix) {
  // If no prefix specified, pick random
  const chosenPrefix = prefix || randomPrefix();
  const hash = hashSha3(pubkey);
  // Use first 18 bytes so address stays around 40 chars
  const truncated = hash.subarray(0, 18);
  const words = bech32m.toWords(truncated);
  // Encode with lowercase prefix then swap prefix case
  const encoded = bech32m.encode(chosenPrefix.toLowerCase(), words);
  return chosenPrefix + encoded.slice(chosenPrefix.length);
}
