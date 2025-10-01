import React from "react";
import logo from "./logo.png";
import "../styles/global.css";

const buttons = ["Dashboard", "Transactions", "Settings", "Help"];

export default function Sidebar({ wallet, onWalletCreated, onLogout, currentPage, onPageChange }) {

    const handleButtonClick = (label) => {
        switch (label.toLowerCase()) {
            case 'dashboard':
                onPageChange('dashboard');
                break;
            case 'settings':
                onPageChange('settings');
                break;
            case 'transactions':
                // TODO: Implement transactions page
                console.log('Transactions page not implemented yet');
                break;
            case 'help':
                // TODO: Implement help page
                console.log('Help page not implemented yet');
                break;
            default:
                break;
        }
    };

    return (
        <div className="sidebar">
            <img src={logo} alt="Synergy Logo" className="sidebar-logo" />
            <div className="sidebar-content">
                <h2 style={{ fontWeight: 900, fontSize: 32, marginTop: 45 }}>Synergy Wallet</h2>
                <hr className="top" style={{ marginTop: 65, marginBottom: 15 }} />
                {buttons.map((label) => (
                    <button
                        key={label}
                        className="sidebar-button"
                        style={{
                            marginBottom: 5,
                            backgroundColor: currentPage === label.toLowerCase() ? 'var(--primary-mid)' : 'transparent',
                            color: currentPage === label.toLowerCase() ? '#fff' : 'var(--text)'
                        }}
                        onClick={() => handleButtonClick(label)}
                    >
                        {label}
                    </button>
                ))}

                <hr className="bottom" style={{ marginTop: 20 }} />
                {/* {wallet && (
                    <div style={{width: "100%", marginTop: 10}}>
                        <div style={{fontFamily: "Inter Medium", fontSize: 14, marginBottom: 3}}>Current Wallet:</div>
                        <div
                            style={{
                                fontFamily: "monospace",
                                fontSize: 13,
                                background: "#251844cc",
                                borderRadius: 7,
                                padding: "6px 10px",
                                letterSpacing: "0.5px",
                                marginBottom: 4,
                                wordBreak: "break-all",
                            }}
                        >
                            {typeof wallet?.synergyAddress === "string"
                                ? wallet.synergyAddress.slice(0, 11) + "..." + wallet.synergyAddress.slice(-3)
                                : "(no address)"}
                        </div>
                    </div>
                )} */}
            </div>

            <div className="sidebar-footer">
                {wallet && (
                    <button className="sidebar-button" style={{ marginBottom: 16 }} onClick={onLogout}>
                        Log Out
                    </button>
                )}
                <small style={{ marginBottom: 26 }}>Synergy Network © 2025</small>
            </div>
        </div>
    );
}
