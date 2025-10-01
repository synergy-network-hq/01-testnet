import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer';
import "./styles/global.css";

window.Buffer = Buffer;

const PUBLIC_KEY_LEN = 1952;
const SECRET_KEY_LEN = 4032;

function generateKeypairFromSeed(seedBuffer) {
  const mod = window.dilithium;
  const seedPtr = mod._malloc(seedBuffer.length);
  mod.HEAPU8.set(seedBuffer, seedPtr);
  const pkPtr = mod._malloc(PUBLIC_KEY_LEN);
  const skPtr = mod._malloc(SECRET_KEY_LEN);

  mod._dilithium3_keypair_from_seed(pkPtr, skPtr, seedPtr);

  const publicKey = new Uint8Array(mod.HEAPU8.buffer, pkPtr, PUBLIC_KEY_LEN);
  const privateKey = new Uint8Array(mod.HEAPU8.buffer, skPtr, SECRET_KEY_LEN);

  const pub = new Uint8Array(publicKey);
  const priv = new Uint8Array(privateKey);

  mod._free(seedPtr);
  mod._free(pkPtr);
  mod._free(skPtr);

  return { publicKey: pub, privateKey: priv };
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <div style={{
    color: "#fff",
    background: "#18112a",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem"
  }}>
    Loading Synergy cryptography engine…
  </div>
);

// Wait for DilithiumModule to load
window.DilithiumModule().then((mod) => {
  window.dilithium = mod;
  window.dilithium.generateKeypairFromSeed = generateKeypairFromSeed;
  console.log("Dilithium WASM loaded!", window.dilithium);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
});
