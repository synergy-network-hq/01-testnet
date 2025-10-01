// src/api/pqcCrypto.js
// Quantum-safe (Dilithium) keygen/sign/verify via Pyodide+Python

let pyodide = null;
let pyReady = false;

// Load Pyodide (browser Python runtime) and setup environment
export async function loadPyodideAndPQCLib() {
  if (pyReady) return;
  if (!window.loadPyodide) {
    // Load Pyodide from CDN if not already present
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  pyodide = await window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
  });
  // Install Python deps from requirements file
  await pyodide.loadPackage('micropip');
  await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('pqcrypto')
  `);
  // Load your Python PQC script (adjust path if needed)
  const pqcPy = await fetch('/pqc.py').then(r => r.text());
  pyodide.runPython(pqcPy);
  pyReady = true;
}

// Generate Dilithium keypair (returns { publicKey, privateKey } as base64)
export async function generateKeypair() {
  await loadPyodideAndPQCLib();
  const result = pyodide.runPython('py_generate_keypair()');
  return result.toJs ? result.toJs() : result;
}

// Sign a message (returns base64 signature)
export async function signMessage(privateKey, message) {
  await loadPyodideAndPQCLib();
  // Pyodide input: all strings, use repr for safety
  const pyCall = `
py_sign_message(${JSON.stringify(privateKey)}, ${JSON.stringify(message)})
  `;
  return pyodide.runPython(pyCall);
}

// Verify a signature (returns true/false)
export async function verifySignature(publicKey, message, signature) {
  await loadPyodideAndPQCLib();
  const pyCall = `
py_verify_signature(${JSON.stringify(publicKey)}, ${JSON.stringify(message)}, ${JSON.stringify(signature)})
  `;
  return pyodide.runPython(pyCall) === true;
}
