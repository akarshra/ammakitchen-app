import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { BRAND_INFO } from '../data/menuData';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Check,
  CreditCard,
  Banknote,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react-native';

const SALEM_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home',
    address: '42, Brindavan Road, Fairlands, Salem - 636016',
    area: 'Fairlands',
  },
  {
    id: 'addr-2',
    label: 'Parents (Senior Citizen Delivery)',
    address: '18, Ramakrishna Road, Hasthampatti, Salem - 636007',
    area: 'Hasthampatti',
  },
  {
    id: 'addr-3',
    label: 'Office',
    address: 'Plot 7, Sarada College Main Rd, Alagapuram, Salem - 636004',
    area: 'Alagapuram',
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { totalAmount, cart, placeOrder } = useApp();

  const [selectedAddrId, setSelectedAddrId] = useState('addr-1');
  const [deliverySpeed, setDeliverySpeed] = useState<'ASAP' | 'SCHEDULED'>('ASAP');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [upiProvider, setUpiProvider] = useState<'GPay' | 'PhonePe' | 'Paytm'>('GPay');
  const [isPlacing, setIsPlacing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'AUTH' | 'SUCCESS' | 'FAILED'>('AUTH');

  const selectedAddr =
    SALEM_ADDRESSES.find((a) => a.id === selectedAddrId) || SALEM_ADDRESSES[0];

  const handlePlaceOrder = () => {
    if (paymentMethod === 'UPI') {
      setShowRazorpayModal(true);
      setRazorpayStep('AUTH');
    } else {
      setIsPlacing(true);
      setTimeout(() => {
        setIsPlacing(false);
        placeOrder(selectedAddr.address, 'Cash on Delivery', '', 'Pending');
        router.replace('/order-success' as any);
      }, 900);
    }
  };

  const handleRazorpaySuccess = () => {
    setRazorpayStep('SUCCESS');
    const paymentText = `UPI (${upiProvider})`;
    placeOrder(selectedAddr.address, paymentText, '', 'Paid');
    setTimeout(() => {
      setShowRazorpayModal(false);
      router.replace('/order-success' as any);
    }, 1500);
  };

  const handleRazorpayFail = () => {
    setRazorpayStep('FAILED');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cart' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.mainWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Lock size={14} color={Colors.goldMetallic} />
              <Text style={styles.headerTitle}>Secure Checkout</Text>
            </View>
            <Text style={styles.headerSubtitle}>Amma's Kitchen Salem</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Delivery Address */}
          <View style={[styles.sectionCard, Shadows.card]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <MapPin size={17} color={Colors.terracotta} />
                <Text style={styles.sectionTitle}>Delivery Location</Text>
              </View>
              <Text style={styles.cityPill}>Salem, Tamil Nadu</Text>
            </View>

            <View style={styles.addressList}>
              {SALEM_ADDRESSES.map((addr) => {
                const isSelected = selectedAddrId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => setSelectedAddrId(addr.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.addressItem,
                      isSelected && styles.addressItemSelected,
                    ]}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.addressTextContainer}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      <Text style={styles.addressFull}>{addr.address}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Delivery Timing */}
          <View style={[styles.sectionCard, Shadows.card]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <Clock size={17} color={Colors.goldMetallic} />
                <Text style={styles.sectionTitle}>Preparation & Delivery Slot</Text>
              </View>
            </View>

            <View style={styles.slotRow}>
              <TouchableOpacity
                onPress={() => setDeliverySpeed('ASAP')}
                activeOpacity={0.8}
                style={[
                  styles.slotButton,
                  deliverySpeed === 'ASAP' && styles.slotButtonActive,
                ]}
              >
                <View style={styles.slotTop}>
                  <Text
                    style={[
                      styles.slotTitle,
                      deliverySpeed === 'ASAP' && styles.slotTitleActive,
                    ]}
                  >
                    ⚡ Salem Express
                  </Text>
                </View>
                <Text style={styles.slotSubtitle}>30–45 mins • Piping Hot</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDeliverySpeed('SCHEDULED')}
                activeOpacity={0.8}
                style={[
                  styles.slotButton,
                  deliverySpeed === 'SCHEDULED' && styles.slotButtonActive,
                ]}
              >
                <View style={styles.slotTop}>
                  <Text
                    style={[
                      styles.slotTitle,
                      deliverySpeed === 'SCHEDULED' && styles.slotTitleActive,
                    ]}
                  >
                    🍱 Meal Batch
                  </Text>
                </View>
                <Text style={styles.slotSubtitle}>Lunch (12:30 PM - 1:30 PM)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Payment Method */}
          <View style={[styles.sectionCard, Shadows.card]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <CreditCard size={17} color={Colors.forestGreen} />
                <Text style={styles.sectionTitle}>Payment Method</Text>
              </View>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>Verified Demo</Text>
              </View>
            </View>

            {/* UPI Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('UPI')}
              activeOpacity={0.8}
              style={[
                styles.paymentOption,
                paymentMethod === 'UPI' && styles.paymentOptionActive,
              ]}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radioOuter}>
                  {paymentMethod === 'UPI' && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={styles.paymentName}>UPI Instant Pay</Text>
                  <Text style={styles.paymentDesc}>Google Pay, PhonePe, Paytm, BHIM</Text>
                </View>
              </View>
            </TouchableOpacity>

            {paymentMethod === 'UPI' && (
              <View style={styles.upiPillsRow}>
                {(['GPay', 'PhonePe', 'Paytm'] as const).map((app) => (
                  <TouchableOpacity
                    key={app}
                    onPress={() => setUpiProvider(app)}
                    style={[
                      styles.upiPill,
                      upiProvider === app && styles.upiPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.upiPillText,
                        upiProvider === app && styles.upiPillTextActive,
                      ]}
                    >
                      {app}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Cash on Delivery Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('COD')}
              activeOpacity={0.8}
              style={[
                styles.paymentOption,
                paymentMethod === 'COD' && styles.paymentOptionActive,
              ]}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radioOuter}>
                  {paymentMethod === 'COD' && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={styles.paymentName}>Cash on Delivery</Text>
                  <Text style={styles.paymentDesc}>Pay cash or scan QR upon delivery</Text>
                </View>
              </View>
              <Banknote size={20} color={Colors.goldMetallic} />
            </TouchableOpacity>
          </View>

          {/* Order Summary Preview Card */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.summaryTitle}>
              Feast Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </Text>
            {cart.map((ci) => (
              <View key={ci.item.id} style={styles.summaryItemRow}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {ci.quantity}x {ci.item.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ₹{ci.item.price * ci.quantity}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Total Payable</Text>
              <Text style={styles.summaryTotalAmount}>₹{totalAmount}</Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Place Order CTA */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>Total Payable</Text>
            <Text style={styles.bottomPrice}>₹{totalAmount}</Text>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacing}
            activeOpacity={0.88}
            style={[styles.placeOrderBtn, Shadows.floating]}
          >
            {isPlacing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.placeOrderBtnText}>Place Salem Feast Order</Text>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.8} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Razorpay Secure Gateway Simulator Modal */}
      <Modal
        visible={showRazorpayModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRazorpayModal(false)}
      >
        <View style={styles.rpModalOverlay}>
          <View style={styles.rpCard}>
            {/* Razorpay Brand Header */}
            <View style={styles.rpHeader}>
              <View style={styles.rpHeaderLeft}>
                <Text style={styles.rpBrandName}>Razorpay</Text>
                <View style={styles.rpSecurePill}>
                  <ShieldCheck size={9} color="#10B981" />
                  <Text style={styles.rpSecureText}>SECURE</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowRazorpayModal(false)}
                style={styles.rpCloseBtn}
              >
                <X size={16} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            {/* Content Body */}
            <View style={styles.rpBody}>
              <View style={styles.rpMerchantRow}>
                <View>
                  <Text style={styles.rpMerchantName}>Amma's Kitchen Salem</Text>
                  <Text style={styles.rpOrderRef}>Ref: {Date.now().toString().slice(-6)}</Text>
                </View>
                <Text style={styles.rpAmountText}>₹{totalAmount}</Text>
              </View>

              <View style={styles.rpDivider} />

              {/* Step 1: Authorization Loader */}
              {razorpayStep === 'AUTH' && (
                <View style={styles.rpStepContent}>
                  <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 12 }} />
                  <Text style={styles.rpStepTitle}>Connecting to secure gateway...</Text>
                  <Text style={styles.rpStepDesc}>
                    Please authorize the transaction using your {upiProvider} app.
                  </Text>
                  <View style={styles.simulationButtons}>
                    <TouchableOpacity
                      onPress={handleRazorpaySuccess}
                      style={[styles.simBtn, { backgroundColor: '#10B981' }]}
                    >
                      <Text style={styles.simBtnText}>Simulate Success Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleRazorpayFail}
                      style={[styles.simBtn, { backgroundColor: '#EF4444' }]}
                    >
                      <Text style={styles.simBtnText}>Simulate Declined / Failure</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 2: Payment Success */}
              {razorpayStep === 'SUCCESS' && (
                <View style={styles.rpStepContent}>
                  <View style={[styles.statusCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: '#10B981' }]}>
                    <Check size={32} color="#10B981" strokeWidth={3} />
                  </View>
                  <Text style={[styles.rpStepTitle, { color: '#10B981', marginTop: 12 }]}>Payment Successful!</Text>
                  <Text style={styles.rpStepDesc}>
                    Redirecting you back to Amma's Kitchen Salem...
                  </Text>
                </View>
              )}

              {/* Step 3: Payment Failed */}
              {razorpayStep === 'FAILED' && (
                <View style={styles.rpStepContent}>
                  <View style={[styles.statusCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}>
                    <X size={32} color="#EF4444" strokeWidth={3} />
                  </View>
                  <Text style={[styles.rpStepTitle, { color: '#EF4444', marginTop: 12 }]}>Payment Declined</Text>
                  <Text style={styles.rpStepDesc}>
                    The bank rejected the request or the authorization session timed out.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
                    <TouchableOpacity
                      onPress={() => setRazorpayStep('AUTH')}
                      style={[styles.simBtn, { flex: 1, backgroundColor: '#3B82F6' }]}
                    >
                      <Text style={styles.simBtnText}>Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowRazorpayModal(false);
                        setPaymentMethod('COD');
                      }}
                      style={[styles.simBtn, { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                    >
                      <Text style={styles.simBtnText}>Pay with COD</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Footer lock badge */}
            <View style={styles.rpFooter}>
              <Lock size={10} color="#64748B" />
              <Text style={styles.rpFooterText}>128-bit Encrypted SSL Gateway powered by Razorpay</Text>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.goldMetallic,
    fontWeight: '700',
    marginTop: 1,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cityPill: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  demoBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.forestGreen,
  },
  addressList: {
    gap: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 10,
  },
  addressItemSelected: {
    borderColor: Colors.goldMetallic,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.goldMetallic,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.goldMetallic,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressFull: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  slotButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  slotButtonActive: {
    borderColor: Colors.goldMetallic,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  slotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  slotTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  slotTitleActive: {
    color: Colors.goldMetallic,
  },
  slotSubtitle: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  paymentOptionActive: {
    borderColor: Colors.goldMetallic,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  upiPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 28,
  },
  upiPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  upiPillActive: {
    borderColor: Colors.forestGreen,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  upiPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  upiPillTextActive: {
    color: Colors.forestGreen,
    fontWeight: '800',
  },
  orderSummaryCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryTotalAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.goldMetallic,
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
  bottomLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  rpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rpCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  rpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rpHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rpBrandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3B82F6',
  },
  rpSecurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  rpSecureText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#10B981',
  },
  rpCloseBtn: {
    padding: 4,
  },
  rpBody: {
    padding: 20,
  },
  rpMerchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rpMerchantName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rpOrderRef: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rpAmountText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rpDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 16,
  },
  rpStepContent: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  rpStepTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rpStepDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  simulationButtons: {
    marginTop: 20,
    width: '100%',
    gap: 10,
  },
  simBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  statusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  rpFooterText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
});
