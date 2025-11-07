import { COIN_GECKO_API_KEY } from '@env';
import { getCachedImageUrl, cacheImageUrl } from '../utils/imageCacheManager';

// CoinGecko API configuration
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = COIN_GECKO_API_KEY || '';

// Rate limiting: 10 requests per minute (10 rpm)
const RATE_LIMIT_MS = 6 * 1000; // 6 seconds (60s / 10 req = 6s per request)
let lastRequestTime = 0;
let cachedPrices: { [key: string]: CoinPrice } = {};
let previousPrices: { [key: string]: number } = {}; // Store previous prices for change calculation
let cachedImages: { [key: string]: CoinImage } = {};
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 1000; // Cache prices for 60 seconds
// Images are cached permanently in AsyncStorage (no expiration)

// Mapping from our asset IDs to CoinGecko IDs
const assetIdToCoinGeckoId: { [key: string]: string } = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  'tether_(ethereum)': 'tether',
  bnb_smart_chain: 'binancecoin',
  solana: 'solana',
  'usd_coin_(ethereum)': 'usd-coin',
  xrp_ledger: 'ripple',
  cardano: 'cardano',
  dogecoin: 'dogecoin',
  tron: 'tron',
};

// Mapping from ticker symbols to CoinGecko IDs
const tickerToCoinGeckoId: { [key: string]: string } = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
};

export interface CoinPrice {
  usd: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
  price_change_percentage?: number; // Our calculated change since last fetch
  previous_price?: number; // Previous price for reference
}

export interface CoinImage {
  thumb: string;
  small: string;
  large: string;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: CoinImage;
}

export interface PriceResponse {
  [coinId: string]: CoinPrice;
}

/**
 * Wait for rate limit to be satisfied
 */
const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
};

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  const now = Date.now();
  return (
    now - cacheTimestamp < CACHE_DURATION_MS &&
    Object.keys(cachedPrices).length > 0
  );
};

/**
 * Fetch prices for multiple coins from CoinGecko API
 * Respects 10 req/min rate limit and caches results
 * Returns cached data immediately if available, then updates in background if needed
 */
export const fetchCoinPrices = async (
  coinIds: string[],
  options: {
    includeMarketCap?: boolean;
    include24hrVol?: boolean;
    include24hrChange?: boolean;
    includeLastUpdated?: boolean;
  } = {},
): Promise<PriceResponse> => {
  try {
    // Return cached data immediately if still valid
    if (isCacheValid()) {
      console.log('[CoinGecko] Returning cached prices');
      return cachedPrices;
    }

    // Check if we have stale cache to return while fetching fresh data
    const hasStaleCache = Object.keys(cachedPrices).length > 0;

    // If within rate limit window and we have stale cache, return it immediately
    // Fresh data will be fetched on next call after rate limit expires
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_MS && hasStaleCache) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastRequest) / 1000);
      console.log(
        `[CoinGecko] Rate limited. Returning stale cache. Fresh data in ${waitTime}s`,
      );
      return cachedPrices;
    }

    // Convert our asset IDs to CoinGecko IDs
    const geckoIds = coinIds
      .map(id => assetIdToCoinGeckoId[id] || tickerToCoinGeckoId[id] || id)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    // Wait for rate limit before making fresh request
    await waitForRateLimit();

    const params = new URLSearchParams({
      ids: geckoIds.join(','),
      vs_currencies: 'usd',
      include_market_cap: options.includeMarketCap ? 'true' : 'false',
      include_24hr_vol: options.include24hrVol ? 'true' : 'false',
      include_24hr_change: options.include24hrChange ? 'true' : 'false',
      include_last_updated_at: options.includeLastUpdated ? 'true' : 'false',
    });

    const url = `${COINGECKO_BASE_URL}/simple/price?${params.toString()}&x_cg_demo_api_key=${API_KEY}`;

    console.log('[CoinGecko] Fetching fresh prices from API...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: PriceResponse = await response.json();

    // Calculate price changes and update cache
    const enrichedData: PriceResponse = {};

    Object.keys(data).forEach(coinId => {
      const currentPrice = data[coinId].usd;
      const prevPrice = previousPrices[coinId];

      enrichedData[coinId] = {
        ...data[coinId],
      };

      // Calculate percentage change if we have a previous price
      if (prevPrice !== undefined && prevPrice !== 0) {
        const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
        enrichedData[coinId].price_change_percentage = priceChange;
        enrichedData[coinId].previous_price = prevPrice;
      }

      // Store current price as previous for next comparison
      previousPrices[coinId] = currentPrice;
    });

    // Update cache
    cachedPrices = enrichedData;
    cacheTimestamp = Date.now();
    console.log('[CoinGecko] Fresh prices cached');

    return enrichedData;
  } catch (error) {
    console.error('[CoinGecko] Error fetching prices:', error);

    // Return cached data if available, even if expired
    if (Object.keys(cachedPrices).length > 0) {
      console.log('[CoinGecko] Returning cached prices after error');
      return cachedPrices;
    }

    throw error;
  }
};

