import tw from 'twrnc';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { TypeAnimation } from 'react-native-type-animation';
import { fonts } from '../constants/fonts';
import logo from '../assets/images/auronlogo_transparent.png';

import Button from '../components/Button';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useWallet } from '../context/WalletContext';
import createAllWallets from '../hooks/CreateWallet';
NfcManager.start();

function WelcomeScreen({
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
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    tagId,
    setTagId,
    evmAddress,
    setEvmAddress,
    solanaAddress,
    setSolanaAddress,
  } = useWallet();

  // Debug: Log context value
  console.log('Current tagId in context:', tagId);
  console.log('Current evmAddress in context:', evmAddress);
  console.log('Current solanaAddress in context:', solanaAddress);

  useEffect(() => {
    if (Platform.OS === 'android') {
      readNfc();
    }

    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  useEffect(() => {
    const handleWalletCreation = async () => {
      console.log('tagId changed:', tagId);

      if (tagId && tagId !== 'No ID found' && !tagId.startsWith('Error')) {
        console.log('Setting tagId in context:', tagId);
        setTagId(tagId); // Store tagId in context
        setIsGenerating(true);

        try {
          console.log('Creating wallets for tagId:', tagId);
          const wallets = await createAllWallets(tagId);
          if (setEvmAddress) {
            setEvmAddress(wallets.evm); // Store EVM address in context
          }
          if (setSolanaAddress) {
            setSolanaAddress(wallets.solana); // Store Solana address in context
          }
          console.log('Created wallets:', wallets);

          // Navigate after wallets are created and stored
          console.log('Navigating to WalletDashboard');
          navigation.navigate('WalletDashboard');
        } catch (error) {
          console.error('Failed to create wallets:', error);
          // Optionally, handle wallet creation error, e.g., show a message
        } finally {
          setIsGenerating(false);
        }
      }
    };

    handleWalletCreation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId, navigation, setTagId]);

  async function readNfc() {
    try {
      console.log('Starting NFC scan...');
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log('Full tag object:', JSON.stringify(tag, null, 2));

      const tagIdValue = tag?.id ? tag.id : 'No ID found';
      console.log('Extracted tag ID:', tagIdValue);

      setTagId(tagIdValue);
    } catch (ex) {
      console.warn('NFC Error:', ex);
      if (ex instanceof Error) {
        setTagId('Error: ' + ex.message);
      } else {
        setTagId('An unknown error occurred');
      }
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" />

      <Modal transparent={true} visible={isGenerating} animationType="fade">
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={tw`bg-gray-800 p-5 rounded-lg items-center`}>
            <LottieView
              source={require('../assets/lottie/loading_animation.json')}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
            <Text style={[fonts.pnbSemiBold, tw`text-white mt-4 text-lg`]}>
              Generating Wallets...
            </Text>
          </View>
        </View>
      </Modal>

      <View style={[tw`flex-1 justify-between items-center p-5`]}>
        <View style={tw`items-center`}>
          <Image
            source={logo}
            style={tw`w-40 h-40 mt-5`}
            resizeMode="contain"
          />
        </View>
        <Text style={tw`text-white mt-1 text-center text-4xl`}>
          <Text style={[fonts.pnbBold, tw`text-white text-12`]}>
            Auron Wallet
          </Text>
        </Text>

        <TypeAnimation
          sequence={[
            {
              text: 'Auron Wallet allows you to securely store and use your crypto by tapping or holding your existing NFC card near your phone.',
            },
            { action: () => console.log('Animation completed') },
          ]}
          repeat={1}
          style={
            (fonts.pnbRegular,
            tw`text-white text-center text-base mt-1 mx-2 h-30 w-80 mb-1`)
          }
          cursor={false}
        />

        <View>
          {Platform.OS === 'ios' ? (
            <>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-white text-center h-30 w-80 mt-5 mb-5`,
                ]}
              >
                Tap to generate your wallet.
              </Text>
              <Button title="Generate Wallet" onPress={readNfc} />
            </>
          ) : (
            <>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-white text-center h-30 w-80 mt-5 mb-5`,
                ]}
              >
                Ready to scan.
                {'\n'}
                Hold your NFC card near your phone.
              </Text>
            </>
          )}
        </View>

        <View style={tw`items-center mt-5`}>
          <Text style={[fonts.pnbSemiBold, tw`text-white text-4 text-center`]}>
            This is the tag data:
          </Text>
          <Text style={[fonts.pnbRegular, tw`text-white text-3 text-center`]}>
            {tagId ? JSON.stringify(tagId) : 'No tag read yet.'}
          </Text>
        </View>
        <View
          style={tw`my-5 w-80 rounded-2xl border border-white bg-white/10 p-4`}
        >
          <Text style={[fonts.pnbSemiBold, tw`text-white text-5 text-center`]}>
            Disclaimer
          </Text>
          <Text
            style={[
              fonts.pnbRegular,
              tw`text-white text-3  pb-5 text-center mt-2 mx-2`,
            ]}
          >
            Auron does not sell or provide NFC cards. The wallet only utilizes
            cards that users already own (credit, debit, or any NFC-enabled
            card). Loss of your physical NFC card may result in loss of access
            to your assets. Always keep your card safe and secure.
          </Text>
        </View>
      </View>
    </>
  );
}

export default WelcomeScreen;
