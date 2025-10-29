import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fonts } from '../constants/fonts';
import Button from '../components/Button';

type PinInputScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PinInput'
>;

function PinInputScreen({ navigation, route }: PinInputScreenProps) {
  return (
    <SafeAreaProvider style={[tw`flex-1 bg-black`]}>
      <Root navigation={navigation} tagId={route.params.tagId} />
    </SafeAreaProvider>
  );
}

function Root({
  navigation,
  tagId,
}: {
  navigation: PinInputScreenProps['navigation'];
  tagId: string;
}) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isNavigating, setIsNavigating] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete after updating
    const updatedPin = [...pin];
    updatedPin[index] = value;
    const isComplete = updatedPin.every(digit => digit !== '');

    if (isComplete) {
      // PIN is complete, auto-submit
      handleAutoSubmit(updatedPin.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoSubmit = async (pinString: string) => {
    if (pinString.length === 6) {
      Keyboard.dismiss();
      setIsNavigating(true);

      // Small delay to show spinner before navigation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            { name: 'WalletDashboard', params: { tagId, pin: pinString } },
          ],
        });
      }, 300);
    }
  };

  const handleSubmit = () => {
    const pinString = pin.join('');
    handleAutoSubmit(pinString);
  };

  const clearPin = () => {
    setPin(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isPinComplete = pin.every(digit => digit !== '');

  return (
    <>
      <StatusBar barStyle="light-content" />

      {/* Loading Overlay */}
      {isNavigating && (
        <View
          style={[
            tw`absolute inset-0 bg-black justify-center items-center`,
            { zIndex: 9999 },
          ]}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[fonts.pnbSemiBold, tw`text-white text-xl mt-4`]}>
            Verifying PIN...
          </Text>
        </View>
      )}

      <View style={[tw`flex-1 justify-center items-center px-8`]}>
        <Text style={[fonts.pnbBold, tw`text-white text-4xl mb-2`]}>
          Enter PIN
        </Text>
        <Text
          style={[
            fonts.pnbRegular,
            tw`text-gray-400 text-base mb-12 text-center`,
          ]}
        >
          Enter your 6-digit PIN to secure your wallet
        </Text>

        {/* PIN Input Boxes */}
        <View style={tw`flex-row gap-3 mb-8`}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                fonts.pnbBold,
                tw`w-12 h-16 bg-gray-800 border-2 ${
                  digit ? 'border-blue-500' : 'border-gray-600'
                } rounded-xl text-white text-2xl text-center`,
              ]}
              value={digit}
              onChangeText={value => handlePinChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={tw`w-full gap-4`}>
          <View style={isPinComplete ? {} : tw`opacity-50`}>
            <Button
              title="Continue"
              onPress={isPinComplete ? handleSubmit : () => {}}
            />
          </View>
          <TouchableOpacity onPress={clearPin}>
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-gray-400 text-center text-base`,
              ]}
            >
              Clear PIN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View style={tw`mt-12 px-4`}>
          <Text
            style={[fonts.pnbRegular, tw`text-gray-500 text-sm text-center`]}
          >
            Your PIN will be combined with the NFC tag ID to generate a unique
            and secure wallet
          </Text>
        </View>
      </View>
    </>
  );
}

export default PinInputScreen;
