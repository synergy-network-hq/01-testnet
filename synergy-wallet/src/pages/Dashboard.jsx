import React, { useState, useEffect } from "react";
import { fetchAllBalances } from "../utils/balanceFetcher";
import SendModal from "../components/SendModal";
import ReceiveModal from "../components/ReceiveModal";
import SwapModal from "../components/SwapModal";
import "../styles/global.css";
import "../styles/global.scss";

export default function Dashboard({ wallet, onLogout, onAddWallet }) {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Fetch real token balances from blockchain APIs
  useEffect(() => {
    const fetchBalances = async () => {
      if (!wallet) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedBalances = await fetchAllBalances(wallet);
        setBalances(fetchedBalances);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to fetch balances. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [wallet]);

  const totalPortfolioValue = Object.values(balances).reduce((total, token) => {
    const value = parseFloat(token.usd.replace(/[$,]/g, ''));
    return total + (isNaN(value) ? 0 : value);
  }, 0);

  const refreshBalances = async () => {
    if (!wallet) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedBalances = await fetchAllBalances(wallet);
      setBalances(fetchedBalances);
    } catch (err) {
      console.error('Error refreshing balances:', err);
      setError('Failed to refresh balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter balances based on zero balance toggle
  const filteredBalances = hideZeroBalances
    ? Object.fromEntries(
      Object.entries(balances).filter(([_, token]) => {
        const balance = parseFloat(token.balance);
        return balance > 0;
      })
    )
    : balances;

  // Action handlers
  const handleBuy = () => {
    alert('Buy functionality coming soon! This will integrate with DEXs and centralized exchanges.');
  };

  const handleSell = () => {
    alert('Sell functionality coming soon! This will integrate with DEXs and centralized exchanges.');
  };

  const handleSwap = () => {
    setShowSwapModal(true);
  };

  const handleSend = () => {
    setShowSendModal(true);
  };

  const handleReceive = () => {
    setShowReceiveModal(true);
  };

  const handleStake = () => {
    alert('Staking functionality coming soon! This will allow you to stake tokens and earn rewards.');
  };

  // Transaction handlers
  const handleSendTransaction = async (transactionData) => {
    console.log('Sending transaction:', transactionData);
    // In a real implementation, this would:
    // 1. Sign the transaction with the wallet's private key
    // 2. Broadcast it to the blockchain
    // 3. Update the balance
    alert(`Transaction sent: ${transactionData.amount} ${transactionData.network} to ${transactionData.recipient}`);
    await refreshBalances();
  };

  const handleSwapTransaction = async (swapData) => {
    console.log('Swapping tokens:', swapData);
    // In a real implementation, this would:
    // 1. Connect to a DEX aggregator (1inch, 0x, etc.)
    // 2. Get the best swap route
    // 3. Execute the swap
    alert(`Swap executed: ${swapData.amount} ${swapData.fromToken} → ${swapData.toToken}`);
    await refreshBalances();
  };


  return (
    <div className="container">
      <div className="content">
        <section className="card">
          <h1>Wallet Dashboard</h1>

          {/* Portfolio Overview */}
          <div className="portfolio-overview" style={{
            marginBottom: "0", height: "60px", padding: "20px", display: "flex",
            flexDirection: "column", justifyContent: "center"
          }}>
            <h2 style={{ margin: "0" }}>Total Portfolio Value</h2>
            <div className="portfolio-value" style={{ margin: "0" }}>
              ${totalPortfolioValue.toLocaleString()}
            </div>
            <div className="wallet-label" style={{ margin: "0" }}>
              {wallet?.label || "Synergy Wallet"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons" style={{
            display: "flex",
            justifyContent: "center",
            gap: "4",
            marginBottom: "1.5rem",
            marginTop: "0.5rem",
            flexWrap: "nowrap",
            overflowX: "auto"
          }}>
            <button className="sidebar-button" onClick={handleBuy} style={{ width: "150px" }}>
              💰 Buy
            </button>
            <button className="sidebar-button" onClick={handleSell} style={{ width: "150px" }}>
              💸 Sell
            </button>
            <button className="sidebar-button" onClick={handleSwap} style={{ width: "150px" }}>
              🔄 Swap
            </button>
            <button className="sidebar-button" onClick={handleSend} style={{ width: "150px" }}>
              📤 Send
            </button>
            <button className="sidebar-button" onClick={handleReceive} style={{ width: "150px" }}>
              📥 Receive
            </button>
            <button className="sidebar-button" onClick={handleStake} style={{ width: "150px" }}>
              🏦 Stake
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Token Balances */}
          <div className="token-balances-section">
            <h3>Token Balances</h3>

            {loading ? (
              <div className="loading-state">
                <div>Loading balances...</div>
                <div className="loading-subtitle">This may take a few moments</div>
              </div>
            ) : Object.keys(filteredBalances).length === 0 ? (
              <div className="empty-state">
                <div>{hideZeroBalances ? "No tokens with balances found" : "No balances found"}</div>
                <div className="empty-subtitle">Try refreshing or check the console for errors</div>
              </div>
            ) : (
              <div className="token-grid">
                {Object.entries(filteredBalances).map(([network, token]) => {
                  // Map network names to logo files
                  const getNetworkLogo = (networkName) => {
                    const logoMap = {
                      'bitcoin': '/assets/bitcoin.png',
                      'ethereum': '/assets/ethereum.png',
                      'solana': '/assets/solana.png',
                      'bitcoinCash': '/assets/bitcoinCash.png',
                      'tron': '/assets/tron.png',
                      'cardano': '/assets/cardano.png',
                      'ripple': '/assets/xrp.png',
                      'polkadot': '/assets/polkadot.png',
                      'cosmos': '/assets/cosmos.png',
                      'near': '/assets/nearProtocol.png',
                      'starknet': '/assets/starknet.png'
                    };
                    return logoMap[networkName] || null;
                  };

                  const logoPath = getNetworkLogo(network);

                  return (
                    <div key={network} className={`token-card ${token.error ? 'error' : ''}`}>
                      <div className="token-info">
                        <div className={`token-icon ${token.error ? 'error' : ''}`}>
                          {logoPath ? (
                            <img
                              src={logoPath}
                              alt={`${network} logo`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: "50%"
                              }}
                            />
                          ) : (
                            token.symbol.slice(0, 2)
                          )}
                        </div>
                        <div className="token-details">
                          <div className={`token-symbol ${token.error ? 'error' : ''}`}>
                            {token.symbol}
                          </div>
                          <div className="token-network">
                            {network.charAt(0).toUpperCase() + network.slice(1).replace(/([A-Z])/g, ' $1')}
                            {token.error && " (Error)"}
                          </div>
                        </div>
                      </div>
                      <div className="token-balance">
                        <div className={`balance-amount ${token.error ? 'error' : ''}`}>
                          {token.balance}
                        </div>
                        <div className="balance-usd">
                          {token.usd}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Zero Balance Toggle */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "20px",
              gap: "10px"
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--text-muted)"
              }}>
                <input
                  type="checkbox"
                  checked={hideZeroBalances}
                  onChange={(e) => setHideZeroBalances(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--primary-mid)"
                  }}
                />
                Hide zero balances
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="sidebar-button" onClick={onAddWallet}>
              Add New Wallet
            </button>
            <button
              className="sidebar-button"
              onClick={refreshBalances}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Balances"}
            </button>
          </div>
        </section>

        {/* Modals */}
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          wallet={wallet}
          onSend={handleSendTransaction}
        />

        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          wallet={wallet}
        />

        <SwapModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          wallet={wallet}
          balances={balances}
          onSwap={handleSwapTransaction}
        />
      </div>
    </div>
  );
}
