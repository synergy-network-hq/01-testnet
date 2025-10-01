// src/utils/balanceFetcher.js

import axios from 'axios';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';

// API endpoints for different blockchains
const API_ENDPOINTS = {
  bitcoin: 'https://blockstream.info/api',
  ethereum: 'https://api.etherscan.io/api',
  solana: 'https://api.mainnet-beta.solana.com',
  bitcoinCash: 'https://api.blockchair.com/bitcoin-cash',
  tron: 'https://api.trongrid.io',
  cardano: 'https://api.koios.rest/api/v0',
  ripple: 'https://xrplcluster.com',
  polkadot: 'https://polkadot.api.onfinality.io/public',
  cosmos: 'https://lcd-cosmoshub.keplr.app',
  near: 'https://rpc.mainnet.near.org',
  starknet: 'https://starknet-mainnet.infura.io/v3'
};

// Token symbols and decimals
const TOKEN_INFO = {
  bitcoin: { symbol: 'BTC', decimals: 8 },
  ethereum: { symbol: 'ETH', decimals: 18 },
  solana: { symbol: 'SOL', decimals: 9 },
  bitcoinCash: { symbol: 'BCH', decimals: 8 },
  tron: { symbol: 'TRX', decimals: 6 },
  cardano: { symbol: 'ADA', decimals: 6 },
  ripple: { symbol: 'XRP', decimals: 6 },
  polkadot: { symbol: 'DOT', decimals: 10 },
  cosmos: { symbol: 'ATOM', decimals: 6 },
  near: { symbol: 'NEAR', decimals: 24 },
  starknet: { symbol: 'STRK', decimals: 18 }
};

// Price API (using CoinGecko as it's free and reliable)
const PRICE_API = 'https://api.coingecko.com/api/v3/simple/price';

export const fetchBalance = async (network, address) => {
  if (!address) {
    return { balance: '0', symbol: TOKEN_INFO[network]?.symbol || 'N/A', usd: '$0.00' };
  }

  try {
    switch (network) {
      case 'bitcoin':
        return await fetchBitcoinBalance(address);
      case 'ethereum':
        return await fetchEthereumBalance(address);
      case 'solana':
        return await fetchSolanaBalance(address);
      case 'bitcoinCash':
        return await fetchBitcoinCashBalance(address);
      case 'tron':
        return await fetchTronBalance(address);
      case 'cardano':
        return await fetchCardanoBalance(address);
      case 'ripple':
        return await fetchRippleBalance(address);
      case 'polkadot':
        return await fetchPolkadotBalance(address);
      case 'cosmos':
        return await fetchCosmosBalance(address);
      case 'near':
        return await fetchNearBalance(address);
      case 'starknet':
        return await fetchStarknetBalance(address);
      default:
        return { balance: '0', symbol: 'N/A', usd: '$0.00' };
    }
  } catch (error) {
    console.error(`Error fetching ${network} balance:`, error);
    return { balance: '0', symbol: TOKEN_INFO[network]?.symbol || 'N/A', usd: '$0.00', error: true };
  }
};

