import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

type TransactionSuccessModalProps = {
  visible: boolean;
  txHash: string;
  amount: string;
  assetSymbol: string;
  recipientAddress: string;
  network: string;
  onClose: () => void;
};

const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  visible,
  txHash,
  amount,
  assetSymbol,
  recipientAddress,
  network,
  onClose,
}) => {
  const getExplorerUrl = (hash: string, networkType: string): string => {
    const explorers: { [key: string]: string } = {
      bitcoin: `https://blockchair.com/bitcoin/transaction/${hash}`,
      ethereum: `https://etherscan.io/tx/${hash}`,
      bsc: `https://bscscan.com/tx/${hash}`,
      solana: `https://explorer.solana.com/tx/${hash}`,
    };
    return explorers[networkType] || '';
  };

  const openExplorer = () => {
    const url = getExplorerUrl(txHash, network);
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background.card },
          ]}
        >
          {/* Success Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary.bg10 },
            ]}
          >
            <Icon name="check-circle" size={64} color={colors.primary.main} />
          </View>

          {/* Title */}
          <Text
            style={[
              fonts.pnbSemiBold,
              styles.title,
              { color: colors.text.primary },
            ]}
          >
            Transaction Sent!
          </Text>

          {/* Amount */}
          <Text
            style={[
              fonts.pnbBold,
              styles.amount,
              { color: colors.primary.main },
            ]}
          >
            {amount} {assetSymbol}
          </Text>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text
                style={[
                  fonts.pnbRegular,
                  styles.label,
                  { color: colors.text.tertiary },
                ]}
              >
                To
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  styles.value,
                  { color: colors.text.secondary },
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={[
                  fonts.pnbRegular,
                  styles.label,
                  { color: colors.text.tertiary },
                ]}
              >
                Transaction Hash
              </Text>
              <TouchableOpacity
                onPress={openExplorer}
                style={styles.hashButton}
              >
                <Text
                  style={[
                    fonts.pnbRegular,
                    styles.hashValue,
                    { color: colors.primary.light },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-10)}
                </Text>
                <Icon
                  name="open-in-new"
                  size={16}
                  color={colors.primary.light}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={[
                  fonts.pnbRegular,
                  styles.label,
                  { color: colors.text.tertiary },
                ]}
              >
                Network
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  styles.value,
                  { color: colors.text.secondary },
                ]}
              >
                {network.charAt(0).toUpperCase() + network.slice(1)}
              </Text>
            </View>
          </View>

          {/* Note */}
          <View
            style={[
              styles.noteContainer,
              { backgroundColor: colors.background.gray800 },
            ]}
          >
            <Icon name="info-outline" size={20} color={colors.text.tertiary} />
            <Text
              style={[
                fonts.pnbRegular,
                styles.noteText,
                { color: colors.text.tertiary },
              ]}
            >
              Your transaction has been submitted to the network. It may take a
              few minutes to confirm.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              { backgroundColor: colors.primary.main },
            ]}
          >
            <Text
              style={[
                fonts.pnbSemiBold,
                styles.closeButtonText,
                { color: colors.background.primary },
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
  },
  hashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hashValue: {
    fontSize: 14,
    flex: 1,
  },
  noteContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default TransactionSuccessModal;
