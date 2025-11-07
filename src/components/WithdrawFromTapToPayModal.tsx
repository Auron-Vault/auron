import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWallet } from '../context/WalletContext';
import {
  transferSolana,
  transferSolanaSPLToken,
} from '../services/transferService';

interface WithdrawFromTapToPayModalProps {
  visible: boolean;
  onClose: () => void;
  tapToPayAddress: string;
  tapToPayPrivateKey: string;
  tapToPaySolBalance: number;
  tapToPayUsdcBalance: number;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

type AssetType = 'SOL' | 'USDC';

const WithdrawFromTapToPayModal: React.FC<WithdrawFromTapToPayModalProps> = ({
  visible,
  onClose,
  tapToPayAddress,
  tapToPayPrivateKey,
  tapToPaySolBalance,
  tapToPayUsdcBalance,
  onSuccess,
  onError,
}) => {
  const { addresses } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState<AssetType>('SOL');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentBalance =
    selectedAsset === 'SOL' ? tapToPaySolBalance : tapToPayUsdcBalance;

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (currentBalance * percentage).toFixed(
      selectedAsset === 'SOL' ? 4 : 2,
    );
    setAmount(quickAmount);
  };

  const handleMaxAmount = () => {
    if (selectedAsset === 'SOL') {
      // Reserve 0.01 SOL for transaction fees
      const maxSol = Math.max(0, tapToPaySolBalance - 0.01);
      setAmount(maxSol.toFixed(4));
    } else {
      setAmount(tapToPayUsdcBalance.toFixed(2));
    }
  };

