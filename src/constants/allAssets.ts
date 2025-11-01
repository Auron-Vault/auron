// Common EVM libraries to avoid repetition
const evmLibraries = [
  { name: 'ethers', install: 'npm install ethers' },
  { name: 'web3', install: 'npm install web3' },
  { name: 'viem', install: 'npm install viem' },
];

export const allAssets = [
  // ===================================================
  // Top 10 Cryptocurrencies by Market Cap
  // ===================================================

  // 1. Bitcoin (BTC)
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    ticker: 'BTC',
    chain: 'Bitcoin',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'bitcore-lib', install: 'npm install bitcore-lib' }],
  },

  // 2. Ethereum (ETH)
  {
    id: 'ethereum',
    name: 'Ethereum',
    ticker: 'ETH',
    chain: 'Ethereum',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },

  // 3. Tether (USDT) - BSC
  {
    id: 'tether_(bsc)',
    name: 'Tether',
    ticker: 'USDT',
    chain: 'BNB Smart Chain',
    type: 'EVM_TOKEN',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    libraries: evmLibraries,
  },

  // 4. BNB (BNB)
  {
    id: 'bnb_smart_chain',
    name: 'BNB',
    ticker: 'BNB',
    chain: 'BNB Smart Chain',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },

  // 5. Solana (SOL)
  {
    id: 'solana',
    name: 'Solana',
    ticker: 'SOL',
    chain: 'Solana',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: '@solana/web3.js', install: 'npm install @solana/web3.js' },
    ],
  },

  // 6. USD Coin (USDC) - Ethereum
  {
    id: 'usd_coin_(ethereum)',
    name: 'USD Coin',
    ticker: 'USDC',
    chain: 'Ethereum',
    type: 'EVM_TOKEN',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    libraries: evmLibraries,
  },

  // 7. XRP (XRP)
  {
    id: 'xrp_ledger',
    name: 'XRP',
    ticker: 'XRP',
    chain: 'XRP Ledger',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'xrpl', install: 'npm install xrpl' }],
  },

  // 8. Cardano (ADA)
  {
    id: 'cardano',
    name: 'Cardano',
    ticker: 'ADA',
    chain: 'Cardano',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: 'lucid-cardano', install: 'npm install lucid-cardano' },
      { name: '@meshsdk/core', install: 'npm install @meshsdk/core' },
    ],
  },

  // 9. Dogecoin (DOGE) - Using Bitcoin libraries
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    ticker: 'DOGE',
    chain: 'Dogecoin',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'bitcore-lib', install: 'npm install bitcore-lib' }],
  },

  // 10. TRON (TRX)
  {
    id: 'tron',
    name: 'TRON',
    ticker: 'TRX',
    chain: 'Tron',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'tronweb', install: 'npm install tronweb' }],
  },
];
