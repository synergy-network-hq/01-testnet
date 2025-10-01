import React, { useState } from "react";
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { initDilithium } from "../pqc/dilithium";
import { pubkeyToSynergyAddress } from "../utils/synergyAddress";

export default function UnifiedWalletWizard({ onComplete, onCancel }) {
  // Wizard state
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null); // "create" or "import"
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicInput, setMnemonicInput] = useState(Array(12).fill(""));
  const [mnemonicError, setMnemonicError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [walletInfo, setWalletInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [sns, setSNS] = useState("");
  const [error, setError] = useState("");

  // Util: Derive keypair deterministically from mnemonic + optional password
  async function deriveWallet(mnemonic, password) {
    // BIP39 seed (512 bits), can use as seed for PQC
    const seed = mnemonicToSeedSync(mnemonic, password);
    const pqc = await initDilithium();
    if (!pqc.keypairFromSeed) {
      throw new Error("Dilithium lib must support deterministic keypairFromSeed(seed)");
    }
    const kp = await pqc.keypairFromSeed(seed); // <-- deterministic!
    const synergyAddress = await pubkeyToSynergyAddress(kp.publicKey);
    const publicKeyHex = Array.from(kp.publicKey)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    return { synergyAddress, publicKey: publicKeyHex };
  }

  // Step 0: Select Create or Import
  if (step === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2 className="wizard-title">Welcome to Synergy Wallet</h2>
        <p>Start by creating a new wallet or importing an existing one.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, margin: "36px 0" }}>
          <button className="wizard-btn" onClick={() => {
            setMnemonic(generateMnemonic(wordlist, 128));
            setMode("create");
            setStep(1);
          }}>Create New Wallet</button>
          <button className="wizard-btn" onClick={() => {
            setMode("import");
            setStep(1);
          }}>Import Wallet</button>
        </div>
        <button className="wizard-btn" style={{ marginTop: 14 }} onClick={onCancel}>Cancel</button>
      </div>
    );
  }

  // CREATE: Step 1 — Show new mnemonic
  if (step === 1 && mode === "create") {
    const mnemonicWords = mnemonic.split(" ");
    return (
      <div style={{ textAlign: "center" }}>
        <h2 className="wizard-title">Your 12-Word Recovery Phrase</h2>
        <hr className="modal-hr-top" />
        <div className="mnemonic-grid">
          <div className="mnemonic-col">
            {mnemonicWords.slice(0, 6).map((word, i) => (
              <div className="mnemonic-word" key={i}>
                <span className="mnemonic-word-number">{i + 1}</span>
                <span>{word}</span>
              </div>
            ))}
          </div>
          <div className="mnemonic-col">
            {mnemonicWords.slice(6, 12).map((word, i) => (
              <div className="mnemonic-word" key={i + 6}>
                <span className="mnemonic-word-number">{i + 7}</span>
                <span>{word}</span>
              </div>
            ))}
          </div>
        </div>
        <hr className="modal-hr-bottom" />
        <div className="wizard-warning" style={{ marginBottom: 12 }}>
          ⚠️ Write these 12 words down <b>in order</b> and store them securely!<br />
          They are your ONLY way to recover your wallet on any device.
        </div>
        <button className="wizard-btn" style={{ marginTop: 10 }} onClick={() => setStep(2)}>
          I've safely stored my phrase
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "16%" }} /></div>
      </div>
    );
  }

  // CREATE: Step 2 — Confirm mnemonic input
  if (step === 2 && mode === "create") {
    const firstColInputs = mnemonicInput.slice(0, 6);
    const secondColInputs = mnemonicInput.slice(6, 12);
    return (
      <form
        style={{ textAlign: "center" }}
        onSubmit={e => {
          e.preventDefault();
          if (mnemonicInput.join(" ").trim() === mnemonic.trim()) {
            setMnemonicError("");
            setStep(3);
          } else {
            setMnemonicError("Incorrect phrase! Please check the word order and spelling.");
          }
        }}>
        <h2 className="wizard-title">Confirm Recovery Phrase</h2>
        <p className="wizard-desc">Enter each word in order:</p>
        <div className="mnemonic-grid">
          <div className="mnemonic-col">
            {firstColInputs.map((val, i) => (
              <div className="mnemonic-input" key={i}>
                <span className="mnemonic-input-number">{i + 1}</span>
                <input
                  type="text"
                  value={val}
                  required
                  className="mnemonic-textbox"
                  autoFocus={i === 0}
                  onChange={e => {
                    const arr = [...mnemonicInput];
                    arr[i] = e.target.value.trim();
                    setMnemonicInput(arr);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mnemonic-col">
            {secondColInputs.map((val, i) => (
              <div className="mnemonic-input" key={i + 6}>
                <span className="mnemonic-input-number">{i + 7}</span>
                <input
                  type="text"
                  value={val}
                  required
                  className="mnemonic-textbox"
                  onChange={e => {
                    const arr = [...mnemonicInput];
                    arr[i + 6] = e.target.value.trim();
                    setMnemonicInput(arr);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {mnemonicError && <div className="wizard-error">{mnemonicError}</div>}
        <button className="wizard-btn" type="submit" style={{ marginTop: 16 }}>
          Confirm Phrase
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "32%" }} /></div>
      </form>
    );
  }

  // CREATE/IMPORT: Step 3 — Set password (for encrypting local storage)
  if ((step === 3 && mode === "create") || (step === 1 && mode === "import")) {
    return (
      <form onSubmit={async e => {
        e.preventDefault();
        if (mode === "create" && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&]).{8,}$/.test(password)) {
          setPasswordError("Password must be at least 8 chars and include upper, lower, number, and a symbol (!@#$%&)");
          return;
        }
        if (password !== passwordConfirm) {
          setPasswordError("Passwords do not match.");
          return;
        }
        setPasswordError("");
        setProcessing(true);

        try {
          let mnemonicToUse = mnemonic;
          if (mode === "import") {
            // Normalize and validate
            const norm = mnemonic
              .split(/\s+/)
              .map(w => w.trim())
              .join(' ')
              .trim();
            if (!validateMnemonic(norm, wordlist)) {
              setError("Invalid mnemonic phrase.");
              setProcessing(false);
              return;
            }
            mnemonicToUse = norm;
          }
          const wallet = await deriveWallet(mnemonicToUse, password);
          setWalletInfo({
            mnemonic: mnemonicToUse,
            synergyAddress: wallet.synergyAddress,
            publicKey: wallet.publicKey
          });
          setStep(4);
        } catch (err) {
          setError("Failed to derive wallet: " + err.message);
        }
        setProcessing(false);
      }}>
        <h2 className="wizard-title">{mode === "import" ? "Import Wallet" : "Set a Password"}</h2>
        <p>
          {mode === "import"
            ? "Enter your recovery phrase and a password to restore your wallet on this device."
            : "Set a password to protect your wallet on this device. (Password is NOT part of wallet recovery, just local protection.)"}
        </p>
        {mode === "import" && (
          <textarea
            placeholder="Enter your 12-word recovery phrase"
            value={mnemonic}
            onChange={e => setMnemonic(e.target.value)}
            rows={3}
            required
            style={{ width: "100%", padding: 9, borderRadius: 6, fontSize: 16, marginBottom: 12 }}
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          minLength={8}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", fontSize: 16, marginTop: 12, marginBottom: 10 }}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={passwordConfirm}
          minLength={8}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", fontSize: 16, marginBottom: 12 }}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
        />
        {passwordError && <div className="wizard-error">{passwordError}</div>}
        {error && <div className="wizard-error">{error}</div>}
        <button className="wizard-btn" type="submit" disabled={processing}>
          {processing ? (mode === "import" ? "Importing..." : "Creating...") : (mode === "import" ? "Import Wallet" : "Continue")}
        </button>
        <button className="wizard-btn" type="button" style={{ marginLeft: 18 }} onClick={onCancel}>
          Cancel
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "48%" }} /></div>
      </form>
    );
  }

  // CREATE/IMPORT: Step 4 — Show info and confirm
  if (step === 4 && walletInfo) {
    return (
      <div>
        <h2 className="wizard-title">Your Wallet is Ready</h2>
        <div style={{
          background: "#1e1140", padding: 18, borderRadius: 10, margin: "16px 0", color: "#fff",
          fontFamily: "monospace", fontSize: 15, overflow: "hidden"
        }}>
          <div>
            <b>Synergy Address:</b>
            <div style={{
              background: "#120f1f",
              borderRadius: 7,
              padding: 8,
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
              overflowX: "auto"
            }}>
              <span style={{
                flex: 1,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflowX: "auto"
              }}>{walletInfo.synergyAddress}</span>
              <button
                className="copy-btn"
                style={{
                  marginLeft: 8,
                  padding: 7,
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer"
                }}
                title="Copy address"
                onClick={() => navigator.clipboard.writeText(walletInfo.synergyAddress)}
              >
                {/* SVG clipboard icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <b>PQC Public Key:</b>
            <div style={{ background: "#120f1f", borderRadius: 7, padding: 8, margin: "4px 0", position: "relative", maxHeight: 76, overflow: "auto", fontSize: 12, wordBreak: "break-all" }}>
              <span>{walletInfo.publicKey}</span>
              <button className="wizard-btn" style={{ position: "absolute", top: 6, right: 6, fontSize: 13, padding: "3px 9px" }}
                onClick={() => navigator.clipboard.writeText(walletInfo.publicKey)}>Copy</button>
            </div>
          </div>
        </div>
        <button
          className="wizard-btn"
          onClick={() => setStep(5)}
          style={{ marginTop: 14 }}
        >
          Continue
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "100%" }} /></div>
      </div>
    );
  }

  // CREATE/IMPORT: Step 5 — SNS Step (Optional)
  if (step === 5 && walletInfo) {
    return (
      <div>
        <h2 className="wizard-title">Create an SNS Name</h2>
        <p className="wizard-desc">
          Give your wallet a unique Synergy Name (SNS). This will make sending/receiving easier!
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <input
            value={sns}
            onChange={e => setSNS(e.target.value)}
            className="mnemonic-textbox"
            style={{ width: 180, fontSize: 18, marginRight: 8 }}
            placeholder="e.g. mycoolwallet"
          />
          <span style={{ fontSize: 18 }}>.syn</span>
        </div>
        <button className="wizard-btn" style={{ marginTop: 20 }}
          onClick={() => {
            // Optionally, validate SNS name here
            onComplete({ ...walletInfo, sns });
          }}
        >Finish</button>
        <button
          type="button"
          onClick={() => onComplete(walletInfo)}
          style={{
            display: "block",
            background: "none",
            border: "none",
            marginTop: 14,
            color: "#b9b9b9",
            fontSize: 14,
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit"
          }}
        >
          Skip this step
        </button>
        <div className="wizard-progress">
          <div className="wizard-progress-bar" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  // Fallback/cancel
  return (
    <div>
      <div className="wizard-title">Wallet Setup Cancelled</div>
      <button className="wizard-btn" onClick={onCancel}>Close</button>
    </div>
  );
}
