import React from 'react';
import { View, Text, StatusBar, Image } from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import bitcoinlogo from '../assets/images/bitcoin_logo.png';
import ethereumlogo from '../assets/images/ethereum_logo.png';
import bnblogo from '../assets/images/bnb_logo.png';
import solanalogo from '../assets/images/solana_logo.png';
import usdclogo from '../assets/images/usdc_logo.png';
import { useWallet } from '../context/WalletContext';
import Button from '../components/Button';

function WalletDashboard({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <SafeAreaProvider style={[tw`flex-1 bg-black`]}>
      <Root navigation={navigation} />
    </SafeAreaProvider>
  );
}

function Root({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  const {
    tagId,
    setTagId,
    evmAddress,
    setEvmAddress,
    solanaAddress,
    setSolanaAddress,
  } = useWallet();
  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[tw`justify-between p-5`]}>
        <Text style={[fonts.pnbBold, tw`text-white text-8 pt-5`]}>
          Auron Wallet
        </Text>
      </View>
      <View style={tw`mt-5 mx-8 h-50  rounded-xl p-4 shadow-custom`}>
        <Text style={[fonts.pnbSemiBold, tw`text-white text-2xl text-center`]}>
          Account 1
        </Text>
        <Text style={[fonts.pnbBold, tw`text-white text-4xl text-center mt-2`]}>
          $ 153,126.51
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
      <View
        style={tw`mt-2 p-4 rounded-xl shadow-custom border-gray-600 mx-5 h-100`}
      >
        <View
          style={tw`my-1 h-16 flex-row border rounded-2xl shadow-custom border-gray-600 bg-gray-800 items-center`}
        >
          <Image source={bitcoinlogo} style={tw`h-12 w-12 my-2 mx-1`} />
          <View style={tw`flex-col items-start ml-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              Bitcoin
            </Text>
            <Text style={[fonts.pnbRegular, tw`text-white text-md `]}>
              $101,152.17
            </Text>
          </View>
          <View style={tw`flex-1 items-end mr-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              1.251 BTC
            </Text>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg `]}>
              $ 103,521.00
            </Text>
          </View>
        </View>
        <View
          style={tw`my-1 h-16 flex-row border rounded-2xl shadow-custom border-gray-600 bg-gray-800 items-center`}
        >
          <Image source={ethereumlogo} style={tw`h-12 w-12 my-2 mx-1`} />
          <View style={tw`flex-col items-start ml-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              Ethereum
            </Text>
            <Text style={[fonts.pnbRegular, tw`text-white text-md `]}>
              $3,973.44
            </Text>
          </View>
          <View style={tw`flex-1 items-end mr-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              2.41 ETH
            </Text>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg `]}>
              $ 10,521.00
            </Text>
          </View>
        </View>
        <View
          style={tw`my-1 h-16 flex-row border rounded-2xl shadow-custom border-gray-600 bg-gray-800 items-center`}
        >
          <Image source={bnblogo} style={tw`h-12 w-12 my-2 mx-1`} />
          <View style={tw`flex-col items-start ml-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              Binance Coin
            </Text>
            <Text style={[fonts.pnbRegular, tw`text-white text-md `]}>
              $ 1,105.85
            </Text>
          </View>
          <View style={tw`flex-1 items-end mr-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              5.47 BNB
            </Text>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg `]}>
              $ 6,521.00
            </Text>
          </View>
        </View>
        <View
          style={tw`my-1 h-16 flex-row border rounded-2xl shadow-custom border-gray-600 bg-gray-800 items-center`}
        >
          <Image source={solanalogo} style={tw`h-12 w-12 my-2 mx-1`} />
          <View style={tw`flex-col items-start ml-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              Solana
            </Text>
            <Text style={[fonts.pnbRegular, tw`text-white text-md `]}>
              $ 199.98
            </Text>
          </View>
          <View style={tw`flex-1 items-end mr-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              125.42 SOL
            </Text>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg `]}>
              $ 25,081.18
            </Text>
          </View>
        </View>
        <View
          style={tw`my-1 h-16 flex-row border rounded-2xl shadow-custom border-gray-600 bg-gray-800 items-center`}
        >
          <Image source={usdclogo} style={tw`h-12 w-12 my-2 mx-1`} />
          <View style={tw`flex-col items-start ml-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              USD Coin
            </Text>
            <Text style={[fonts.pnbRegular, tw`text-white text-md `]}>
              $1.00
            </Text>
          </View>
          <View style={tw`flex-1 items-end mr-2`}>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg mt-1`]}>
              7,482.45 USDC
            </Text>
            <Text style={[fonts.pnbSemiBold, tw`text-white text-lg `]}>
              $ 7,482.45
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

export default WalletDashboard;
