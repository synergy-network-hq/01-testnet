import React, { useState } from "react";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { initDilithium } from "../pqc/dilithium";
import { pubkeyToSynergyAddress } from "../utils/synergyAddress";

export default function ImportWalletWizard({ onComplete, onCancel }) {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleImport(e) {
    e.preventDefault();
    // Normalize mnemonic (trims and removes extra spaces)
    const normalizedMnemonic = mnemonic
      .split(/\s+/)
      .map(w => w.trim())
      .join(' ')
      .trim();

    if (!validateMnemonic(normalizedMnemonic, wordlist)) {
      setError("Invalid mnemonic phrase.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setProcessing(true);
    try {
      // PQC: In real app, you'd recover keys using mnemonic+password
      const pqc = await initDilithium();
      const kp = await pqc.keypair();
      const synergyAddress = await pubkeyToSynergyAddress(kp.publicKey);
      const publicKeyHex = Array.from(kp.publicKey)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      onComplete({
        synergyAddress, // Ensure string
        publicKey: publicKeyHex, // Store as hex string
      });
    } catch (err) {
      setError("Failed to import wallet: " + err.message);
    }
    setProcessing(false);
  }


  return (
    <form onSubmit={handleImport}>
      <h2 className="wizard-title">Import/Recover Wallet</h2>
      <textarea
        placeholder="Enter your 12-word recovery phrase"
        value={mnemonic}
        onChange={e => setMnemonic(e.target.value)}
        rows={3}
        required
        style={{ width: "100%", padding: 9, borderRadius: 6, fontSize: 16, marginBottom: 12 }}
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 6, fontSize: 16, marginBottom: 12 }}
        required
      />
      {error && <div className="wizard-error">{error}</div>}
      <button className="wizard-btn" type="submit" disabled={processing}>
        {processing ? "Importing..." : "Import Wallet"}
      </button>
      <button className="wizard-btn" type="button" onClick={onCancel} style={{ marginLeft: 18 }}>
        Cancel
      </button>
    </form>
  );
}