// Bitcoin balance fetching
const fetchBitcoinBalance = async (address) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.bitcoin}/address/${address}`);
    const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
    const balanceInBTC = balance / Math.pow(10, TOKEN_INFO.bitcoin.decimals);

    const price = await getTokenPrice('bitcoin');
    const usdValue = balanceInBTC * price;

    return {
      balance: balanceInBTC.toFixed(8),
      symbol: TOKEN_INFO.bitcoin.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Bitcoin balance fetch error:', error);
    return { balance: '0', symbol: 'BTC', usd: '$0.00', error: true };
  }
};

// Ethereum balance fetching
const fetchEthereumBalance = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const balance = await provider.getBalance(address);
    const balanceInETH = parseFloat(ethers.formatEther(balance));

    const price = await getTokenPrice('ethereum');
    const usdValue = balanceInETH * price;

    return {
      balance: balanceInETH.toFixed(6),
      symbol: TOKEN_INFO.ethereum.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Ethereum balance fetch error:', error);
    return { balance: '0', symbol: 'ETH', usd: '$0.00', error: true };
  }
};

// Solana balance fetching
const fetchSolanaBalance = async (address) => {
  try {
    // Use a more reliable Solana RPC endpoint
    const connection = new Connection('https://rpc.ankr.com/solana', 'confirmed');
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    const balanceInSOL = balance / Math.pow(10, TOKEN_INFO.solana.decimals);

    const price = await getTokenPrice('solana');
    const usdValue = balanceInSOL * price;

    return {
      balance: balanceInSOL.toFixed(6),
      symbol: TOKEN_INFO.solana.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Solana balance fetch error:', error);
    // Try alternative RPC endpoint
    try {
      const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/demo', 'confirmed');
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      const balanceInSOL = balance / Math.pow(10, TOKEN_INFO.solana.decimals);

      const price = await getTokenPrice('solana');
      const usdValue = balanceInSOL * price;

      return {
        balance: balanceInSOL.toFixed(6),
        symbol: TOKEN_INFO.solana.symbol,
        usd: `$${usdValue.toFixed(2)}`
      };
    } catch (fallbackError) {
      console.error('Solana fallback balance fetch error:', fallbackError);
      return { balance: '0', symbol: 'SOL', usd: '$0.00', error: true };
    }
  }
};

// Bitcoin Cash balance fetching
const fetchBitcoinCashBalance = async (address) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.bitcoinCash}/dashboards/address/${address}`);
    const balance = response.data.data[0].address.balance;
    const balanceInBCH = balance / Math.pow(10, TOKEN_INFO.bitcoinCash.decimals);

    const price = await getTokenPrice('bitcoin-cash');
    const usdValue = balanceInBCH * price;

    return {
      balance: balanceInBCH.toFixed(8),
      symbol: TOKEN_INFO.bitcoinCash.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Bitcoin Cash balance fetch error:', error);
    return { balance: '0', symbol: 'BCH', usd: '$0.00', error: true };
  }
};

// Tron balance fetching
const fetchTronBalance = async (address) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.tron}/wallet/getaccount`, {
      address: address,
      visible: true
    });
    const balance = response.data.balance || 0;
    const balanceInTRX = balance / Math.pow(10, TOKEN_INFO.tron.decimals);

    const price = await getTokenPrice('tron');
    const usdValue = balanceInTRX * price;

    return {
      balance: balanceInTRX.toFixed(6),
      symbol: TOKEN_INFO.tron.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Tron balance fetch error:', error);
    return { balance: '0', symbol: 'TRX', usd: '$0.00', error: true };
  }
};

// Cardano balance fetching
const fetchCardanoBalance = async (address) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.cardano}/address_info`, {
      _addresses: [address]
    });
    const balance = response.data[0]?.balance || 0;
    const balanceInADA = balance / Math.pow(10, TOKEN_INFO.cardano.decimals);

    const price = await getTokenPrice('cardano');
    const usdValue = balanceInADA * price;

    return {
      balance: balanceInADA.toFixed(6),
      symbol: TOKEN_INFO.cardano.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Cardano balance fetch error:', error);
    return { balance: '0', symbol: 'ADA', usd: '$0.00', error: true };
  }
};

// Ripple balance fetching
const fetchRippleBalance = async (address) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.ripple}`, {
      method: 'account_info',
      params: [{
        account: address,
        ledger_index: 'validated'
      }]
    });
    const balance = response.data.result.account_data?.Balance || 0;
    const balanceInXRP = balance / Math.pow(10, TOKEN_INFO.ripple.decimals);

    const price = await getTokenPrice('ripple');
    const usdValue = balanceInXRP * price;

    return {
      balance: balanceInXRP.toFixed(6),
      symbol: TOKEN_INFO.ripple.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Ripple balance fetch error:', error);
    return { balance: '0', symbol: 'XRP', usd: '$0.00', error: true };
  }
};

// Polkadot balance fetching
const fetchPolkadotBalance = async (address) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.polkadot}`, {
      id: 1,
      jsonrpc: '2.0',
      method: 'system_account',
      params: [address]
    });
    const balance = response.data.result?.data?.free || 0;
    const balanceInDOT = balance / Math.pow(10, TOKEN_INFO.polkadot.decimals);

    const price = await getTokenPrice('polkadot');
    const usdValue = balanceInDOT * price;

    return {
      balance: balanceInDOT.toFixed(6),
      symbol: TOKEN_INFO.polkadot.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Polkadot balance fetch error:', error);
    return { balance: '0', symbol: 'DOT', usd: '$0.00', error: true };
  }
};

