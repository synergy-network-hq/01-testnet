import axios from 'axios';

const RPC_ENDPOINTS = {
  testnet: 'http://localhost:8545',
  mainnet: 'https://rpc.synergy-network.io', // Placeholder
};

class RPCService {
  constructor() {
    this.endpoints = RPC_ENDPOINTS;
    this.currentEndpoint = RPC_ENDPOINTS.testnet;
  }

  async call(method, params = []) {
    try {
      const response = await axios.post(this.currentEndpoint, {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Date.now(),
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error(`RPC call ${method} failed:`, error);
      throw error;
    }
  }

  // Synergy-specific RPC methods
  async getBlockNumber() {
    return this.call('eth_blockNumber');
  }

  async getBlockByNumber(blockNumber, includeTransactions = false) {
    return this.call('eth_getBlockByNumber', [
      `0x${blockNumber.toString(16)}`,
      includeTransactions
    ]);
  }

  async getValidators() {
    return this.call('synergy_getValidators');
  }

  async getValidator(address) {
    return this.call('synergy_getValidator', [address]);
  }

  async getValidatorStats() {
    return this.call('synergy_getValidatorStats');
  }

  async getNetworkStats() {
    return this.call('synergy_getNetworkStats');
  }

  async registerValidator(validatorData) {
    return this.call('synergy_registerValidator', [validatorData]);
  }

  async updateValidatorPerformance(update) {
    return this.call('synergy_updateValidatorPerformance', [update]);
  }

  // Utility methods
  setEndpoint(endpoint) {
    if (this.endpoints[endpoint]) {
      this.currentEndpoint = this.endpoints[endpoint];
    } else {
      this.currentEndpoint = endpoint;
    }
  }

  getCurrentEndpoint() {
    return this.currentEndpoint;
  }

  isConnected() {
    return this.call('eth_blockNumber').then(() => true).catch(() => false);
  }
}

export default new RPCService();
