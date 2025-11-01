import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Clipboard,
  Alert,
  RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import { allAssets } from '../constants/allAssets';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import bitcoinlogo from '../assets/images/bitcoin_logo.png';
import ethereumlogo from '../assets/images/ethereum_logo.png';
import bnblogo from '../assets/images/bnb_logo.png';
import solanalogo from '../assets/images/solana_logo.png';
import usdclogo from '../assets/images/usdc_logo.png';
import tetherlogo from '../assets/images/tether_logo.png';
import ripplelogo from '../assets/images/ripple_logo.png';
import cardanologo from '../assets/images/cardano_logo.png';
import dogecoinlogo from '../assets/images/dogecoin_logo.png';
import TransferModal from '../components/TransferModal';
import TransactionSuccessModal from '../components/TransactionSuccessModal';
import tronlogo from '../assets/images/tron_logo.png';
import { useWallet, Asset } from '../context/WalletContext';
import Button from '../components/Button';
import { fetchAllBalances } from '../services/balanceService';
import createAllWallets, { getPrivateKey } from '../hooks/CreateWallet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchCoinPrices } from '../services/coinGeckoService';
import { saveTransaction } from '../utils/transactionHistory';
import SwipeableAssetCard from '../components/SwipeableAssetCard';
import {
  startTiming,
  endTiming,
  measureAsync,
} from '../utils/performanceMonitor';

// Logo mapping for assets (all local images)
const logoMap: { [key: string]: any } = {
  bitcoin: bitcoinlogo,
  ethereum: ethereumlogo,
  bnb_smart_chain: bnblogo,
  solana: solanalogo,
  'usd_coin_(ethereum)': usdclogo,
  'tether_(bsc)': tetherlogo,
  xrp_ledger: ripplelogo,
  cardano: cardanologo,
  dogecoin: dogecoinlogo,
  tron: tronlogo,
};

// Mock price data for assets (will be replaced by API data)
const mockPrices: { [key: string]: number } = {
  BTC: 101152.17,
  ETH: 3973.44,
  BNB: 1105.85,
  SOL: 199.98,
  USDC: 1.0,
  USDT: 1.0,
  XRP: 0.62,
  ADA: 0.58,
  DOGE: 0.15,
  TRX: 0.21,
};

// Generate initial assets from ALL assets in constants
const generateInitialAssets = (): Asset[] => {
  return allAssets.map(asset => {
    const price = mockPrices[asset.ticker] || 0;
    const balance = 0; // Start with 0 balance, will update from blockchain
    return {
      id: asset.id,
      name: asset.name,
      symbol: asset.ticker,
      logo: logoMap[asset.id] || bitcoinlogo, // Use local logo from logoMap
      price,
      balance,
      value: price * balance,
    };
  });
};

type WalletDashboardProps = NativeStackScreenProps<
  RootStackParamList,
  'WalletDashboard'
>;

function WalletDashboard({ navigation, route }: WalletDashboardProps) {
  return (
    <SafeAreaProvider style={[tw`flex-1 bg-black`]}>
      <Root navigation={navigation} route={route} />
    </SafeAreaProvider>
  );
}

