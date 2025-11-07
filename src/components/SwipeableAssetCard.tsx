import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import { Asset } from '../context/WalletContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width

interface SwipeableAssetCardProps {
  item: Asset;
  onPress: () => void;
}

const SwipeableAssetCard: React.FC<SwipeableAssetCardProps> = ({
  item,
  onPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const onGestureEvent = (event: any) => {
    const translation = event.nativeEvent.translationX;
    translateX.setValue(translation);

    // Update opacity based on swipe distance
    const absTranslation = Math.abs(translation);
    const newOpacity = Math.min(absTranslation / SWIPE_THRESHOLD, 1);
    opacity.setValue(newOpacity);
  };

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: translation, velocityX } = event.nativeEvent;

      // If swiped enough or has strong velocity, open the detail
      if (
        Math.abs(translation) > SWIPE_THRESHOLD ||
        Math.abs(velocityX) > 500
      ) {
        // Trigger navigation
        onPress();
        // Reset position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Reset to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  return (
    <View style={tw`relative`}>
      {/* Background hint indicators */}
      <Animated.View
        style={[
          tw`absolute left-0 top-0 bottom-0 flex-row items-center px-4`,
          { opacity, zIndex: 0 },
        ]}
      >
        <Icon name="chevron-right" size={24} color={colors.primary.main} />
        <Text
          style={[
            fonts.pnbSemiBold,
            tw`text-sm ml-2`,
            { color: colors.primary.main },
          ]}
        >
          View Details
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          tw`absolute right-0 top-0 bottom-0 flex-row items-center px-4`,
          { opacity, zIndex: 0 },
        ]}
      >
        <Text
          style={[
            fonts.pnbSemiBold,
            tw`text-sm mr-2`,
            { color: colors.primary.main },
          ]}
        >
          View Details
        </Text>
        <Icon name="chevron-left" size={24} color={colors.primary.main} />
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                    outputRange: [-SCREEN_WIDTH * 0.4, 0, SCREEN_WIDTH * 0.4],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
              tw`my-1 flex-row rounded-2xl shadow-lg py-3 px-4`,
              {
                borderWidth: 1,
                borderColor: colors.border.primary,
                backgroundColor: colors.background.gray800,
              },
            ]}
          >
            <Image source={item.logo} style={tw`h-12 w-12 mr-3 self-center`} />
            <View style={tw`flex-col items-start flex-1 justify-center py-1`}>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base`,
                  { color: colors.text.primary },
                ]}
              >
                {item.name}
              </Text>
              <View style={tw`flex-row items-center flex-wrap`}>
                <Text
                  style={[
                    fonts.pnbRegular,
                    tw`text-sm`,
                    { color: colors.text.secondary },
                  ]}
                >
                  $
                  {item.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                {item.priceChangePercentage !== undefined && (
                  <View
                    style={[
                      tw`ml-2 px-1.5 py-0.5 rounded`,
                      {
                        backgroundColor:
                          item.priceChangePercentage >= 0
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-xs`,
                        {
                          color:
                            item.priceChangePercentage >= 0
                              ? colors.status.success
                              : colors.status.error,
                        },
                      ]}
                    >
                      {item.priceChangePercentage >= 0 ? '+' : ''}
                      {item.priceChangePercentage.toFixed(2)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={tw`items-end justify-center ml-3 py-1`}>
              <Text
                style={[
                  fonts.pnbSemiBold,
                  tw`text-base`,
                  { color: colors.text.primary },
                ]}
              >
                {item.balance.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 5,
                })}{' '}
                {item.symbol}
              </Text>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-sm`,
                  { color: colors.text.secondary },
                ]}
              >
                ${' '}
                {item.value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeableAssetCard;
