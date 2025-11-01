import tw from 'twrnc';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { fonts } from '../constants/fonts';
import logo from '../assets/images/auronlogo_transparent.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, toUtf8Bytes, keccak256, toBeArray, Mnemonic } from 'ethers';

import Button from '../components/Button';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useWallet } from '../context/WalletContext';

function WelcomeScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  // Initialize NFC when component mounts
  useEffect(() => {
    NfcManager.start().catch(err => {
      console.log('NFC initialization failed:', err);
    });
  }, []);
  return (
    <SafeAreaProvider style={[tw`flex-1 bg-black`]}>
      <Root navigation={navigation} />
    </SafeAreaProvider>
  );
}

function Root({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { tagId, setTagId, addresses, setAddresses } = useWallet();
  const [validationState, setValidationState] = useState<
    'idle' | 'validating' | 'validated' | 'failed'
  >('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [currentValidatingTagId, setCurrentValidatingTagId] = useState<
    string | null
  >(null);

  // Use refs to track validation progress without stale closures
  const tapCountRef = useRef(0);
  const generatedAddressesRef = useRef<string[]>([]);

  // Debug: Log context value
  console.log('Current tagId in context:', tagId);
  console.log('Current addresses in context:', addresses);

  useEffect(() => {
    if (Platform.OS === 'android') {
      readNfc();
    }

    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      console.log('tagId changed:', tagId);

      if (tagId && tagId !== 'No ID found' && !tagId.startsWith('Error')) {
        console.log('TagId detected:', tagId);

        // Check if this tagId is already validated and cached
        const cachedValidation = await AsyncStorage.getItem(
          `validated_tag_${tagId}`,
        );

        if (cachedValidation === 'true' && validationState === 'idle') {
          // Only navigate if we're not currently validating another card
          console.log('TagId already validated, navigating to PIN input');
          navigation.navigate('PinInput', { tagId });
        } else if (validationState === 'idle') {
          // First tap - start validation
          console.log('TagId needs validation - starting validation process');
          setCurrentValidatingTagId(tagId);
          setValidationState('validating');
          await validateTag(tagId);
        } else if (
          validationState === 'validating' &&
          currentValidatingTagId === tagId
        ) {
          // Subsequent taps during validation - continue validation
          console.log('Same card tapped again during validation');
          await validateTag(tagId);
        } else if (
          validationState === 'validating' &&
          currentValidatingTagId !== tagId
        ) {
          // Different card tapped during validation - FAIL validation
          console.log(
            '❌ Different card detected during validation - INCOMPATIBLE',
          );
          setValidationState('failed');
          setValidationMessage(
            '❌ Card mismatch! You must tap the same card 3 times.',
          );
          // Reset after showing error
          setTimeout(() => {
            resetValidation();
          }, 3000);
        }
      }
    };

    handleNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);

  const validateTag = async (currentTagId: string) => {
    try {
      const currentTap = tapCountRef.current + 1;
      setValidationMessage(`Tap ${currentTap}/3: Generating test wallet...`);

      // Generate ONLY EVM wallet with default PIN "000000" for faster validation
      // First create a deterministic mnemonic from tagId + PIN
      const combinedSeed = `${currentTagId}-000000`;
      const entropyBytes = toUtf8Bytes(combinedSeed);
      const hash = keccak256(entropyBytes);
      const entropy128 = toBeArray(hash).slice(0, 16);
      const mnemonic = Mnemonic.fromEntropy(entropy128).phrase;

      // Generate EVM wallet from mnemonic
      const wallet = Wallet.fromPhrase(mnemonic);
      const testAddress = wallet.address;

      console.log(
        `Validation tap ${currentTap}: Generated address:`,
        testAddress,
      );

      // Add to addresses array
      generatedAddressesRef.current.push(testAddress);
      tapCountRef.current = currentTap;

      if (tapCountRef.current === 3) {
        // Check if all 3 addresses are identical
        const firstAddress = generatedAddressesRef.current[0];
        const allMatch = generatedAddressesRef.current.every(
          addr => addr === firstAddress,
        );

        if (allMatch) {
          console.log('✅ Validation passed: All addresses match');
          setValidationState('validated');
          setValidationMessage('✅ Card validated successfully!');

          // Cache the validated tagId
          await AsyncStorage.setItem(`validated_tag_${currentTagId}`, 'true');

          // Navigate to PIN input after 1.5 seconds
          setTimeout(() => {
            navigation.navigate('PinInput', { tagId: currentTagId });
          }, 1500);
        } else {
          console.log('❌ Validation failed: Addresses do not match');
          console.log('Addresses:', generatedAddressesRef.current);
          setValidationState('failed');
          setValidationMessage(
            '❌ Incompatible card detected. Please use a different NFC card.',
          );

          // Reset after showing error
          setTimeout(() => {
            resetValidation();
          }, 3000);
        }
      } else {
        // Need more taps
        setValidationMessage(
          `Please tap your card again (${tapCountRef.current}/3)`,
        );
        // Clear tagId to allow same card to be read again
        setTagId(null);
        // Restart NFC scan for next tap
        setTimeout(() => {
          readNfc();
        }, 1000);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState('failed');
      setValidationMessage('❌ Validation error. Please try again.');
      setTimeout(() => {
        resetValidation();
      }, 3000);
    }
  };

  const resetValidation = () => {
    setValidationState('idle');
    tapCountRef.current = 0;
    generatedAddressesRef.current = [];
    setValidationMessage('');
    setCurrentValidatingTagId(null);
    setTagId(null);
    // Restart NFC scanning
    setTimeout(() => {
      readNfc();
    }, 500);
  };

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
      // Always cancel technology request after reading
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

      {/* Validation Modal */}
      <Modal
        transparent={true}
        visible={
          validationState === 'validating' ||
          validationState === 'validated' ||
          validationState === 'failed'
        }
        animationType="fade"
      >
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-90`}
        >
          <View
            style={tw`bg-gray-800 p-6 rounded-2xl items-center mx-8 max-w-80`}
          >
            {validationState === 'validating' && (
              <>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-white mt-4 text-xl text-center`,
                  ]}
                >
                  Validating Card
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-gray-400 mt-2 text-sm text-center`,
                  ]}
                >
                  {validationMessage}
                </Text>
                <View style={tw`flex-row mt-4 gap-2`}>
                  {[0, 1, 2].map(i => (
                    <View
                      key={i}
                      style={tw`w-3 h-3 rounded-full ${
                        i < tapCountRef.current ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </View>
              </>
            )}
            {validationState === 'validated' && (
              <>
                <Text style={tw`text-6xl mb-2`}>✅</Text>
                <Text
                  style={[fonts.pnbBold, tw`text-white text-xl text-center`]}
                >
                  Card Validated!
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-gray-400 mt-2 text-sm text-center`,
                  ]}
                >
                  Proceeding to PIN entry...
                </Text>
              </>
            )}
            {validationState === 'failed' && (
              <>
                <Text style={tw`text-6xl mb-2`}>❌</Text>
                <Text
                  style={[fonts.pnbBold, tw`text-white text-xl text-center`]}
                >
                  Incompatible Card
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-gray-400 mt-2 text-sm text-center`,
                  ]}
                >
                  {validationMessage}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={tw`flex-1 justify-between pb-8`}>
        {/* Header Section */}
        <View style={tw`items-center pt-10`}>
          <View style={tw`items-center`}>
            <Image source={logo} style={tw`w-32 h-32`} resizeMode="contain" />
          </View>

          <Text
            style={[
              fonts.pnbBold,
              tw`text-white text-4xl mt-1`,
              { letterSpacing: 1 },
            ]}
          >
            Auron Wallet
          </Text>
        </View>

        {/* Description Section */}
        <View style={tw`px-3 mt-1`}>
          <View
            style={tw`bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10`}
          >
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-white text-lg text-center mb-1`,
              ]}
            >
              Secure. Simple. Yours.
            </Text>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-gray-300 text-base text-center leading-6`,
              ]}
            >
              Your crypto, secured by your NFC card. No cloud storage, no
              servers, just pure cryptographic security in your pocket.
            </Text>
          </View>
        </View>

        {/* NFC Section */}
        <View style={tw`items-center mt-4 px-6`}>
          {Platform.OS === 'ios' ? (
            <>
              <View
                style={[
                  tw`bg-purple-600 rounded-full p-6 mb-3`,
                  {
                    shadowColor: '#9c70c0',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 15,
                  },
                ]}
              >
                <View style={tw`w-20 h-20 items-center justify-center`}>
                  <Text style={tw`text-6xl`}>📱</Text>
                </View>
              </View>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-white text-xl text-center mb-2`,
                ]}
              >
                Tap to Begin
              </Text>
              <Button title="Generate Wallet" onPress={readNfc} />
            </>
          ) : (
            <>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-white text-xl text-center mb-1`,
                ]}
              >
                Ready to Scan
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-gray-400 text-base text-center`,
                ]}
              >
                Hold your NFC card near your phone
              </Text>
            </>
          )}
        </View>

        {/* Tag Info Section - Only show if tag is read */}
        {/* {tagId && (
          <View
            style={tw`mx-6 mt-4 bg-green-600/10 border border-green-500/30 rounded-2xl p-4`}
          >
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-green-400 text-sm text-center mb-1`,
              ]}
            >
              ✓ Card Detected
            </Text>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-green-300/70 text-xs text-center`,
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {tagId}
            </Text>
          </View>
        )} */}

        {/* Disclaimer Section */}
        <View style={tw`mx-6 mt-4`}>
          <View
            style={tw`bg-orange-600/10 border border-orange-500/20 rounded-2xl p-4`}
          >
            <View style={tw`flex-row items-center mb-3`}>
              <Text style={tw`text-2xl mr-2`}>⚠️</Text>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-orange-300 text-base flex-1`,
                ]}
              >
                Important Notice
              </Text>
            </View>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-orange-200/70 text-sm leading-5`,
              ]}
            >
              Auron does not sell or provide NFC cards. Use any existing NFC
              card you own. Keep your card safe—losing it means losing access to
              your wallet.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

export default WelcomeScreen;
