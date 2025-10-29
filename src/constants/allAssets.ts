// Common EVM libraries to avoid repetition
const evmLibraries = [
  { name: 'ethers', install: 'npm install ethers' },
  { name: 'web3', install: 'npm install web3' },
  { name: 'viem', install: 'npm install viem' },
];

export const allAssets = [
  // ===================================================
  // Category 1: NON_EVM (Native Coins)
  // ===================================================
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    ticker: 'BTC',
    chain: 'Bitcoin',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'bitcore-lib', install: 'npm install bitcore-lib' }],
  },
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
  {
    id: 'xrp_ledger',
    name: 'XRP Ledger',
    ticker: 'XRP',
    chain: 'XRP Ledger',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'xrpl', install: 'npm install xrpl' }],
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    ticker: 'DOT',
    chain: 'Polkadot',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: '@polkadot/api', install: 'npm install @polkadot/api' },
    ],
  },
  {
    id: 'tron',
    name: 'Tron',
    ticker: 'TRX',
    chain: 'Tron',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'tronweb', install: 'npm install tronweb' }],
  },
  {
    id: 'near_protocol',
    name: 'NEAR Protocol',
    ticker: 'NEAR',
    chain: 'NEAR Protocol',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [{ name: 'near-api-js', install: 'npm install near-api-js' }],
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    ticker: 'ATOM',
    chain: 'Cosmos',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: '@cosmjs/stargate', install: 'npm install @cosmjs/stargate' },
    ],
  },
  {
    id: 'stellar',
    name: 'Stellar',
    ticker: 'XLM',
    chain: 'Stellar',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      {
        name: '@stellar/stellar-sdk',
        install: 'npm install @stellar/stellar-sdk',
      },
    ],
  },
  {
    id: 'aptos',
    name: 'Aptos',
    ticker: 'APT',
    chain: 'Aptos',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: '@aptos-labs/ts-sdk', install: 'npm install @aptos-labs/ts-sdk' },
    ],
  },
  {
    id: 'sui',
    name: 'Sui',
    ticker: 'SUI',
    chain: 'Sui',
    type: 'NON_EVM_COIN',
    contractAddress: null,
    libraries: [
      { name: '@mysten/sui.js', install: 'npm install @mysten/sui.js' },
    ],
  },

  // ===================================================
  // Category 2: EVM (Native Coins)
  // ===================================================
  {
    id: 'ethereum',
    name: 'Ethereum',
    ticker: 'ETH',
    chain: 'Ethereum',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },
  {
    id: 'bnb_smart_chain',
    name: 'BNB Smart Chain',
    ticker: 'BNB',
    chain: 'BNB Smart Chain',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },
  {
    id: 'polygon_pos',
    name: 'Polygon PoS',
    ticker: 'MATIC',
    chain: 'Polygon PoS',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },
  {
    id: 'avalanche_c-chain',
    name: 'Avalanche C-Chain',
    ticker: 'AVAX',
    chain: 'Avalanche C-Chain',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },
  {
    id: 'fantom_opera',
    name: 'Fantom Opera',
    ticker: 'FTM',
    chain: 'Fantom Opera',
    type: 'EVM_COIN',
    contractAddress: null,
    libraries: evmLibraries,
  },

  // ===================================================
  // Category 3: NON_EVM Tokens
  // ===================================================
  {
    id: 'usd_coin_(solana)',
    name: 'USD Coin (Solana)',
    ticker: 'USDC',
    chain: 'Solana',
    type: 'NON_EVM_TOKEN',
    contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // SPL Token
    libraries: [
      { name: '@solana/web3.js', install: 'npm install @solana/web3.js' },
    ],
  },
  {
    id: 'tether_(tron)',
    name: 'Tether (Tron)',
    ticker: 'USDT',
    chain: 'Tron',
    type: 'NON_EVM_TOKEN',
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRC-20 Token
    libraries: [{ name: 'tronweb', install: 'npm install tronweb' }],
  },

  // ===================================================
  // Category 4: EVM Tokens (Stablecoins & Others)
  // ===================================================
  {
    id: 'usd_coin_(ethereum)',
    name: 'USD Coin (Ethereum)',
    ticker: 'USDC',
    chain: 'Ethereum',
    type: 'EVM_TOKEN',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // ERC-20
    libraries: evmLibraries,
  },
  {
    id: 'tether_(ethereum)',
    name: 'Tether (Ethereum)',
    ticker: 'USDT',
    chain: 'Ethereum',
    type: 'EVM_TOKEN',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // ERC-20
    libraries: evmLibraries,
  },
  {
    id: 'dai_(ethereum)',
    name: 'Dai (Ethereum)',
    ticker: 'DAI',
    chain: 'Ethereum',
    type: 'EVM_TOKEN',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // ERC-20
    libraries: evmLibraries,
  },
  {
    id: 'tether_(bnb_smart_chain)',
    name: 'Tether (BNB Smart Chain)',
    ticker: 'USDT',
    chain: 'BNB Smart Chain',
    type: 'EVM_TOKEN',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955', // BEP-20
    libraries: evmLibraries,
  },
  {
    id: 'usd_coin_(bnb_smart_chain)',
    name: 'USD Coin (BNB Smart Chain)',
    ticker: 'USDC',
    chain: 'BNB Smart Chain',
    type: 'EVM_TOKEN',
    contractAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // BEP-20
    libraries: evmLibraries,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    ticker: 'ARB',
    chain: 'Arbitrum',
    type: 'EVM_TOKEN',
    contractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548', // Governance Token
    libraries: evmLibraries,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    ticker: 'OP',
    chain: 'Optimism',
    type: 'EVM_TOKEN',
    contractAddress: '0x4200000000000000000000000000000000000042', // Governance Token
    libraries: evmLibraries,
  },
];
