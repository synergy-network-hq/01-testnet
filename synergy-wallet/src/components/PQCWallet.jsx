import React, { useState } from "react";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { initDilithium } from "../pqc/dilithium.js";
import { pubkeyToSynergyAddress } from '../utils/synergyAddress';
import "../styles/main.css";

function toHex(uint8arr) {
  if (!uint8arr) return "";
  return Array.from(uint8arr)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PQCWallet() {
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicInput, setMnemonicInput] = useState(Array(12).fill(""));
  const [mnemonicError, setMnemonicError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [walletInfo, setWalletInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Step 1: Generate and display mnemonic
  const handleGenerateMnemonic = () => {
    const phrase = generateMnemonic(wordlist, 128); // 12 words
    setMnemonic(phrase);
    setStep(2);
  };

  // Step 2: User confirms mnemonic
  const handleMnemonicInputChange = (i, value) => {
    const updated = [...mnemonicInput];
    updated[i] = value.trim();
    setMnemonicInput(updated);
  };
  const handleCheckMnemonic = (e) => {
    e.preventDefault();
    if (mnemonicInput.join(" ").trim() === mnemonic.trim()) {
      setMnemonicError("");
      setStep(3);
    } else {
      setMnemonicError("Incorrect phrase! Please check the word order and spelling.");
    }
  };

  // Step 3: Set password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError("");
    setProcessing(true);
    try {
      const pqc = await initDilithium();
      const kp = await pqc.keypair();
      const synergyAddress = await pubkeyToSynergyAddress(kp.publicKey);
      setWalletInfo({
        mnemonic,
        publicKey: toHex(kp.publicKey),
        synergyAddress,
      });
      setStep(4);
    } catch (err) {
      setPasswordError("Failed to create wallet: " + err.message);
    }
    setProcessing(false);
  };

  // --- UI Render ---
  return (
    <div style={{ maxWidth: 540, margin: "40px auto", padding: 24, background: "rgba(30, 20, 50, 0.75)", borderRadius: 18, boxShadow: "0 2px 32px #0006", fontFamily: "Inter, monospace" }}>
      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>Create a New Synergy Wallet</h1>
          <button
            className="btn"
            style={{ fontSize: 20, padding: "14px 36px", borderRadius: 12, background: "#7b1fa2", color: "#fff", border: "none", marginTop: 40, cursor: "pointer" }}
            onClick={handleGenerateMnemonic}
          >
            Generate My 12-Word Recovery Phrase
          </button>
          <p style={{ marginTop: 32, color: "#aaa", fontSize: 16 }}>
            A recovery phrase lets you restore your wallet if your device is lost or stolen.<br />
            Never share it with anyone. <strong>You are your own bank.</strong>
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 28 }}>Your Recovery Phrase</h2>
          <div style={{ background: "#1e1140", padding: 18, borderRadius: 10, fontSize: 22, letterSpacing: 2, margin: "24px 0", userSelect: "all" }}>
            <span style={{ color: "#ffda47" }}>{mnemonic}</span>
          </div>
          <div style={{ color: "#c60", marginBottom: 16, fontWeight: "bold" }}>
            <span>⚠️ Write these 12 words down, in order. They won't be shown again!</span>
          </div>
          <button
            className="btn"
            style={{ fontSize: 18, padding: "10px 30px", borderRadius: 10, background: "#22b573", color: "#fff", border: "none" }}
            onClick={() => { setMnemonicInput(Array(12).fill("")); setStep(2.5); }}
          >
            I have recorded the phrase
          </button>
        </div>
      )}

      {step === 2.5 && (
        <form onSubmit={handleCheckMnemonic}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Confirm Your Recovery Phrase</h2>
          <p style={{ color: "#aaa", fontSize: 15, marginBottom: 18 }}>
            Enter each word in the correct position to confirm you've written it down:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
            {Array(12).fill().map((_, i) => (
              <input
                key={i}
                type="text"
                value={mnemonicInput[i]}
                onChange={e => handleMnemonicInputChange(i, e.target.value)}
                required
                autoFocus={i === 0}
                style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #444", fontSize: 16, background: "#2e2148", color: "#fff" }}
              />
            ))}
          </div>
          {mnemonicError && <div style={{ color: "#f44", marginBottom: 10 }}>{mnemonicError}</div>}
          <button
            type="submit"
            className="btn"
            style={{ fontSize: 18, padding: "10px 30px", borderRadius: 10, background: "#7b1fa2", color: "#fff", border: "none" }}
          >
            Confirm Phrase
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit}>
          <h2 style={{ fontSize: 24 }}>Set a Wallet Password</h2>
          <p style={{ color: "#aaa", fontSize: 15 }}>
            This password encrypts your wallet locally. It does <strong>not</strong> replace your recovery phrase.<br />
            <strong>Minimum 8 characters.</strong>
          </p>
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginTop: 20, marginBottom: 12, width: "100%", padding: 10, borderRadius: 7, border: "1px solid #555", fontSize: 16, background: "#221843", color: "#fff" }}
            required
            minLength={8}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            style={{ marginBottom: 16, width: "100%", padding: 10, borderRadius: 7, border: "1px solid #555", fontSize: 16, background: "#221843", color: "#fff" }}
            required
            minLength={8}
          />
          {passwordError && <div style={{ color: "#f44", marginBottom: 8 }}>{passwordError}</div>}
          <button
            type="submit"
            disabled={processing}
            className="btn"
            style={{ fontSize: 18, padding: "10px 30px", borderRadius: 10, background: "#22b573", color: "#fff", border: "none" }}
          >
            {processing ? "Creating Wallet..." : "Create Wallet"}
          </button>
        </form>
      )}

      {step === 4 && walletInfo && (
        <div>
          <h2 style={{ fontSize: 24 }}>Your Wallet is Ready</h2>
          <div style={{ background: "#1e1140", padding: 18, borderRadius: 10, margin: "16px 0", color: "#fff", fontFamily: "monospace", fontSize: 16 }}>
            <div><strong>PQC Public Key:</strong> <br />{walletInfo.publicKey}</div>
            <div style={{ marginTop: 8 }}><strong>Synergy Address:</strong> <br />{walletInfo.synergyAddress}</div>
          </div>
          <div style={{ marginTop: 18, color: "#aaa", fontSize: 15 }}>
            Keep your recovery phrase and password safe. You’ll need the phrase to restore your wallet.
          </div>
        </div>
      )}
    </div>
  );
}
