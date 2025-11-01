import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { Asset } from '../context/WalletContext';
import Button from '../components/Button';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TransferModal from '../components/TransferModal';
import { getPrivateKey } from './CreateWallet';
import { getAssetTransactionHistory } from '../utils/transactionHistory';

type Transaction = {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  symbol: string;
  date: string;
  txHash?: string;
};

type UseAssetDetailsParams = {
  onSendPress?: (asset: Asset, amount: number) => void;
  tagId?: string; // Add tagId for deriving private keys
};

// Memoized Transaction Item Component
const TransactionItem = React.memo(
  ({
    item,
    asset,
    index,
    total,
  }: {
    item: Transaction;
    asset: Asset;
    index: number;
    total: number;
  }) => (
    <View
      style={tw`flex-row justify-between py-3 ${
        index !== total - 1 ? 'border-b border-gray-800' : ''
      }`}
    >
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center mb-1`}>
          <Text style={tw`text-lg mr-2`}>
            {item.type === 'send' ? '↑' : '↓'}
          </Text>
          <Text style={[fonts.pnbSemiBold, tw`text-white text-base`]}>
            {item.type === 'send' ? 'Sent' : 'Received'}
          </Text>
        </View>
        <Text style={[fonts.pnbRegular, tw`text-gray-400 text-xs`]}>
          {new Date(item.date).toLocaleString()}
        </Text>
        {item.txHash && (
          <Text
            style={[fonts.pnbRegular, tw`text-gray-500 text-xs mt-1`]}
            numberOfLines={1}
          >
            {item.txHash.substring(0, 16)}...
          </Text>
        )}
      </View>
      <View style={tw`items-end justify-center`}>
        <Text
          style={[
            fonts.pnbBold,
            tw`text-base ${
              item.type === 'send' ? 'text-red-400' : 'text-green-400'
            }`,
          ]}
        >
          {item.type === 'send' ? '-' : '+'}
          {item.amount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 5,
          })}{' '}
          {item.symbol}
        </Text>
        <Text style={[fonts.pnbRegular, tw`text-gray-400 text-xs mt-1`]}>
          ${(item.amount * asset.price).toFixed(2)}
        </Text>
      </View>
    </View>
  ),
);

export default function useAssetDetails(params?: UseAssetDetailsParams) {
  const [visible, setVisible] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showReceive, setShowReceive] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [privateKeyForAsset, setPrivateKeyForAsset] = useState('');
  const { addresses, assets } = useWallet();

  // Get asset from context
  const currentAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find(a => a.id === selectedAssetId) || null;
  }, [selectedAssetId, assets]);

  // Extract only the values we need to prevent unnecessary rerenders
  const assetId = currentAsset?.id;
  const assetName = currentAsset?.name;
  const assetSymbol = currentAsset?.symbol;
  const assetLogo = currentAsset?.logo;
  const assetBalance = currentAsset?.balance ?? 0;
  const assetPrice = currentAsset?.price ?? 0;
  const assetValue = currentAsset?.value ?? 0;
  const assetPriceChange = currentAsset?.priceChangePercentage;

  // Reconstruct asset object with stable reference
  const asset = useMemo(
    () =>
      currentAsset
        ? {
            id: assetId!,
            name: assetName!,
            symbol: assetSymbol!,
            logo: assetLogo!,
            balance: assetBalance,
            price: assetPrice,
            value: assetValue,
            priceChangePercentage: assetPriceChange,
          }
        : null,
    [
      assetId,
      assetName,
      assetSymbol,
      assetLogo,
      assetBalance,
      assetPrice,
      assetValue,
      assetPriceChange,
    ],
  );

  // Derive private key when asset changes
  useEffect(() => {
    const derivePrivateKey = async () => {
      if (asset && params?.tagId) {
        try {
          const assetId = asset.id;
          let network: 'bitcoin' | 'ethereum' | 'solana' | 'bsc';

          // Map asset to network type for getPrivateKey
          if (assetId === 'bitcoin') {
            network = 'bitcoin';
          } else if (assetId === 'solana') {
            network = 'solana';
          } else if (
            assetId === 'bnb_smart_chain' ||
            assetId === 'tether_(bsc)'
          ) {
            network = 'bsc';
          } else if (['ethereum', 'usd_coin_(ethereum)'].includes(assetId)) {
            network = 'ethereum';
          } else {
            // For other networks not yet implemented
            console.log(
              'Network not yet supported for private key derivation:',
              assetId,
            );
            setPrivateKeyForAsset('');
            return;
          }

          const key = await getPrivateKey(params.tagId, network);
          setPrivateKeyForAsset(key);
        } catch (error) {
          console.error('Error deriving private key:', error);
          setPrivateKeyForAsset('');
        }
      } else {
        setPrivateKeyForAsset('');
      }
    };

    derivePrivateKey();
  }, [asset, params?.tagId]);

  // Load transactions from AsyncStorage when asset changes
  useEffect(() => {
    if (asset) {
      loadTransactions(asset.symbol);
    }
  }, [asset?.symbol]); // Only depend on symbol to avoid unnecessary reloads

  const loadTransactions = async (symbol: string) => {
    // Don't block UI - load in background
    try {
      const history = await getAssetTransactionHistory(symbol);
      if (history.length > 0) {
        // Convert to the Transaction type used by this component
        const converted: Transaction[] = history.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          symbol: tx.symbol,
          date: tx.date,
          txHash: tx.txHash,
        }));
        setTxs(converted);
      } else {
        // Initialize with empty array
        setTxs([]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTxs([]);
    }
  };

  const saveTransactions = async (
    symbol: string,
    transactions: Transaction[],
  ) => {
    try {
      await AsyncStorage.setItem(`txs_${symbol}`, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  };

  const openAsset = useCallback((a: Asset) => {
    setSelectedAssetId(a.id);
    setShowReceive(false);
    setShowTransfer(false);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setShowReceive(false);
    setShowTransfer(false);
  }, []);

  const send = useCallback(() => {
    if (!asset) return;
    setShowTransfer(true);
  }, [asset]);

  const handleTransferSuccess = useCallback(
    (txHash: string) => {
      if (!asset) return;

      // Add transaction to history
      const tx: Transaction = {
        id: String(Date.now()),
        type: 'send',
        amount: 0, // Amount will be tracked separately in real implementation
        symbol: asset.symbol,
        date: new Date().toISOString(),
        txHash: txHash,
      };
      const newTxs = [tx, ...txs];
      setTxs(newTxs);
      saveTransactions(asset.symbol, newTxs);

      Alert.alert('Success', 'Transaction sent successfully!');
    },
    [asset, txs],
  );

  const receive = useCallback(() => {
    setShowReceive(true);
  }, []);

  const copyAddress = useCallback(() => {
    if (!asset) return;

    let address = '';
    if (asset.symbol === 'BTC') {
      address = addresses.bitcoin || '';
    } else if (asset.symbol === 'SOL') {
      address = addresses.solana || '';
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

  const getAddress = useCallback(() => {
    if (!asset) return '';
    if (asset.symbol === 'BTC') return addresses.bitcoin || '';
    if (asset.symbol === 'SOL') return addresses.solana || '';
    return addresses.ethereum || '';
  }, [asset, addresses]);

  const getAddressForDisplay = useCallback(() => {
    if (!asset) return 'Generating...';
    if (asset.symbol === 'BTC') return addresses.bitcoin || 'Generating...';
    if (asset.symbol === 'SOL') return addresses.solana || 'Generating...';
    return addresses.ethereum || 'Generating...';
  }, [asset, addresses]);

  // Memoize address for display to prevent recalculation
  const addressForDisplay = useMemo(() => {
    if (!asset) return 'Generating...';
    if (asset.symbol === 'BTC') return addresses.bitcoin || 'Generating...';
    if (asset.symbol === 'SOL') return addresses.solana || 'Generating...';
    return addresses.ethereum || 'Generating...';
  }, [asset?.symbol, addresses.bitcoin, addresses.ethereum, addresses.solana]);

  // Return stable JSX element instead of function component
  const assetModalElement = useMemo(
    () =>
      asset ? (
        <>
          <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={close}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
          >
            <View style={tw`flex-1 justify-end bg-black bg-opacity-70`}>
              <View style={tw`bg-gray-900 rounded-t-3xl h-5/6`}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={tw`p-6`}>
                    {/* Header */}
                    <View style={tw`flex-row items-center mb-6`}>
                      <View
                        style={[
                          tw`w-16 h-16 rounded-full items-center justify-center mr-4`,
                          {
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            borderWidth: 2,
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                          },
                        ]}
                      >
                        <Image source={asset.logo} style={tw`h-12 w-12`} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[fonts.pnbBold, tw`text-white text-2xl`]}>
                          {asset.name}
                        </Text>
                        <Text
                          style={[
                            fonts.pnbRegular,
                            tw`text-gray-400 text-sm mt-1`,
                          ]}
                        >
                          $
                          {asset.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={close} style={tw`p-2`}>
                        <Icon name="close" size={24} color="#A78BFA" />
                      </TouchableOpacity>
                    </View>

                    {!showReceive ? (
                      <>
                        {/* Balance Display */}
                        <View
                          style={tw`mb-6 bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50`}
                        >
                          <Text
                            style={[
                              fonts.pnbRegular,
                              tw`text-gray-400 text-sm mb-1`,
                            ]}
                          >
                            Your Balance
                          </Text>
                          <Text
                            style={[fonts.pnbBold, tw`text-white text-4xl`]}
                          >
                            {asset.balance.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 5,
                            })}
                            <Text
                              style={[
                                fonts.pnbRegular,
                                tw`text-lg text-gray-400`,
                              ]}
                            >
                              {' '}
                              {asset.symbol}
                            </Text>
                          </Text>
                          <Text
                            style={[
                              fonts.pnbSemiBold,
                              tw`text-purple-400 text-lg mt-2`,
                            ]}
                          >
                            $
                            {asset.value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={tw`flex-row mb-6 gap-3`}>
                          <View style={tw`flex-1`}>
                            <Button title="↑ Send" onPress={send} />
                          </View>
                          <View style={tw`flex-1`}>
                            <Button title="↓ Receive" onPress={receive} />
                          </View>
                        </View>

                        {/* Transaction History */}
                        <View>
                          <Text
                            style={[fonts.pnbBold, tw`text-white text-xl mb-3`]}
                          >
                            Recent Activity
                          </Text>
                          {txs.length === 0 ? (
                            <View style={tw`py-8 items-center`}>
                              <Text style={tw`text-5xl mb-2`}>📭</Text>
                              <Text
                                style={[fonts.pnbRegular, tw`text-gray-400`]}
                              >
                                No transactions yet
                              </Text>
                            </View>
                          ) : (
                            <ScrollView
                              style={tw`max-h-80`}
                              showsVerticalScrollIndicator={false}
                              nestedScrollEnabled={true}
                            >
                              {txs.map((item, index) => (
                                <TransactionItem
                                  key={item.id}
                                  item={item}
                                  asset={asset}
                                  index={index}
                                  total={txs.length}
                                />
                              ))}
                            </ScrollView>
                          )}
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Receive View - Enhanced UI */}
                        <View>
                          <Text
                            style={[
                              fonts.pnbBold,
                              tw`text-white text-2xl mb-2`,
                            ]}
                          >
                            Receive {asset.symbol}
                          </Text>
                          <Text
                            style={[
                              fonts.pnbRegular,
                              tw`text-gray-400 text-sm mb-6`,
                            ]}
                          >
                            Share this address to receive {asset.symbol}
                          </Text>

                          {/* Address Card */}
                          <View
                            style={[
                              tw`rounded-2xl p-5 mb-4 border-2`,
                              {
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                borderColor: 'rgba(139, 92, 246, 0.3)',
                              },
                            ]}
                          >
                            <View style={tw`flex-row items-center mb-3`}>
                              <Image
                                source={asset.logo}
                                style={tw`h-10 w-10 mr-3`}
                              />
                              <Text
                                style={[
                                  fonts.pnbSemiBold,
                                  tw`text-purple-300 text-base`,
                                ]}
                              >
                                Your {asset.symbol} Address
                              </Text>
                            </View>

                            <View
                              style={tw`bg-gray-900/50 rounded-xl p-4 flex-row items-center justify-between`}
                            >
                              <Text
                                style={[
                                  fonts.pnbRegular,
                                  tw`text-white text-xs leading-5 flex-1 mr-2`,
                                ]}
                                selectable
                                numberOfLines={3}
                              >
                                {addressForDisplay}
                              </Text>
                              <TouchableOpacity
                                onPress={copyAddress}
                                style={tw`p-2`}
                              >
                                <Icon
                                  name="clipboard-text-outline"
                                  size={22}
                                  color="#A78BFA"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Network Info */}
                          <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4`}>
                            <View style={tw`flex-row items-center mb-2`}>
                              <Text style={tw`text-lg mr-2`}>🌐</Text>
                              <Text
                                style={[
                                  fonts.pnbSemiBold,
                                  tw`text-white text-sm`,
                                ]}
                              >
                                Network Information
                              </Text>
                            </View>
                            <View style={tw`flex-row justify-between mt-2`}>
                              <Text
                                style={[
                                  fonts.pnbRegular,
                                  tw`text-gray-400 text-sm`,
                                ]}
                              >
                                Network
                              </Text>
                              <Text
                                style={[
                                  fonts.pnbSemiBold,
                                  tw`text-purple-300 text-sm`,
                                ]}
                              >
                                {asset.symbol === 'BTC'
                                  ? 'Bitcoin'
                                  : asset.symbol === 'SOL'
                                  ? 'Solana'
                                  : 'Ethereum'}
                              </Text>
                            </View>
                            <View style={tw`flex-row justify-between mt-2`}>
                              <Text
                                style={[
                                  fonts.pnbRegular,
                                  tw`text-gray-400 text-sm`,
                                ]}
                              >
                                Asset Type
                              </Text>
                              <Text
                                style={[
                                  fonts.pnbSemiBold,
                                  tw`text-purple-300 text-sm`,
                                ]}
                              >
                                {asset.symbol}
                              </Text>
                            </View>
                          </View>

                          {/* Warning */}
                          <View
                            style={[
                              tw`rounded-xl p-4 mb-4 border`,
                              {
                                backgroundColor: 'rgba(251, 146, 60, 0.05)',
                                borderColor: 'rgba(251, 146, 60, 0.2)',
                              },
                            ]}
                          >
                            <View style={tw`flex-row items-start`}>
                              <Text style={tw`text-xl mr-3 mt-0.5`}>⚠️</Text>
                              <View style={tw`flex-1`}>
                                <Text
                                  style={[
                                    fonts.pnbSemiBold,
                                    tw`text-orange-300 text-sm mb-1`,
                                  ]}
                                >
                                  Important Notice
                                </Text>
                                <Text
                                  style={[
                                    fonts.pnbRegular,
                                    tw`text-orange-200/70 text-xs`,
                                  ]}
                                >
                                  Only send {asset.symbol} to this address.
                                  Sending other assets may result in permanent
                                  loss of funds.
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Back Button */}
                          <Button
                            title="← Back "
                            onPress={() => setShowReceive(false)}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Transfer Modal */}
          <TransferModal
            visible={showTransfer}
            asset={asset}
            fromAddress={getAddress()}
            onClose={() => setShowTransfer(false)}
            onSuccess={handleTransferSuccess}
            privateKey={privateKeyForAsset}
          />
        </>
      ) : null,
    [
      asset,
      visible,
      showReceive,
      showTransfer,
      txs,
      addressForDisplay,
      privateKeyForAsset,
      close,
      send,
      receive,
      copyAddress,
      getAddress,
      handleTransferSuccess,
    ],
  );

  // Wrapper component that returns the memoized element
  const AssetModal = () => assetModalElement;

  return { openAsset, close, AssetModal };
}
