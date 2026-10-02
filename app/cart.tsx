import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { DietaryBadge } from '../components/DietaryBadge';
import { MENU_ITEMS } from '../data/menuData';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  HeartHandshake,
  Utensils,
  Coffee,
  Soup,
  Percent,
} from 'lucide-react-native';

const QUICK_PAIRINGS = [
  {
    id: 'ak-filter-coffee',
    name: 'Salem Filter Coffee',
    price: 29,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    tag: 'Bestseller',
  },
  {
    id: 'ak-salem-thattu-vadai-set',
    name: 'Salem Street Crackers',
    price: 69,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80',
    tag: 'Crispy Snack',
  },
  {
    id: 'ak-curd-rice',
    name: 'Tempered Curd Rice',
    price: 79,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80',
    tag: 'Cooling Side',
  },
  {
    id: 'ak-ghee-podi-idli',
    name: 'Ghee Podi Mini Idlis',
    price: 99,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    tag: 'Hot Ghee',
  },
];

const QUICK_NOTES = [
  '🥣 Less Spice',
  '👴 Senior Citizen Soft Rice',
  '🌿 Extra Salem Sambar',
  '🚫 No Onion / Garlic',
  '📦 Eco Packaging',
];

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    packagingFee,
    totalAmount,
    cartCount,
  } = useApp();

  const [cookingNotes, setCookingNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).toUpperCase();
    if (!code) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${code}`, {
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
      });
      if (response.ok) {
        const coupon = await response.json();
        setCouponCode(code);
        setCouponApplied(true);
        if (coupon.discount_type === 'percent') {
          const discount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
          setDiscountAmount(discount);
        } else {
          setDiscountAmount(Number(coupon.discount_value));
        }
      } else {
        alert('Invalid or inactive coupon code');
        setCouponApplied(false);
        setDiscountAmount(0);
      }
    } catch (err) {
      console.warn('Error applying coupon from API, using fallback:', err);
      if (code === 'AMMA50' || code === 'FIRST') {
        setCouponCode(code);
        setCouponApplied(true);
        setDiscountAmount(30);
      } else {
        setCouponCode(code || 'AMMAVIP');
        setCouponApplied(true);
        setDiscountAmount(25);
      }
    }
  };

  const handleQuickAdd = (pairingId: string) => {
    const itemToAdd = MENU_ITEMS.find((i) => i.id === pairingId);
    if (itemToAdd) {
      addToCart(itemToAdd, 1);
    }
  };

  const handleAddNotePreset = (note: string) => {
    if (cookingNotes.includes(note)) return;
    setCookingNotes((prev) => (prev ? `${prev}, ${note}` : note));
  };

  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleContinueCheckout = () => {
    router.push('/checkout' as any);
  };

  if (cartCount === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Feast Box</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={44} color={Colors.goldMetallic} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>Your Feast Box is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Treat yourself and your loved ones to fresh, comforting Salem homestyle meals made with pure wood-pressed oils.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/explore' as any)}
            activeOpacity={0.88}
            style={[styles.exploreBtn, Shadows.floating]}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Explore Today's Menu</Text>
            <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.mainWrapper}>
        {/* Luxury Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Your Feast Box</Text>
              <View style={styles.liveIndicatorDot} />
            </View>
            <Text style={styles.headerSubtitle}>
              {cartCount} {cartCount === 1 ? 'Dish' : 'Dishes'} • Amma's Kitchen Salem
            </Text>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearCartBtn} activeOpacity={0.7}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Sizzling Batch & Delivery Guarantee Banner */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeHeader}>
              <View style={styles.flameIconBox}>
                <Flame size={16} color={Colors.terracotta} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>Freshly Wood-Fired on Order</Text>
                <Text style={styles.guaranteeSubtitle}>
                  Salem Express Delivery • Arriving steaming hot in 30–45 mins
                </Text>
              </View>
              <View style={styles.timePill}>
                <Clock size={11} color={Colors.goldMetallic} />
                <Text style={styles.timePillText}>30-45m</Text>
              </View>
            </View>
          </View>

          {/* Cart Items Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>ORDERED ITEMS</Text>
            <Text style={styles.sectionItemCount}>{cartCount} selected</Text>
          </View>

          <View style={styles.itemsCard}>
            {cart.map((ci, index) => (
              <View
                key={ci.item.id}
                style={[
                  styles.cartItemRow,
                  index !== cart.length - 1 && styles.cartItemDivider,
                ]}
              >
                <View style={styles.itemImageWrapper}>
                  <Image
                    source={{ uri: ci.item.image }}
                    style={styles.itemImage}
                    contentFit="cover"
                    priority="high"
                  />
                  <View style={styles.dietaryCornerBadge}>
                    <DietaryBadge isVeg={ci.item.isVeg} size={11} />
                  </View>
                </View>

                <View style={styles.itemInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {ci.item.name}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {ci.item.subtitle || 'Traditional Homestyle Recipe'}
                  </Text>
                  <Text style={styles.itemUnitPrice}>₹{ci.item.price} per portion</Text>

                  <View style={styles.itemActionsRow}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                        style={styles.stepBtn}
                        activeOpacity={0.75}
                      >
                        {ci.quantity === 1 ? (
                          <Trash2 size={13} color={Colors.terracotta} />
                        ) : (
                          <Minus size={13} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                      <Text style={styles.stepNumber}>{ci.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                        style={styles.stepBtn}
                        activeOpacity={0.75}
                      >
                        <Plus size={13} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemTotalPrice}>
                      ₹{ci.item.price * ci.quantity}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Pairings: Complete Your Feast */}
          <View style={styles.pairingsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sparkleRow}>
                <Sparkles size={14} color={Colors.goldMetallic} />
                <Text style={styles.sectionHeading}>COMPLETE YOUR FEAST</Text>
              </View>
              <Text style={styles.pairingHint}>Popular Add-ons</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pairingsScroll}
            >
              {QUICK_PAIRINGS.map((pairing) => {
                const inCart = cart.some((c) => c.item.id === pairing.id);
                return (
                  <View key={pairing.id} style={styles.pairingCard}>
                    <Image
                      source={{ uri: pairing.image }}
                      style={styles.pairingImage}
                      contentFit="cover"
                    />
                    <View style={styles.pairingTag}>
                      <Text style={styles.pairingTagText}>{pairing.tag}</Text>
                    </View>
                    <View style={styles.pairingDetails}>
                      <Text style={styles.pairingName} numberOfLines={1}>
                        {pairing.name}
                      </Text>
                      <View style={styles.pairingPriceRow}>
                        <Text style={styles.pairingPrice}>₹{pairing.price}</Text>
                        <TouchableOpacity
                          onPress={() => handleQuickAdd(pairing.id)}
                          style={[
                            styles.pairingAddBtn,
                            inCart && styles.pairingAddBtnActive,
                          ]}
                          activeOpacity={0.8}
                        >
                          <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                          <Text style={styles.pairingAddBtnText}>
                            {inCart ? 'ADD MORE' : 'ADD'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Cooking & Delivery Notes with Preset Chips */}
          <View style={styles.notesContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>SPECIAL INSTRUCTIONS</Text>
              <Text style={styles.notesHelp}>Optional</Text>
            </View>

            <View style={styles.presetChipsRow}>
              {QUICK_NOTES.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleAddNotePreset(chip)}
                  activeOpacity={0.8}
                  style={styles.presetChip}
                >
                  <Text style={styles.presetChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.notesInputBox}>
              <TextInput
                placeholder="e.g. Senior citizen meal: low spice & soft texture, less salt..."
                placeholderTextColor={Colors.textMuted}
                value={cookingNotes}
                onChangeText={setCookingNotes}
                multiline
                numberOfLines={2}
                style={styles.notesInput}
              />
            </View>
          </View>

          {/* Luxury Gold Voucher & Promo Code */}
          <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <View style={styles.couponIconBox}>
                <Percent size={15} color={Colors.goldMetallic} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.couponCardTitle}>Offers & Savings</Text>
                <Text style={styles.couponCardSubtitle}>
                  Apply coupon for instant savings on your feast
                </Text>
              </View>
            </View>

            <View style={styles.couponInputRow}>
              <Tag size={15} color={Colors.goldDark} />
              <TextInput
                placeholder="Enter promo code (e.g. AMMA50)"
                placeholderTextColor={Colors.textMuted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                style={styles.couponInput}
              />
              <TouchableOpacity
                onPress={() => handleApplyCoupon()}
                disabled={couponApplied}
                style={[
                  styles.applyBtn,
                  couponApplied && styles.applyBtnDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>
                  {couponApplied ? 'Applied ✓' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>

            {!couponApplied && (
              <TouchableOpacity
                onPress={() => handleApplyCoupon('AMMA50')}
                activeOpacity={0.8}
                style={styles.quickCouponPill}
              >
                <Sparkles size={12} color={Colors.goldMetallic} />
                <Text style={styles.quickCouponText}>
                  Tap to apply <Text style={styles.boldCoupon}>AMMA50</Text> (Save ₹30)
                </Text>
              </TouchableOpacity>
            )}

            {couponApplied && (
              <View style={styles.couponSuccessBanner}>
                <CheckCircle2 size={15} color={Colors.forestGreen} />
                <Text style={styles.couponSuccessText}>
                  Amma's Kitchen Salem savings applied: <Text style={styles.boldCoupon}>-₹{discountAmount} OFF</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Detailed Bill Summary */}
          <View style={styles.billCard}>
            <View style={styles.billHeaderRow}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              <View style={styles.billBadge}>
                <Text style={styles.billBadgeText}>Transparent Pricing</Text>
              </View>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal}</Text>
            </View>

            <View style={styles.billRow}>
              <View style={styles.deliveryLabelRow}>
                <Text style={styles.billLabel}>Salem Delivery Partner</Text>
                {deliveryFee === 0 && (
                  <Text style={styles.freePill}>FREE</Text>
                )}
              </View>
              <Text style={styles.billValue}>
                {deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Eco Spill-Proof Packaging</Text>
              <Text style={styles.billValue}>₹{packagingFee}</Text>
            </View>

            {couponApplied && (
              <View style={styles.billRow}>
                <Text style={styles.discountLabel}>Coupon Savings (AMMA50)</Text>
                <Text style={styles.discountValue}>-₹{discountAmount}</Text>
              </View>
            )}

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalTitle}>Total To Pay</Text>
                <Text style={styles.taxSub}>Inclusive of GST & all taxes</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.totalAmountText}>₹{finalTotal}</Text>
                {couponApplied && (
                  <Text style={styles.savingsTag}>You saved ₹{discountAmount}!</Text>
                )}
              </View>
            </View>
          </View>

          {/* 3 Pillars Trust Badges */}
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <ShieldCheck size={16} color={Colors.forestGreen} />
              <Text style={styles.trustItemText}>Wood-Pressed Oils</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={Colors.goldMetallic} />
              <Text style={styles.trustItemText}>Small Batch Cooked</Text>
            </View>
            <View style={styles.trustItem}>
              <HeartHandshake size={16} color={Colors.terracotta} />
              <Text style={styles.trustItemText}>Pure Mother's Care</Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Bottom Floating Checkout Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total Amount</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomTotalPrice}>₹{finalTotal}</Text>
              {couponApplied && (
                <Text style={styles.bottomOriginalPrice}>₹{totalAmount}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinueCheckout}
            activeOpacity={0.88}
            style={[styles.checkoutBtn, Shadows.floating]}
          >
            <Text style={styles.checkoutBtnText}>Continue to Checkout</Text>
            <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.8} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainWrapper: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: '#111620',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.forestGreen,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.goldMetallic,
    fontWeight: '700',
    marginTop: 1,
  },
  clearCartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  clearCartText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.terracotta,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  guaranteeCard: {
    backgroundColor: '#161E2E',
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    borderRadius: 16,
    padding: 12,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flameIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(232, 90, 42, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 90, 42, 0.4)',
  },
  guaranteeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  guaranteeSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  timePillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.8,
  },
  sectionItemCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pairingHint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  cartItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemImageWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceWarm,
  },
  dietaryCornerBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(11, 15, 21, 0.88)',
    borderRadius: 4,
    padding: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 1,
    marginBottom: 4,
  },
  itemUnitPrice: {
    fontSize: 11.5,
    color: Colors.goldMetallic,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    paddingHorizontal: 10,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  pairingsSection: {
    gap: 8,
  },
  pairingsScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  pairingCard: {
    width: 148,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  pairingImage: {
    width: '100%',
    height: 84,
    backgroundColor: Colors.surfaceWarm,
  },
  pairingTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(11, 15, 21, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: Colors.goldMetallic,
  },
  pairingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.goldMetallic,
    textTransform: 'uppercase',
  },
  pairingDetails: {
    padding: 10,
    gap: 4,
  },
  pairingName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pairingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  pairingPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pairingAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  pairingAddBtnActive: {
    backgroundColor: Colors.terracotta,
  },
  pairingAddBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  notesContainer: {
    gap: 8,
  },
  notesHelp: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  presetChipText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  notesInputBox: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  notesInput: {
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 40,
  },
  couponCard: {
    backgroundColor: '#141B28',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 10,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  couponCardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingVertical: 8,
  },
  applyBtn: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  applyBtnDisabled: {
    backgroundColor: Colors.forestGreen,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  quickCouponPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  quickCouponText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  boldCoupon: {
    color: Colors.goldMetallic,
    fontWeight: '900',
  },
  couponSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  couponSuccessText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.forestGreen,
  },
  billCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  billHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  billBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  billBadgeText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freePill: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.forestGreen,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: Colors.forestGreen,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  billValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  discountLabel: {
    fontSize: 13,
    color: Colors.forestGreen,
    fontWeight: '700',
  },
  discountValue: {
    fontSize: 13.5,
    fontWeight: '900',
    color: Colors.forestGreen,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  taxSub: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  totalAmountText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: -0.5,
  },
  savingsTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.forestGreen,
  },
  trustGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustItemText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: '#111620',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bottomTotalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  bottomOriginalPrice: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