// Cosmos balance fetching
const fetchCosmosBalance = async (address) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.cosmos}/cosmos/bank/v1beta1/balances/${address}`);
    const balance = response.data.balances?.find(b => b.denom === 'uatom')?.amount || 0;
    const balanceInATOM = balance / Math.pow(10, TOKEN_INFO.cosmos.decimals);

    const price = await getTokenPrice('cosmos');
    const usdValue = balanceInATOM * price;

    return {
      balance: balanceInATOM.toFixed(6),
      symbol: TOKEN_INFO.cosmos.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Cosmos balance fetch error:', error);
    return { balance: '0', symbol: 'ATOM', usd: '$0.00', error: true };
  }
};

// Near balance fetching
const fetchNearBalance = async (address) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.near}`, {
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: address
      }
    });
    const balance = response.data.result?.amount || 0;
    const balanceInNEAR = balance / Math.pow(10, TOKEN_INFO.near.decimals);

    const price = await getTokenPrice('near');
    const usdValue = balanceInNEAR * price;

    return {
      balance: balanceInNEAR.toFixed(6),
      symbol: TOKEN_INFO.near.symbol,
      usd: `$${usdValue.toFixed(2)}`
    };
  } catch (error) {
    console.error('Near balance fetch error:', error);
    return { balance: '0', symbol: 'NEAR', usd: '$0.00', error: true };
  }
};

// Starknet balance fetching
const fetchStarknetBalance = async (address) => {
  try {
    // Starknet balance fetching is more complex and requires specific libraries
    // For now, return a placeholder
    return {
      balance: '0',
      symbol: TOKEN_INFO.starknet.symbol,
      usd: '$0.00',
      error: true
    };
  } catch (error) {
    console.error('Starknet balance fetch error:', error);
    return { balance: '0', symbol: 'STRK', usd: '$0.00', error: true };
  }
};

// Get token price from CoinGecko
const getTokenPrice = async (tokenId) => {
  try {
    const response = await axios.get(`${PRICE_API}?ids=${tokenId}&vs_currencies=usd`);
    return response.data[tokenId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${tokenId}:`, error);
    return 0;
  }
};

// Fetch all balances for a wallet
export const fetchAllBalances = async (wallet) => {
  if (!wallet) {
    return {};
  }


  // Only fetch balances for addresses that exist in the wallet
  // Temporarily disable problematic networks until API endpoints are fixed
  const addressMappings = [
    { network: 'bitcoin', address: wallet.bitcoinAddress },
    { network: 'ethereum', address: wallet.ethereumAddress },
    { network: 'solana', address: wallet.solanaAddress },
    { network: 'tron', address: wallet.tronAddress },
    { network: 'ripple', address: wallet.rippleAddress },
    { network: 'near', address: wallet.nearAddress },
    { network: 'starknet', address: wallet.starknetAddress }
    // Temporarily disabled: bitcoinCash, cardano, polkadot, cosmos (API issues)
  ].filter(({ address }) => address && address !== 'undefined'); // Only include addresses that exist

  // If no addresses found, return empty object
  if (addressMappings.length === 0) {
    return {};
  }

  const balancePromises = addressMappings.map(({ network, address }) => {
    return fetchBalance(network, address).then(balance => {
      return { network, balance };
    }).catch(error => {
      console.error(`Error fetching ${network} balance:`, error);
      return { network, balance: { balance: '0', symbol: 'N/A', usd: '$0.00', error: true } };
    });
  });

  const results = await Promise.allSettled(balancePromises);

  const balances = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { network, balance } = result.value;
      balances[network] = balance;
    } else {
      const network = addressMappings[index].network;
      console.error(`Failed to fetch ${network} balance:`, result.reason);
      balances[network] = { balance: '0', symbol: 'N/A', usd: '$0.00', error: true };
    }
  });

  return balances;
};
