import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Asset } from '../context/WalletContext';
import {
  transferAsset,
  validateTransferParams,
  estimateTransferFee,
  TransferResult,
} from '../services/transferService';
import QRCodeScanner from './QRCodeScanner';
import SlideToSend from './SlideToSend';
import CustomAlert from './CustomAlert';
import { saveTransaction } from '../utils/transactionHistory';

interface TransferModalProps {
  visible: boolean;
  asset: Asset | null;
  fromAddress: string;
  onClose: () => void;
  onSuccess: (txHash: string, amount: string, recipientAddress: string) => void;
  privateKey: string; // This should be retrieved securely from wallet
  initialRecipientAddress?: string; // Optional pre-filled recipient address
  maxAmount?: number; // Optional maximum transfer amount
}

const TransferModal: React.FC<TransferModalProps> = ({
  visible,
  asset,
  fromAddress,
  onClose,
  onSuccess,
  privateKey,
  initialRecipientAddress,
  maxAmount,
}) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<{
    fee: number;
    feeUSD: number;
  } | null>(null);

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

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setRecipientAddress(initialRecipientAddress || '');
      setAmount('');
      setEstimatedFee(null);
    }
  }, [visible, initialRecipientAddress]);

  // Estimate fee when amount changes
  const estimateFee = useCallback(async () => {
    if (asset && amount && parseFloat(amount) > 0) {
      try {
        const fee = await estimateTransferFee(asset, parseFloat(amount));
        setEstimatedFee(fee);
      } catch (error) {
        console.error('Fee estimation error:', error);
      }
    } else {
      setEstimatedFee(null);
    }
  }, [amount, asset]);

  React.useEffect(() => {
    estimateFee();
  }, [estimateFee]);

  const handleMaxAmount = useCallback(async () => {
    if (!asset) return;

    try {
      // For native tokens (BTC, ETH, BNB, SOL), we need to subtract gas fees
      // For ERC-20 tokens (USDC, USDT), gas is paid in ETH, so we can send full balance
      const isNativeToken = [
        'bitcoin',
        'ethereum',
        'bnb_smart_chain',
        'solana',
        'xrp_ledger',
        'cardano',
        'dogecoin',
        'tron',
      ].includes(asset.id);

      if (isNativeToken) {
        // Estimate the fee for the maximum amount first
        const tempFee = await estimateTransferFee(asset, asset.balance);

        // For Solana, the fee includes both transaction fee and rent-exempt minimum
        // No additional buffer needed since it's already included
        const maxSendable = Math.max(0, asset.balance - tempFee.fee);

        if (maxSendable <= 0) {
          const feeDescription =
            asset.id === 'solana'
              ? `${tempFee.fee.toFixed(8)} ${
                  asset.symbol
                } (includes rent-exempt reserve)`
              : `${tempFee.fee.toFixed(8)} ${asset.symbol}`;

          setCustomAlert({
            visible: true,
            title: 'Insufficient Balance',
            message: `Your balance is too low to cover the network fee of ${feeDescription}`,
            icon: 'alert-circle',
            iconColor: colors.status.error,
            buttons: [{ text: 'OK', style: 'default' }],
          });
          return;
        }

        setAmount(maxSendable.toString());
      } else {
        // For ERC-20 tokens, gas is paid in ETH, so we can send the full balance
        // Just leave a tiny amount for precision issues
        const maxAmount = asset.balance * 0.9999;
        setAmount(maxAmount.toString());
      }
    } catch (error) {
      console.error('Error calculating max amount:', error);
      // Fallback to 99% of balance
      const maxAmount = asset.balance * 0.99;
      setAmount(maxAmount.toString());
    }
  }, [asset]);

  const handleTransfer = useCallback(async () => {
    if (!asset) {
      setCustomAlert({
        visible: true,
        title: 'Error',
        message: 'No asset selected',
        icon: 'alert-circle',
        iconColor: colors.status.error,
        buttons: [{ text: 'OK', style: 'default' }],
      });
      return;
    }

    // Validate inputs
    const validation = validateTransferParams({
      asset,
      fromAddress,
      toAddress: recipientAddress,
      amount: parseFloat(amount),
      privateKey,
    });

    if (!validation.valid) {
      setCustomAlert({
        visible: true,
        title: 'Validation Error',
        message: validation.error || 'Invalid input',
        icon: 'alert-circle',
        iconColor: colors.status.error,
        buttons: [{ text: 'OK', style: 'default' }],
      });
      return;
    }

    // Check max amount limit if specified
    if (maxAmount !== undefined && parseFloat(amount) > maxAmount) {
      setCustomAlert({
        visible: true,
        title: 'Amount Exceeds Limit',
        message: `Maximum transfer amount is ${maxAmount} ${asset.symbol}`,
        icon: 'alert-circle',
        iconColor: colors.status.warning,
        buttons: [{ text: 'OK', style: 'default' }],
      });
      return;
    }

    // Additional check for native tokens: ensure balance covers amount + gas
    const isNativeToken = [
      'bitcoin',
      'ethereum',
      'bnb_smart_chain',
      'solana',
      'xrp_ledger',
      'cardano',
      'dogecoin',
      'tron',
    ].includes(asset.id);

    if (isNativeToken && estimatedFee) {
      const totalRequired = parseFloat(amount) + estimatedFee.fee;
      if (asset.balance < totalRequired) {
        setCustomAlert({
          visible: true,
          title: 'Insufficient Balance',
          message: `You need ${totalRequired.toFixed(5)} ${
            asset.symbol
          } total (${parseFloat(amount).toFixed(
            5,
          )} + ${estimatedFee.fee.toFixed(
            5,
          )} gas fee), but you only have ${asset.balance.toFixed(5)} ${
            asset.symbol
          }`,
          icon: 'alert-circle',
          iconColor: colors.status.error,
          buttons: [{ text: 'OK', style: 'default' }],
        });
        return;
      }
    }

    // Execute transfer directly (no confirmation dialog)
    await executeTransfer();
  }, [asset, amount, recipientAddress, fromAddress, privateKey, estimatedFee]);

  const executeTransfer = useCallback(async () => {
    if (!asset) return;

    console.log('=== TRANSFER DEBUG ===');
    console.log('Asset ID:', asset.id);
    console.log('Asset Symbol:', asset.symbol);
    console.log('From Address:', fromAddress);
    console.log('To Address:', recipientAddress);
    console.log('Amount:', amount);
    console.log('Private Key Present:', !!privateKey);
    console.log('Private Key Length:', privateKey?.length || 0);

    setIsLoading(true);

    try {
      const result: TransferResult = await transferAsset({
        asset,
        fromAddress,
        toAddress: recipientAddress,
        amount: parseFloat(amount),
        privateKey,
      });

      setIsLoading(false);

      if (result.success && result.txHash) {
        // Save transaction to history
        await saveTransaction(
          {
            type: 'send',
            amount: parseFloat(amount),
            symbol: asset.symbol,
            txHash: result.txHash,
            toAddress: recipientAddress,
            fromAddress: fromAddress,
            network: asset.name,
          },
          fromAddress, // Pass wallet address for backend sync
        );

        setCustomAlert({
          visible: true,
          title: 'Success!',
          message: `Transaction sent successfully!\n\nTx Hash: ${result.txHash.substring(
            0,
            10,
          )}...${result.txHash.substring(result.txHash.length - 8)}`,
          icon: 'check-circle',
          iconColor: colors.status.success,
          buttons: [
            {
              text: 'OK',
              onPress: () => {
                onSuccess(result.txHash!, amount, recipientAddress);
                onClose();
              },
              style: 'default',
            },
          ],
        });
      } else {
        setCustomAlert({
          visible: true,
          title: 'Transfer Failed',
          message: result.error || 'Unknown error occurred',
          icon: 'close-circle',
          iconColor: colors.status.error,
          buttons: [{ text: 'OK', style: 'default' }],
        });
      }
    } catch (error) {
      setIsLoading(false);
      setCustomAlert({
        visible: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Transfer failed',
        icon: 'alert-circle',
        iconColor: colors.status.error,
        buttons: [{ text: 'OK', style: 'default' }],
      });
    }
  }, [
    asset,
    fromAddress,
    recipientAddress,
    amount,
    privateKey,
    onSuccess,
    onClose,
  ]);

  const handlePasteAddress = useCallback(async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setRecipientAddress(text.trim());
        setCustomAlert({
          visible: true,
          title: 'Success',
          message: 'Address pasted from clipboard',
          icon: 'check-circle',
          iconColor: colors.status.success,
          buttons: [{ text: 'OK', style: 'default' }],
        });
      } else {
        setCustomAlert({
          visible: true,
          title: 'Clipboard Empty',
          message: 'Clipboard is empty',
          icon: 'alert-circle',
          iconColor: colors.status.warning,
          buttons: [{ text: 'OK', style: 'default' }],
        });
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      setCustomAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to read clipboard',
        icon: 'alert-circle',
        iconColor: colors.status.error,
        buttons: [{ text: 'OK', style: 'default' }],
      });
    }
  }, []);

  const handleScanQR = useCallback(() => {
    setShowScanner(true);
  }, []);

  const handleQRScanned = useCallback((data: string) => {
    // Extract address from QR code data
    // QR codes might contain just the address or a URI like bitcoin:address or ethereum:address
    let address = data.trim();

    // Handle different QR code formats
    if (address.includes(':')) {
      // Format: bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
      const parts = address.split(':');
      if (parts.length > 1) {
        address = parts[1].split('?')[0]; // Remove any query parameters
      }
    }

    setRecipientAddress(address);
    setShowScanner(false);
  }, []);

  if (!asset) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end`}>
        <View
          style={[
            tw`rounded-t-3xl p-6`,
            { backgroundColor: colors.background.card, maxHeight: '90%' },
          ]}
        >
          {/* Header */}
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text
              style={[
                fonts.pnbBold,
                tw`text-2xl`,
                { color: colors.text.primary },
              ]}
            >
              Send {asset.symbol}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Asset Info Card */}
            <View
              style={[
                tw`p-4 rounded-2xl mb-6`,
                { backgroundColor: colors.primary.bg10 },
              ]}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <View>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Available Balance
                  </Text>
                  <Text
                    style={[
                      fonts.pnbBold,
                      tw`text-2xl mt-1`,
                      { color: colors.text.primary },
                    ]}
                  >
                    {asset.balance.toFixed(5)} {asset.symbol}
                  </Text>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    ≈ ${asset.value.toFixed(2)} USD
                  </Text>
                </View>
                <Icon name="wallet" size={40} color={colors.primary.light} />
              </View>
            </View>

            {/* Recipient Address */}
            <View style={tw`mb-4`}>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-sm mb-2`,
                  { color: colors.text.secondary },
                ]}
              >
                Recipient Address
              </Text>
              <View
                style={[
                  tw`flex-row items-center rounded-xl p-4`,
                  {
                    backgroundColor: colors.background.gray800,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                  },
                ]}
              >
                <TextInput
                  style={[
                    fonts.pnbRegular,
                    tw`flex-1 text-sm`,
                    { color: colors.text.primary },
                  ]}
                  placeholder="Enter recipient address"
                  placeholderTextColor={colors.text.tertiary}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={handleScanQR}
                  style={tw`ml-2`}
                  disabled={isLoading}
                >
                  <Icon
                    name="qrcode-scan"
                    size={24}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePasteAddress}
                  style={tw`ml-2`}
                  disabled={isLoading}
                >
                  <Icon
                    name="content-paste"
                    size={24}
                    color={colors.primary.light}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-sm`,
                    { color: colors.text.secondary },
                  ]}
                >
                  Amount
                </Text>
                <TouchableOpacity
                  onPress={handleMaxAmount}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm`,
                      { color: colors.primary.light },
                    ]}
                  >
                    MAX
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  tw`flex-row items-center rounded-xl p-4`,
                  {
                    backgroundColor: colors.background.gray800,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                  },
                ]}
              >
                <TextInput
                  style={[
                    fonts.pnbBold,
                    tw`flex-1 text-2xl`,
                    { color: colors.text.primary },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.tertiary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-lg`,
                    { color: colors.text.secondary },
                  ]}
                >
                  {asset.symbol}
                </Text>
              </View>
              {amount && parseFloat(amount) > 0 && (
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-sm mt-2`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  ≈ ${(parseFloat(amount) * asset.price).toFixed(2)} USD
                </Text>
              )}
            </View>

            {/* Fee Estimate */}
            {estimatedFee && (
              <View
                style={[
                  tw`p-4 rounded-xl mb-4`,
                  { backgroundColor: colors.background.gray800 },
                ]}
              >
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Network Fee
                  </Text>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm`,
                      { color: colors.text.primary },
                    ]}
                  >
                    {estimatedFee.fee.toFixed(8)} {asset.symbol}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-sm`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Fee in USD
                  </Text>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    ≈ ${estimatedFee.feeUSD.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Total */}
            {amount && parseFloat(amount) > 0 && estimatedFee && (
              <View
                style={[
                  tw`p-4 rounded-xl mb-6`,
                  {
                    backgroundColor: colors.primary.bg10,
                    borderWidth: 1,
                    borderColor: colors.primary.border30,
                  },
                ]}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-base`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Total (Amount + Fee)
                  </Text>
                  <View style={tw`items-end`}>
                    <Text
                      style={[
                        fonts.pnbBold,
                        tw`text-lg`,
                        { color: colors.text.primary },
                      ]}
                    >
                      {(parseFloat(amount) + estimatedFee.fee).toFixed(8)}{' '}
                      {asset.symbol}
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-sm`,
                        { color: colors.text.secondary },
                      ]}
                    >
                      ≈ $
                      {(
                        (parseFloat(amount) + estimatedFee.fee) *
                        asset.price
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Slide to Send */}
            {isLoading ? (
              <View style={tw`py-4 items-center`}>
                <ActivityIndicator size="large" color={colors.primary.light} />
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`mt-2`,
                    { color: colors.text.secondary },
                  ]}
                >
                  Processing transaction...
                </Text>
              </View>
            ) : (
              <SlideToSend
                onSlideComplete={handleTransfer}
                disabled={
                  !recipientAddress || !amount || parseFloat(amount) <= 0
                }
                amount={amount}
                symbol={asset.symbol}
              />
            )}

            {/* Warning */}
            <View
              style={[
                tw`p-3 rounded-xl mt-4`,
                { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
              ]}
            >
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="alert-circle"
                  size={16}
                  color={colors.status.error}
                />
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs ml-2`,
                    { color: colors.status.error },
                  ]}
                >
                  Double-check the recipient address. Transactions cannot be
                  reversed.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* QR Code Scanner */}
      <QRCodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScanned}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        icon={customAlert.icon}
        iconColor={customAlert.iconColor}
        buttons={customAlert.buttons}
        onDismiss={() => setCustomAlert({ ...customAlert, visible: false })}
      />
    </Modal>
  );
};

export default React.memo(TransferModal);
