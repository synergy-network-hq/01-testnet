import React, { useState } from 'react';
import '../styles/global.scss';

export default function SendModal({ isOpen, onClose, wallet, selectedNetwork, onSend }) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(selectedNetwork || 'bitcoin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // This would integrate with actual blockchain APIs
      await onSend({
        network: selectedToken,
        recipient: recipientAddress,
        amount: parseFloat(amount),
        fromAddress: wallet[`${selectedToken}Address`]
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="synergy-modal-header">
          <h3 className="synergy-modal-title">Send {selectedToken.toUpperCase()}</h3>
          <button className="synergy-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="wizard-form">
          <div className="wizard-label">
            <label>Recipient Address</label>
            <input
              className="wizard-input"
              type="text"
              placeholder="Enter recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

          <div className="wizard-label">
            <label>Amount</label>
            <input
              className="wizard-input"
              type="number"
              step="0.00000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="wizard-label">
            <label>Network</label>
            <select
              className="wizard-input"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
              <option value="tron">Tron</option>
              <option value="ripple">Ripple</option>
              <option value="near">Near Protocol</option>
              <option value="starknet">Starknet</option>
            </select>
          </div>

          {error && (
            <div className="wizard-error">
              {error}
            </div>
          )}

          <button
            className="wizard-submit-btn"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