/**
 * Get price for a single coin by asset ID or ticker
 */
export const getCoinPrice = async (
  assetIdOrTicker: string,
  options: {
    includeMarketCap?: boolean;
    include24hrVol?: boolean;
    include24hrChange?: boolean;
    includeLastUpdated?: boolean;
  } = {},
): Promise<CoinPrice | null> => {
  try {
    const geckoId =
      assetIdToCoinGeckoId[assetIdOrTicker] ||
      tickerToCoinGeckoId[assetIdOrTicker] ||
      assetIdOrTicker;

    const prices = await fetchCoinPrices([geckoId], options);
    return prices[geckoId] || null;
  } catch (error) {
    console.error(
      `[CoinGecko] Error fetching price for ${assetIdOrTicker}:`,
      error,
    );
    return null;
  }
};

/**
 * Force refresh prices (bypasses cache)
 * Note: This preserves previous prices for change calculation
 */
export const refreshPrices = async (
  coinIds: string[],
): Promise<PriceResponse> => {
  // Clear cache to force fresh fetch (but keep previous prices)
  cachedPrices = {};
  cacheTimestamp = 0;
  return fetchCoinPrices(coinIds);
};

/**
 * Reset price change tracking (clears previous prices)
 */
export const resetPriceTracking = (): void => {
  previousPrices = {};
  cachedPrices = {};
  cacheTimestamp = 0;
};

/**
 * Get current cache status
 */
export const getCacheStatus = () => ({
  isValid: isCacheValid(),
  cacheAge: Date.now() - cacheTimestamp,
  cachedCoins: Object.keys(cachedPrices),
  cachedImages: Object.keys(cachedImages),
  trackedCoins: Object.keys(previousPrices),
  lastRequestTime,
  nextRequestAvailable: Math.max(
    0,
    RATE_LIMIT_MS - (Date.now() - lastRequestTime),
  ),
});

/**
 * Fetch coin images from CoinGecko API
 * Returns image URLs (thumb, small, large) for each coin
 * Caches images permanently in AsyncStorage (never expires)
 */
export const fetchCoinImages = async (
  coinIds: string[],
): Promise<{ [coinId: string]: CoinImage }> => {
  try {
    // Convert our asset IDs to CoinGecko IDs
    const geckoIds = coinIds
      .map(id => assetIdToCoinGeckoId[id] || tickerToCoinGeckoId[id] || id)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    const imageMap: { [coinId: string]: CoinImage } = {};

    // First, check AsyncStorage for cached images
    const cachedChecks = await Promise.all(
      geckoIds.map(async geckoId => {
        const cached = await getCachedImageUrl(geckoId);
        return { geckoId, cached };
      }),
    );

    // Identify which coins need fetching
    const needsFetching: string[] = [];
    cachedChecks.forEach(({ geckoId, cached }) => {
      if (cached) {
        imageMap[geckoId] = {
          thumb: cached,
          small: cached,
          large: cached,
        };
      } else {
        needsFetching.push(geckoId);
      }
    });

    // If all images are cached, return immediately
    if (needsFetching.length === 0) {
      cachedImages = imageMap;
      return imageMap;
    }

    // Fetch missing images from API
    await waitForRateLimit();

    const params = new URLSearchParams({
      vs_currency: 'usd',
      ids: needsFetching.join(','),
      per_page: '250',
      page: '1',
      sparkline: 'false',
    });

    const url = `${COINGECKO_BASE_URL}/coins/markets?${params.toString()}&x_cg_demo_api_key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: Array<{
      id: string;
      symbol: string;
      name: string;
      image: string;
    }> = await response.json();

    console.log(
      '[DEBUG] API returned coins:',
      data.map(c => c.id),
    );

    // Process fetched images and cache them
    const cachePromises = data.map(async coin => {
      imageMap[coin.id] = {
        thumb: coin.image,
        small: coin.image,
        large: coin.image,
      };
      // Cache to AsyncStorage
      await cacheImageUrl(coin.id, coin.image);
    });

    await Promise.all(cachePromises);

    // Update in-memory cache
    cachedImages = imageMap;

    return imageMap;
  } catch (error) {
    console.error('[CoinGecko] Error fetching coin images:', error);

    // Return in-memory cached images if available
    if (Object.keys(cachedImages).length > 0) {
      return cachedImages;
    }

    throw error;
  }
};

/**
 * Get image URL for a single coin
 */
export const getCoinImage = async (
  assetIdOrTicker: string,
  size: 'thumb' | 'small' | 'large' = 'small',
): Promise<string | null> => {
  try {
    const geckoId =
      assetIdToCoinGeckoId[assetIdOrTicker] ||
      tickerToCoinGeckoId[assetIdOrTicker] ||
      assetIdOrTicker;

    const images = await fetchCoinImages([geckoId]);
    const coinImage = images[geckoId];

    return coinImage ? coinImage[size] : null;
  } catch (error) {
    console.error(
      `[CoinGecko] Error fetching image for ${assetIdOrTicker}:`,
      error,
    );
    return null;
  }
};
