import { ethers } from 'ethers';

// Constants
const TESTNET_CHAIN_ID = '0x3503'; // Hex for 13579 (from network_config.json)
const MAINNET_CHAIN_ID = '0x3504'; // Example mainnet chain ID (not specified in config)
const TESTNET_RPC_URL = 'https://testnet-rpc.synergy.network';
const MAINNET_RPC_URL = 'https://mainnet-rpc.synergy.network';
const TESTNET_EXPLORER_URL = 'https://testnet-explorer.synergy.network';
const MAINNET_EXPLORER_URL = 'https://explorer.synergy.network';

/**
 * Wallet connection service for Synergy Network
 */
export const walletConnectorService = {
  /**
   * Check if MetaMask is installed
   * @returns {boolean} - Whether MetaMask is installed
   */
  isMetaMaskInstalled: () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  },

  /**
   * Request connection to MetaMask
   * @returns {Promise<string>} - Connected account address
   */
  connectMetaMask: async () => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw new Error(error.message || 'Failed to connect to MetaMask');
    }
  },

  /**
   * Get current chain ID
   * @returns {Promise<string>} - Current chain ID in hex format
   */
  getCurrentChainId: async () => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      return await window.ethereum.request({ method: 'eth_chainId' });
    } catch (error) {
      console.error('Error getting chain ID:', error);
      throw new Error('Failed to get current chain ID');
    }
  },

  /**
   * Check if connected to Synergy Network
   * @param {string} network - 'testnet' or 'mainnet'
   * @returns {Promise<boolean>} - Whether connected to specified network
   */
  isConnectedToSynergyNetwork: async (network = 'testnet') => {
    try {
      const currentChainId = await walletConnectorService.getCurrentChainId();
      const targetChainId = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;
      return currentChainId === targetChainId;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  },

  /**
   * Add Synergy Network to MetaMask
   * @param {string} network - 'testnet' or 'mainnet'
   * @returns {Promise<boolean>} - Success status
   */
  addSynergyNetworkToMetaMask: async (network = 'testnet') => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const isTestnet = network === 'testnet';
    const networkData = {
      chainId: isTestnet ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID,
      chainName: isTestnet ? 'Synergy Testnet' : 'Synergy Mainnet',
      nativeCurrency: {
        name: 'Synergy',
        symbol: 'SYN',
        decimals: 18
      },
      rpcUrls: [isTestnet ? TESTNET_RPC_URL : MAINNET_RPC_URL],
      blockExplorerUrls: [isTestnet ? TESTNET_EXPLORER_URL : MAINNET_EXPLORER_URL]
    };

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkData]
      });
      return true;
    } catch (error) {
      console.error('Error adding Synergy Network to MetaMask:', error);
      throw new Error(error.message || 'Failed to add Synergy Network to MetaMask');
    }
  },

  /**
   * Switch to Synergy Network
   * @param {string} network - 'testnet' or 'mainnet'
   * @returns {Promise<boolean>} - Success status
   */
  switchToSynergyNetwork: async (network = 'testnet') => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const targetChainId = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
      return true;
    } catch (error) {
      // If the network is not added to MetaMask (error code 4902), add it
      if (error.code === 4902) {
        try {
          await walletConnectorService.addSynergyNetworkToMetaMask(network);
          return true;
        } catch (addError) {
          throw addError;
        }
      }
      throw error;
    }
  },

  /**
   * Get signer from provider
   * @returns {Promise<ethers.Signer>} - Ethers signer
   */
  getSigner: async () => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return await provider.getSigner();
    } catch (error) {
      console.error('Error getting signer:', error);
      throw new Error('Failed to get signer');
    }
  },

  /**
   * Listen for account changes
   * @param {Function} callback - Callback function to handle account changes
   * @returns {void}
   */
  onAccountsChanged: (callback) => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.on('accountsChanged', callback);
  },

  /**
   * Listen for chain changes
   * @param {Function} callback - Callback function to handle chain changes
   * @returns {void}
   */
  onChainChanged: (callback) => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.on('chainChanged', callback);
  },

  /**
   * Remove event listeners
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   * @returns {void}
   */
  removeListener: (event, callback) => {
    if (!walletConnectorService.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.removeListener(event, callback);
  }
};

export default walletConnectorService;
