import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { MenuItem } from '../data/menuData';
import { DietaryBadge } from './DietaryBadge';
import { FoodMediaView } from './FoodMediaView';
import { useApp } from '../context/AppContext';
import { Star, Plus, Minus, Heart, Clock, Sparkles, Leaf, Video } from 'lucide-react-native';

interface FoodCardProps {
  item: MenuItem;
  layout?: 'standard' | 'horizontal';
  index?: number;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, layout = 'standard', index = 0 }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const { addToCart, updateQuantity, getItemQuantity, isFavorite, toggleFavorite } = useApp();

  const quantity = getItemQuantity(item.id);
  const favorite = isFavorite(item.id);

  // Animations
  const cardScale = useRef(new Animated.Value(1)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const addPulseAnim = useRef(new Animated.Value(1)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    // Staggered entrance animation
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 350,
      delay: Math.min(index * 60, 400),
      useNativeDriver: useNative,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: useNative,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: useNative,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressCard = () => {
    router.push(`/dish/${item.id}` as any);
  };

  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    addToCart(item, 1);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation?.();
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation?.();
    updateQuantity(item.id, quantity - 1);
  };

  const handleToggleFav = (e: any) => {
    e.stopPropagation?.();
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 120, useNativeDriver: useNative }),
      Animated.spring(heartScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: useNative }),
    ]).start();
    toggleFavorite(item.id);
  };

  const translateY = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  if (layout === 'horizontal') {
    return (
      <Animated.View
        style={{
          opacity: mountAnim,
          transform: [{ translateY }, { scale: cardScale }],
          width: '100%',
        }}
      >
        <TouchableOpacity
          onPress={handlePressCard}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.92}
          style={[styles.horizontalCard, Shadows.card]}
        >
          <View style={[styles.horizontalImageContainer, isSmallScreen && { width: 110 }]}>
            <FoodMediaView
              imageUri={item.image}
              videoUri={item.video}
              style={styles.horizontalImage}
              contentFit="cover"
              priority="high"
            />
            {item.video && (
              <View style={styles.liveVideoBadge}>
                <Video size={9} color="#FFFFFF" />
                <Text style={styles.liveVideoText}>LIVE</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.favBadge}
              onPress={handleToggleFav}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Heart
                  size={13}
                  color={favorite ? Colors.heartCrimson : '#666'}
                  fill={favorite ? Colors.heartCrimson : 'transparent'}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalContent}>
            <View style={styles.topRow}>
              <DietaryBadge isVeg={item.isVeg} size={13} />
              <Text style={styles.subtitleText} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>

            <Text style={[styles.titleText, isSmallScreen && { fontSize: 14 }]} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={styles.descText} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.bottomRow}>
              <View style={styles.priceBlock}>
                <Text style={[styles.priceText, isSmallScreen && { fontSize: 16 }]}>₹{item.price}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPriceText}>₹{item.originalPrice}</Text>
                )}
              </View>

              {quantity === 0 ? (
                <Animated.View style={{ transform: [{ scale: addPulseAnim }] }}>
                  <TouchableOpacity
                    onPress={handleAdd}
                    activeOpacity={0.8}
                    style={styles.addButtonSmall}
                  >
                    <Plus size={12} color={Colors.forestGreen} strokeWidth={2.5} />
                    <Text style={styles.addButtonSmallText}>ADD</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <View style={styles.stepperSmall}>
                  <TouchableOpacity onPress={handleDecrement} style={styles.stepBtn}>
                    <Minus size={11} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={styles.stepCount}>{quantity}</Text>
                  <TouchableOpacity onPress={handleIncrement} style={styles.stepBtn}>
                    <Plus size={11} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: mountAnim,
        transform: [{ translateY }, { scale: cardScale }],
        width: '100%',
      }}
    >
      <TouchableOpacity
        onPress={handlePressCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.94}
        style={[styles.card, Shadows.card]}
      >
        {/* Top Image & Overlays */}
        <View style={[styles.imageWrapper, isSmallScreen && { height: 175 }]}>
          <FoodMediaView
            imageUri={item.image}
            videoUri={item.video}
            style={styles.image}
            contentFit="cover"
            priority="high"
          />
          {/* Top Badges */}
          <View style={styles.overlayTop}>
            <View style={styles.topBadgesLeft}>
              <View style={styles.ratingBadge}>
                <Star size={11} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.ratingCount}>({item.reviewCount})</Text>
              </View>
              {item.video && (
                <View style={styles.liveVideoBadgeStandard}>
                  <Video size={10} color="#FFFFFF" />
                  <Text style={styles.liveVideoTextStandard}>LIVE KITCHEN</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.favCircle}
              onPress={handleToggleFav}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Heart
                  size={14}
                  color={favorite ? Colors.heartCrimson : '#4A3B32'}
                  fill={favorite ? Colors.heartCrimson : 'transparent'}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Prep Time Pill */}
          <View style={styles.prepTimePill}>
            <Clock size={11} color="#FFFFFF" />
            <Text style={styles.prepTimeText}>{item.prepTime}</Text>
          </View>

          {item.isComfortPick ? (
            <View style={styles.comfortPill}>
              <Sparkles size={11} color={Colors.goldMetallic} />
              <Text style={styles.comfortPillText}>Chef Amma's Special</Text>
            </View>
          ) : (
            <View style={styles.oilPill}>
              <Leaf size={11} color={Colors.forestGreenLight} />
              <Text style={styles.oilPillText}>Wood-Pressed Oil</Text>
            </View>
          )}
        </View>

        {/* Card Body */}
        <View style={[styles.content, isSmallScreen && { padding: 12 }]}>
          <View style={styles.headerRow}>
            <DietaryBadge isVeg={item.isVeg} size={14} />
            <Text style={styles.subtitleLabel} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>

          <Text style={[styles.name, isSmallScreen && { fontSize: 16 }]} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={[styles.description, isSmallScreen && { fontSize: 12, lineHeight: 16 }]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Price & Action Row */}
          <View style={styles.footerRow}>
            <View>
              <View style={styles.priceRow}>
                <Text style={[styles.price, isSmallScreen && { fontSize: 19 }]}>₹{item.price}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                )}
              </View>
              <Text style={styles.portionLabel}>{item.servingSize}</Text>
            </View>

            {quantity === 0 ? (
              <Animated.View style={{ transform: [{ scale: addPulseAnim }] }}>
                <TouchableOpacity
                  onPress={handleAdd}
                  activeOpacity={0.8}
                  style={[styles.addButton, isSmallScreen && { paddingHorizontal: 12, paddingVertical: 6 }]}
                >
                  <Text style={[styles.addButtonText, isSmallScreen && { fontSize: 12 }]}>ADD</Text>
                  <Plus size={13} color={Colors.forestGreen} strokeWidth={2.5} />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={handleDecrement}
                  style={[styles.stepperBtn, isSmallScreen && { width: 26, height: 26 }]}
                  activeOpacity={0.7}
                >
                  <Minus size={13} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={[styles.stepperText, isSmallScreen && { fontSize: 13 }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={handleIncrement}
                  style={[styles.stepperBtn, isSmallScreen && { width: 26, height: 26 }]}
                  activeOpacity={0.7}
                >
                  <Plus size={13} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 195,
    backgroundColor: Colors.surfaceWarm,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 28, 40, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    gap: 3,
  },
  topBadgesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveVideoBadgeStandard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 3.5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  liveVideoTextStandard: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveVideoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  liveVideoText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  favCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 28, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  favBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(21, 28, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prepTimePill: {
    position: 'absolute',
    bottom: 9,
    left: 10,
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
  },
  prepTimeText: {
    fontSize: 10.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  comfortPill: {
    position: 'absolute',
    bottom: 9,
    right: 10,
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1.2,
    borderColor: Colors.goldMetallic,
  },
  comfortPillText: {
    fontSize: 10,
    color: Colors.goldMetallic,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  oilPill: {
    position: 'absolute',
    bottom: 9,
    right: 10,
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
  },
  oilPillText: {
    fontSize: 10,
    color: Colors.forestGreenLight,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  content: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  subtitleLabel: {
    fontSize: 11,
    color: Colors.terracotta,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 17.5,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 17.5,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  originalPrice: {
    fontSize: 12.5,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  portionLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.forestGreen,
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    minWidth: 22,
    textAlign: 'center',
  },

  // Horizontal Card Variant
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    height: 130,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  horizontalImageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceWarm,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: 11,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subtitleText: {
    fontSize: 10,
    color: Colors.terracotta,
    fontWeight: '800',
    flex: 1,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  descText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    lineHeight: 14.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  originalPriceText: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 3,
  },
  addButtonSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.forestGreen,
  },
  stepperSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 5,
  },
});
