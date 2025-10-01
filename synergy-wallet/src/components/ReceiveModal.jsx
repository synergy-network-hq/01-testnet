import React, { useState } from 'react';
import '../styles/global.scss';

export default function ReceiveModal({ isOpen, onClose, wallet, selectedNetwork }) {
  const [selectedToken, setSelectedToken] = useState(selectedNetwork || 'bitcoin');

  if (!isOpen) return null;

  const getAddress = () => {
    const addressKey = `${selectedToken}Address`;
    return wallet[addressKey] || 'Address not available';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getAddress());
    // You could add a toast notification here
  };

  const generateQRCode = (text) => {
    // In a real implementation, you'd use a QR code library like qrcode.js
    // For now, we'll use a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="synergy-modal-header">
          <h3 className="synergy-modal-title">Receive {selectedToken.toUpperCase()}</h3>
          <button className="synergy-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="wizard-form">
          <div className="wizard-label">
            <label>Select Network</label>
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

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              background: 'white',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <img
                src={generateQRCode(getAddress())}
                alt="QR Code"
                style={{ width: '200px', height: '200px' }}
              />
            </div>
          </div>

          <div className="wizard-label">
            <label>Your {selectedToken.toUpperCase()} Address</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--code-bg)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--divider)'
            }}>
              <input
                className="wizard-input"
                type="text"
                value={getAddress()}
                readOnly
                style={{
                  border: 'none',
                  background: 'transparent',
                  flex: 1,
                  margin: 0
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  background: 'var(--primary-mid)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--code-bg)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--divider)',
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}>
            <strong>Important:</strong> Only send {selectedToken.toUpperCase()} to this address.
            Sending other cryptocurrencies may result in permanent loss.
          </div>
        </div>
      </div>
    </div>
  );
}
