import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

interface TapToPayCardProps {
  tagId?: string;
  onTopUp?: () => void;
  onAddressGenerated?: (address: string) => void;
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
  onShowAlert,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [solBalance, setSolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [solanaAddress, setSolanaAddress] = useState('');
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Predefined PIN from .env
  const PIN = TAP_TO_PAY_PIN;
  const TAG = tagId || 'tap_to_pay_default';

  // Generate wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        setIsLoading(true);

        // Generate Solana wallet using predefined PIN
        const combinedSeed = `${TAG}-${PIN}`;
        const wallets = await createAllWallets(combinedSeed);
        const address = wallets.solana;

        setSolanaAddress(address);

        // Notify parent component
        if (onAddressGenerated) {
          onAddressGenerated(address);
        }

        // Fetch balances
        await fetchBalances(address);

        setIsLoading(false);
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

    initializeWallet();
  }, [PIN, TAG]);

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

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    if (!solanaAddress) return;
    setIsLoading(true);
    await fetchBalances(solanaAddress);
    setIsLoading(false);
  }, [solanaAddress, fetchBalances]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!solanaAddress) return;

    const interval = setInterval(() => {
      fetchBalances(solanaAddress);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [solanaAddress, fetchBalances]);

  // Format time since last update
  const getTimeDisplay = useCallback(() => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }, [lastUpdate]);

  const totalUsdValue = usdcBalance * 1.0 + solBalance * 200; // Rough estimate

  return (
    <View
      style={[
        tw`mx-6 mt-4 rounded-3xl p-6 shadow-2xl`,
        {
          backgroundColor: colors.primary.bg10,
          borderWidth: 1,
          borderColor: colors.primary.bg20,
        },
      ]}
    >
      {/* Header */}
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
              {onTopUp && (
                <TouchableOpacity
                  onPress={onTopUp}
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
              )}
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
          <View
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
                  require('react-native').Clipboard.setString(solanaAddress);
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
          </View>
        </>
      )}
    </View>
  );
};

export default React.memo(TapToPayCard);
