import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { MENU_ITEMS } from '../data/menuData';
import { FoodMediaView } from './FoodMediaView';
import { ArrowRight, Sparkles, Star, Flame, ShieldCheck, Video } from 'lucide-react-native';

export const HeroPickCard: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const cardHeight = Math.min(Math.max(width * 0.72, 260), 310);

  const comfortDish = MENU_ITEMS[0]; // Grand South Indian Meals
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const float3DAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    // 1. Badge pulse loop
    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    badgeLoop.start();

    // 2. 3D Gyroscope Floating Tilt Loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float3DAnim, {
          toValue: 1,
          duration: 3400,
          useNativeDriver: useNative,
        }),
        Animated.timing(float3DAnim, {
          toValue: -1,
          duration: 3400,
          useNativeDriver: useNative,
        }),
        Animated.timing(float3DAnim, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    return () => {
      badgeLoop.stop();
      floatLoop.stop();
    };
  }, []);

  const handleExplore = () => {
    router.push('/explore' as any);
  };

  const handleDishPress = () => {
    router.push(`/dish/${comfortDish.id}` as any);
  };

  // 3D Perspective Rotations
  const rotateX = float3DAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['2.5deg', '0deg', '-2.5deg'],
  });

  const rotateY = float3DAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  const translateY = float3DAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-4, 0, 4],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.perspectiveWrapper,
          {
            transform: [
              { perspective: 1000 },
              { rotateX },
              { rotateY },
              { translateY },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleDishPress}
          activeOpacity={0.92}
          style={[styles.heroCard, { height: cardHeight }, Shadows.floating]}
        >
          <FoodMediaView
            imageUri={comfortDish.image}
            videoUri={comfortDish.video}
            style={styles.backgroundImage}
            contentFit="cover"
            priority="high"
          />
          <View style={styles.darkGradientOverlay} />

          <View style={styles.contentContainer}>
            {/* Top Row: Luxury Ribbon & Rating */}
            <View style={styles.tagRow}>
              <Animated.View
                style={[
                  styles.comfortBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Sparkles size={12} color={Colors.goldMetallic} />
                <Text style={styles.comfortBadgeText}>Chef Amma's Signature</Text>
              </Animated.View>

              <View style={styles.ratingBadge}>
                <Star size={11} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.ratingCount}>(342)</Text>
              </View>
            </View>

            {/* Center Info with Luxury Typography */}
            <View style={styles.textSection}>
              <View style={styles.curationPill}>
                <Flame size={10} color={Colors.goldMetallic} />
                <Text style={styles.subtitleHeader}>Salem Heritage Royal Thali</Text>
              </View>
              <Text
                style={[
                  styles.dishTitle,
                  isSmallScreen && { fontSize: 20 },
                ]}
                numberOfLines={1}
              >
                Grand South Indian Meals
              </Text>
              <Text
                style={[
                  styles.dishDescription,
                  isSmallScreen && { fontSize: 11, lineHeight: 15 },
                ]}
                numberOfLines={2}
              >
                Steamed Ponni rice, Salem drumstick sambar, pepper rasam, seasonal vegetable kootu, poriyal & fresh curd.
              </Text>
            </View>

            {/* Bottom Action Row */}
            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.priceLabel}>Royal Feast Box</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.heroPrice, isSmallScreen && { fontSize: 22 }]}>
                    ₹149
                  </Text>
                  <Text style={styles.heroOldPrice}>₹179</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>SAVE ₹30</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleExplore}
                activeOpacity={0.85}
                style={[styles.ctaButton, isSmallScreen && { paddingHorizontal: 12, paddingVertical: 8 }]}
              >
                <Text style={[styles.ctaText, isSmallScreen && { fontSize: 12 }]}>View Full Menu</Text>
                <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  perspectiveWrapper: {
    width: '100%',
  },
  heroCard: {
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 15, 21, 0.82)',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comfortBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: Colors.goldMetallic,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  comfortBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 28, 40, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 3,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  textSection: {
    gap: 4,
  },
  curationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitleHeader: {
    fontSize: 10.5,
    color: Colors.goldLight,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dishTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  dishDescription: {
    fontSize: 12,
    color: '#FAF6EE',
    opacity: 0.94,
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  priceLabel: {
    fontSize: 10,
    color: '#FAF6EE',
    opacity: 0.85,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroOldPrice: {
    fontSize: 13,
    color: '#FAF6EE',
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: Colors.forestGreenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
