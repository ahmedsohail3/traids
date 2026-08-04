/**
 * LoadingDots — the row of pulsing dots shown under the splash logo (Figma:
 * light SplashScreen node 2374:2864 / dark node 4553:4276). The Figma frames
 * capture that animation mid-motion; this reproduces it as a looping wave —
 * each dot brightens and grows in turn, left to right.
 */
import {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Easing} from 'react-native';

const DOT_COUNT = 5;
const DOT_SIZE = 8;
const GAP = 8;
const STEP_DELAY = 120;
const PULSE_UP = 220;
const PULSE_DOWN = 260;

const Dot = ({color, index}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * STEP_DELAY),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_UP,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DOWN,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay((DOT_COUNT - 1 - index) * STEP_DELAY),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, index]);

  const opacity = pulse.interpolate({inputRange: [0, 1], outputRange: [0.3, 1]});
  const scale = pulse.interpolate({inputRange: [0, 1], outputRange: [1, 1.35]});

  return (
    <Animated.View
      style={[styles.dot, {backgroundColor: color, opacity, transform: [{scale}]}]}
    />
  );
};

const LoadingDots = ({color = '#10375C'}) => (
  <View style={styles.row}>
    {Array.from({length: DOT_COUNT}).map((_, i) => (
      <Dot key={i} color={color} index={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: GAP},
  dot: {width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2},
});

export default LoadingDots;
