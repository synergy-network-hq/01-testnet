// Converts Uint8Array to hex string
export function toHex(arr) {
  if (!arr) return '';
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Converts hex string to Uint8Array
export function fromHex(hex) {
  if (!hex) return new Uint8Array();
  // Remove whitespace and make lowercase
  hex = hex.replace(/\s+/g, '').toLowerCase();
  // If hex length is odd, pad left with '0'
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => {
    const val = parseInt(byte, 16);
    if (isNaN(val)) throw new Error(`Invalid hex byte: "${byte}"`);
    return val;
  }));
}
