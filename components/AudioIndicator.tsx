import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface AudioIndicatorProps {
  isListening: boolean;
  color?: string;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({ isListening, color = '#4F46E5' }) => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      scale1.value = withRepeat(withSequence(withTiming(1.8, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
      scale2.value = withRepeat(withSequence(withTiming(1.4, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true);
      scale3.value = withRepeat(withSequence(withTiming(2.2, { duration: 500 }), withTiming(1, { duration: 500 })), -1, true);
    } else {
      scale1.value = withTiming(1);
      scale2.value = withTiming(1);
      scale3.value = withTiming(1);
    }
  }, [isListening]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale1.value }],
    opacity: interpolate(scale1.value, [1, 2.2], [0.6, 1]),
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale2.value }],
    opacity: interpolate(scale2.value, [1, 2.2], [0.6, 1]),
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale3.value }],
    opacity: interpolate(scale3.value, [1, 2.2], [0.6, 1]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle1]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle2]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle3]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle2]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle1]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 4,
  },
  bar: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
});
