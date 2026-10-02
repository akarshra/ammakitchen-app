import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';

export const FloatingCartBar: React.FC = () => {
  const router = useRouter();
  const { cartCount, totalAmount } = useApp();

  if (cartCount === 0) {
    return null;
  }

  const handleOpenCart = () => {
    router.push('/cart' as any);
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        onPress={handleOpenCart}
        activeOpacity={0.9}
        style={[styles.container, Shadows.floating]}
      >
        <View style={styles.leftSection}>
          <View style={styles.iconCircle}>
            <ShoppingBag size={18} color="#FFFFFF" />
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.itemsLabel}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} added
            </Text>
            <Text style={styles.totalPrice}>₹{totalAmount}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <View style={styles.arrowCircle}>
            <ArrowRight size={14} color={Colors.terracotta} strokeWidth={2.5} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 80, // Above bottom tab bar
    left: 16,
    right: 16,
    zIndex: 999,
  },
  container: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.4)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.gold,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemsLabel: {
    fontSize: 11,
    color: '#FAF6F0',
    opacity: 0.8,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6F0',
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
