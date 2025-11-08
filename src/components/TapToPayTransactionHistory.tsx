import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import { TransactionHistoryItem } from '../utils/transactionHistory';

interface TapToPayTransactionHistoryProps {
  transactions: TransactionHistoryItem[];
}

const TapToPayTransactionHistory: React.FC<TapToPayTransactionHistoryProps> = ({
  transactions,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionHistoryItem | null>(null);

  const handleCopyAddress = (address: string) => {
    Clipboard.setString(address);
  };

  const handleCopyTxHash = (txHash: string) => {
    Clipboard.setString(txHash);
  };

  return (
    <View style={tw`mt-6 px-6 flex-1`}>
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text
          style={[fonts.pnbBold, tw`text-base`, { color: colors.text.primary }]}
        >
          Transaction History
        </Text>
        <Text
          style={[
            fonts.pnbRegular,
            tw`text-xs`,
            { color: colors.text.tertiary },
          ]}
        >
          {transactions.length} transaction
          {transactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View
          style={[
            tw`py-8 items-center`,
            {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
            },
          ]}
        >
          <Icon name="history" size={40} color={colors.text.tertiary} />
          <Text
            style={[
              fonts.pnbRegular,
              tw`text-sm mt-2`,
              { color: colors.text.tertiary },
            ]}
          >
            No transactions yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedTransaction(item)}
              style={[
                tw`flex-row items-center justify-between p-3 mb-2`,
                {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                },
              ]}
            >
              <View style={tw`flex-row items-center flex-1`}>
                <View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                    {
                      backgroundColor:
                        item.category === 'invoice'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : item.type === 'send'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                    },
                  ]}
                >
                  <Icon
                    name={
                      item.category === 'invoice'
                        ? 'history'
                        : item.type === 'send'
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    size={20}
                    color={
                      item.category === 'invoice'
                        ? '#A855F7'
                        : item.type === 'send'
                        ? '#EF4444'
                        : '#10B981'
                    }
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm`,
                      { color: colors.text.primary },
                    ]}
                  >
                    {item.category === 'invoice'
                      ? `Invoice ${
                          item.type === 'send' ? 'Payment' : 'Received'
                        }`
                      : `${item.type === 'send' ? 'Sent' : 'Received'} ${
                          item.symbol
                        }`}
                  </Text>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs`,
                      { color: colors.text.tertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.category === 'invoice' && item.invoiceDescription
                      ? item.invoiceDescription
                      : `${new Date(item.date).toLocaleDateString()} • ${
                          item.type === 'send' ? 'To' : 'From'
                        }: ${(item.type === 'send'
                          ? item.toAddress
                          : item.fromAddress
                        )?.slice(0, 8)}...`}
                  </Text>
                </View>
              </View>
              <View style={tw`items-end`}>
                <Text
                  style={[
                    fonts.pnbSemiBold,
                    tw`text-sm`,
                    {
                      color: item.type === 'send' ? '#EF4444' : '#10B981',
                    },
                  ]}
                >
                  {item.type === 'send' ? '-' : '+'}
                  {item.amount.toFixed(4)}
                </Text>
                <View
                  style={[
                    tw`px-2 py-0.5 rounded-full mt-1`,
                    {
                      backgroundColor:
                        item.status === 'confirmed'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : item.status === 'failed'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(250, 204, 21, 0.2)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbRegular,
                      {
                        fontSize: 10,
                        color:
                          item.status === 'confirmed'
                            ? '#10B981'
                            : item.status === 'failed'
                            ? '#EF4444'
                            : '#FACC15',
                      },
                    ]}
                  >
                    {item.category === 'invoice' && item.status === 'pending'
                      ? 'Unpaid'
                      : item.status === 'confirmed'
                      ? 'Paid'
                      : item.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Transaction Detail Modal */}
      <Modal
        visible={selectedTransaction !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View
          style={[
            tw`flex-1 justify-end`,
            { backgroundColor: 'rgba(0,0,0,0.7)' },
          ]}
        >
          <View
            style={[
              tw`rounded-t-3xl p-6`,
              { backgroundColor: colors.background.card, maxHeight: '80%' },
            ]}
          >
            {/* Header */}
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text
                style={[
                  fonts.pnbBold,
                  { color: colors.text.primary, fontSize: 20 },
                ]}
              >
                Transaction Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                <Icon name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTransaction && (
                <View>
                  {/* Status Icon */}
                  <View style={tw`items-center mb-6`}>
                    <View
                      style={[
                        tw`w-20 h-20 rounded-full items-center justify-center mb-3`,
                        {
                          backgroundColor:
                            selectedTransaction.category === 'invoice'
                              ? 'rgba(168, 85, 247, 0.2)'
                              : selectedTransaction.type === 'send'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                        },
                      ]}
                    >
                      <Icon
                        name="account-cash-outline"
                        size={36}
                        color={
                          selectedTransaction.category === 'invoice'
                            ? '#A855F7'
                            : selectedTransaction.type === 'send'
                            ? '#EF4444'
                            : '#10B981'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        fonts.pnbBold,
                        { color: colors.text.primary, fontSize: 18 },
                      ]}
                    >
                      {selectedTransaction.category === 'invoice'
                        ? `Invoice ${
                            selectedTransaction.type === 'send'
                              ? 'Payment'
                              : 'Received'
                          }`
                        : `${
                            selectedTransaction.type === 'send'
                              ? 'Sent'
                              : 'Received'
                          } ${selectedTransaction.symbol}`}
                    </Text>
                  </View>

                  {/* Amount */}
                  <View
                    style={[
                      tw`p-4 rounded-xl mb-3`,
                      { backgroundColor: colors.background.elevated },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`mb-2`,
                        { color: colors.text.secondary, fontSize: 12 },
                      ]}
                    >
                      Amount
                    </Text>
                    <Text
                      style={[
                        fonts.pnbBold,
                        {
                          color:
                            selectedTransaction.type === 'send'
                              ? '#EF4444'
                              : '#10B981',
                          fontSize: 28,
                        },
                      ]}
                    >
                      {selectedTransaction.type === 'send' ? '-' : '+'}
                      {selectedTransaction.amount.toFixed(4)}{' '}
                      {selectedTransaction.symbol}
                    </Text>
                  </View>

                  {/* Status */}
                  <View
                    style={[
                      tw`p-4 rounded-xl mb-3`,
                      { backgroundColor: colors.background.elevated },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`mb-2`,
                        { color: colors.text.secondary, fontSize: 12 },
                      ]}
                    >
                      Status
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      <View
                        style={[
                          tw`px-3 py-1.5 rounded-full`,
                          {
                            backgroundColor:
                              selectedTransaction.status === 'confirmed'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : selectedTransaction.status === 'failed'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(250, 204, 21, 0.2)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            fonts.pnbSemiBold,
                            {
                              fontSize: 12,
                              color:
                                selectedTransaction.status === 'confirmed'
                                  ? '#10B981'
                                  : selectedTransaction.status === 'failed'
                                  ? '#EF4444'
                                  : '#FACC15',
                            },
                          ]}
                        >
                          {selectedTransaction.category === 'invoice' &&
                          selectedTransaction.status === 'pending'
                            ? 'Unpaid'
                            : selectedTransaction.status === 'confirmed'
                            ? 'Paid'
                            : selectedTransaction.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Date */}
                  <View
                    style={[
                      tw`p-4 rounded-xl mb-3`,
                      { backgroundColor: colors.background.elevated },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`mb-2`,
                        { color: colors.text.secondary, fontSize: 12 },
                      ]}
                    >
                      Date
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        { color: colors.text.primary, fontSize: 14 },
                      ]}
                    >
                      {new Date(selectedTransaction.date).toLocaleString()}
                    </Text>
                  </View>

                  {/* Invoice Description */}
                  {selectedTransaction.category === 'invoice' &&
                    selectedTransaction.invoiceDescription && (
                      <View
                        style={[
                          tw`p-4 rounded-xl mb-3`,
                          { backgroundColor: colors.background.elevated },
                        ]}
                      >
                        <Text
                          style={[
                            fonts.pnbSemiBold,
                            tw`mb-2`,
                            { color: colors.text.secondary, fontSize: 12 },
                          ]}
                        >
                          Description
                        </Text>
                        <Text
                          style={[
                            fonts.pnbRegular,
                            { color: colors.text.primary, fontSize: 14 },
                          ]}
                        >
                          {selectedTransaction.invoiceDescription}
                        </Text>
                      </View>
                    )}

                  {/* From Address */}
                  {selectedTransaction.fromAddress && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCopyAddress(selectedTransaction.fromAddress!)
                      }
                      style={[
                        tw`p-4 rounded-xl mb-3 flex-row items-center justify-between`,
                        { backgroundColor: colors.background.elevated },
                      ]}
                    >
                      <View style={tw`flex-1 mr-3`}>
                        <Text
                          style={[
                            fonts.pnbSemiBold,
                            tw`mb-2`,
                            { color: colors.text.secondary, fontSize: 12 },
                          ]}
                        >
                          From
                        </Text>
                        <Text
                          style={[
                            fonts.pnbRegular,
                            { color: colors.text.primary, fontSize: 12 },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {selectedTransaction.fromAddress}
                        </Text>
                      </View>
                      <Icon
                        name="content-copy"
                        size={20}
                        color={colors.primary.main}
                      />
                    </TouchableOpacity>
                  )}

                  {/* To Address */}
                  {selectedTransaction.toAddress && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCopyAddress(selectedTransaction.toAddress!)
                      }
                      style={[
                        tw`p-4 rounded-xl mb-3 flex-row items-center justify-between`,
                        { backgroundColor: colors.background.elevated },
                      ]}
                    >
                      <View style={tw`flex-1 mr-3`}>
                        <Text
                          style={[
                            fonts.pnbSemiBold,
                            tw`mb-2`,
                            { color: colors.text.secondary, fontSize: 12 },
                          ]}
                        >
                          To
                        </Text>
                        <Text
                          style={[
                            fonts.pnbRegular,
                            { color: colors.text.primary, fontSize: 12 },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {selectedTransaction.toAddress}
                        </Text>
                      </View>
                      <Icon
                        name="content-copy"
                        size={20}
                        color={colors.primary.main}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Transaction Hash */}
                  {selectedTransaction.txHash &&
                    !selectedTransaction.txHash.startsWith('invoice-') && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          handleCopyTxHash(selectedTransaction.txHash)
                        }
                        style={[
                          tw`p-4 rounded-xl mb-3 flex-row items-center justify-between`,
                          { backgroundColor: colors.background.elevated },
                        ]}
                      >
                        <View style={tw`flex-1 mr-3`}>
                          <Text
                            style={[
                              fonts.pnbSemiBold,
                              tw`mb-2`,
                              { color: colors.text.secondary, fontSize: 12 },
                            ]}
                          >
                            Transaction Hash
                          </Text>
                          <Text
                            style={[
                              fonts.pnbRegular,
                              { color: colors.text.primary, fontSize: 12 },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            {selectedTransaction.txHash}
                          </Text>
                        </View>
                        <Icon
                          name="content-copy"
                          size={20}
                          color={colors.primary.main}
                        />
                      </TouchableOpacity>
                    )}

                  {/* Invoice ID */}
                  {selectedTransaction.invoiceId && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCopyTxHash(selectedTransaction.invoiceId!)
                      }
                      style={[
                        tw`p-4 rounded-xl mb-3 flex-row items-center justify-between`,
                        { backgroundColor: colors.background.elevated },
                      ]}
                    >
                      <View style={tw`flex-1 mr-3`}>
                        <Text
                          style={[
                            fonts.pnbSemiBold,
                            tw`mb-2`,
                            { color: colors.text.secondary, fontSize: 12 },
                          ]}
                        >
                          Invoice ID
                        </Text>
                        <Text
                          style={[
                            fonts.pnbRegular,
                            { color: colors.text.primary, fontSize: 12 },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {selectedTransaction.invoiceId}
                        </Text>
                      </View>
                      <Icon
                        name="content-copy"
                        size={20}
                        color={colors.primary.main}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Network */}
                  <View
                    style={[
                      tw`p-4 rounded-xl mb-6`,
                      { backgroundColor: colors.background.elevated },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`mb-2`,
                        { color: colors.text.secondary, fontSize: 12 },
                      ]}
                    >
                      Network
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        { color: colors.text.primary, fontSize: 14 },
                      ]}
                    >
                      {selectedTransaction.network}
                    </Text>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={[
                      tw`py-4 rounded-xl flex-row items-center justify-center`,
                      { backgroundColor: colors.primary.main },
                    ]}
                    onPress={() => setSelectedTransaction(null)}
                  >
                    <Text
                      style={[fonts.pnbBold, { color: '#FFF', fontSize: 16 }]}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TapToPayTransactionHistory;
