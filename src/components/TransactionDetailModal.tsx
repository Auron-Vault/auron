import React, { useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Transaction = {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  symbol: string;
  date: string;
  txHash?: string;
  toAddress?: string;
  fromAddress?: string;
  network?: string;
};

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  assetPrice?: number;
  onShowAlert?: (alert: {
    title: string;
    message: string;
    icon: string;
    iconColor: string;
  }) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  assetPrice = 0,
  onShowAlert,
}) => {
  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      Clipboard.setString(text);
      if (onShowAlert) {
        onShowAlert({
          title: 'Copied!',
          message: `${label} copied to clipboard`,
          icon: 'check-circle',
          iconColor: '#10B981',
        });
      }
    },
    [onShowAlert],
  );

  const openBlockExplorer = useCallback(() => {
    if (!transaction?.txHash) return;

    let explorerUrl = '';
    const txHash = transaction.txHash;

    // Determine explorer URL based on network/symbol
    switch (transaction.symbol) {
      case 'BTC':
        explorerUrl = `https://mempool.space/tx/${txHash}`;
        break;
      case 'ETH':
      case 'USDC':
        explorerUrl = `https://etherscan.io/tx/${txHash}`;
        break;
      case 'BNB':
      case 'USDT':
        explorerUrl = `https://bscscan.com/tx/${txHash}`;
        break;
      case 'SOL':
        explorerUrl = `https://solscan.io/tx/${txHash}`;
        break;
      default:
        explorerUrl = `https://etherscan.io/tx/${txHash}`;
    }

    Linking.openURL(explorerUrl).catch(err =>
      console.error('Failed to open explorer:', err),
    );
  }, [transaction]);

  if (!transaction) return null;

  const usdValue = (transaction.amount * assetPrice).toFixed(2);
  const formattedDate = new Date(transaction.date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          tw`flex-1 justify-end`,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
      >
        <View
          style={[
            tw`rounded-t-3xl p-6`,
            { backgroundColor: colors.background.card, maxHeight: '80%' },
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
              Transaction Details
            </Text>
            <TouchableOpacity onPress={onClose} style={tw`p-2`}>
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Icon */}
            <View style={tw`items-center mb-6`}>
              <View
                style={[
                  tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                  {
                    backgroundColor:
                      transaction.type === 'send'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                  },
                ]}
              >
                <Icon
                  name={transaction.type === 'send' ? 'arrow-up' : 'arrow-down'}
                  size={40}
                  color={
                    transaction.type === 'send'
                      ? colors.status.error
                      : colors.status.success
                  }
                />
              </View>
              <Text
                style={[
                  fonts.pnbBold,
                  tw`text-3xl mb-2`,
                  {
                    color:
                      transaction.type === 'send'
                        ? colors.status.error
                        : colors.status.success,
                  },
                ]}
              >
                {transaction.type === 'send' ? '-' : '+'}
                {transaction.amount.toFixed(6)} {transaction.symbol}
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-lg`,
                  { color: colors.text.tertiary },
                ]}
              >
                ${usdValue}
              </Text>
            </View>

            {/* Transaction Details */}
            <View style={tw`mb-6`}>
              {/* Type */}
              <View style={tw`mb-4`}>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mb-1`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Type
                </Text>
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-base`,
                    { color: colors.text.primary },
                  ]}
                >
                  {transaction.type === 'send' ? 'Sent' : 'Received'}
                </Text>
              </View>

              {/* Date */}
              <View style={tw`mb-4`}>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mb-1`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Date & Time
                </Text>
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-base`,
                    { color: colors.text.primary },
                  ]}
                >
                  {formattedDate}
                </Text>
              </View>

              {/* Transaction Hash */}
              {transaction.txHash && (
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs mb-1`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    Transaction Hash
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(transaction.txHash!, 'Transaction hash')
                    }
                    style={tw`flex-row items-center`}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-sm flex-1`,
                        { color: colors.primary.main },
                      ]}
                      numberOfLines={1}
                    >
                      {transaction.txHash}
                    </Text>
                    <Icon
                      name="content-copy"
                      size={18}
                      color={colors.primary.main}
                      style={tw`ml-2`}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* To Address */}
              {transaction.toAddress && (
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs mb-1`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    To Address
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(transaction.toAddress!, 'Address')
                    }
                    style={tw`flex-row items-center`}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-sm flex-1`,
                        { color: colors.text.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {transaction.toAddress}
                    </Text>
                    <Icon
                      name="content-copy"
                      size={18}
                      color={colors.text.secondary}
                      style={tw`ml-2`}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* From Address */}
              {transaction.fromAddress && (
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs mb-1`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    From Address
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(transaction.fromAddress!, 'Address')
                    }
                    style={tw`flex-row items-center`}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-sm flex-1`,
                        { color: colors.text.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {transaction.fromAddress}
                    </Text>
                    <Icon
                      name="content-copy"
                      size={18}
                      color={colors.text.secondary}
                      style={tw`ml-2`}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Network */}
              {transaction.network && (
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs mb-1`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    Network
                  </Text>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-base`,
                      { color: colors.text.primary },
                    ]}
                  >
                    {transaction.network}
                  </Text>
                </View>
              )}
            </View>

            {/* View on Explorer Button */}
            {transaction.txHash && (
              <TouchableOpacity
                onPress={openBlockExplorer}
                style={[
                  tw`py-4 rounded-xl flex-row items-center justify-center mb-4`,
                  { backgroundColor: colors.primary.bg20 },
                ]}
              >
                <Icon
                  name="open-in-new"
                  size={20}
                  color={colors.primary.main}
                  style={tw`mr-2`}
                />
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-base`,
                    { color: colors.primary.main },
                  ]}
                >
                  View on Block Explorer
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(TransactionDetailModal);
