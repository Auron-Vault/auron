import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';

interface SlideToSendProps {
  onSlideComplete: () => void;
  disabled?: boolean;
  amount?: string;
  symbol?: string;
}

const SLIDER_WIDTH = 300;
const BUTTON_WIDTH = 60;
const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_WIDTH - 10;

const SlideToSend: React.FC<SlideToSendProps> = ({
  onSlideComplete,
  disabled = false,
  amount,
  symbol,
}) => {
  const [sliding, setSliding] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [completed, setCompleted] = useState(false);

  // Use refs to store latest values
  const disabledRef = useRef(disabled);
  const completedRef = useRef(completed);
  const onSlideCompleteRef = useRef(onSlideComplete);

  // Update refs when props/state change
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    onSlideCompleteRef.current = onSlideComplete;
  }, [onSlideComplete]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        if (!disabledRef.current && !completedRef.current) {
          setSliding(true);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabledRef.current || completedRef.current) return;

        const newValue = Math.max(
          0,
          Math.min(gestureState.dx, SLIDE_THRESHOLD),
        );
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        setSliding(false);

        if (
          gestureState.dx >= SLIDE_THRESHOLD &&
          !disabledRef.current &&
          !completedRef.current
        ) {
          // Completed slide
          Animated.spring(slideAnim, {
            toValue: SLIDE_THRESHOLD,
            useNativeDriver: false,
            tension: 40,
            friction: 5,
          }).start(() => {
            setCompleted(true);
            setTimeout(() => {
              onSlideCompleteRef.current();
            }, 100);
          });
        } else {
          // Slide back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            tension: 40,
            friction: 5,
          }).start();
        }
      },
    }),
  ).current;

  // Format amount to 5 decimal places
  const formattedAmount = amount
    ? parseFloat(amount)
        .toFixed(5)
        .replace(/\.?0+$/, '')
    : '';

  const buttonOpacity = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD],
    outputRange: [1, 0],
  });

  const trackOpacity = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD / 2, SLIDE_THRESHOLD],
    outputRange: [0.3, 0.5, 1],
  });

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.track} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.trackFill,
            {
              width: slideAnim.interpolate({
                inputRange: [0, SLIDE_THRESHOLD],
                outputRange: [0, SLIDER_WIDTH - 20],
              }),
              opacity: trackOpacity,
            },
          ]}
        />

        <Animated.Text
          style={[fonts.pnbSemiBold, styles.text, { opacity: buttonOpacity }]}
        >
          {completed
            ? 'Sending...'
            : sliding
            ? 'Keep sliding...'
            : 'Slide to send'}
        </Animated.Text>

        {amount && symbol && !completed && (
          <Animated.Text
            style={[
              fonts.pnbBold,
              styles.amountText,
              { opacity: buttonOpacity },
            ]}
          >
            {formattedAmount} {symbol}
          </Animated.Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ translateX: slideAnim }],
          },
          completed && styles.buttonCompleted,
        ]}
        {...panResponder.panHandlers}
      >
        <Icon
          name={completed ? 'check' : 'arrow-right'}
          size={28}
          color="#FFFFFF"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 70,
    position: 'relative',
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: SLIDER_WIDTH,
    height: 70,
    backgroundColor: colors.primary.bg20,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary.border50,
  },
  trackFill: {
    position: 'absolute',
    left: 10,
    height: 66,
    backgroundColor: colors.primary.bg80,
    borderRadius: 33,
  },
  text: {
    fontSize: 16,
    color: colors.text.primary,
    zIndex: 1,
  },
  amountText: {
    fontSize: 14,
    color: colors.primary.light,
    marginTop: 4,
    zIndex: 1,
  },
  button: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: BUTTON_WIDTH,
    height: BUTTON_WIDTH,
    backgroundColor: colors.primary.light,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonCompleted: {
    backgroundColor: colors.status.success,
  },
});

export default SlideToSend;
