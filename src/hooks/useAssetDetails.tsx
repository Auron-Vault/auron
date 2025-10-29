import React, { useState, useCallback, useEffect } from 'react';
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
} from 'react-native';
import tw from 'twrnc';
import { Asset } from '../context/WalletContext';
import Button from '../components/Button';
import { fonts } from '../constants/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
};

export default function useAssetDetails(params?: UseAssetDetailsParams) {
  const [visible, setVisible] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showReceive, setShowReceive] = useState(false);
  const { addresses } = useWallet();

  // Load transactions from AsyncStorage when asset changes
  useEffect(() => {
    if (asset) {
      loadTransactions(asset.symbol);
    }
  }, [asset]);

  const loadTransactions = async (symbol: string) => {
    try {
      const stored = await AsyncStorage.getItem(`txs_${symbol}`);
      if (stored) {
        setTxs(JSON.parse(stored));
      } else {
        // Initialize with sample data
        const sampleTxs: Transaction[] = [
          {
            id: 't1',
            type: 'receive',
            amount: 0.1,
            symbol: symbol,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ];
        setTxs(sampleTxs);
        await AsyncStorage.setItem(`txs_${symbol}`, JSON.stringify(sampleTxs));
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
    setAsset(a);
    setShowReceive(false);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setShowReceive(false);
  }, []);

  const send = useCallback(
    (amount: number) => {
      if (!asset) return;

      // Call the custom send handler if provided (for navigation)
      if (params?.onSendPress) {
        params.onSendPress(asset, amount);
        return;
      }

      // Otherwise add a simulated transaction
      const tx: Transaction = {
        id: String(Date.now()),
        type: 'send',
        amount,
        symbol: asset.symbol,
        date: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
      const newTxs = [tx, ...txs];
      setTxs(newTxs);
      saveTransactions(asset.symbol, newTxs);
    },
    [asset, txs, params],
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

  const AssetModal = () => {
    if (!asset) return null;

    const getAddress = () => {
      if (asset.symbol === 'BTC') return addresses.bitcoin || 'Generating...';
      if (asset.symbol === 'SOL') return addresses.solana || 'Generating...';
      return addresses.ethereum || 'Generating...';
    };

    const address = getAddress();

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={close}
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
                      style={[fonts.pnbRegular, tw`text-gray-400 text-sm mt-1`]}
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
                      <Text style={[fonts.pnbBold, tw`text-white text-4xl`]}>
                        {asset.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                        <Text
                          style={[fonts.pnbRegular, tw`text-lg text-gray-400`]}
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
                        <Button
                          title="↑ Send"
                          onPress={() =>
                            send(Math.max(0.0001, asset.balance * 0.01))
                          }
                        />
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
                          <Text style={[fonts.pnbRegular, tw`text-gray-400`]}>
                            No transactions yet
                          </Text>
                        </View>
                      ) : (
                        <View>
                          {txs.map((item, index) => (
                            <View
                              key={item.id}
                              style={tw`flex-row justify-between py-3 ${
                                index !== txs.length - 1
                                  ? 'border-b border-gray-800'
                                  : ''
                              }`}
                            >
                              <View style={tw`flex-1`}>
                                <View style={tw`flex-row items-center mb-1`}>
                                  <Text style={tw`text-lg mr-2`}>
                                    {item.type === 'send' ? '↑' : '↓'}
                                  </Text>
                                  <Text
                                    style={[
                                      fonts.pnbSemiBold,
                                      tw`text-white text-base`,
                                    ]}
                                  >
                                    {item.type === 'send' ? 'Sent' : 'Received'}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    fonts.pnbRegular,
                                    tw`text-gray-400 text-xs`,
                                  ]}
                                >
                                  {new Date(item.date).toLocaleString()}
                                </Text>
                                {item.txHash && (
                                  <Text
                                    style={[
                                      fonts.pnbRegular,
                                      tw`text-gray-500 text-xs mt-1`,
                                    ]}
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
                                      item.type === 'send'
                                        ? 'text-red-400'
                                        : 'text-green-400'
                                    }`,
                                  ]}
                                >
                                  {item.type === 'send' ? '-' : '+'}
                                  {item.amount.toLocaleString('en-US', {
                                    minimumFractionDigits: 4,
                                    maximumFractionDigits: 6,
                                  })}{' '}
                                  {item.symbol}
                                </Text>
                                <Text
                                  style={[
                                    fonts.pnbRegular,
                                    tw`text-gray-400 text-xs mt-1`,
                                  ]}
                                >
                                  ${(item.amount * asset.price).toFixed(2)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    {/* Receive View - Enhanced UI */}
                    <View>
                      <Text
                        style={[fonts.pnbBold, tw`text-white text-2xl mb-2`]}
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
                            {address}
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
                            style={[fonts.pnbSemiBold, tw`text-white text-sm`]}
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
                              Only send {asset.symbol} to this address. Sending
                              other assets may result in permanent loss of
                              funds.
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
    );
  };

  return { AssetModal, openAsset, close, send } as const;
}
