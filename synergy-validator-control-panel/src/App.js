import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

// Components
import ValidatorSetup from './components/ValidatorSetup';
import ValidatorDashboard from './components/ValidatorDashboard';
import Layout from './components/Layout';

// Services
import rpcService from './services/rpcService';

// Set background image
if (typeof window !== 'undefined') {
  document.body.style.backgroundImage = 'url("/assets/metal.png")';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center center';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.backgroundRepeat = 'no-repeat';
}

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [validatorConfig, setValidatorConfig] = useState(null);

  // Check if validator is already configured
  useEffect(() => {
    const savedConfig = localStorage.getItem('validator-config');
    if (savedConfig) {
      try {
        setValidatorConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error parsing saved validator config:', error);
      }
    }
  }, []);

  const handleValidatorSetupComplete = (config) => {
    setValidatorConfig(config);
    localStorage.setItem('validator-config', JSON.stringify(config));
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            validatorConfig ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ValidatorSetup
                onComplete={handleValidatorSetupComplete}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            validatorConfig ? (
              <ValidatorDashboard validatorConfig={validatorConfig} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/setup" element={<ValidatorSetup onComplete={handleValidatorSetupComplete} />} />
      </Routes>
    </Layout>
  );
}

export default App;
