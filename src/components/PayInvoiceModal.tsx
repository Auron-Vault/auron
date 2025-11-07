import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import apiService, { Invoice } from '../services/apiService';
import { Asset } from '../context/WalletContext';

interface PayInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  payerAddress: string;
  privateKey: string; // Private key for signing transaction
  usdcBalance: number; // Current USDC balance
  onPaymentSuccess: (txHash: string, invoiceId: string) => void; // Called after successful payment
  onShowAlert?: (alert: {
    title: string;
    message: string;
    icon: string;
    iconColor: string;
  }) => void;
  onInvoiceFetched?: () => void; // Callback when invoice is fetched
}

const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  visible,
  onClose,
  payerAddress,
  privateKey,
  usdcBalance,
  onPaymentSuccess,
  onShowAlert,
  onInvoiceFetched,
}) => {
  const [step, setStep] = useState<'input' | 'review' | 'processing'>('input');
  const [invoiceId, setInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentProgress, setPaymentProgress] = useState('');

  const handleFetchInvoice = async () => {
    if (!invoiceId.trim()) {
      onShowAlert?.({
        title: 'Invalid Invoice ID',
        message: 'Please enter a valid invoice ID',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.getInvoice(invoiceId.trim());

      if (result.invoice.payment_status) {
        onShowAlert?.({
          title: 'Already Paid',
          message: 'This invoice has already been paid',
          icon: 'check-circle',
          iconColor: colors.primary.main,
        });
        setLoading(false);
        return;
      }

      setInvoice(result.invoice);
      setStep('review');

      // Notify parent that invoice was fetched
      onInvoiceFetched?.();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      onShowAlert?.({
        title: 'Invoice Not Found',
        message:
          'Could not find invoice with this ID. Please check and try again.',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!invoice) return;

    // Check balance
    const invoiceAmount = parseFloat(invoice.amount);
    if (usdcBalance < invoiceAmount) {
      onShowAlert?.({
        title: 'Insufficient Balance',
        message: `You need ${invoiceAmount} USDC but only have ${usdcBalance} USDC`,
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      return;
    }

    setStep('processing');
    setPaymentProgress('Preparing transaction...');

    try {
      // Import transfer service
      const { transferSolanaSPLToken } = await import(
        '../services/transferService'
      );

      setPaymentProgress('Executing payment...');

      // Create USDC asset object
      const usdcAsset: Asset = {
        id: 'usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        logo: require('../assets/images/usdc_logo.png'),
        price: 1,
        balance: usdcBalance,
        value: usdcBalance * 1,
      };

      // Execute payment
      const result = await transferSolanaSPLToken({
        asset: usdcAsset,
        fromAddress: payerAddress,
        toAddress: invoice.payee,
        amount: invoiceAmount,
        privateKey: privateKey,
      });

      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      setPaymentProgress('Updating invoice status...');

      // Mark invoice as paid
      await apiService.markInvoicePaid(
        invoice.id,
        result.txHash!,
        payerAddress,
      );

      // Success!
      onShowAlert?.({
        title: 'Payment Successful!',
        message: `Invoice paid successfully. Transaction: ${result.txHash!.slice(
          0,
          8,
        )}...`,
        icon: 'check-circle',
        iconColor: colors.primary.main,
      });

      // Notify parent
      onPaymentSuccess(result.txHash!, invoice.id);

      // Close modal
      handleClose();
    } catch (error) {
      console.error('Payment error:', error);
      onShowAlert?.({
        title: 'Payment Failed',
        message:
          error instanceof Error ? error.message : 'Failed to process payment',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      setStep('review'); // Go back to review
    }
  };

  const handleClose = () => {
    setStep('input');
    setInvoiceId('');
    setInvoice(null);
    onClose();
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
              <Icon name="receipt" size={24} color={colors.primary.main} />
              <Text
                style={[
                  fonts.pnbBold,
                  tw`ml-2`,
                  { color: colors.text.primary, fontSize: 20 },
                ]}
              >
                Pay Invoice
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'input' ? (
              /* Input Invoice ID */
              <View>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`mb-4`,
                    { color: colors.text.secondary, fontSize: 14 },
                  ]}
                >
                  Enter the Invoice ID you received to view and pay
                </Text>

                {/* Invoice ID Input */}
                <View style={tw`mb-6`}>
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`mb-2`,
                      { color: colors.text.primary, fontSize: 14 },
                    ]}
                  >
                    Invoice ID *
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
                    placeholder="Paste invoice ID here"
                    placeholderTextColor={colors.text.tertiary}
                    value={invoiceId}
                    onChangeText={setInvoiceId}
                    autoCapitalize="none"
                    multiline
                  />
                </View>

                {/* Fetch Button */}
                <TouchableOpacity
                  style={[
                    tw`py-4 rounded-xl flex-row items-center justify-center`,
                    { backgroundColor: colors.primary.main },
                  ]}
                  onPress={handleFetchInvoice}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Icon name="magnify" size={20} color="#FFF" />
                      <Text
                        style={[
                          fonts.pnbBold,
                          tw`ml-2`,
                          { color: '#FFF', fontSize: 16 },
                        ]}
                      >
                        Fetch Invoice
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : step === 'processing' ? (
              /* Processing Payment */
              <View style={tw`py-8`}>
                <View style={tw`items-center mb-6`}>
                  <View
                    style={[
                      tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                      { backgroundColor: colors.primary.bg20 },
                    ]}
                  >
                    <ActivityIndicator
                      size="large"
                      color={colors.primary.main}
                    />
                  </View>
                  <Text
                    style={[
                      fonts.pnbBold,
                      tw`text-center mb-2`,
                      { color: colors.text.primary, fontSize: 18 },
                    ]}
                  >
                    Processing Payment
                  </Text>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-center`,
                      { color: colors.text.secondary, fontSize: 14 },
                    ]}
                  >
                    {paymentProgress}
                  </Text>
                </View>

                {invoice && (
                  <View
                    style={[
                      tw`p-4 rounded-xl`,
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
                      Paying
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
                )}
              </View>
            ) : (
              /* Review Invoice */
              <View>
                {/* Success Header */}
                <View style={tw`items-center mb-4`}>
                  <View
                    style={[
                      tw`w-16 h-16 rounded-full items-center justify-center mb-3`,
                      { backgroundColor: colors.primary.bg20 },
                    ]}
                  >
                    <Icon
                      name="receipt-text"
                      size={32}
                      color={colors.primary.main}
                    />
                  </View>
                  <Text
                    style={[
                      fonts.pnbBold,
                      tw`text-center mb-1`,
                      { color: colors.text.primary, fontSize: 18 },
                    ]}
                  >
                    Invoice Found
                  </Text>
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-center`,
                      { color: colors.text.secondary, fontSize: 13 },
                    ]}
                  >
                    Review details before proceeding
                  </Text>
                </View>

                {invoice && (
                  <View style={tw`mb-6`}>
                    {/* Invoice ID */}
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
                        Amount to Pay
                      </Text>
                      <Text
                        style={[
                          fonts.pnbBold,
                          { color: colors.primary.main, fontSize: 32 },
                        ]}
                      >
                        {invoice.amount && !invoice.amount.endsWith('0')
                          ? parseFloat(invoice.amount).toFixed(4)
                          : invoice.amount}{' '}
                        {invoice.asset || 'USDC'}
                      </Text>
                    </View>

                    {/* Description */}
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

                    {/* Payee Address */}
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
                        Pay To
                      </Text>
                      <Text
                        style={[
                          fonts.pnbRegular,
                          { color: colors.text.primary, fontSize: 12 },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {invoice.payee}
                      </Text>
                    </View>

                    {/* Warning Box */}
                    <View
                      style={[
                        tw`p-4 rounded-xl mb-4`,
                        {
                          backgroundColor: colors.primary.bg10,
                          borderWidth: 1,
                          borderColor: colors.primary.border30,
                        },
                      ]}
                    >
                      <View style={tw`flex-row items-start`}>
                        <Icon
                          name="information"
                          size={20}
                          color={colors.primary.main}
                          style={tw`mr-2 mt-0.5`}
                        />
                        <Text
                          style={[
                            fonts.pnbRegular,
                            tw`flex-1`,
                            {
                              color: colors.text.secondary,
                              fontSize: 12,
                              lineHeight: 18,
                            },
                          ]}
                        >
                          Payment will be processed from your tap-to-pay wallet.
                          Make sure you have sufficient balance.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    style={[
                      tw`flex-1 py-4 rounded-xl flex-row items-center justify-center`,
                      {
                        backgroundColor: colors.background.elevated,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                      },
                    ]}
                    onPress={() => setStep('input')}
                  >
                    <Icon
                      name="arrow-left"
                      size={20}
                      color={colors.text.secondary}
                    />
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`ml-2`,
                        { color: colors.text.secondary, fontSize: 14 },
                      ]}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      tw`flex-1 py-4 rounded-xl flex-row items-center justify-center`,
                      { backgroundColor: colors.secondary.main },
                    ]}
                    onPress={handlePayNow}
                  >
                    <Icon name="credit-card-outline" size={20} color="#000" />
                    <Text
                      style={[
                        fonts.pnbBold,
                        tw`ml-2`,
                        { color: '#000', fontSize: 14 },
                      ]}
                    >
                      Pay Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PayInvoiceModal;
