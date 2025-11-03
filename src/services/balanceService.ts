import { Asset } from '../context/WalletContext';
import { startTiming, endTiming } from '../utils/performanceMonitor';
import { ETHEREUM_RPC_URL, BSC_RPC_URL, SOLANA_RPC_URL } from '@env';

/**
 * Balance Service
 * Fetches real-time cryptocurrency balances from blockchain APIs
 */

// Timeout wrapper for fetch requests
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 5000,
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export interface BalanceResult {
  balance: number;
  error?: string;
}

/**
 * Fetch Bitcoin balance
 * Uses multiple free Bitcoin APIs with fallback
 */
export const fetchBitcoinBalance = async (
  address: string,
): Promise<BalanceResult> => {
  // Array of Bitcoin balance APIs to try
  const apis = [
    // Blockchain.info API
    {
      name: 'Blockchain.info',
      fetch: async () => {
        const response = await fetch(
          `https://blockchain.info/q/addressbalance/${address}`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const satoshis = parseInt(await response.text(), 10);
        return satoshis / 100000000; // Convert to BTC
      },
    },
    // Blockstream API
    {
      name: 'Blockstream',
      fetch: async () => {
        const response = await fetch(
          `https://blockstream.info/api/address/${address}`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const satoshis =
          (data.chain_stats?.funded_txo_sum || 0) -
          (data.chain_stats?.spent_txo_sum || 0);
        return satoshis / 100000000; // Convert to BTC
      },
    },
    // Mempool.space API
    {
      name: 'Mempool.space',
      fetch: async () => {
        const response = await fetch(
          `https://mempool.space/api/address/${address}`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const satoshis =
          (data.chain_stats?.funded_txo_sum || 0) -
          (data.chain_stats?.spent_txo_sum || 0);
        return satoshis / 100000000; // Convert to BTC
      },
    },
  ];

  // Try each API in sequence
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} for Bitcoin balance...`);
      const balance = await api.fetch();
      console.log('Bitcoin balance fetched:', {
        address,
        balance,
        api: api.name,
      });
      return { balance };
    } catch (error) {
      console.warn(
        `${api.name} failed:`,
        error instanceof Error ? error.message : error,
      );
      // Continue to next API
    }
  }

  // All APIs failed
  console.error('All Bitcoin balance APIs failed for address:', address);
  return {
    balance: 0,
    error: 'All balance APIs failed',
  };
};

/**
 * Fetch Ethereum balance
 * Uses multiple public RPC endpoints with fallback
 */
export const fetchEthereumBalance = async (
  address: string,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    ETHEREUM_RPC_URL,
    'https://eth.llamarpc.com',
    'https://ethereum-mainnet.gateway.tatum.io',
    'https://eth.drpc.org',
    'https://cloudflare-eth.com',
  ];

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data.error) continue;

      // Convert Wei to ETH (1 ETH = 10^18 Wei)
      const balanceInWei = BigInt(data.result);
      const balance = Number(balanceInWei) / 1e18;

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Fetch ERC-20 token balance
 * Supports USDC, USDT, BNB (ERC-20)
 */
export const fetchERC20Balance = async (
  address: string,
  tokenContractAddress: string,
  decimals: number,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    ETHEREUM_RPC_URL,
    'https://eth.llamarpc.com',
    'https://ethereum-mainnet.gateway.tatum.io',
    'https://eth.drpc.org',
  ];

  // ERC-20 balanceOf function signature
  // keccak256("balanceOf(address)") = 0x70a08231
  const functionSelector = '0x70a08231';
  const paddedAddress = address.slice(2).padStart(64, '0');
  const data = functionSelector + paddedAddress;

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: tokenContractAddress,
              data: data,
            },
            'latest',
          ],
          id: 1,
        }),
      });

      if (!response.ok) continue;

      const result = await response.json();
      if (result.error) continue;

      // Convert hex result to decimal
      const balanceInSmallestUnit = BigInt(result.result);
      const balance = Number(balanceInSmallestUnit) / Math.pow(10, decimals);

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch ERC-20 balance from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Fetch BNB balance (BNB Smart Chain)
 */
export const fetchBNBBalance = async (
  address: string,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    BSC_RPC_URL,
    'https://binance.llamarpc.com',
    'https://bsc.drpc.org',
  ];

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetchWithTimeout(
        rpcUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1,
          }),
        },
        3000, // 3 second timeout
      );

      if (!response.ok) continue;

      const data = await response.json();
      if (data.error) continue;

      // Convert Wei to BNB (1 BNB = 10^18 Wei)
      const balanceInWei = BigInt(data.result);
      const balance = Number(balanceInWei) / 1e18;

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Fetch BEP-20 token balance (BSC network)
 */
export const fetchBEP20Balance = async (
  address: string,
  tokenContractAddress: string,
  decimals: number,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    BSC_RPC_URL,
    'https://binance.llamarpc.com',
    'https://bsc.drpc.org',
  ];

  // BEP-20 balanceOf function signature (same as ERC-20)
  // keccak256("balanceOf(address)") = 0x70a08231
  const functionSelector = '0x70a08231';
  const paddedAddress = address.slice(2).padStart(64, '0');
  const data = functionSelector + paddedAddress;

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetchWithTimeout(
        rpcUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: tokenContractAddress,
                data: data,
              },
              'latest',
            ],
            id: 1,
          }),
        },
        3000, // 3 second timeout for BSC
      );

      if (!response.ok) continue;

      const result = await response.json();
      if (result.error) continue;

      // Convert hex result to decimal
      const balanceInSmallestUnit = BigInt(result.result);
      const balance = Number(balanceInSmallestUnit) / Math.pow(10, decimals);

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch BEP-20 balance from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Fetch Solana balance (SOL)
 * Uses public RPC endpoints
 */
export const fetchSolanaBalance = async (
  address: string,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    SOLANA_RPC_URL,
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
  ];

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data.error) continue;

      // Convert lamports to SOL (1 SOL = 10^9 lamports)
      const balanceInLamports = data.result?.value || 0;
      const balance = balanceInLamports / 1e9;

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Fetch XRP balance
 * Uses XRPL public API
 */
export const fetchXRPBalance = async (
  address: string,
): Promise<BalanceResult> => {
  const rpcEndpoints = [
    'https://s1.ripple.com:51234',
    'https://s2.ripple.com:51234',
    'https://xrplcluster.com',
  ];

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_info',
          params: [
            {
              account: address,
              ledger_index: 'current',
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data.result?.error) continue;

      // Convert drops to XRP (1 XRP = 1,000,000 drops)
      const balanceInDrops = data.result?.account_data?.Balance || 0;
      const balance = Number(balanceInDrops) / 1000000;

      return { balance };
    } catch (error) {
      console.warn(`Failed to fetch from ${rpcUrl}:`, error);
      continue;
    }
  }

  return { balance: 0, error: 'All RPC endpoints failed' };
};

/**
 * Main function to fetch balance for any asset
 */
export const fetchAssetBalance = async (
  assetId: string,
  address: string,
): Promise<BalanceResult> => {
  try {
    switch (assetId) {
      case 'bitcoin':
        return await fetchBitcoinBalance(address);

      case 'ethereum':
        return await fetchEthereumBalance(address);

      case 'usd_coin_(ethereum)':
        // USDC ERC-20 token contract
        return await fetchERC20Balance(
          address,
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          6, // USDC has 6 decimals
        );

      case 'tether_(bsc)':
        // USDT BEP-20 token contract on BSC
        return await fetchBEP20Balance(
          address,
          '0x55d398326f99059fF775485246999027B3197955',
          18, // USDT on BSC has 18 decimals
        );

      case 'bnb_smart_chain':
        return await fetchBNBBalance(address);

      case 'solana':
        return await fetchSolanaBalance(address);

      case 'xrp_ledger':
        return await fetchXRPBalance(address);

      // Placeholder for unsupported assets
      case 'cardano':
      case 'dogecoin':
      case 'tron':
        console.warn(`Balance fetching not implemented for ${assetId}`);
        return { balance: 0, error: 'Not implemented' };

      default:
        return { balance: 0, error: `Unsupported asset: ${assetId}` };
    }
  } catch (error) {
    console.error(`Error fetching balance for ${assetId}:`, error);
    return {
      balance: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Fetch all balances for multiple addresses
 */
export const fetchAllBalances = async (addresses: {
  bitcoin?: string;
  ethereum?: string;
  bsc?: string;
  solana?: string;
}): Promise<{ [assetId: string]: number }> => {
  const balances: { [assetId: string]: number } = {};

  startTiming('BalanceService - Total Fetch Time');

  // Create parallel fetch promises for all networks
  const fetchPromises: Promise<void>[] = [];

  // Fetch Bitcoin balance
  if (addresses.bitcoin) {
    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - Bitcoin');
        const btcResult = await fetchAssetBalance(
          'bitcoin',
          addresses.bitcoin!,
        );
        balances.bitcoin = btcResult.balance;
        endTiming('BalanceService - Bitcoin');
      })(),
    );
  }

  // Fetch Ethereum and ERC-20 tokens (can run in parallel with other networks)
  if (addresses.ethereum) {
    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - Ethereum');
        const ethResult = await fetchAssetBalance(
          'ethereum',
          addresses.ethereum!,
        );
        balances.ethereum = ethResult.balance;
        endTiming('BalanceService - Ethereum');
      })(),
    );

    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - USDC (ERC-20)');
        const usdcResult = await fetchAssetBalance(
          'usd_coin_(ethereum)',
          addresses.ethereum!,
        );
        balances['usd_coin_(ethereum)'] = usdcResult.balance;
        endTiming('BalanceService - USDC (ERC-20)');
      })(),
    );
  }

  // Fetch BNB and USDT from BSC network (can run in parallel)
  if (addresses.bsc) {
    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - BNB');
        const bnbResult = await fetchAssetBalance(
          'bnb_smart_chain',
          addresses.bsc!,
        );
        balances.bnb_smart_chain = bnbResult.balance;
        endTiming('BalanceService - BNB');
      })(),
    );

    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - USDT (BEP-20)');
        const usdtResult = await fetchAssetBalance(
          'tether_(bsc)',
          addresses.bsc!,
        );
        balances['tether_(bsc)'] = usdtResult.balance;
        endTiming('BalanceService - USDT (BEP-20)');
      })(),
    );
  }

  // Fetch Solana balance
  if (addresses.solana) {
    fetchPromises.push(
      (async () => {
        startTiming('BalanceService - Solana');
        const solResult = await fetchAssetBalance('solana', addresses.solana!);
        balances.solana = solResult.balance;
        endTiming('BalanceService - Solana');
      })(),
    );
  }

  // Wait for all fetches to complete in parallel
  await Promise.all(fetchPromises);

  // Fetch XRP balance (if we have an XRP address)
  // For now, XRP, ADA, DOGE, TRX will show 0
  balances.xrp_ledger = 0;
  balances.cardano = 0;
  balances.dogecoin = 0;
  balances.tron = 0;

  endTiming('BalanceService - Total Fetch Time');

  return balances;
};
