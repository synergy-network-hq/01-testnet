// src/utils/crypto.js

// Uses AES-GCM and PBKDF2 for PIN-based encryption of wallet secrets.

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100_000;

export async function deriveKey(pin, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSecret(pin, plaintext) {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(pin, salt);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  // Return: base64(salt + iv + ciphertext)
  const data = new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)]);
  return btoa(String.fromCharCode(...data));
}

export async function decryptSecret(pin, b64) {
  const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(pin, salt);
  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}
