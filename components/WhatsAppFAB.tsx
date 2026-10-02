import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
  Platform,
  View,
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { BRAND_INFO } from '../data/menuData';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/theme';

export const WhatsAppFAB: React.FC = () => {
  const { cartCount } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const elevationAnim = useRef(new Animated.Value(cartCount > 0 ? 1 : 0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    Animated.spring(elevationAnim, {
      toValue: cartCount > 0 ? 1 : 0,
      friction: 8,
      tension: 70,
      useNativeDriver: false,
    }).start();
  }, [cartCount]);

  useEffect(() => {
    // 1. Button pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: useNative,
        }),
      ])
    );
    pulseLoop.start();

    // 2. Continuous radar ripple
    const rippleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: useNative,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: useNative,
        }),
      ])
    );
    rippleLoop.start();

    return () => {
      pulseLoop.stop();
      rippleLoop.stop();
    };
  }, []);

  const handlePress = () => {
    Linking.openURL(BRAND_INFO.whatsappUrl).catch(() => {});
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.6, 0.3, 0],
  });

  const bottomOffset = elevationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 76],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
        },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <MessageCircle size={26} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998,
  },
  ripple: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25D366',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
