require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const path = require('path');

// Debug logging
const config = {
  SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
  SELLER_PRIVATE_KEY: process.env.SELLER_PRIVATE_KEY,
  BUYER_PRIVATE_KEY: process.env.BUYER_PRIVATE_KEY,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY
};

// Log what we found (safely)
Object.keys(config).forEach(key => {
  console.log(`${key}: ${config[key] ? 'Found' : 'Not Found'} (${typeof config[key]})`);
});

if (!config.SELLER_PRIVATE_KEY || !config.BUYER_PRIVATE_KEY) {
  throw new Error('Missing private keys in .env file');
}

if (!config.SEPOLIA_RPC_URL) {
  throw new Error('Missing SEPOLIA_RPC_URL in .env file');
}

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    root: path.resolve(__dirname),
    sources: path.resolve(__dirname, "contracts"),
    artifacts: path.resolve(__dirname, "artifacts"),
    cache: path.resolve(__dirname, "cache")
  },
  networks: {
    sepolia: {
      url: config.SEPOLIA_RPC_URL,
      accounts: [
        config.SELLER_PRIVATE_KEY,
        config.BUYER_PRIVATE_KEY
      ]
    }
  }
};