  const handleWithdraw = async () => {
    const transferAmount = parseFloat(amount);

    // Validation
    if (!amount || transferAmount <= 0) {
      onError('Please enter a valid amount');
      return;
    }

    if (transferAmount > currentBalance) {
      onError('Insufficient balance in tap-to-pay wallet');
      return;
    }

    if (selectedAsset === 'SOL' && transferAmount > tapToPaySolBalance - 0.01) {
      onError('Please reserve at least 0.01 SOL for transaction fees');
      return;
    }

    if (!addresses.solana) {
      onError('Main wallet not initialized');
      return;
    }

    if (!tapToPayPrivateKey) {
      onError('Tap-to-pay wallet not initialized');
      return;
    }

    setIsProcessing(true);

    try {
      let result;

      console.log(`[Withdraw] Starting ${selectedAsset} withdrawal:`, {
        from: tapToPayAddress,
        to: addresses.solana,
        amount: transferAmount,
      });

      if (selectedAsset === 'SOL') {
        // Withdraw SOL
        result = await transferSolana({
          fromAddress: tapToPayAddress,
          toAddress: addresses.solana,
          amount: transferAmount,
          privateKey: tapToPayPrivateKey,
          asset: {
            id: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            logo: require('../assets/images/solana_logo.png'),
            price: 200,
            balance: 0,
            value: 0,
          },
        });
      } else {
        // Withdraw USDC (SPL Token)
        console.log('[Withdraw] Initiating USDC SPL token withdrawal...');
        result = await transferSolanaSPLToken({
          fromAddress: tapToPayAddress,
          toAddress: addresses.solana,
          amount: transferAmount,
          privateKey: tapToPayPrivateKey,
          asset: {
            id: 'usd-coin',
            symbol: 'USDC',
            name: 'USD Coin',
            logo: require('../assets/images/usdc_logo.png'),
            price: 1,
            balance: 0,
            value: 0,
          },
        });
        console.log('[Withdraw] USDC withdrawal result:', result);
      }

      if (result.success) {
        console.log(
          `[Withdraw] Withdrawal successful. TxHash: ${result.txHash}`,
        );
        setAmount('');
        setIsProcessing(false);

        // Close modal and notify parent
        onClose();
        onSuccess(
          `Successfully withdrew ${transferAmount} ${selectedAsset} to main wallet`,
        );

        return; // Exit early to prevent finally block from running
      } else {
        console.error('[Withdraw] Withdrawal failed:', result.error);
        onError(result.error || 'Withdrawal failed');
      }
    } catch (error: any) {
      console.error('[Withdraw] Exception during withdrawal:', error);
      console.error('[Withdraw] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      onError(error.message || 'Failed to withdraw');
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount =
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= currentBalance &&
    (selectedAsset === 'SOL'
      ? parseFloat(amount) <= tapToPaySolBalance - 0.01
      : true);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={[
            tw`flex-1 justify-end`,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={[
                tw`rounded-t-3xl px-6 py-6`,
                { backgroundColor: colors.background.card },
              ]}
            >
              {/* Header */}
              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-xl`,
                    { color: colors.text.primary },
                  ]}
                >
                  Withdraw to Main Wallet
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 500 }}
              >
                {/* Asset Selection */}
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-sm mb-3`,
                    { color: colors.text.secondary },
                  ]}
                >
                  Select Asset
                </Text>
                <View style={tw`flex-row mb-6`}>
                  {/* SOL Option */}
                  <TouchableOpacity
                    onPress={() => setSelectedAsset('SOL')}
                    style={[
                      tw`flex-1 mr-2 p-4 rounded-2xl border-2`,
                      {
                        backgroundColor:
                          selectedAsset === 'SOL'
                            ? colors.primary.bg20
                            : colors.background.gray800,
                        borderColor:
                          selectedAsset === 'SOL'
                            ? colors.primary.main
                            : 'transparent',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center mb-2`}>
                      <Icon
                        name="circle"
                        size={12}
                        color="#14F195"
                        style={tw`mr-2`}
                      />
                      <Text
                        style={[
                          fonts.pnbSemiBold,
                          tw`text-base`,
                          { color: colors.text.primary },
                        ]}
                      >
                        SOL
                      </Text>
                    </View>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-xs`,
                        { color: colors.text.tertiary },
                      ]}
                    >
                      Balance: {tapToPaySolBalance.toFixed(4)}
                    </Text>
                  </TouchableOpacity>

                  {/* USDC Option */}
                  <TouchableOpacity
                    onPress={() => setSelectedAsset('USDC')}
                    style={[
                      tw`flex-1 ml-2 p-4 rounded-2xl border-2`,
                      {
                        backgroundColor:
                          selectedAsset === 'USDC'
                            ? colors.primary.bg20
                            : colors.background.gray800,
                        borderColor:
                          selectedAsset === 'USDC'
                            ? colors.primary.main
                            : 'transparent',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center mb-2`}>
                      <Icon
                        name="circle"
                        size={12}
                        color="#2775CA"
                        style={tw`mr-2`}
                      />
                      <Text
                        style={[
                          fonts.pnbSemiBold,
                          tw`text-base`,
                          { color: colors.text.primary },
                        ]}
                      >
                        USDC
                      </Text>
                    </View>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-xs`,
                        { color: colors.text.tertiary },
                      ]}
                    >
                      Balance: {tapToPayUsdcBalance.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-sm mb-3`,
                    { color: colors.text.secondary },
                  ]}
                >
                  Amount
                </Text>
                <View
                  style={[
                    tw`flex-row items-center px-4 py-4 rounded-2xl mb-3`,
                    { backgroundColor: colors.background.gray800 },
                  ]}
                >
                  <TextInput
                    style={[
                      fonts.pnbSemiBold,
                      tw`flex-1 text-2xl`,
                      { color: colors.text.primary },
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-lg ml-2`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {selectedAsset}
                  </Text>
                </View>

                {/* Quick Amount Buttons */}
                <View style={tw`flex-row mb-6`}>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(0.25)}
                    style={[
                      tw`flex-1 mr-2 py-2 rounded-xl`,
                      { backgroundColor: colors.background.gray800 },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-center text-sm`,
                        { color: colors.text.primary },
                      ]}
                    >
                      25%
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(0.5)}
                    style={[
                      tw`flex-1 mx-1 py-2 rounded-xl`,
                      { backgroundColor: colors.background.gray800 },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-center text-sm`,
                        { color: colors.text.primary },
                      ]}
                    >
                      50%
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(0.75)}
                    style={[
                      tw`flex-1 mx-1 py-2 rounded-xl`,
                      { backgroundColor: colors.background.gray800 },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-center text-sm`,
                        { color: colors.text.primary },
                      ]}
                    >
                      75%
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleMaxAmount}
                    style={[
                      tw`flex-1 ml-2 py-2 rounded-xl`,
                      { backgroundColor: colors.primary.bg80 },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-center text-sm`,
                        { color: colors.text.primary },
                      ]}
                    >
                      MAX
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Info Box */}
                {selectedAsset === 'SOL' && (
                  <View
                    style={[
                      tw`flex-row p-3 rounded-xl mb-6`,
                      { backgroundColor: colors.warning.bg },
                    ]}
                  >
                    <Icon
                      name="information"
                      size={20}
                      color={colors.warning.title}
                      style={tw`mr-2 mt-0.5`}
                    />
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-xs flex-1`,
                        { color: colors.warning.text },
                      ]}
                    >
                      Note: 0.01 SOL will be reserved in tap-to-pay wallet for
                      transaction fees
                    </Text>
                  </View>
                )}

                {/* Withdraw Button */}
                <TouchableOpacity
                  onPress={handleWithdraw}
                  disabled={!isValidAmount || isProcessing}
                  style={[
                    tw`py-4 rounded-2xl items-center justify-center mb-4`,
                    {
                      backgroundColor:
                        isValidAmount && !isProcessing
                          ? colors.primary.main
                          : colors.background.gray800,
                    },
                  ]}
                >
                  {isProcessing ? (
                    <ActivityIndicator color={colors.text.primary} />
                  ) : (
                    <Text
                      style={[
                        fonts.pnbBold,
                        tw`text-base`,
                        {
                          color:
                            isValidAmount && !isProcessing
                              ? colors.text.primary
                              : colors.text.tertiary,
                        },
                      ]}
                    >
                      Withdraw {amount ? `${amount} ${selectedAsset}` : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WithdrawFromTapToPayModal;
