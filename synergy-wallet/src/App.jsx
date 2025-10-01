import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";
import UmaWalletWizard from "./modals/umaWalletWizard";
import "./styles/global.css";

function App() {
  const [wallet, setWallet] = useState(() => {
    const stored = localStorage.getItem("synergyWallet");
    return stored ? JSON.parse(stored) : null;
  });
  const [showWizard, setShowWizard] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleAddWallet = () => setShowWizard(true);

  const handleWalletReady = (walletObj) => {
    setWallet(walletObj);
    localStorage.setItem("synergyWallet", JSON.stringify(walletObj));
    setShowWizard(false);
  };

  const handleLogout = () => {
    setWallet(null);
    localStorage.removeItem("synergyWallet");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings wallet={wallet} onLogout={handleLogout} onBackToDashboard={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <>
            <Dashboard
              wallet={wallet}
              onLogout={handleLogout}
              onAddWallet={handleAddWallet}
            />
            <UmaWalletWizard
              isOpen={showWizard}
              onClose={() => setShowWizard(false)}
              onWalletCreated={handleWalletReady}
            />
          </>
        );
    }
  };

  return (
    <div>
      <div id="overlay"></div>
      <div className="container">
        {wallet && <Sidebar wallet={wallet} onLogout={handleLogout} currentPage={currentPage} onPageChange={handlePageChange} />}
        <div className="content">
          {!wallet ? (
            <LoginPage onWalletCreated={handleWalletReady} />
          ) : (
            renderCurrentPage()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
