import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/theme';
import { MENU_ITEMS } from '../../data/menuData';
import { useApp, SubscriptionCustomization } from '../../context/AppContext';
import { DietaryBadge } from '../../components/DietaryBadge';
import { FoodMediaView } from '../../components/FoodMediaView';
import { FeedbackModal } from '../../components/FeedbackModal';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Flame,
  Video,
  Leaf,
  MessageSquarePlus,
} from 'lucide-react-native';

export default function DishDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const imageHeight = Math.min(width * 0.78, 360);

  const { addToCart, isFavorite, toggleFavorite, cartCount } = useApp();

  const item = MENU_ITEMS.find((m) => m.id === id) || MENU_ITEMS[0];
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Subscription customizer states
  const isSubscription = item.category === 'Monthly Subscription';
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [dietPref, setDietPref] = useState<'Veg' | 'Non-Veg' | 'Mix'>('Veg');
  
  const getTimeSlotsForPlan = (planId: string) => {
    const idLower = planId.toLowerCase();
    if (idLower.includes('breakfast')) return ['7:30 AM', '8:00 AM', '8:30 AM'];
    if (idLower.includes('lunch')) return ['12:30 PM', '1:00 PM', '1:30 PM'];
    if (idLower.includes('dinner')) return ['7:30 PM', '8:00 PM', '8:30 PM'];
    return ['Thrice Daily (8AM, 1PM, 8PM)'];
  };

  const slots = getTimeSlotsForPlan(item.id);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(slots[0]);

  const favorite = isFavorite(item.id);
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: useNative,
        }),
        Animated.timing(tiltAnim, {
          toValue: -1,
          duration: 3500,
          useNativeDriver: useNative,
        }),
        Animated.timing(tiltAnim, {
          toValue: 0,
          duration: 1750,
          useNativeDriver: useNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotateX = tiltAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['2deg', '0deg', '-2deg'],
  });

  const rotateY = tiltAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2.5deg', '0deg', '2.5deg'],
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleAddToCart = () => {
    if (isSubscription) {
      if (selectedDays.length === 0) {
        alert('Please select at least one delivery day!');
        return;
      }
      
      const history: { date: string; status: 'Pending' }[] = [];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let current = new Date();
      
      while (history.length < 30) {
        current.setDate(current.getDate() + 1);
        const dayOfWeek = dayNames[current.getDay()];
        if (selectedDays.includes(dayOfWeek)) {
          history.push({
            date: current.toISOString().split('T')[0],
            status: 'Pending' as const
          });
        }
      }
      
      const customization: SubscriptionCustomization = {
        planId: item.id,
        planName: item.name,
        price: item.price,
        deliveryDays: selectedDays,
        preference: dietPref,
        timeSlot: selectedTimeSlot,
        startDate: history[0].date,
        endDate: history[history.length - 1].date,
        remainingDeliveries: 30,
        history
      };

      addToCart(item, 1, `Days: ${selectedDays.length} / week | Slot: ${selectedTimeSlot}`, customization);
    } else {
      addToCart(item, quantity);
    }
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const totalPrice = item.price * quantity;

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', flex: 1 }}>
        {/* Floating Top Navigation Bar */}
        <SafeAreaView style={styles.floatingNav} edges={['top']} pointerEvents="box-none">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.85}
            style={[styles.navButton, Shadows.floating]}
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.navRight} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              activeOpacity={0.85}
              style={[styles.navButton, Shadows.floating]}
            >
              <Heart
                size={18}
                color={favorite ? Colors.heartCrimson : '#FFFFFF'}
                fill={favorite ? Colors.heartCrimson : 'transparent'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cart' as any)}
              activeOpacity={0.85}
              style={[styles.navButton, Shadows.floating]}
            >
              <ShoppingBag size={18} color="#FFFFFF" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Top Image with 3D Depth */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                height: imageHeight,
                transform: [
                  { perspective: 1000 },
                  { rotateX },
                  { rotateY },
                ],
              },
            ]}
          >
            <FoodMediaView
              imageUri={item.image}
              videoUri={item.video}
              style={styles.image}
              contentFit="cover"
              priority="high"
            />
            <View style={styles.imageOverlay} />

            {/* Category & Prep Time Badges */}
            <View style={styles.imageBottomBadges}>
              <View style={styles.badgeGroupLeft}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                {item.video && (
                  <View style={styles.liveVideoBadge}>
                    <Video size={11} color="#FFFFFF" />
                    <Text style={styles.liveVideoBadgeText}>LIVE KITCHEN VIDEO</Text>
                  </View>
                )}
              </View>
              <View style={styles.prepTimeBadge}>
                <Clock size={12} color="#FFFFFF" />
                <Text style={styles.prepTimeText}>{item.prepTime}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Content Sheet */}
          <View style={styles.sheet}>
            {/* Header Info */}
            <View style={styles.headerBlock}>
              <View style={styles.titleTopRow}>
                <DietaryBadge isVeg={item.isVeg} size={18} />
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              <Text style={styles.dishName}>{item.name}</Text>

              {/* Rating and Reviews */}
              <View style={styles.ratingRow}>
                <View style={styles.ratingPill}>
                  <Star size={13} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                  <Text style={styles.ratingNumber}>{item.rating} ★</Text>
                </View>
                <Text style={styles.reviewText}>
                  {item.reviewCount} Salem food lovers rated this
                </Text>
              </View>

              {/* Price Box */}
              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>₹{item.price}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPriceText}>₹{item.originalPrice}</Text>
                  )}
                  {item.originalPrice && (
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>SAVE ₹{item.originalPrice - item.price}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.portionText}>{item.servingSize}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>About This Traditional Dish</Text>
              <Text style={styles.longDesc}>{item.longDescription}</Text>
            </View>

            {isSubscription && (
              <View style={styles.customizerCard}>
                <View style={styles.customizerHeader}>
                  <Sparkles size={16} color={Colors.goldMetallic} />
                  <Text style={styles.customizerTitle}>Interactive Subscription Planner</Text>
                </View>

                {/* 1. Days of Week Picker */}
                <View style={styles.optionSection}>
                  <Text style={styles.optionLabel}>1. Select Delivery Days</Text>
                  <Text style={styles.optionSub}>Pick which days you want food delivered</Text>
                  <View style={styles.daysContainer}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            setSelectedDays((prev) =>
                              prev.includes(day)
                                ? prev.filter((d) => d !== day)
                                : [...prev, day]
                            );
                          }}
                          style={[
                            styles.dayPill,
                            isSelected && styles.dayPillActive,
                          ]}
                        >
                          <Text style={[styles.dayPillText, isSelected && styles.dayPillTextActive]}>
                            {day.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Diet Preference Selector */}
                <View style={styles.optionSection}>
                  <Text style={styles.optionLabel}>2. Dietary Preference</Text>
                  <View style={styles.dietContainer}>
                    {(['Veg', 'Non-Veg', 'Mix'] as const).map((pref) => {
                      const isSelected = dietPref === pref;
                      return (
                        <TouchableOpacity
                          key={pref}
                          onPress={() => setDietPref(pref)}
                          style={[
                            styles.dietOption,
                            isSelected && styles.dietOptionActive,
                          ]}
                        >
                          <Text style={[styles.dietText, isSelected && styles.dietTextActive]}>
                            {pref}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Delivery Time Slot */}
                <View style={styles.optionSection}>
                  <Text style={styles.optionLabel}>3. Preferred Delivery Slot</Text>
                  <View style={styles.timeSlotsContainer}>
                    {slots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => setSelectedTimeSlot(slot)}
                          style={[
                            styles.timeSlotPill,
                            isSelected && styles.timeSlotPillActive,
                            slots.length === 1 && { flex: 1, alignItems: 'center' }
                          ]}
                        >
                          <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Highlights */}
            {item.highlights && item.highlights.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Amma’s Culinary Highlights</Text>
                <View style={styles.highlightsGrid}>
                  {item.highlights.map((hl, index) => (
                    <View key={index} style={styles.highlightItem}>
                      <Sparkles size={14} color={Colors.goldMetallic} />
                      <Text style={styles.highlightText}>{hl}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ingredients Included */}
            {item.ingredients && item.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Authentic Salem Ingredients</Text>
                <View style={styles.ingredientsBox}>
                  {item.ingredients.map((ing, idx) => (
                    <View key={idx} style={styles.ingredientRow}>
                      <CheckCircle2 size={15} color={Colors.forestGreen} />
                      <Text style={styles.ingredientText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Nutrition / Details pill */}
            <View style={styles.nutritionBox}>
              <View style={styles.nutritionCol}>
                <Text style={styles.nutriLabel}>Energy</Text>
                <Text style={styles.nutriValue}>{item.calories}</Text>
              </View>
              <View style={styles.nutriDivider} />
              <View style={styles.nutritionCol}>
                <Text style={styles.nutriLabel}>Oil Used</Text>
                <Text style={styles.nutriValue}>100% Wood-Pressed</Text>
              </View>
              <View style={styles.nutriDivider} />
              <View style={styles.nutritionCol}>
                <Text style={styles.nutriLabel}>Kitchen</Text>
                <Text style={styles.nutriValue}>Salem Cloud</Text>
              </View>
            </View>

            {/* Dish Feedback Button */}
            <TouchableOpacity
              onPress={() => setShowFeedback(true)}
              activeOpacity={0.8}
              style={styles.dishFeedbackRow}
            >
              <View style={styles.dishFeedbackLeft}>
                <Star size={16} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                <Text style={styles.dishFeedbackText}>
                  Tried this dish? Share your rating with Amma
                </Text>
              </View>
              <MessageSquarePlus size={16} color={Colors.goldMetallic} />
            </TouchableOpacity>

            {/* Safe spacing */}
            <View style={{ height: 110 }} />
          </View>
        </ScrollView>

        {/* Added to Cart Feedback Toast */}
        {addedToast && (
          <View style={styles.toastContainer}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>Added {quantity} to cart!</Text>
          </View>
        )}

        {/* Feedback Modal */}
        <FeedbackModal
          visible={showFeedback}
          onClose={() => setShowFeedback(false)}
          defaultDishId={item.id}
        />

        {/* Sticky Bottom Bar */}
        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          {!isSubscription && (
            <View style={styles.bottomStepper}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.bottomStepBtn}
              >
                <Minus size={16} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.bottomQuantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.bottomStepBtn}
              >
                <Plus size={16} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            activeOpacity={0.88}
            style={[styles.addCtaButton, Shadows.luxury]}
          >
            <ShoppingBag size={18} color="#FFFFFF" />
            <Text style={styles.addCtaText}>
              {isSubscription 
                ? `Customise & Add • ₹${item.price}` 
                : `Add to Feast • ₹${totalPrice}`}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceWarm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 28, 16, 0.25)',
  },
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 9999,
    elevation: 20,
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17, 22, 32, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.terracotta,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  imageBottomBadges: {
    position: 'absolute',
    bottom: 38,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveVideoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 14,
    gap: 4.5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  liveVideoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.goldMetallic,
  },
  categoryBadgeText: {
    color: Colors.goldMetallic,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  prepTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  prepTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sheet: {
    backgroundColor: Colors.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  headerBlock: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: 20,
    marginBottom: 20,
  },
  titleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.terracotta,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dishName: {
    fontSize: 25,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.goldMetallic,
  },
  reviewText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  originalPriceText: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  portionText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  longDesc: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  highlightsGrid: {
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldBg,
    padding: 11,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  highlightText: {
    fontSize: 12.5,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  ingredientsBox: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 16,
    padding: 14,
    gap: 9,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  nutritionBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nutritionCol: {
    alignItems: 'center',
  },
  nutriLabel: {
    fontSize: 10.5,
    color: Colors.goldLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutriValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  nutriDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toastContainer: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: Colors.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111620',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    gap: 12,
  },
  bottomStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  bottomStepBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomQuantityText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    paddingHorizontal: 10,
    minWidth: 26,
    textAlign: 'center',
  },
  addCtaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  addCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dishFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  dishFeedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  dishFeedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.goldMetallic,
    flex: 1,
  },
  customizerCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    padding: 16,
    marginVertical: 14,
    gap: 16,
  },
  customizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    paddingBottom: 10,
  },
  customizerTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.2,
  },
  optionSection: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  optionSub: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: -4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dayPill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 8,
    width: '23%',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: Colors.goldMetallic,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayPillTextActive: {
    color: Colors.goldMetallic,
  },
  dietContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  dietOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  dietOptionActive: {
    backgroundColor: Colors.terracotta,
  },
  dietText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  dietTextActive: {
    color: '#FFFFFF',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotPill: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  timeSlotPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  timeSlotTextActive: {
    color: '#10B981',
  },
});
