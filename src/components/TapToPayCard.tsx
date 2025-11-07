import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import createAllWallets from '../hooks/CreateWallet';
import {
  fetchSolanaBalance,
  fetchSolanaSPLTokenBalance,
} from '../services/balanceService';
import { TAP_TO_PAY_PIN } from '@env';
import {
  saveWalletId,
  getTransactionHistory,
  getTransactionHistoryWithInvoices,
  TransactionHistoryItem,
} from '../utils/transactionHistory';
import InvoiceModal from './InvoiceModal';
import PayInvoiceModal from './PayInvoiceModal';
import TopUpTapToPayModal from './TopUpTapToPayModal';
import WithdrawFromTapToPayModal from './WithdrawFromTapToPayModal';
import { Asset } from '../context/WalletContext';
import { useWallet } from '../context/WalletContext';
import apiService from '../services/apiService';

interface TapToPayCardProps {
  tagId?: string;
  onTopUp?: () => void;
  onAddressGenerated?: (address: string) => void;
  onTransactionsUpdate?: (transactions: TransactionHistoryItem[]) => void;
  onShowAlert?: (alert: {
    title: string;
    message: string;
    icon: string;
    iconColor: string;
  }) => void;
}

const TapToPayCard: React.FC<TapToPayCardProps> = ({
  tagId,
  onTopUp,
  onAddressGenerated,
  onTransactionsUpdate,
  onShowAlert,
}) => {
  // Use context for persistent state
  const {
    tapToPayAddress: contextAddress,
    setTapToPayAddress: setContextAddress,
    tapToPayInitialized,
    setTapToPayInitialized,
  } = useWallet();

  const [isLoading, setIsLoading] = useState(!tapToPayInitialized);
  const [solBalance, setSolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [solanaAddress, setSolanaAddress] = useState(contextAddress || '');
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'direct' | 'online'>('direct');
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

  // Predefined PIN from .env - memoize to prevent re-initialization
  const PIN = useRef(TAP_TO_PAY_PIN).current;
  const TAG = useRef(tagId || 'tap_to_pay_default').current;

  // Generate wallet on mount ONCE - defer heavy operations for smooth navigation
  useEffect(() => {
    // Check if already initialized in context
    if (tapToPayInitialized && contextAddress) {
      console.log(
        '[TapToPayCard] Already initialized from context:',
        contextAddress,
      );
      setSolanaAddress(contextAddress);
      setIsLoading(false);

      // Notify parent and fetch data in background
      if (onAddressGenerated) {
        onAddressGenerated(contextAddress);
      }

      // Fetch balances and transactions in background
      setTimeout(async () => {
        await fetchBalances(contextAddress);
        await loadTransactions(contextAddress);
      }, 100);

      return;
    }
    const initializeWallet = async () => {
      try {
        setIsLoading(true);

        // Generate Solana wallet using predefined PIN
        const combinedSeed = `${TAG}-${PIN}`;
        const wallets = await createAllWallets(combinedSeed);
        const address = wallets.solana;

        setSolanaAddress(address);
        setContextAddress(address); // Save to context
        setTapToPayInitialized(true); // Mark as initialized in context

        // Notify parent component immediately
        if (onAddressGenerated) {
          onAddressGenerated(address);
        }

        // Stop loading to show UI quickly
        setIsLoading(false);

        // Defer heavy operations to avoid blocking navigation
        setTimeout(async () => {
          // Register wallet with backend (async, non-blocking)
          saveWalletId(address, 'tap-to-pay').catch(err =>
            console.warn('Failed to register tap-to-pay wallet:', err),
          );

          // Fetch balances and transactions in background
          await fetchBalances(address);
          await loadTransactions(address);
        }, 100); // 100ms delay to allow screen transition to complete
      } catch (error) {
        console.error('Failed to initialize Tap-to-Pay wallet:', error);
        if (onShowAlert) {
          onShowAlert({
            title: 'Initialization Failed',
            message: 'Failed to initialize Tap-to-Pay wallet',
            icon: 'alert-circle',
            iconColor: '#EF4444',
          });
        }
        setIsLoading(false);
      }
    };

    // Defer initialization slightly to allow navigation animation to complete
    const timer = setTimeout(() => {
      initializeWallet();
    }, 50);

    return () => clearTimeout(timer);
  }, []); // Run ONLY on mount - empty dependency array

  // Get private key when address is ready
  useEffect(() => {
    const getPrivKey = async () => {
      if (solanaAddress) {
        try {
          const { getPrivateKey } = await import('../hooks/CreateWallet');
          const combinedSeed = `${TAG}-${PIN}`;
          const privKey = await getPrivateKey(combinedSeed, 'solana');
          setPrivateKey(privKey);
        } catch (error) {
          console.error('Failed to get private key:', error);
        }
      }
    };
    getPrivKey();
  }, [solanaAddress, TAG, PIN]);

  // Fetch balances
  const fetchBalances = useCallback(async (address: string) => {
    try {
      // Fetch SOL balance
      const solResult = await fetchSolanaBalance(address);
      setSolBalance(solResult.balance);

      // Fetch USDC (Solana) balance
      const usdcResult = await fetchSolanaSPLTokenBalance(
        address,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint address
      );
      setUsdcBalance(usdcResult.balance);

      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch Tap-to-Pay balances:', error);
    }
  }, []);

  // Load transaction history
  const loadTransactions = useCallback(
    async (address: string) => {
      try {
        const history = await getTransactionHistoryWithInvoices(address);
        // Filter only transactions for this address
        const filtered = history.filter(
          tx => tx.fromAddress === address || tx.toAddress === address,
        );

        console.log(
          `[TapToPayCard] Loaded ${filtered.length} transactions (including invoices)`,
        );

        // Notify parent component with updated transactions
        if (onTransactionsUpdate) {
          onTransactionsUpdate(filtered);
        }
      } catch (error) {
        console.error('Failed to load Tap-to-Pay transactions:', error);
      }
    },
    [onTransactionsUpdate],
  );

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    if (!solanaAddress) return;
    setIsLoading(true);
    await fetchBalances(solanaAddress);
    await loadTransactions(solanaAddress);
    setIsLoading(false);
  }, [solanaAddress, fetchBalances, loadTransactions]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!solanaAddress) return;

    const interval = setInterval(() => {
      fetchBalances(solanaAddress);
      loadTransactions(solanaAddress);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [solanaAddress, fetchBalances, loadTransactions]);

  // Format time since last update
  const getTimeDisplay = useCallback(() => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }, [lastUpdate]);

  // Handle successful invoice payment
  const handlePaymentSuccess = async (txHash: string, invoiceId: string) => {
    // Refresh balances and transactions
    await fetchBalances(solanaAddress);
    await loadTransactions(solanaAddress);
  };

  const totalUsdValue = usdcBalance * 1.0 + solBalance * 200; // Rough estimate

  return (
    <View
      style={[
        tw`mx-4 mt-0 rounded-3xl p-6 shadow-2xl`,
        {
          backgroundColor: colors.primary.bg10,
          borderWidth: 1,
          borderColor: colors.primary.bg20,
        },
      ]}
    >
      {/* Header */}
      <View style={tw`px-6`}>
        <View style={tw`flex-row items-center justify-center mb-2`}>
          <Icon name="chevron-left" size={16} color="#666" />
          <Text style={[fonts.pnbRegular, tw`text-xs mx-2`, { color: '#666' }]}>
            Swipe to go back
          </Text>
          <Icon name="chevron-right" size={16} color="#666" />
        </View>
      </View>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View style={tw`flex-row items-center`}>
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
              { backgroundColor: colors.primary.bg20 },
            ]}
          >
            <Icon
              name="contactless-payment"
              size={24}
              color={colors.primary.main}
            />
          </View>
          <View>
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`text-base`,
                { color: colors.text.primary },
              ]}
            >
              Tap-to-Pay Wallet
            </Text>
            <Text
              style={[
                fonts.pnbRegular,
                tw`text-xs`,
                { color: colors.text.tertiary },
              ]}
            >
              Solana Network
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
          <Icon
            name="refresh"
            size={20}
            color={isLoading ? colors.text.tertiary : colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      {isLoading && !solanaAddress ? (
        <View style={tw`py-8 items-center`}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text
            style={[
              fonts.pnbRegular,
              tw`text-sm mt-2`,
              { color: colors.text.secondary },
            ]}
          >
            Initializing wallet...
          </Text>
        </View>
      ) : (
        <>
          {/* Total Balance */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-between items-start`}>
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs mb-1`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Total Balance
                </Text>
                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-3xl`,
                    { color: colors.text.primary },
                  ]}
                >
                  ${totalUsdValue.toFixed(2)}
                </Text>
                {lastUpdate > 0 && (
                  <Text
                    style={[
                      fonts.pnbRegular,
                      tw`text-xs mt-1`,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    Updated {getTimeDisplay()}
                  </Text>
                )}
              </View>
              <View style={tw`gap-2`}>
                {/* Top Up Button */}
                <TouchableOpacity
                  onPress={() => setShowTopUpModal(true)}
                  style={[
                    tw`px-4 py-2 rounded-xl flex-row items-center`,
                    { backgroundColor: colors.primary.bg80 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="plus-circle"
                    size={16}
                    color={colors.text.primary}
                  />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm ml-1`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Top Up
                  </Text>
                </TouchableOpacity>

                {/* Withdraw Button */}
                <TouchableOpacity
                  onPress={async () => {
                    // Get private key for tap-to-pay wallet
                    const { getPrivateKey } = await import(
                      '../hooks/CreateWallet'
                    );
                    const combinedSeed = `${TAG}-${PIN}`;
                    const privKey = await getPrivateKey(combinedSeed, 'solana');
                    setPrivateKey(privKey);
                    setShowWithdrawModal(true);
                  }}
                  style={[
                    tw`px-4 py-2 rounded-xl flex-row items-center`,
                    {
                      backgroundColor: colors.background.gray800,
                      borderWidth: 1,
                      borderColor: colors.primary.border30,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="arrow-up-circle"
                    size={16}
                    color={colors.text.primary}
                  />
                  <Text
                    style={[
                      fonts.pnbSemiBold,
                      tw`text-sm ml-1`,
                      { color: colors.text.primary },
                    ]}
                  >
                    Withdraw
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Asset Balances */}
          <View style={tw`flex-row justify-between mb-4`}>
            {/* SOL Balance */}
            <View style={tw`flex-1 mr-2`}>
              <View
                style={[
                  tw`p-4 rounded-2xl`,
                  { backgroundColor: colors.background.gray800 },
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
                      tw`text-xs`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    SOL
                  </Text>
                </View>
                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-lg`,
                    { color: colors.text.primary },
                  ]}
                >
                  {solBalance.toFixed(4)}
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  ${(solBalance * 200).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* USDC Balance */}
            <View style={tw`flex-1 ml-2`}>
              <View
                style={[
                  tw`p-4 rounded-2xl`,
                  { backgroundColor: colors.background.gray800 },
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
                      tw`text-xs`,
                      { color: colors.text.secondary },
                    ]}
                  >
                    USDC
                  </Text>
                </View>
                <Text
                  style={[
                    fonts.pnbBold,
                    tw`text-lg`,
                    { color: colors.text.primary },
                  ]}
                >
                  {usdcBalance.toFixed(2)}
                </Text>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-xs`,
                    { color: colors.text.tertiary },
                  ]}
                >
                  ${usdcBalance.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet Address */}
          {/* <View
            style={[
              tw`p-3 rounded-xl flex-row items-center justify-between`,
              { backgroundColor: colors.background.gray800 },
            ]}
          >
            <View style={tw`flex-1 mr-2`}>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-xs mb-1`,
                  { color: colors.text.tertiary },
                ]}
              >
                Wallet Address
              </Text>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-xs`,
                  { color: colors.text.primary },
                ]}
                numberOfLines={1}
              >
                {solanaAddress}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (solanaAddress) {
                  Clipboard.setString(solanaAddress);
                  if (onShowAlert) {
                    onShowAlert({
                      title: 'Copied!',
                      message: 'Address copied to clipboard',
                      icon: 'check-circle',
                      iconColor: '#10B981',
                    });
                  }
                }
              }}
            >
              <Icon name="content-copy" size={18} color={colors.primary.main} />
            </TouchableOpacity>
          </View> */}

          {/* Invoice Buttons */}
          <View style={tw`flex-row gap-3 mt-4`}>
            <TouchableOpacity
              style={[
                tw`flex-1 py-3 rounded-xl flex-row items-center justify-center`,
                { backgroundColor: colors.primary.main },
              ]}
              onPress={() => {
                setInvoiceMode('direct');
                setShowInvoiceModal(true);
              }}
            >
              <Icon name="qrcode-scan" size={20} color="#000" />
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`ml-2`,
                  { color: '#000', fontSize: 14 },
                ]}
              >
                Direct Invoice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tw`flex-1 py-3 rounded-xl flex-row items-center justify-center`,
                { backgroundColor: colors.primary.main },
              ]}
              onPress={() => {
                setInvoiceMode('online');
                setShowInvoiceModal(true);
              }}
            >
              <Icon name="web" size={20} color="#FFF" />
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`ml-2`,
                  { color: '#FFF', fontSize: 14 },
                ]}
              >
                Online Invoice
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pay Invoice Button */}
          <TouchableOpacity
            style={[
              tw`py-3 rounded-xl flex-row items-center justify-center mt-3`,
              {
                backgroundColor: colors.background.elevated,
                borderWidth: 1,
                borderColor: colors.border.purple,
              },
            ]}
            onPress={() => setShowPayInvoiceModal(true)}
          >
            {/* <Icon name="receipt-text" size={20} color={colors.primary.main} /> */}
            <Icon
              name="arrow-right"
              size={16}
              color={colors.primary.main}
              style={tw`mx-2`}
            />
            <Text
              style={[
                fonts.pnbSemiBold,
                tw`ml-2`,
                { color: colors.primary.main, fontSize: 14 },
              ]}
            >
              Pay Invoice
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payeeAddress={solanaAddress}
        mode={invoiceMode}
        onShowAlert={onShowAlert}
        onInvoiceCreated={() => {
          // Refresh transactions to show new invoice
          loadTransactions(solanaAddress);
        }}
      />

      {/* Pay Invoice Modal */}
      <PayInvoiceModal
        visible={showPayInvoiceModal}
        onClose={() => setShowPayInvoiceModal(false)}
        payerAddress={solanaAddress}
        privateKey={privateKey}
        usdcBalance={usdcBalance}
        onPaymentSuccess={handlePaymentSuccess}
        onShowAlert={onShowAlert}
        onInvoiceFetched={() => {
          // Refresh transactions to show fetched invoice
          loadTransactions(solanaAddress);
        }}
      />

      {/* Top Up Modal */}
      <TopUpTapToPayModal
        visible={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        tapToPayAddress={solanaAddress}
        onSuccess={message => {
          // Ensure modal is closed first
          setShowTopUpModal(false);

          // Wait for modal to fully close before showing alert
          setTimeout(() => {
            if (onShowAlert) {
              onShowAlert({
                title: 'Success',
                message,
                icon: 'check-circle',
                iconColor: colors.status.success,
              });
            }
            // Refresh balances after successful top-up
            handleRefresh();
          }, 500);
        }}
        onError={message => {
          if (onShowAlert) {
            onShowAlert({
              title: 'Error',
              message,
              icon: 'alert-circle',
              iconColor: colors.status.error,
            });
          }
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawFromTapToPayModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        tapToPayAddress={solanaAddress}
        tapToPayPrivateKey={privateKey}
        tapToPaySolBalance={solBalance}
        tapToPayUsdcBalance={usdcBalance}
        onSuccess={message => {
          // Ensure modal is closed first
          setShowWithdrawModal(false);

          // Wait for modal to fully close before showing alert
          setTimeout(() => {
            if (onShowAlert) {
              onShowAlert({
                title: 'Success',
                message,
                icon: 'check-circle',
                iconColor: colors.status.success,
              });
            }
            // Refresh balances after successful withdrawal
            handleRefresh();
          }, 500);
        }}
        onError={message => {
          if (onShowAlert) {
            onShowAlert({
              title: 'Error',
              message,
              icon: 'alert-circle',
              iconColor: colors.status.error,
            });
          }
        }}
      />
    </View>
  );
};

export default React.memo(TapToPayCard);
