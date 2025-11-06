import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Alert,
  ActivityIndicator,
  StatusBar,
  InteractionManager,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import { useWallet, Asset } from '../context/WalletContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TransferModal from '../components/TransferModal';
import { getAssetTransactionHistory } from '../utils/transactionHistory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startTiming, endTiming } from '../utils/performanceMonitor';
import QRCode from 'react-qr-code';

type Props = NativeStackScreenProps<RootStackParamList, 'AssetDetail'>;

type Transaction = {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  symbol: string;
  date: string;
  txHash?: string;
};

// Memoized Transaction Item Component
const TransactionItem = React.memo(
  ({
    item,
    asset,
    index,
  }: {
    item: Transaction;
    asset: Asset;
    index: number;
  }) => (
    <View
      key={item.id}
      style={[
        tw`flex-row items-center justify-between py-4 px-4 mb-2 rounded-xl`,
        { backgroundColor: colors.background.card },
      ]}
    >
      <View style={tw`flex-row items-center flex-1`}>
        <View
          style={[
            tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
            {
              backgroundColor:
                item.type === 'send'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
            },
          ]}
        >
          <Icon
            name={item.type === 'send' ? 'arrow-up' : 'arrow-down'}
            size={20}
            color={
              item.type === 'send' ? colors.status.error : colors.status.success
            }
          />
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              fonts.pnbSemiBold,
              tw`text-sm`,
              { color: colors.text.primary },
            ]}
          >
            {item.type === 'send' ? 'Sent' : 'Received'} {item.symbol}
          </Text>
          <Text
            style={[
              fonts.pnbRegular,
              tw`text-xs`,
              { color: colors.text.tertiary },
            ]}
          >
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={tw`items-end`}>
        <Text
          style={[
            fonts.pnbSemiBold,
            tw`text-sm`,
            {
              color:
                item.type === 'send'
                  ? colors.status.error
                  : colors.status.success,
            },
          ]}
        >
          {item.type === 'send' ? '-' : '+'}
          {item.amount.toFixed(6)}
        </Text>
        <Text
          style={[
            fonts.pnbRegular,
            tw`text-xs`,
            { color: colors.text.tertiary },
          ]}
        >
          ${(item.amount * asset.price).toFixed(2)}
        </Text>
      </View>
    </View>
  ),
);

const AssetDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assetId, tagId } = route.params;
  const { assets, addresses, privateKeys } = useWallet();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [privateKeyForAsset, setPrivateKeyForAsset] = useState('');
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Track screen mount time
  useEffect(() => {
    startTiming(`AssetDetail[${assetId}] - Screen Load`);
    return () => {
      endTiming(`AssetDetail[${assetId}] - Screen Load`);
    };
  }, [assetId]);

  // Get current asset from context - simple lookup, no complex memoization
  const asset = useMemo(
    () => assets.find(a => a.id === assetId),
    [assets, assetId],
  );

  // Load transactions callback (defined before useEffect that uses it)
  const loadTransactions = useCallback(async (symbol: string) => {
    startTiming(`AssetDetail[${symbol}] - Load Transactions`);
    setLoadingTxs(true);
    try {
      const history = await getAssetTransactionHistory(symbol);
      const converted: Transaction[] = history.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        symbol: tx.symbol,
        date: tx.date,
        txHash: tx.txHash,
      }));
      setTxs(converted);
      endTiming(`AssetDetail[${symbol}] - Load Transactions`);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTxs([]);
      endTiming(`AssetDetail[${symbol}] - Load Transactions`);
    } finally {
      setLoadingTxs(false);
    }
  }, []);

  // Get private key from context when asset changes (no derivation needed!)
  useEffect(() => {
    if (!asset) {
      setPrivateKeyForAsset('');
      return;
    }

    const assetIdVal = asset.id;

    // Map asset to network and get private key from context
    if (assetIdVal === 'bitcoin') {
      setPrivateKeyForAsset(privateKeys.bitcoin || '');
    } else if (assetIdVal === 'solana' || assetIdVal === 'usd_coin_(solana)') {
      setPrivateKeyForAsset(privateKeys.solana || '');
    } else if (
      assetIdVal === 'bnb_smart_chain' ||
      assetIdVal === 'tether_(bsc)'
    ) {
      setPrivateKeyForAsset(privateKeys.bsc || '');
    } else if (['ethereum', 'usd_coin_(ethereum)'].includes(assetIdVal)) {
      setPrivateKeyForAsset(privateKeys.ethereum || '');
    } else {
      setPrivateKeyForAsset('');
    }
  }, [asset?.id, privateKeys]);

  // Load transactions AFTER screen is visible (lazy loading with InteractionManager)
  useEffect(() => {
    if (!asset) return;

    // Wait for screen transition to complete before loading transactions
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      loadTransactions(asset.symbol);
    });

    return () => interactionPromise.cancel();
  }, [asset?.symbol, loadTransactions]);

  const copyAddress = useCallback(() => {
    if (!asset) return;

    let address = '';
    if (asset.symbol === 'BTC') {
      address = addresses.bitcoin || '';
    } else if (asset.symbol === 'SOL' || asset.id === 'usd_coin_(solana)') {
      address = addresses.solana || '';
    } else if (asset.symbol === 'BNB' || asset.symbol === 'USDT') {
      address = addresses.bsc || '';
    } else {
      address = addresses.ethereum || '';
    }

    if (address) {
      Clipboard.setString(address);
      Alert.alert(
        'Address Copied',
        `${asset.symbol} address copied to clipboard`,
      );
    }
  }, [asset, addresses]);

  const addressForDisplay = useMemo(() => {
    if (!asset) return 'Generating...';
    const symbol = asset.symbol;
    if (symbol === 'BTC') return addresses.bitcoin || 'Generating...';
    if (symbol === 'SOL' || asset.id === 'usd_coin_(solana)')
      return addresses.solana || 'Generating...';
    if (symbol === 'BNB' || symbol === 'USDT')
      return addresses.bsc || 'Generating...';
    return addresses.ethereum || 'Generating...';
  }, [asset, addresses]);

  // Optimized FlatList callbacks
  const renderTransaction = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <TransactionItem item={item} asset={asset!} index={index} />
    ),
    [asset],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  if (!asset) {
    return (
      <SafeAreaView
        style={[tw`flex-1`, { backgroundColor: colors.background.primary }]}
      >
        <StatusBar barStyle="light-content" />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[fonts.pnbRegular, { color: colors.text.secondary }]}>
            Asset not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: colors.background.primary }]}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw`px-6 pt-4 pb-6`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mb-6`}
          >
            <Icon name="arrow-left" size={28} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Asset Info */}
          <View style={tw`items-center mb-6`}>
            <Image source={asset.logo} style={tw`w-20 h-20 mb-4`} />
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-2xl mb-2`,
                { color: colors.text.primary },
              ]}
            >
              {asset.name}
            </Text>
            <Text
              style={[
                fonts.pnbBold,
                tw`text-4xl mb-2`,
                { color: colors.text.primary },
              ]}
            >
              {asset.balance.toFixed(6)} {asset.symbol}
            </Text>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-xl`,
                { color: colors.text.secondary },
              ]}
            >
              ${asset.value.toFixed(2)}
            </Text>
            {asset.priceChangePercentage !== undefined && (
              <View style={tw`flex-row items-center mt-2`}>
                <Icon
                  name={
                    asset.priceChangePercentage >= 0
                      ? 'trending-up'
                      : 'trending-down'
                  }
                  size={16}
                  color={
                    asset.priceChangePercentage >= 0
                      ? colors.status.success
                      : colors.status.error
                  }
                />
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-sm ml-1`,
                    {
                      color:
                        asset.priceChangePercentage >= 0
                          ? colors.status.success
                          : colors.status.error,
                    },
                  ]}
                >
                  {asset.priceChangePercentage >= 0 ? '+' : ''}
                  {asset.priceChangePercentage.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row gap-4 mb-6`}>
            <TouchableOpacity
              onPress={() => setShowTransferModal(true)}
              style={[
                tw`flex-1 py-4 rounded-xl flex-row items-center justify-center`,
                { backgroundColor: colors.primary.main },
              ]}
            >
              <Icon name="send" size={20} color={colors.background.primary} />
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base ml-2`,
                  { color: colors.background.primary },
                ]}
              >
                Send
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowReceive(true)}
              style={[
                tw`flex-1 py-4 rounded-xl flex-row items-center justify-center`,
                { backgroundColor: colors.background.card },
              ]}
            >
              <Icon name="download" size={20} color={colors.primary.main} />
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base ml-2`,
                  { color: colors.primary.main },
                ]}
              >
                Receive
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Info */}
          <View
            style={[
              tw`p-4 rounded-xl`,
              { backgroundColor: colors.background.card },
            ]}
          >
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-sm mb-2`,
                { color: colors.text.tertiary },
              ]}
            >
              Current Price
            </Text>
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-2xl`,
                { color: colors.text.primary },
              ]}
            >
              ${asset.price.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={tw`px-6 pb-6`}>
          <Text
            style={[
              fonts.pnbSemiBold,
              tw`text-lg mb-4`,
              { color: colors.text.primary },
            ]}
          >
            Recent Transactions
          </Text>

          {loadingTxs ? (
            <View style={tw`py-8 items-center`}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : txs.length > 0 ? (
            <FlatList
              data={txs}
              renderItem={renderTransaction}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
            />
          ) : (
            <View
              style={[
                tw`py-12 items-center rounded-xl`,
                { backgroundColor: colors.background.card },
              ]}
            >
              <Icon
                name="history"
                size={48}
                color={colors.text.tertiary}
                style={tw`mb-2`}
              />
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-sm`,
                  { color: colors.text.tertiary },
                ]}
              >
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Receive Modal */}
      {showReceive && (
        <View
          style={[
            tw`absolute inset-0`,
            { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
          ]}
        >
          <TouchableOpacity
            style={tw`flex-1`}
            activeOpacity={1}
            onPress={() => setShowReceive(false)}
          >
            <View style={tw`flex-1 justify-center items-center px-6`}>
              <View
                style={[
                  tw`w-full p-6 rounded-2xl max-w-md`,
                  { backgroundColor: colors.background.card },
                ]}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={tw`flex-row justify-between items-center mb-6`}>
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-xl`,
                        { color: colors.text.primary },
                      ]}
                    >
                      Receive {asset.symbol}
                    </Text>
                    <TouchableOpacity onPress={() => setShowReceive(false)}>
                      <Icon
                        name="close"
                        size={24}
                        color={colors.text.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* QR Code and Address Display */}
                  <View style={tw`items-center mb-6`}>
                    <View
                      style={[
                        tw`p-6 rounded-2xl w-full items-center`,
                        { backgroundColor: colors.background.primary },
                      ]}
                    >
                      {addressForDisplay !== 'Generating...' ? (
                        <>
                          {/* QR Code */}
                          <View
                            style={[
                              tw`p-4 rounded-2xl mb-4 items-center`,
                              { backgroundColor: '#FFFFFF' },
                            ]}
                          >
                            <QRCode
                              value={addressForDisplay}
                              size={200}
                              bgColor="#FFFFFF"
                              fgColor="#000000"
                            />
                          </View>
                          <Text
                            style={[
                              fonts.pnbSemiBold,
                              tw`text-center text-sm mb-3`,
                              { color: colors.text.secondary },
                            ]}
                          >
                            Your {asset.symbol} Address
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              Clipboard.setString(addressForDisplay);
                              Alert.alert(
                                'Copied!',
                                'Address copied to clipboard',
                              );
                            }}
                            style={[
                              tw`p-4 rounded-xl flex-row items-center justify-between w-full`,
                              { backgroundColor: colors.background.gray800 },
                            ]}
                          >
                            <Text
                              style={[
                                fonts.pnbRegular,
                                tw`text-sm flex-1 mr-3`,
                                { color: colors.text.primary },
                              ]}
                              numberOfLines={3}
                            >
                              {addressForDisplay}
                            </Text>
                            <Icon
                              name="content-copy"
                              size={24}
                              color={colors.primary.light}
                            />
                          </TouchableOpacity>
                          <Text
                            style={[
                              fonts.pnbRegular,
                              tw`text-xs mt-3 text-center`,
                              { color: colors.text.tertiary },
                            ]}
                          >
                            Scan QR or tap to copy address
                          </Text>
                        </>
                      ) : (
                        <View style={tw`items-center justify-center py-8`}>
                          <ActivityIndicator
                            size="large"
                            color={colors.primary.main}
                          />
                          <Text
                            style={[
                              fonts.pnbRegular,
                              tw`text-sm mt-3`,
                              { color: colors.text.secondary },
                            ]}
                          >
                            Generating address...
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Network Info */}
                  <View
                    style={[
                      tw`p-4 rounded-xl mb-4`,
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
                        Important
                      </Text>
                    </View>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-xs`,
                        { color: colors.text.secondary },
                      ]}
                    >
                      Only send {asset.symbol} to this address. Sending other
                      assets may result in permanent loss.
                    </Text>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setShowReceive(false)}
                    style={[
                      tw`py-4 rounded-xl flex-row items-center justify-center`,
                      { backgroundColor: colors.primary.main },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-base`,
                        { color: colors.background.primary },
                      ]}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Transfer Modal */}
      <TransferModal
        visible={showTransferModal}
        asset={asset}
        fromAddress={addressForDisplay}
        onClose={() => setShowTransferModal(false)}
        onSuccess={async (txHash, amount, recipientAddress) => {
          setShowTransferModal(false);
          // Reload transactions
          if (asset) {
            await loadTransactions(asset.symbol);
          }
        }}
        privateKey={privateKeyForAsset}
      />
    </SafeAreaView>
  );
};

export default AssetDetailScreen;
