import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Colors } from '../constants/theme';

export const FloatingSparkles: React.FC = () => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: useNative,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: useNative,
          }),
        ])
      );
    };

    const l1 = createLoop(anim1, 4000, 0);
    const l2 = createLoop(anim2, 5000, 1200);
    const l3 = createLoop(anim3, 4500, 2400);

    l1.start();
    l2.start();
    l3.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, []);

  const getStyle = (anim: Animated.Value, startX: number, endX: number) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.7, 1],
      outputRange: [0, 0.8, 0.6, 0],
    }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -60],
        }),
      },
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [startX, endX],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 1.2, 0.4],
        }),
      },
    ],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.sparkle, styles.sparkle1, getStyle(anim1, 20, 45)]} />
      <Animated.View style={[styles.sparkle, styles.sparkle2, getStyle(anim2, 140, 120)]} />
      <Animated.View style={[styles.sparkle, styles.sparkle3, getStyle(anim3, 260, 290)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: Colors.goldMetallic,
  },
  sparkle1: {
    width: 6,
    height: 6,
    top: 60,
    left: '10%',
    shadowColor: Colors.goldBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  sparkle2: {
    width: 8,
    height: 8,
    top: 70,
    left: '45%',
    backgroundColor: Colors.goldLight,
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  sparkle3: {
    width: 5,
    height: 5,
    top: 65,
    left: '75%',
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
});
