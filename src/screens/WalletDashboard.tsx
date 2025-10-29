import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import bitcoinlogo from '../assets/images/bitcoin_logo.png';
import ethereumlogo from '../assets/images/ethereum_logo.png';
import bnblogo from '../assets/images/bnb_logo.png';
import solanalogo from '../assets/images/solana_logo.png';
import usdclogo from '../assets/images/usdc_logo.png';
import { useWallet, Asset } from '../context/WalletContext';
import useAssetDetails from '../hooks/useAssetDetails';
import Button from '../components/Button';
import createAllWallets from '../hooks/CreateWallet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Dummy data for initial load
const DUMMY_ASSETS: Asset[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: bitcoinlogo,
    price: 101152.17,
    balance: 1.251,
    value: 103521.0,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    logo: ethereumlogo,
    price: 3973.44,
    balance: 2.41,
    value: 10521.0,
  },
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    logo: bnblogo,
    price: 1105.85,
    balance: 5.47,
    value: 6521.0,
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    logo: solanalogo,
    price: 199.98,
    balance: 125.42,
    value: 25081.18,
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    logo: usdclogo,
    price: 1.0,
    balance: 7482.45,
    value: 7482.45,
  },
];

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
    addresses,
    setAddresses,
    assets,
    setAssets,
    totalValue,
  } = useWallet();
  // Set initial loading state to true if we have params (wallet generation needed)
  const [isLoading, setIsLoading] = useState(
    !!(route.params?.tagId && route.params?.pin),
  );

  // Debug logging
  console.log('WalletDashboard - isLoading:', isLoading);
  console.log('WalletDashboard - route.params:', route.params);

  // Generate wallets if tagId and pin are provided
  useEffect(() => {
    const generateWallets = async () => {
      if (route.params?.tagId && route.params?.pin) {
        setIsLoading(true);
        try {
          console.log('Generating wallets with tagId and PIN...');
          // Combine tagId and PIN for extra security
          const combinedSeed = `${route.params.tagId}-${route.params.pin}`;
          const wallets = await createAllWallets(combinedSeed);

          // Store all addresses in context
          setAddresses({
            bitcoin: wallets.bitcoin,
            ethereum: wallets.ethereum,
            solana: wallets.solana,
          });

          console.log('Wallets generated:', wallets);
        } catch (error) {
          console.error('Failed to create wallets:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateWallets();
  }, [route.params]);

  // Load dummy data on first render if assets are empty
  useEffect(() => {
    if (assets.length === 0) {
      setAssets(DUMMY_ASSETS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { AssetModal, openAsset } = useAssetDetails();

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => openAsset(item)}
      style={tw`my-1 h-16 flex-row border rounded-2xl shadow-lg border-gray-600 bg-gray-800 items-center p-2`}
    >
      <Image source={item.logo} style={tw`h-12 w-12 my-2 mx-1`} />
      <View style={tw`flex-col items-start ml-2`}>
        <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
          {item.name}
        </Text>
        <Text style={[fonts.pnbRegular, tw`text-white text-base`]}>
          $
          {item.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
      <View style={tw`flex-1 items-end mr-2`}>
        <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
          {item.balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {item.symbol}
        </Text>
        <Text style={[fonts.pnbSemiBold, tw`text-white text-lg`]}>
          ${' '}
          {item.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

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

      <View style={[tw`justify-between p-5`]}>
        <Text style={[fonts.pnbBold, tw`text-white text-8 pt-5`]}>
          Auron Wallet
        </Text>
      </View>
      <View style={tw`mt-5 mx-8 h-50 rounded-xl p-4 shadow-lg bg-gray-800`}>
        <Text style={[fonts.pnbSemiBold, tw`text-white text-2xl text-center`]}>
          Account 1
        </Text>
        <Text style={[fonts.pnbBold, tw`text-white text-4xl text-center mt-2`]}>
          ${' '}
          {totalValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={tw`flex-row justify-center mt-4`}>
          <View style={tw`mx-4 items-center`}>
            <Button title="Send" onPress={() => {}} />
          </View>
          <View style={tw`mx-4 items-center`}>
            <Button title="Receive" onPress={() => {}} />
          </View>
        </View>
      </View>
      <View style={tw`mt-10`}>
        <Text style={[fonts.pnbBold, tw`text-white text-2xl ml-5`]}>
          Assets List
        </Text>
      </View>
      <View style={tw`mt-2 px-5 flex-1`}>
        <FlatList
          data={assets}
          renderItem={renderAssetItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-4`}
        />
        {/* Asset details modal */}
        <AssetModal />
      </View>
    </View>
  );
}

export default WalletDashboard;
