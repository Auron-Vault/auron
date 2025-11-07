import React, { useState } from 'react';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import TapToPayCard from '../components/TapToPayCard';
import TapToPayTransactionHistory from '../components/TapToPayTransactionHistory';
import { TransactionHistoryItem } from '../utils/transactionHistory';
import CustomAlert from '../components/CustomAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type TapToPayWalletScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TapToPayWallet'
>;

function TapToPayWalletScreen({
  navigation,
  route,
}: TapToPayWalletScreenProps) {
  const { tagId } = route.params || {};
  const [tapToPayAddress, setTapToPayAddress] = useState('');
  const [tapToPayTransactions, setTapToPayTransactions] = useState<
    TransactionHistoryItem[]
  >([]);

  // Custom Alert State
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    visible: false,
    title: '',
  });

  return (
    <PanGestureHandler
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
          // Swipe right (positive translationX) to go back to Main Wallet
          if (
            nativeEvent.translationX > 50 &&
            Math.abs(nativeEvent.velocityX) > 500
          ) {
            navigation.goBack();
          }
        }
      }}
    >
      <View style={tw`flex-1 bg-black`}>
        <View style={[tw`flex-row justify-between items-center p-5`]}>
          <Text style={[fonts.pnbBold, tw`text-white text-8 pt-5`]}>
            Auron Wallet
          </Text>
        </View>
        <StatusBar barStyle="light-content" />

        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {/* Swipe Indicator */}

          {/* Header */}

          {/* Tap-to-Pay Card */}
          <View style={tw`px-3`}>
            <TapToPayCard
              tagId={tagId || undefined}
              onAddressGenerated={address => setTapToPayAddress(address)}
              onTransactionsUpdate={transactions =>
                setTapToPayTransactions(transactions)
              }
              onShowAlert={alert =>
                setCustomAlert({
                  visible: true,
                  title: alert.title,
                  message: alert.message,
                  icon: alert.icon,
                  iconColor: alert.iconColor,
                  buttons: [{ text: 'OK', style: 'default' }],
                })
              }
            />
          </View>

          {/* Transaction History */}
          <TapToPayTransactionHistory transactions={tapToPayTransactions} />
        </ScrollView>

        {/* Custom Alert */}
        <CustomAlert
          visible={customAlert.visible}
          title={customAlert.title}
          message={customAlert.message}
          icon={customAlert.icon}
          iconColor={customAlert.iconColor}
          buttons={customAlert.buttons}
          onDismiss={() =>
            setCustomAlert({ visible: false, title: '', buttons: [] })
          }
        />
      </View>
    </PanGestureHandler>
  );
}

export default TapToPayWalletScreen;
