import React, { useState } from "react";
import "../styles/global.css";
import "../styles/global.scss";

export default function Settings({ wallet, onLogout, onBackToDashboard }) {
  const [unmaskedAddresses, setUnmaskedAddresses] = useState({});

  // Test function to check if APIs are working
  const testAPIs = async () => {
    console.log('Testing API connectivity...');
    try {
      // Test a simple API call
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      console.log('CoinGecko API test:', data);
      alert('API test completed! Check console for results.');
    } catch (error) {
      console.error('API test failed:', error);
      alert('API test failed! Check console for details.');
    }
  };

  const toggleAddressMask = (network) => {
    setUnmaskedAddresses(prev => ({
      ...prev,
      [network]: !prev[network]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatAddress = (address, isUnmasked) => {
    if (!address) return "N/A";
    if (isUnmasked) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const networkConfigs = [
    {
      key: 'synergyAddress',
      name: 'Synergy Network',
      logo: '/assets/synergy.png',
      color: '#667eea',
      description: 'Native Synergy blockchain address'
    },
    {
      key: 'bitcoinAddress',
      name: 'Bitcoin',
      logo: '/assets/bitcoin.png',
      color: '#f7931a',
      description: 'Native SegWit (Bech32) Bitcoin address'
    },
    {
      key: 'ethereumAddress',
      name: 'EVM Network',
      logo: '/assets/ethereum.png',
      color: '#627eea',
      description: 'Ethereum Virtual Machine compatible address',
      tooltip: 'This address is used by the Ethereum network along with BNB Smart Chain, Polygon, Arbitrum, Avalanche, Optimism, Base, zkSync Era, Linea, Mantle, Fantom, Cronos, Celo, Klaytn, Moonbeam, Moonriver, Gnosis Chain, Evmos, Skale Network and others'
    },
    {
      key: 'solanaAddress',
      name: 'Solana',
      logo: '/assets/solana.png',
      color: '#9945ff',
      description: 'Solana blockchain address'
    },
    {
      key: 'bitcoinCashAddress',
      name: 'Bitcoin Cash',
      logo: '/assets/bitcoinCash.png',
      color: '#0ac18e',
      description: 'Bitcoin Cash blockchain address'
    },
    {
      key: 'tronAddress',
      name: 'Tron',
      logo: '/assets/tron.png',
      color: '#ff060a',
      description: 'Tron blockchain address'
    },
    {
      key: 'cardanoAddress',
      name: 'Cardano',
      logo: '/assets/cardano.png',
      color: '#0033ad',
      description: 'Cardano blockchain address'
    },
    {
      key: 'rippleAddress',
      name: 'Ripple',
      logo: '/assets/xrp.png',
      color: '#23292f',
      description: 'Ripple blockchain address'
    },
    {
      key: 'polkadotAddress',
      name: 'Polkadot',
      logo: '/assets/polkadot.png',
      color: '#e6007a',
      description: 'Polkadot blockchain address'
    },
    {
      key: 'cosmosAddress',
      name: 'Cosmos',
      logo: '/assets/cosmos.png',
      color: '#2e3148',
      description: 'Cosmos blockchain address'
    },
    {
      key: 'nearAddress',
      name: 'Near Protocol',
      logo: '/assets/nearProtocol.png',
      color: '#00c1de',
      description: 'Near Protocol blockchain address'
    },
    {
      key: 'starknetAddress',
      name: 'Starknet',
      logo: '/assets/starknet.png',
      color: '#ff0420',
      description: 'Starknet blockchain address'
    }
  ];

  return (
    <div className="container">
      <div className="content">
        <section className="card">
          <div className="settings-header">
            <h1>Wallet Settings</h1>
            
          </div>

          <div className="wallet-info-section">
            <h3>Wallet Information</h3>
            <div className="wallet-info-card">
              <div className="wallet-info-content">
                <div className="wallet-details">
                  <div className="wallet-name">
                    {wallet?.label || "Synergy Wallet"}
                  </div>
                  <div className="wallet-id">
                    Wallet ID: {wallet?.id || "N/A"}
                  </div>
                </div>
                <div className="wallet-version">
                  Version: {wallet?.version || "2.0"}
                </div>
              </div>
            </div>
          </div>

          <div className="network-addresses-section">
            <h3>Network Addresses</h3>
            <p className="address-description">
              Click the eye icon to reveal or hide each address. All addresses are derived from your master seed phrase.
            </p>

            <div className="address-grid">
              {networkConfigs.map((config) => {
                const address = wallet?.[config.key];
                const isUnmasked = unmaskedAddresses[config.key];

                return (
                  <div key={config.key} className="address-card">
                    <div className="address-header">
                      <div className="address-info">
                        <div className="network-icon" style={{ background: config.color, padding: "4px" }}>
                          <img
                            src={config.logo}
                            alt={`${config.name} logo`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              borderRadius: "50%"
                            }}
                          />
                        </div>
                        <div className="network-details">
                          <div className="network-name-row">
                            <span className="network-name">
                              {config.name}
                            </span>
                            {config.tooltip && (
                              <div className="tooltip-container">
                                <button className="info-button" title={config.tooltip}>
                                  i
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="network-description">
                            {config.description}
                          </div>
                        </div>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => toggleAddressMask(config.key)}
                        title={isUnmasked ? "Hide address" : "Show address"}
                      >
                        {isUnmasked ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>

                    <div className="address-display">
                      <span className="address-text">
                        {formatAddress(address, isUnmasked)}
                      </span>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(address)}
                        title="Copy address"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="security-info-section">
            <h4>Security Information</h4>
            <div className="security-details">
              <p>
                <strong>Security Level:</strong> {wallet?.securityLevel || "Enhanced"}
              </p>
              <p>
                <strong>Device ID:</strong> {wallet?.deviceId ? `${wallet.deviceId.slice(0, 8)}...` : "N/A"}
              </p>
              <p>
                <strong>Created:</strong> {wallet?.createdAt ? new Date(wallet.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "2rem", padding: "1rem", background: "var(--bg-alt)", borderRadius: "0.5rem", border: "1px solid var(--divider)" }}>
            <h4 style={{ marginBottom: "1rem" }}>Developer Tools</h4>
            <button className="sidebar-button" onClick={testAPIs}>
              Test APIs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
