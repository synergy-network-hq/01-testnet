require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: [] // Leave empty for Safe deployment
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};