function Root({ navigation, route }: WalletDashboardProps) {
  const {
    tagId,
    setTagId,
    pin,
    setPin,
    addresses,
    setAddresses,
    privateKeys,
    setPrivateKeys,
    assets,
    setAssets,
    totalValue,
  } = useWallet();
  // Set initial loading state to true if we have params (wallet generation needed)
  const [isLoading, setIsLoading] = useState(
    !!(route.params?.tagId && route.params?.pin),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] =
    useState<Asset | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [privateKeyForTransfer, setPrivateKeyForTransfer] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxData, setSuccessTxData] = useState<{
    txHash: string;
    amount: string;
    assetSymbol: string;
    recipientAddress: string;
    network: string;
  } | null>(null);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<number>(0);
  const [cachedBalances, setCachedBalances] = useState<{
    [key: string]: number;
  }>({});
  const [timeDisplay, setTimeDisplay] = useState('');

  // Update time display every 10 seconds
  useEffect(() => {
    const updateTimeDisplay = () => {
      if (lastBalanceUpdate > 0) {
        const secondsAgo = Math.floor((Date.now() - lastBalanceUpdate) / 1000);
        if (secondsAgo < 60) {
          setTimeDisplay(`${secondsAgo}s ago`);
        } else {
          const minutesAgo = Math.floor(secondsAgo / 60);
          setTimeDisplay(`${minutesAgo}m ago`);
        }
      }
    };

    updateTimeDisplay();
    const interval = setInterval(updateTimeDisplay, 10000);
    return () => clearInterval(interval);
  }, [lastBalanceUpdate]);

  // Calculate portfolio price change
  const portfolioChange = React.useMemo(() => {
    let totalChangeValue = 0;
    let totalPreviousValue = 0;

    assets.forEach(asset => {
      if (asset.priceChangePercentage !== undefined) {
        const currentValue = asset.value;
        const previousPrice =
          asset.price / (1 + asset.priceChangePercentage / 100);
        const previousValue = previousPrice * asset.balance;

        totalChangeValue += currentValue - previousValue;
        totalPreviousValue += previousValue;
      }
    });

    const changePercentage =
      totalPreviousValue !== 0
        ? (totalChangeValue / totalPreviousValue) * 100
        : 0;

    return {
      value: totalChangeValue,
      percentage: changePercentage,
    };
  }, [assets]);

  // Generate wallets if tagId and pin are provided
  useEffect(() => {
    const generateWallets = async () => {
      if (route.params?.tagId && route.params?.pin) {
        setIsLoading(true);
        const startTime = Date.now();
        try {
          // Combine tagId and PIN for extra security
          const combinedSeed = `${route.params.tagId}-${route.params.pin}`;

          console.log('[Wallet] Starting wallet generation...');
          // Generate wallets first (fast - takes ~100ms)
          const wallets = await createAllWallets(combinedSeed);
          console.log(`[Wallet] Generation took ${Date.now() - startTime}ms`);

          // Store tagId and PIN in context for private key derivation
          setTagId(combinedSeed);
          setPin(route.params.pin);

          // Store all addresses in context
          setAddresses({
            bitcoin: wallets.bitcoin,
            ethereum: wallets.ethereum,
            bsc: wallets.bsc,
            solana: wallets.solana,
          });

          // Derive private keys ONCE and store in context
          console.log('[Wallet] Deriving private keys...');
          const derivationStart = Date.now();
          const [btcKey, ethKey, bscKey, solKey] = await Promise.all([
            getPrivateKey(combinedSeed, 'bitcoin'),
            getPrivateKey(combinedSeed, 'ethereum'),
            getPrivateKey(combinedSeed, 'bsc'),
            getPrivateKey(combinedSeed, 'solana'),
          ]);
          console.log(
            `[Wallet] Private key derivation took ${
              Date.now() - derivationStart
            }ms`,
          );

          // Store private keys in context
          setPrivateKeys({
            bitcoin: btcKey,
            ethereum: ethKey,
            bsc: bscKey,
            solana: solKey,
          });

          console.log(
            `[Wallet] Total time to show UI: ${Date.now() - startTime}ms`,
          );
          // Stop loading immediately after wallet generation
          setIsLoading(false);

          // Fetch balances in background (slow - takes ~10s)
          console.log('[Wallet] Fetching balances in background...');
          startTiming('WalletDashboard - Initial Balance Fetch');
          fetchAllBalances({
            bitcoin: wallets.bitcoin,
            ethereum: wallets.ethereum,
            bsc: wallets.bsc,
            solana: wallets.solana,
          })
            .then(balances => {
              endTiming('WalletDashboard - Initial Balance Fetch');
              // Cache the balances and timestamp
              setCachedBalances(balances);
              setLastBalanceUpdate(Date.now());

              // Update assets with real balances
              setAssets((currentAssets: Asset[]) => {
                return currentAssets.map((asset: Asset) => {
                  const realBalance = balances[asset.id] ?? asset.balance;
                  return {
                    ...asset,
                    balance: realBalance,
                    value: asset.price * realBalance,
                  };
                });
              });

              console.log('Balances loaded:', balances);
            })
            .catch(error => {
              console.error('Failed to fetch balances:', error);
            });
        } catch (error) {
          console.error('Failed to create wallets:', error);
          setIsLoading(false);
        }
      }
    };

    generateWallets();
  }, [route.params]);

  // Load initial assets on first render if assets are empty
  useEffect(() => {
    if (assets.length === 0) {
      setAssets(generateInitialAssets());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real prices from CoinGecko (1 req/min) - logos are local
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Map our asset ID to CoinGecko ID (all 10 cryptocurrencies)
        const geckoIdMap: { [key: string]: string } = {
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

        // Get CoinGecko IDs from our asset IDs
        const assetIds = allAssets.map(asset => asset.id);
        const geckoIds = assetIds.map(id => geckoIdMap[id]).filter(Boolean);

        // Fetch prices from CoinGecko API
        const prices = await fetchCoinPrices(geckoIds, {
          includeMarketCap: true,
          include24hrVol: true,
          include24hrChange: true,
          includeLastUpdated: true,
        });

        // Update assets with real prices - logos are already set from local images
        setAssets((currentAssets: Asset[]) => {
          return currentAssets.map((asset: Asset) => {
            const geckoId = geckoIdMap[asset.id];
            const priceData = geckoId ? prices[geckoId] : null;

            if (priceData) {
              const newPrice = priceData.usd;
              const newValue = newPrice * asset.balance;

              return {
                ...asset,
                price: newPrice,
                value: newValue,
                priceChangePercentage: priceData.price_change_percentage,
              };
            }

            return asset;
          });
        });
      } catch (error) {
        console.error('[WalletDashboard] Error fetching data:', error);
      }
    };

    // Fetch data after initial assets are loaded
    if (assets.length > 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Periodically refresh balances (every 1 minute with caching)
  useEffect(() => {
    const refreshBalances = async () => {
      if (addresses.bitcoin || addresses.ethereum || addresses.solana) {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastBalanceUpdate;
        const oneMinute = 60 * 1000; // 60 seconds

        // Only fetch if more than 1 minute has passed AND we have a previous update
        // Skip if lastBalanceUpdate is 0 (initial state)
        if (lastBalanceUpdate === 0) {
          return;
        }

        if (timeSinceLastUpdate < oneMinute) {
          console.log(
            `[Periodic] Using cached balances. Next update in ${Math.ceil(
              (oneMinute - timeSinceLastUpdate) / 1000,
            )}s`,
          );
          return;
        }

        try {
          console.log(
            '[Periodic] Fetching updated balances (1-minute interval)...',
          );
          startTiming('WalletDashboard - Periodic Balance Fetch');
          const balances = await fetchAllBalances({
            bitcoin: addresses.bitcoin || undefined,
            ethereum: addresses.ethereum || undefined,
            bsc: addresses.bsc || undefined,
            solana: addresses.solana || undefined,
          });
          endTiming('WalletDashboard - Periodic Balance Fetch');

          // Cache the new balances and timestamp
          setCachedBalances(balances);
          setLastBalanceUpdate(now);

          // Update assets with refreshed balances
          setAssets((currentAssets: Asset[]) => {
            return currentAssets.map((asset: Asset) => {
              const realBalance = balances[asset.id] ?? asset.balance;
              return {
                ...asset,
                balance: realBalance,
                value: asset.price * realBalance,
              };
            });
          });
        } catch (error) {
          console.error('[Periodic] Error refreshing balances:', error);
        }
      }
    };

    // Only start interval if we have addresses
    if (
      !addresses.bitcoin &&
      !addresses.ethereum &&
      !addresses.bsc &&
      !addresses.solana
    ) {
      return;
    }

    // Run once immediately to check if we need to refresh
    refreshBalances();

    // Set up interval to check every 10 seconds, but only fetch every 1 minute
    const interval = setInterval(refreshBalances, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [addresses.bitcoin, addresses.ethereum, addresses.bsc, addresses.solana]); // Remove lastBalanceUpdate and setAssets from deps

  // Manual refresh handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (
        addresses.bitcoin ||
        addresses.ethereum ||
        addresses.bsc ||
        addresses.solana
      ) {
        console.log('Manual refresh: Fetching updated balances...');
        startTiming('WalletDashboard - Manual Refresh');
        // Fetch updated balances (bypasses cache)
        const balances = await fetchAllBalances({
          bitcoin: addresses.bitcoin || undefined,
          ethereum: addresses.ethereum || undefined,
          bsc: addresses.bsc || undefined,
          solana: addresses.solana || undefined,
        });
        endTiming('WalletDashboard - Manual Refresh');

        // Update cache and timestamp
        setCachedBalances(balances);
        setLastBalanceUpdate(Date.now());

        // Update assets with refreshed balances
        setAssets((currentAssets: Asset[]) => {
          return currentAssets.map((asset: Asset) => {
            const realBalance = balances[asset.id] ?? asset.balance;
            return {
              ...asset,
              balance: realBalance,
              value: asset.price * realBalance,
            };
          });
        });

        console.log('Balances refreshed:', balances);
      }
    } catch (error) {
      console.error('Error refreshing balances:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh balances. Please try again.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [addresses, setAssets]);

  // Get private key from context when asset is selected for transfer
  useEffect(() => {
    if (selectedAssetForTransfer) {
      const assetId = selectedAssetForTransfer.id;

      // Map asset to network and get private key from context
      if (assetId === 'bitcoin') {
        setPrivateKeyForTransfer(privateKeys.bitcoin || '');
      } else if (assetId === 'solana') {
        setPrivateKeyForTransfer(privateKeys.solana || '');
      } else if (assetId === 'bnb_smart_chain' || assetId === 'tether_(bsc)') {
        setPrivateKeyForTransfer(privateKeys.bsc || '');
      } else if (['ethereum', 'usd_coin_(ethereum)'].includes(assetId)) {
        setPrivateKeyForTransfer(privateKeys.ethereum || '');
      } else {
        // For other networks not yet implemented
        console.log('Network not yet supported for private key:', assetId);
        setPrivateKeyForTransfer('');
      }
    } else {
      setPrivateKeyForTransfer('');
    }
  }, [selectedAssetForTransfer, privateKeys]);

  // Network mapping for addresses - memoized
  const getNetworkForAsset = useCallback((assetId: string): string => {
    const networkMap: { [key: string]: string } = {
      bitcoin: 'bitcoin',
      ethereum: 'ethereum',
      'tether_(bsc)': 'bsc',
      'usd_coin_(ethereum)': 'ethereum',
      bnb_smart_chain: 'bsc', // BNB is native on BSC
      solana: 'solana',
      xrp_ledger: 'xrp',
      cardano: 'cardano',
      dogecoin: 'dogecoin',
      tron: 'tron',
    };
    return networkMap[assetId] || 'unknown';
  }, []);

  // Copy address to clipboard
  const copyToClipboard = useCallback(
    (address: string | null, network: string) => {
      if (!address) {
        Alert.alert('Error', 'Address not available yet');
        return;
      }
      Clipboard.setString(address);
      Alert.alert('Copied!', `${network} address copied to clipboard`);
    },
    [],
  );

  const renderAssetItem = useCallback(
    ({ item }: { item: Asset }) => (
      <SwipeableAssetCard
        item={item}
        onPress={() =>
          navigation.navigate('AssetDetail', {
            assetId: item.id,
            tagId: tagId || '',
          })
        }
      />
    ),
    [navigation, tagId],
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Asset) => item.id, []);

  return (
    <View style={tw`flex-1 bg-black`}>
      <StatusBar barStyle="light-content" />

      {/* Loading Overlay */}
      {isLoading ? (
        <View
          style={[
            tw`absolute inset-0 bg-black justify-center items-center`,
            { zIndex: 9999 },
          ]}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[fonts.pnbSemiBold, tw`text-white text-xl mt-4`]}>
            Generating your wallet...
          </Text>
          <Text style={[fonts.pnbRegular, tw`text-gray-400 text-sm mt-2`]}>
            Please wait a moment
          </Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A78BFA"
            colors={['#A78BFA']}
            title="Refreshing balances..."
            titleColor="#A78BFA"
          />
        }
      >
        <View style={[tw`justify-between p-5`]}>
          <Text style={[fonts.pnbBold, tw`text-white text-8 pt-5`]}>
            Auron Wallet
          </Text>
        </View>

        {/** Account Card Section Start**/}

        <View
          style={[
            tw`mt-5 mx-6 rounded-3xl p-6 shadow-2xl`,
            {
              backgroundColor: colors.primary.bg10,
              borderWidth: 1,
              borderColor: colors.primary.border30,
            },
          ]}
        >
          {/* Account Header */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: colors.primary.bg20 },
                ]}
              >
                <Icon name="wallet" size={20} color={colors.primary.light} />
              </View>
              <View>
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-sm`,
                    { color: colors.text.purpleLight },
                  ]}
                >
                  Main Wallet
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs`,
                    { color: colors.text.secondary },
                  ]}
                >
                  Account 1
                </Text>
              </View>
            </View>
            <TouchableOpacity style={tw`p-2`}>
              <Icon
                name="dots-vertical"
                size={20}
                color={colors.primary.light}
              />
            </TouchableOpacity>
          </View>

          {/* Balance Display */}
          <View style={tw`mb-5`}>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-sm mb-1`,
                { color: colors.text.secondary },
              ]}
            >
              Total Balance
            </Text>
            <Text
              style={[
                fonts.pnbBold,
                tw`text-5xl`,
                { color: colors.text.primary },
              ]}
            >
              $
              {totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={tw`flex-row items-center mt-2`}>
              <Icon
                name={
                  portfolioChange.percentage >= 0
                    ? 'trending-up'
                    : 'trending-down'
                }
                size={14}
                color={
                  portfolioChange.percentage >= 0
                    ? colors.status.success
                    : colors.status.error
                }
              />
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-xs ml-1`,
                  {
                    color:
                      portfolioChange.percentage >= 0
                        ? colors.status.success
                        : colors.status.error,
                  },
                ]}
              >
                {portfolioChange.percentage >= 0 ? '+' : ''}
                {portfolioChange.percentage.toFixed(2)}% ($
                {portfolioChange.value >= 0 ? '+' : ''}
                {portfolioChange.value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-xs ml-1`,
                  { color: colors.text.tertiary },
                ]}
              >
                Since last update
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <TouchableOpacity
                onPress={() => setShowSendModal(true)}
                style={[
                  tw`rounded-2xl py-3 flex-row items-center justify-center`,
                  { backgroundColor: colors.primary.bg80 },
                ]}
                activeOpacity={0.8}
              >
                <Icon name="arrow-up" size={18} color={colors.text.primary} />
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`ml-2`,
                    { color: colors.text.primary },
                  ]}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw`flex-1`}>
              <TouchableOpacity
                onPress={() => setShowReceiveModal(true)}
                style={[
                  tw`rounded-2xl py-3 flex-row items-center justify-center border-2`,
                  { borderColor: colors.primary.border50 },
                ]}
                activeOpacity={0.8}
              >
                <Icon
                  name="arrow-down"
                  size={18}
                  color={colors.primary.light}
                />
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`ml-2`,
                    { color: colors.text.purpleLight },
                  ]}
                >
                  Receive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View
            style={[
              tw`flex-row justify-between mt-4 pt-4 border-t`,
              { borderTopColor: colors.primary.border30 },
            ]}
          >
            <View style={tw`items-center flex-1`}>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-xs`,
                  { color: colors.text.secondary },
                ]}
              >
                Assets
              </Text>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base mt-1`,
                  { color: colors.text.primary },
                ]}
              >
                {assets.length}
              </Text>
            </View>
            <View
              style={[
                tw`w-px h-10`,
                { backgroundColor: colors.primary.border30 },
              ]}
            />
            <View style={tw`items-center flex-1`}>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-xs`,
                  { color: colors.text.secondary },
                ]}
              >
                Networks
              </Text>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base mt-1`,
                  { color: colors.text.primary },
                ]}
              >
                3
              </Text>
            </View>
            <View
              style={[
                tw`w-px h-10`,
                { backgroundColor: colors.primary.border30 },
              ]}
            />
            <View style={tw`items-center flex-1`}>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-xs`,
                  { color: colors.text.secondary },
                ]}
              >
                24h Change
              </Text>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base mt-1`,
                  {
                    color:
                      portfolioChange.percentage >= 0
                        ? colors.status.success
                        : colors.status.error,
                  },
                ]}
              >
                {portfolioChange.percentage >= 0 ? '+' : ''}
                {portfolioChange.percentage.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/** Account Card Section End**/}

        <View style={tw`mt-10 mx-5`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={[fonts.pnbBold, tw`text-white text-2xl`]}>
              Assets List
            </Text>
            {lastBalanceUpdate > 0 && (
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="clock-outline"
                  size={12}
                  color={colors.text.tertiary}
                />
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs ml-1`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  {timeDisplay}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={tw`mt-2 px-5 pb-4`}>
          <FlatList
            data={assets}
            renderItem={renderAssetItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      </ScrollView>

      {/* Send Asset Selector Modal */}
      <Modal
        visible={showSendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={tw`flex-1 justify-end`}>
          <View
            style={[
              tw`rounded-t-3xl p-6`,
              { backgroundColor: colors.background.card, maxHeight: '80%' },
            ]}
          >
            {/* Modal Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text
                style={[
                  fonts.pnbBold,
                  tw`text-2xl`,
                  { color: colors.text.primary },
                ]}
              >
                Select Asset to Send
              </Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Icon name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Asset List */}
            <FlatList
              data={assets}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setShowSendModal(false);
                    setSelectedAssetForTransfer(item);
                    setShowTransferModal(true);
                  }}
                  style={[
                    tw`flex-row items-center p-4 my-1 rounded-2xl`,
                    {
                      backgroundColor: colors.background.gray800,
                      borderWidth: 1,
                      borderColor: colors.border.primary,
                    },
                  ]}
                >
                  <Image source={item.logo} style={tw`w-12 h-12`} />
                  <View style={tw`flex-1 ml-3`}>
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-lg`,
                        { color: colors.text.primary },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-sm`,
                        { color: colors.text.secondary },
                      ]}
                    >
                      {item.balance.toFixed(5)} {item.symbol}
                    </Text>
                  </View>
                  <View style={tw`items-end`}>
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-base`,
                        { color: colors.text.primary },
                      ]}
                    >
                      ${item.value.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-xs`,
                        { color: colors.text.tertiary },
                      ]}
                    >
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Receive Addresses Modal */}
      <Modal
        visible={showReceiveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiveModal(false)}
      >
        <View style={tw`flex-1 justify-end`}>
          <View
            style={[
              tw`rounded-t-3xl p-6`,
              { backgroundColor: colors.background.card, maxHeight: '80%' },
            ]}
          >
            {/* Modal Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text
                style={[
                  fonts.pnbBold,
                  tw`text-2xl`,
                  { color: colors.text.primary },
                ]}
              >
                Receive Addresses
              </Text>
              <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
                <Icon name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Bitcoin Network */}
              <View style={tw`mb-6`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Image source={bitcoinlogo} style={tw`w-8 h-8 mr-2`} />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-lg`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Bitcoin Network
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => copyToClipboard(addresses.bitcoin, 'Bitcoin')}
                  style={[
                    tw`p-4 rounded-xl flex-row items-center justify-between`,
                    { backgroundColor: colors.background.gray800 },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm flex-1`,
                      { color: colors.text.secondary },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {addresses.bitcoin || 'Generating...'}
                  </Text>
                  <Icon
                    name="content-copy"
                    size={20}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mt-2`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Use for: BTC
                </Text>
              </View>

              {/* Ethereum Network */}
              <View style={tw`mb-6`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Image source={ethereumlogo} style={tw`w-8 h-8 mr-2`} />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-lg`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Ethereum Network
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    copyToClipboard(addresses.ethereum, 'Ethereum')
                  }
                  style={[
                    tw`p-4 rounded-xl flex-row items-center justify-between`,
                    { backgroundColor: colors.background.gray800 },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm flex-1`,
                      { color: colors.text.secondary },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {addresses.ethereum || 'Generating...'}
                  </Text>
                  <Icon
                    name="content-copy"
                    size={20}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mt-2`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Use for: ETH, USDC, USDT (ERC-20 tokens)
                </Text>
              </View>

              {/* BSC Network */}
              <View style={tw`mb-6`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Image source={bnblogo} style={tw`w-8 h-8 mr-2`} />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-lg`,
                      { color: colors.text.primary },
                    ]}
                  >
                    BSC Network
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => copyToClipboard(addresses.bsc, 'BSC')}
                  style={[
                    tw`p-4 rounded-xl flex-row items-center justify-between`,
                    { backgroundColor: colors.background.gray800 },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm flex-1`,
                      { color: colors.text.secondary },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {addresses.bsc || 'Generating...'}
                  </Text>
                  <Icon
                    name="content-copy"
                    size={20}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mt-2`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Use for: BNB (native), USDT (BEP-20 token)
                </Text>
              </View>

              {/* Solana Network */}
              <View style={tw`mb-6`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Image source={solanalogo} style={tw`w-8 h-8 mr-2`} />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-lg`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Solana Network
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => copyToClipboard(addresses.solana, 'Solana')}
                  style={[
                    tw`p-4 rounded-xl flex-row items-center justify-between`,
                    { backgroundColor: colors.background.gray800 },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm flex-1`,
                      { color: colors.text.secondary },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {addresses.solana || 'Generating...'}
                  </Text>
                  <Icon
                    name="content-copy"
                    size={20}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mt-2`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Use for: SOL
                </Text>
              </View>

              {/* Other Networks Note */}
              <View
                style={[
                  tw`p-4 rounded-xl`,
                  { backgroundColor: colors.primary.bg10 },
                ]}
              >
                <View style={tw`flex-row items-center mb-2`}>
                  <Icon
                    name="information"
                    size={20}
                    color={colors.primary.light}
                  />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm ml-2`,
                      { color: colors.primary.light },
                    ]}
                  >
                    Additional Networks
                  </Text>
                </View>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs`,
                    { color: colors.text.secondary },
                  ]}
                >
                  XRP, Cardano, Dogecoin, and Tron addresses will be available
                  in the next update. Currently showing Bitcoin, Ethereum, and
                  Solana networks only.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <TransferModal
        visible={showTransferModal}
        asset={selectedAssetForTransfer}
        fromAddress={
          selectedAssetForTransfer
            ? selectedAssetForTransfer.symbol === 'BTC'
              ? addresses.bitcoin || ''
              : selectedAssetForTransfer.symbol === 'SOL'
              ? addresses.solana || ''
              : selectedAssetForTransfer.symbol === 'BNB' ||
                selectedAssetForTransfer.symbol === 'USDT'
              ? addresses.bsc || ''
              : addresses.ethereum || ''
            : ''
        }
        onClose={() => {
          setShowTransferModal(false);
          setSelectedAssetForTransfer(null);
        }}
        onSuccess={async (txHash, amount, recipientAddress) => {
          if (!selectedAssetForTransfer) return;

          // Get network for the asset
          const network = getNetworkForAsset(selectedAssetForTransfer.id);

          // Get from address based on asset
          const fromAddr =
            selectedAssetForTransfer.symbol === 'BTC'
              ? addresses.bitcoin || ''
              : selectedAssetForTransfer.symbol === 'SOL'
              ? addresses.solana || ''
              : selectedAssetForTransfer.symbol === 'BNB' ||
                selectedAssetForTransfer.symbol === 'USDT'
              ? addresses.bsc || ''
              : addresses.ethereum || '';

          // Save transaction to history
          await saveTransaction({
            type: 'send',
            amount: parseFloat(amount),
            symbol: selectedAssetForTransfer.symbol,
            txHash,
            toAddress: recipientAddress,
            fromAddress: fromAddr,
            network,
          });

          // Show success modal
          setSuccessTxData({
            txHash,
            amount,
            assetSymbol: selectedAssetForTransfer.symbol,
            recipientAddress,
            network,
          });
          setShowTransferModal(false);
          setShowSuccessModal(true);
        }}
        privateKey={privateKeyForTransfer}
      />

      {/* Transaction Success Modal */}
      {successTxData && (
        <TransactionSuccessModal
          visible={showSuccessModal}
          txHash={successTxData.txHash}
          amount={successTxData.amount}
          assetSymbol={successTxData.assetSymbol}
          recipientAddress={successTxData.recipientAddress}
          network={successTxData.network}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessTxData(null);
            setSelectedAssetForTransfer(null);
          }}
        />
      )}
    </View>
  );
}

export default WalletDashboard;
