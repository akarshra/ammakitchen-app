import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react-native';

export const FloatingQuickCart: React.FC = () => {
  const router = useRouter();
  const { cartCount, subtotal } = useApp();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    if (cartCount > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 80,
        useNativeDriver: useNative,
      }).start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: useNative,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: useNative,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 250,
        useNativeDriver: useNative,
      }).start();
    }
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push('/cart' as any)}
        activeOpacity={0.92}
        style={[styles.floatingBar, Shadows.floating]}
      >
        <View style={styles.leftGroup}>
          <Animated.View
            style={[
              styles.iconCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <ShoppingBag size={18} color="#FFFFFF" strokeWidth={2.5} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </Animated.View>
          <View>
            <Text style={styles.itemsLabel}>
              {cartCount} {cartCount === 1 ? 'dish selected' : 'dishes selected'}
            </Text>
            <Text style={styles.totalPrice}>₹{subtotal}</Text>
          </View>
        </View>

        <View style={styles.viewCartButton}>
          <Text style={styles.viewCartText}>View Feast Box</Text>
          <ArrowRight size={15} color={Colors.forestGreenDark} strokeWidth={2.8} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    maxWidth: 600,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111620',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.goldMetallic,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(251, 191, 36, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.terracotta,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  itemsLabel: {
    color: Colors.goldMetallic,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  totalPrice: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    shadowColor: Colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
