import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon = 'alert-circle',
  iconColor = colors.primary.main,
  buttons = [],
  onDismiss,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          tw`flex-1 justify-center items-center px-6`,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onDismiss}
          style={tw`absolute inset-0`}
        />

        <Animated.View
          style={[
            tw`w-full max-w-sm rounded-3xl overflow-hidden`,
            {
              backgroundColor: colors.background.card,
              borderWidth: 1,
              borderColor: colors.primary.border30,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Gradient Header */}
          <View
            style={[
              tw`p-6 pb-4 items-center`,
              {
                backgroundColor: colors.primary.bg10,
              },
            ]}
          >
            {/* Icon with glow effect */}
            <View
              style={[
                tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                {
                  backgroundColor: colors.primary.bg20,
                  shadowColor: iconColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 10,
                },
              ]}
            >
              <View
                style={[
                  tw`w-14 h-14 rounded-full items-center justify-center`,
                  {
                    backgroundColor: `${iconColor}15`,
                  },
                ]}
              >
                <Icon name={icon} size={32} color={iconColor} />
              </View>
            </View>

            {/* Title */}
            <Text
              style={[
                fonts.pnbBold,
                tw`text-xl text-center`,
                { color: colors.text.primary },
              ]}
            >
              {title}
            </Text>
          </View>

          {/* Message */}
          {message && (
            <View style={tw`px-6 py-4`}>
              <Text
                style={[
                  fonts.pnbRegular,
                  tw`text-center text-sm leading-5`,
                  { color: colors.text.secondary },
                ]}
              >
                {message}
              </Text>
            </View>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <View
              style={[
                tw`px-6 pb-6 pt-2`,
                buttons.length > 2 ? tw`gap-3` : tw`flex-row gap-3`,
              ]}
            >
              {buttons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDestructive = button.style === 'destructive';
                const isPrimary = button.style === 'default' || !button.style;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={[
                      tw`py-3 px-5 rounded-xl flex-1 items-center justify-center`,
                      isCancel && {
                        backgroundColor: colors.background.gray800,
                        borderWidth: 1,
                        borderColor: colors.primary.border30,
                      },
                      isDestructive && {
                        backgroundColor: colors.status.error + '20',
                        borderWidth: 1,
                        borderColor: colors.status.error + '40',
                      },
                      isPrimary && {
                        backgroundColor: colors.primary.bg80,
                      },
                      buttons.length > 2 && tw`flex-none w-full`,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        fonts.pnbSemiBold,
                        tw`text-base`,
                        isCancel && { color: colors.text.secondary },
                        isDestructive && { color: colors.status.error },
                        isPrimary && { color: colors.text.primary },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomAlert;
