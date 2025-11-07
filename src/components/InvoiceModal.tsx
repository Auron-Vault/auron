import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Clipboard,
  Animated,
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import apiService, { Invoice } from '../services/apiService';

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  payeeAddress: string;
  mode: 'direct' | 'online';
  onShowAlert?: (alert: {
    title: string;
    message: string;
    icon: string;
    iconColor: string;
  }) => void;
  onInvoiceCreated?: () => void; // Callback to refresh transactions
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  onClose,
  payeeAddress,
  mode,
  onShowAlert,
  onInvoiceCreated,
}) => {
  const [step, setStep] = useState<'create' | 'waiting' | 'display'>('create');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const handleCreateInvoice = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      onShowAlert?.({
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createInvoice(
        payeeAddress,
        amount,
        description || 'Basic Payment',
      );

      setInvoice(result.invoice);

      // Notify parent to refresh transactions
      onInvoiceCreated?.();

      // For Direct Invoice, go to waiting state for NFC tap
      // For Online Invoice, go directly to display
      if (mode === 'direct') {
        setStep('waiting');
        onShowAlert?.({
          title: 'Invoice Created',
          message: 'Waiting for payer to tap their card...',
          icon: 'nfc',
          iconColor: colors.primary.main,
        });
      } else {
        setStep('display');
        onShowAlert?.({
          title: 'Invoice Created',
          message: 'Invoice has been created successfully',
          icon: 'check-circle',
          iconColor: colors.primary.main,
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      onShowAlert?.({
        title: 'Error',
        message: 'Failed to create invoice. Please try again.',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (nfcEnabled) {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setNfcEnabled(false);
    }
    setStep('create');
    setAmount('');
    setDescription('');
    setInvoice(null);
    onClose();
  };

  const getInvoiceData = () => {
    if (!invoice) return '';

    return JSON.stringify({
      id: invoice.id,
      payee: invoice.payee,
      payer: invoice.payer,
      amount: invoice.amount,
      description: invoice.description,
      type: mode,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
      >
        <View
          style={[
            tw`rounded-t-3xl p-6`,
            { backgroundColor: colors.background.card, maxHeight: '85%' },
          ]}
        >
          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <View style={tw`flex-row items-center`}>
              <Icon
                name={mode === 'direct' ? 'qrcode-scan' : 'web'}
                size={24}
                color={colors.primary.main}
              />
              <Text
                style={[
                  fonts.pnbBold,
                  tw`ml-2`,
                  { color: colors.text.primary, fontSize: 20 },
                ]}
              >
                {mode === 'direct' ? 'Direct Invoice' : 'Online Invoice'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'create' ? (
              /* Create Invoice Form */
              <View>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`mb-4`,
                    { color: colors.text.secondary, fontSize: 14 },
                  ]}
                >
                  Create a new invoice for payment
                </Text>

                {/* Amount Input */}
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`mb-2`,
                      { color: colors.text.primary, fontSize: 14 },
                    ]}
                  >
                    Amount (USDC) *
                  </Text>
                  <TextInput
                    style={[
                      fonts.pnbRegular,
                      tw`p-3 rounded-xl`,
                      {
                        backgroundColor: colors.background.elevated,
                        color: colors.text.primary,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={text => {
                      // Allow only numbers and decimal point
                      const cleaned = text.replace(/[^0-9.]/g, '');

                      // Prevent multiple decimal points
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        return;
                      }

                      // Limit to 4 decimal places
                      if (parts[1] && parts[1].length > 4) {
                        return;
                      }

                      setAmount(cleaned);
                    }}
                    onBlur={() => {
                      if (amount && !amount.endsWith('0')) {
                        const num = parseFloat(amount);
                        if (!isNaN(num)) {
                          setAmount(num.toFixed(4));
                        }
                      }
                    }}
                  />
                </View>

                {/* Description Input */}
                <View style={tw`mb-6`}>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`mb-2`,
                      { color: colors.text.primary, fontSize: 14 },
                    ]}
                  >
                    Description (Optional)
                  </Text>
                  <TextInput
                    style={[
                      fonts.pnbRegular,
                      tw`p-3 rounded-xl`,
                      {
                        backgroundColor: colors.background.elevated,
                        color: colors.text.primary,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        minHeight: 80,
                      },
                    ]}
                    placeholder="Basic Payment"
                    placeholderTextColor={colors.text.tertiary}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                {/* Create Button */}
                <TouchableOpacity
                  style={[
                    tw`py-4 rounded-xl flex-row items-center justify-center`,
                    { backgroundColor: colors.primary.main },
                  ]}
                  onPress={handleCreateInvoice}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Icon name="plus-circle" size={20} color="#FFF" />
                      <Text
                        style={[
                          fonts.pnbBold,
                          tw`ml-2`,
                          { color: '#FFF', fontSize: 16 },
                        ]}
                      >
                        Create Invoice
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : step === 'waiting' ? (
              /* Waiting for NFC Tap - Direct Invoice Only */
              <View style={tw`items-center py-8`}>
                <Animated.View
                  style={[
                    tw`mb-6`,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <View
                    style={[
                      tw`w-32 h-32 rounded-full items-center justify-center`,
                      {
                        backgroundColor: colors.primary.bg20,
                        borderWidth: 3,
                        borderColor: colors.primary.main,
                      },
                    ]}
                  >
                    <Icon name="nfc" size={60} color={colors.primary.main} />
                  </View>
                </Animated.View>

                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-center mb-3`,
                    { color: colors.text.primary, fontSize: 22 },
                  ]}
                >
                  Waiting for Payment
                </Text>

                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-center mb-6`,
                    { color: colors.text.secondary, fontSize: 14 },
                  ]}
                >
                  Ask the payer to tap their NFC card{'\n'}on your device to
                  complete payment
                </Text>

                {/* Invoice Amount Display */}
                <View
                  style={[
                    tw`p-6 rounded-2xl mb-6 w-full`,
                    { backgroundColor: colors.primary.bg10 },
                  ]}
                >
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-center mb-2`,
                      { color: colors.text.secondary, fontSize: 12 },
                    ]}
                  >
                    Amount to Receive
                  </Text>
                  <Text
                    style={[
                      fonts.pnbBold,
                      tw`text-center`,
                      { color: colors.primary.main, fontSize: 36 },
                    ]}
                  >
                    {invoice?.amount && !invoice.amount.endsWith('0')
                      ? parseFloat(invoice.amount).toFixed(4)
                      : invoice?.amount}{' '}
                    USDC
                  </Text>
                  {invoice?.description &&
                    invoice.description !== 'Basic Payment' && (
                      <Text
                        style={[
                          fonts.pnbRegular,
                          tw`text-center mt-2`,
                          { color: colors.text.tertiary, fontSize: 12 },
                        ]}
                      >
                        {invoice.description}
                      </Text>
                    )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={[
                    tw`py-3 px-8 rounded-xl`,
                    { backgroundColor: colors.background.elevated },
                  ]}
                  onPress={handleClose}
                >
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      { color: colors.text.secondary, fontSize: 14 },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Display Invoice - After card tap for Direct, or created for Online */
              <View style={tw`items-center`}>
                {mode === 'direct' && invoice && (
                  <View style={tw`mb-6 items-center`}>
                    <View
                      style={[
                        tw`w-24 h-24 rounded-full items-center justify-center mb-4`,
                        {
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        },
                      ]}
                    >
                      <Icon name="check-circle" size={60} color="#10B981" />
                    </View>
                    <Text
                      style={[
                        fonts.pnbBold,
                        tw`text-center mb-2`,
                        { color: colors.text.primary, fontSize: 20 },
                      ]}
                    >
                      Card Detected!
                    </Text>
                    <Text
                      style={[
                        fonts.pnbRegular,
                        tw`text-center mb-4`,
                        { color: colors.text.secondary, fontSize: 14 },
                      ]}
                    >
                      Ready for payment confirmation
                    </Text>
                  </View>
                )}

                {invoice && (
                  <View style={tw`w-full mb-6`}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        Clipboard.setString(invoice.id);
                        if (onShowAlert) {
                          onShowAlert({
                            title: 'Copied!',
                            message: 'Invoice ID copied to clipboard',
                            icon: 'check-circle',
                            iconColor: '#10B981',
                          });
                        }
                      }}
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
                          {invoice.id}
                        </Text>
                      </View>
                      <Icon
                        name="content-copy"
                        size={20}
                        color={colors.primary.main}
                      />
                    </TouchableOpacity>

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
                          { color: colors.primary.main, fontSize: 24 },
                        ]}
                      >
                        {invoice.amount && !invoice.amount.endsWith('0')
                          ? parseFloat(invoice.amount).toFixed(4)
                          : invoice.amount}{' '}
                        {invoice.asset || 'USDC'}
                      </Text>
                    </View>

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
                        {invoice.description}
                      </Text>
                    </View>

                    {mode === 'online' && (
                      <>
                        {/* Status Badge */}
                        <View
                          style={[
                            tw`p-3 rounded-xl mb-3 flex-row items-center`,
                            { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                          ]}
                        >
                          <Icon
                            name="clock-outline"
                            size={18}
                            color="#EF4444"
                          />
                          <Text
                            style={[
                              fonts.pnbSemiBold,
                              tw`ml-2`,
                              { color: '#EF4444', fontSize: 13 },
                            ]}
                          >
                            Awaiting Payment
                          </Text>
                        </View>

                        {/* Instructions */}
                        <View
                          style={[
                            tw`p-4 rounded-xl mb-3`,
                            { backgroundColor: colors.primary.bg10 },
                          ]}
                        >
                          <View style={tw`flex-row items-start mb-2`}>
                            <Icon
                              name="information"
                              size={18}
                              color={colors.primary.main}
                              style={tw`mr-2 mt-0.5`}
                            />
                            <Text
                              style={[
                                fonts.pnbSemiBold,
                                tw`flex-1`,
                                { color: colors.text.primary, fontSize: 13 },
                              ]}
                            >
                              How to share this invoice:
                            </Text>
                          </View>
                          <Text
                            style={[
                              fonts.pnbRegular,
                              tw`ml-6`,
                              {
                                color: colors.text.secondary,
                                fontSize: 12,
                                lineHeight: 18,
                              },
                            ]}
                          >
                            1. Copy the Invoice ID above{'\n'}
                            2. Share it with the payer via message, email, or
                            any app{'\n'}
                            3. Payer enters the ID in "Pay Invoice" section
                            {'\n'}
                            4. They confirm and pay with their tap-to-pay wallet
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    tw`py-4 rounded-xl flex-row items-center justify-center w-full`,
                    { backgroundColor: colors.secondary.main },
                  ]}
                  onPress={handleClose}
                >
                  <Text
                    style={[fonts.pnbBold, { color: '#000', fontSize: 16 }]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default InvoiceModal;
