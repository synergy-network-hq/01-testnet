import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import blockchainService from '../services/blockchainService';
import walletConnectorService from '../services/walletConnectorService';

// Create context
const WalletContext = createContext();

// Provider component
export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [network, setNetwork] = useState('testnet'); // Default to testnet as per requirements
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize blockchain service
  useEffect(() => {
    const init = async () => {
      try {
        await blockchainService.initializeBlockchainService(network);
      } catch (error) {
        console.error('Failed to initialize blockchain service:', error);
        setError('Failed to initialize blockchain connection');
      }
    };
    
    init();
  }, [network]);

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if MetaMask is installed
      if (!walletConnectorService.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
      }
      
      // Ensure we're connected to the correct network
      const isCorrectNetwork = await walletConnectorService.isConnectedToSynergyNetwork(network);
      if (!isCorrectNetwork) {
        // Switch to the correct network
        await walletConnectorService.switchToSynergyNetwork(network);
      }
      
      // Connect to MetaMask
      const account = await walletConnectorService.connectMetaMask();
      
      // Get signer
      const signer = await walletConnectorService.getSigner();
      
      // Create ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Set state
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      
      // Fetch wallet data
      await fetchWalletData(account);
      
      // Listen for account changes
      walletConnectorService.onAccountsChanged(handleAccountsChanged);
      
      // Listen for chain changes
      walletConnectorService.onChainChanged(handleChainChanged);
      
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    // Remove event listeners
    if (walletConnectorService.isMetaMaskInstalled()) {
      walletConnectorService.removeListener('accountsChanged', handleAccountsChanged);
      walletConnectorService.removeListener('chainChanged', handleChainChanged);
    }
    
    // Reset state
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setWalletData(null);
    setTransactions([]);
    setStakingInfo(null);
    
    return true;
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== account) {
      // User switched accounts
      setAccount(accounts[0]);
      await fetchWalletData(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload();
  };

  // Fetch wallet data
  const fetchWalletData = async (address) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get wallet balance
      const balanceData = await blockchainService.getWalletBalance(address);
      setWalletData(balanceData);
      
      // Get transaction history
      const txHistory = await blockchainService.getTransactionHistory(address);
      setTransactions(txHistory);
      
      // Get staking info
      const staking = await blockchainService.getStakingInfo(address);
      setStakingInfo(staking);
      
      return true;
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setError('Failed to fetch wallet data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send transaction
  const sendTransaction = async (to, amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isConnected || !signer) {
        throw new Error('Wallet not connected');
      }
      
      const result = await blockchainService.sendTransaction(account, to, amount, signer);
      
      // Refresh wallet data
      await fetchWalletData(account);
      
      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      setError(error.message || 'Failed to send transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Stake tokens
  const stakeTokens = async (amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isConnected || !signer) {
        throw new Error('Wallet not connected');
      }
      
      const result = await blockchainService.stakeTokens(amount, signer);
      
      // Refresh wallet data
      await fetchWalletData(account);
      
      return result;
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      setError(error.message || 'Failed to stake tokens');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake tokens
  const unstakeTokens = async (amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isConnected || !signer) {
        throw new Error('Wallet not connected');
      }
      
      const result = await blockchainService.unstakeTokens(amount, signer);
      
      // Refresh wallet data
      await fetchWalletData(account);
      
      return result;
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      setError(error.message || 'Failed to unstake tokens');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch network
  const switchNetwork = async (newNetwork) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update network state
      setNetwork(newNetwork);
      
      // Reinitialize blockchain service with new network
      await blockchainService.initializeBlockchainService(newNetwork);
      
      // Refresh wallet data if connected
      if (isConnected && account) {
        await fetchWalletData(account);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      setError('Failed to switch network');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    isConnected,
    account,
    provider,
    signer,
    walletData,
    transactions,
    stakingInfo,
    network,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    stakeTokens,
    unstakeTokens,
    switchNetwork,
    refreshWalletData: () => account && fetchWalletData(account)
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;
