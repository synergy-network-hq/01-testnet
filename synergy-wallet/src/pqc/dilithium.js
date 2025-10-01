import DilithiumModule from './dilithium_wasm.js';

export async function initDilithium() {
  const mod = await DilithiumModule();

  const PK_LEN = 1952;
  const SK_LEN = 4032;
  const SIG_MAX_LEN = 3309;

  console.log("Module initialized");
  console.log("Available functions:", Object.keys(mod).filter(k => k.startsWith('_')));

  // Debug: Check memory size
  console.log("Initial memory size:", mod.HEAPU8.length);
  console.log("Memory buffer:", mod.HEAPU8.buffer.byteLength);

  function allocArray(data) {
    if (!(data instanceof Uint8Array)) {
      data = typeof data === "string"
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);
    }

    const ptr = mod._malloc(data.length);
    console.log(`Allocated ${data.length} bytes at ptr: ${ptr}`);

    if (ptr === 0) {
      throw new Error("WASM malloc failed!");
    }

    // Check if pointer is within valid memory range
    if (ptr + data.length > mod.HEAPU8.length) {
      console.error(`Pointer ${ptr} + ${data.length} exceeds memory size ${mod.HEAPU8.length}`);
      mod._free(ptr);
      throw new Error("Allocated memory exceeds WASM memory bounds");
    }

    mod.HEAPU8.set(data, ptr);
    return ptr;
  }

  function freeArray(ptr) {
    if (ptr !== 0) {
      console.log(`Freeing ptr: ${ptr}`);
      mod._free(ptr);
    }
  }

  // Helper function to allocate aligned memory for integers
  function allocAligned(size, alignment = 8) {
    const ptr = mod._malloc(size + alignment - 1);
    if (ptr === 0) {
      throw new Error("WASM malloc failed!");
    }

    // Align pointer to the specified boundary
    const alignedPtr = (ptr + alignment - 1) & ~(alignment - 1);
    console.log(`Allocated ${size} bytes, raw ptr: ${ptr}, aligned ptr: ${alignedPtr}`);
    return { ptr, alignedPtr };
  }

  function freeAligned(ptrInfo) {
    if (ptrInfo.ptr !== 0) {
      console.log(`Freeing aligned ptr: ${ptrInfo.ptr}`);
      mod._free(ptrInfo.ptr);
    }
  }

  async function keypair() {
    const pkPtr = mod._malloc(PK_LEN);
    const skPtr = mod._malloc(SK_LEN);

    console.log(`Keypair alloc - pkPtr: ${pkPtr}, skPtr: ${skPtr}`);

    if (pkPtr === 0 || skPtr === 0) {
      freeArray(pkPtr);
      freeArray(skPtr);
      throw new Error("Failed to allocate memory for keypair");
    }

    try {
      const result = mod._dilithium3_keypair(pkPtr, skPtr);
      console.log("Keypair generation result:", result);

      if (result !== 0) {
        throw new Error(`Keypair generation failed with error code: ${result}`);
      }

      const pkOut = new Uint8Array(PK_LEN);
      const skOut = new Uint8Array(SK_LEN);

      pkOut.set(mod.HEAPU8.subarray(pkPtr, pkPtr + PK_LEN));
      skOut.set(mod.HEAPU8.subarray(skPtr, skPtr + SK_LEN));

      return { publicKey: pkOut, secretKey: skOut };
    } finally {
      freeArray(pkPtr);
      freeArray(skPtr);
    }
  }

  async function sign(message, secretKey) {
    console.log("=== SIGN FUNCTION DEBUG ===");

    // Ensure proper types
    if (!(message instanceof Uint8Array)) {
      message = new TextEncoder().encode(String(message));
    }
    if (!(secretKey instanceof Uint8Array)) {
      secretKey = new Uint8Array(secretKey);
    }

    console.log('Message length:', message.length);
    console.log('Secret key length:', secretKey.length);
    console.log('Current memory size:', mod.HEAPU8.length);

    if (secretKey.length !== SK_LEN) {
      throw new Error(`Invalid secret key length: ${secretKey.length}, expected ${SK_LEN}`);
    }

    let msgPtr = 0;
    let skPtr = 0;
    let sigPtr = 0;
    let sigLenPtrInfo = { ptr: 0, alignedPtr: 0 };

    try {
      // Allocate memory with proper error handling
      console.log("Allocating message...");
      msgPtr = allocArray(message);

      console.log("Allocating secret key...");
      skPtr = allocArray(secretKey);

      console.log("Allocating signature buffer...");
      sigPtr = mod._malloc(SIG_MAX_LEN);
      if (sigPtr === 0) {
        throw new Error("Failed to allocate signature buffer");
      }
      console.log(`Signature buffer allocated at: ${sigPtr}`);

      console.log("Allocating signature length buffer...");
      sigLenPtrInfo = allocAligned(8, 8); // 8-byte aligned for 64-bit systems
      const sigLenPtr = sigLenPtrInfo.alignedPtr;
      console.log(`Signature length buffer allocated at: ${sigLenPtr}`);

      // Check memory bounds before proceeding
      const maxPtr = Math.max(
        msgPtr + message.length,
        skPtr + secretKey.length,
        sigPtr + SIG_MAX_LEN,
        sigLenPtr + 8
      );
      console.log(`Max pointer used: ${maxPtr}, Memory size: ${mod.HEAPU8.length}`);

      if (maxPtr > mod.HEAPU8.length) {
        throw new Error(`Memory access would exceed bounds: ${maxPtr} > ${mod.HEAPU8.length}`);
      }

      // Initialize signature length - use proper alignment for 32-bit access
      const sigLenIndex = sigLenPtr >> 2;
      if (sigLenIndex >= mod.HEAPU32.length) {
        throw new Error(`Signature length index ${sigLenIndex} exceeds HEAPU32 bounds`);
      }

      mod.HEAPU32[sigLenIndex] = SIG_MAX_LEN;
      console.log(`Initialized sig length to: ${mod.HEAPU32[sigLenIndex]}`);

      // Verify the data is actually in memory
      console.log("Verifying message in memory:", Array.from(mod.HEAPU8.subarray(msgPtr, msgPtr + Math.min(10, message.length))));
      console.log("Verifying secret key in memory:", Array.from(mod.HEAPU8.subarray(skPtr, skPtr + 10)));

      console.log('About to call dilithium3_sign...');
      console.log(`Parameters: sigPtr=${sigPtr}, sigLenPtr=${sigLenPtr}, msgPtr=${msgPtr}, msgLen=${message.length}, skPtr=${skPtr}`);

      // Call the signing function
      const result = mod._dilithium3_sign(sigPtr, sigLenPtr, msgPtr, message.length, skPtr);
      console.log('Signing result:', result);

      if (result !== 0) {
        throw new Error(`Signing failed with error code: ${result}`);
      }

      // Get the actual signature length
      const sigLen = mod.HEAPU32[sigLenIndex];
      console.log('Signature length:', sigLen);

      if (sigLen > SIG_MAX_LEN || sigLen === 0) {
        throw new Error(`Invalid signature length: ${sigLen}`);
      }

      // Extract the signature
      const sigOut = new Uint8Array(sigLen);
      sigOut.set(mod.HEAPU8.subarray(sigPtr, sigPtr + sigLen));

      console.log("Signature generated successfully, first 20 bytes:", Array.from(sigOut.slice(0, 20)));

      return sigOut;
    } finally {
      // Clean up allocated memory
      freeArray(msgPtr);
      freeArray(skPtr);
      freeArray(sigPtr);
      freeAligned(sigLenPtrInfo);
    }
  }

  async function verify(message, signature, publicKey) {
    console.log("=== VERIFY FUNCTION DEBUG ===");

    // Ensure proper types
    if (!(message instanceof Uint8Array)) {
      message = new TextEncoder().encode(String(message));
    }
    if (!(signature instanceof Uint8Array)) {
      signature = new Uint8Array(signature);
    }
    if (!(publicKey instanceof Uint8Array)) {
      publicKey = new Uint8Array(publicKey);
    }

    console.log('Verifying:');
    console.log('- message length:', message.length);
    console.log('- signature length:', signature.length);
    console.log('- public key length:', publicKey.length);

    if (publicKey.length !== PK_LEN) {
      throw new Error(`Invalid public key length: ${publicKey.length}, expected ${PK_LEN}`);
    }

    let msgPtr = 0;
    let sigPtr = 0;
    let pkPtr = 0;

    try {
      msgPtr = allocArray(message);
      sigPtr = allocArray(signature);
      pkPtr = allocArray(publicKey);

      console.log(`Verify pointers: msgPtr=${msgPtr}, sigPtr=${sigPtr}, pkPtr=${pkPtr}`);

      const result = mod._dilithium3_verify(sigPtr, signature.length, msgPtr, message.length, pkPtr);
      console.log('Verification result:', result);
      return result === 0;
    } finally {
      freeArray(msgPtr);
      freeArray(sigPtr);
      freeArray(pkPtr);
    }
  }

  // Test memory allocation
  console.log("Testing memory allocation...");
  const testPtr = mod._malloc(1000);
  console.log(`Test allocation of 1000 bytes: ${testPtr}`);
  if (testPtr > 0) {
    mod._free(testPtr);
    console.log("Test allocation successful");
  } else {
    console.error("Test allocation failed");
  }

  return { keypair, sign, verify };
}
