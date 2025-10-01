import React, { useState } from 'react';
import '../styles/global.scss';

export default function SwapModal({ isOpen, onClose, wallet, balances, onSwap }) {
  const [fromToken, setFromToken] = useState('bitcoin');
  const [toToken, setToToken] = useState('ethereum');
  const [fromAmount, setFromAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('');

  const availableTokens = Object.keys(balances).filter(token =>
    balances[token] && parseFloat(balances[token].balance) > 0
  );

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (fromToken === toToken) {
      setError('Cannot swap to the same token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // This would integrate with DEX aggregators like 1inch, 0x, etc.
      await onSwap({
        fromToken,
        toToken,
        amount: parseFloat(fromAmount),
        fromAddress: wallet[`${fromToken}Address`],
        toAddress: wallet[`${toToken}Address`]
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    // In a real implementation, you'd call a price API here
    if (value && fromToken !== toToken) {
      setEstimatedOutput((parseFloat(value) * 0.95).toFixed(6)); // Placeholder calculation
    } else {
      setEstimatedOutput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="synergy-modal-header">
          <h3 className="synergy-modal-title">Swap Tokens</h3>
          <button className="synergy-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="wizard-form">
          <div className="wizard-label">
            <label>From</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="wizard-input"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                style={{ flex: 1 }}
              >
                {availableTokens.map(token => (
                  <option key={token} value={token}>
                    {token.toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                className="wizard-input"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Balance: {balances[fromToken]?.balance || '0'} {fromToken.toUpperCase()}
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button
              onClick={() => {
                const temp = fromToken;
                setFromToken(toToken);
                setToToken(temp);
                setFromAmount('');
                setEstimatedOutput('');
              }}
              style={{
                background: 'var(--primary-mid)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ⇅
            </button>
          </div>

          <div className="wizard-label">
            <label>To</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="wizard-input"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
                <option value="tron">Tron</option>
                <option value="ripple">Ripple</option>
                <option value="near">Near Protocol</option>
                <option value="starknet">Starknet</option>
              </select>
              <input
                className="wizard-input"
                type="text"
                value={estimatedOutput}
                readOnly
                placeholder="0.00"
                style={{ flex: 1, background: 'var(--code-bg)' }}
              />
            </div>
          </div>

          {error && (
            <div className="wizard-error">
              {error}
            </div>
          )}

          <div style={{
            background: 'var(--code-bg)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--divider)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginBottom: '20px'
          }}>
            <strong>Estimated Output:</strong> {estimatedOutput} {toToken.toUpperCase()}<br />
            <strong>Network Fee:</strong> ~0.001 {fromToken.toUpperCase()}<br />
            <strong>Slippage:</strong> 0.5%
          </div>

          <button
            className="wizard-submit-btn"
            onClick={handleSwap}
            disabled={loading || !fromAmount || fromToken === toToken}
          >
            {loading ? 'Swapping...' : 'Confirm Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
