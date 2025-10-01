import React, { useState } from "react";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { initDilithium } from "../pqc/dilithium";
import { pubkeyToSynergyAddress } from "../utils/synergyAddress";

export default function CreateWalletWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicInput, setMnemonicInput] = useState(Array(12).fill(""));
  const [mnemonicError, setMnemonicError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [walletInfo, setWalletInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [sns, setSNS] = useState("");

  // Step 0: Welcome screen
  if (step === 0) {
    return (
      <div>
        <h2 className="wizard-title">Create a New Synergy Wallet</h2>
        <p style={{ fontSize: 15, color: "#fff" }}>
          Get started building your future on Synergy Network.<br />
          This wizard will walk you through setting up a quantum-safe wallet.
        </p>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "0%" }} /></div>
        <button className="wizard-btn" onClick={() => {
          setMnemonic(generateMnemonic(wordlist, 128));
          setStep(1);
        }}>Get Started</button>
      </div>
    );
  }

  // STEP 1: Show mnemonic in two columns, 6 per column
  if (step === 1) {
    const mnemonicWords = mnemonic.split(" ");
    const firstCol = mnemonicWords.slice(0, 6);
    const secondCol = mnemonicWords.slice(6, 12);
    return (
      <div style={{ textAlign: "center" }}>
        <h2 className="wizard-title">Your 12-Word Recovery Phrase</h2>
        <hr className="modal-hr-top" />
        <div className="mnemonic-grid">
          <div className="mnemonic-col">
            {firstCol.map((word, i) => (
              <div className="mnemonic-word" key={i}>
                <span className="mnemonic-word-number">{i + 1}</span>
                <span>{word}</span>
              </div>
            ))}
          </div>
          <div className="mnemonic-col">
            {secondCol.map((word, i) => (
              <div className="mnemonic-word" key={i + 6}>
                <span className="mnemonic-word-number">{i + 7}</span>
                <span>{word}</span>
              </div>
            ))}
          </div>
        </div>
        <hr className="modal-hr-bottom" />
        <div className="wizard-warning">
          ⚠️ Write these 12 words down - in order - and store them in a secure location. ⚠️
          <br></br>
          They won't be shown again and they are the only way you will be able to recover your wallet, if you need to do so!
          <br></br>
          DO NOT store them digitally or online, and NEVER under any circumstances share them with anyone.
          <br></br>
          If ANYONE asks you for this recovery phrase, it is a scammer trying to steal your funds.
        </div>
        <button
          className="wizard-btn"
          onClick={() => setStep(2)}
          style={{ marginTop: 16 }}
        >
          I have securely stored my phrase
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "16%" }} /></div>
      </div>
    );
  }

  // STEP 2: Confirm mnemonic with 12 textboxes, two columns
  if (step === 2) {
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
        <p className="wizard-desc">Enter each word in the correct order:</p>
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
        <button className="wizard-btn" type="submit" style={{ marginTop: 18 }}>
          Confirm Phrase
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "32%" }} /></div>
      </form>
    );
  }

  // Step 3: Password
  if (step === 3) {
    return (
      <form onSubmit={async e => {
        e.preventDefault();
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&]).{8,}$/.test(password)) {
          setPasswordError("Password must be at least 8 chars and include upper, lower, number, and one symbol (!@#$%&)");
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

          const publicKeyHex = Array.from(kp.publicKey)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

          setWalletInfo({
            mnemonic,
            synergyAddress, // Ensure this is a string
            publicKey: publicKeyHex,
            // ...other info
          });
          setStep(4);
        } catch (err) {
          setPasswordError("Failed to create wallet: " + err.message);
        }
        setProcessing(false);
      }}>
        <h2 className="wizard-title">Set a Wallet Password</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          minLength={8}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", fontSize: 16, marginTop: 20, marginBottom: 12 }}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={passwordConfirm}
          minLength={8}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", fontSize: 16, marginBottom: 16 }}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
        />
        {passwordError && <div className="wizard-error">{passwordError}</div>}
        <button className="wizard-btn" type="submit" disabled={processing}>
          {processing ? "Creating Wallet..." : "Create Wallet"}
        </button>
        <div className="wizard-progress"><div className="wizard-progress-bar" style={{ width: "48%" }} /></div>
      </form>
    );
  }

  // Step 4: Show info
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
                {/* SVG clipboard icon (Material/Feather/Lucide style) */}
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

  // Step 5: SNS Step
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

  // Catch-all: Cancel
  return (
    <div>
      <div className="wizard-title">Wallet Setup Cancelled</div>
      <button className="wizard-btn" onClick={onCancel}>Close</button>
    </div>
  );
}
