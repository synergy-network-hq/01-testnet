import React, { useState } from 'react';
import { decryptSecret } from '../utils/crypto';

export default function WalletDetails({ wallet, onBack, onDelete }) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [pin, setPin] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [pqcPrivateKey, setPqcPrivateKey] = useState('');
  const [error, setError] = useState('');

  // Handle decrypt
  const handleDecrypt = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const mn = await decryptSecret(pin, wallet.mnemonicEnc);
      const pqc = await decryptSecret(pin, wallet.pqcPrivateKeyEnc);
      setMnemonic(mn);
      setPqcPrivateKey(pqc);
      setShowSecrets(true);
    } catch (err) {
      setError("Incorrect PIN or data corrupted.");
      setShowSecrets(false);
    }
  };

  return (
    <div className="bg-glass dark:bg-glass-dark p-6 rounded-xl w-full max-w-xl mx-auto shadow-lg">
      <button className="mb-2 text-xs underline text-blue-300" onClick={onBack}>← Back to Wallets</button>
      <h2 className="text-xl font-bold mb-2">{wallet.label || "Universal Wallet"}</h2>
      <div className="mb-2"><b>Synergy (PQC):</b> <span className="font-mono">{wallet.synergyAddress}</span></div>
      <div className="mb-2"><b>Bitcoin:</b> <span className="font-mono">{wallet.bitcoinAddress}</span></div>
      <div className="mb-2"><b>Ethereum:</b> <span className="font-mono">{wallet.ethereumAddress}</span></div>
      <div className="mb-2"><b>Solana:</b> <span className="font-mono">{wallet.solanaAddress}</span></div>
      <div className="mt-6 flex gap-2">
        <form onSubmit={handleDecrypt}>
          <input
            type="password"
            className="px-2 py-1 rounded bg-glass-dark text-mono text-sm"
            placeholder="Enter PIN to view secrets"
            value={pin}
            onChange={e => setPin(e.target.value)}
            minLength={4}
          />
          <button type="submit" className="btn-glass ml-2 text-xs">Decrypt Secrets</button>
        </form>
        <button className="btn-glass text-xs ml-2" onClick={onDelete}>Delete Wallet</button>
      </div>
      {error && <div className="text-red-400 mt-2">{error}</div>}
      {showSecrets && (
        <div className="mt-4">
          <div className="bg-yellow-100 text-yellow-800 rounded p-2 text-xs mb-2">DO NOT share these secrets!</div>
          <div><b>Mnemonic:</b> <span className="font-mono">{mnemonic}</span></div>
          <div className="mt-2"><b>PQC Private Key (hex):</b>
            <div className="break-all font-mono text-xs bg-glass-dark p-2 rounded mt-1">{pqcPrivateKey}</div>
          </div>
        </div>
      )}
    </div>
  );
}
