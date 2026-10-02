import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { BRAND_INFO } from '../data/menuData';
import { FeedbackModal } from '../components/FeedbackModal';
import { RiderLiveTracker } from '../components/RiderLiveTracker';
import io from 'socket.io-client';
import {
  Check,
  Clock,
  MapPin,
  Home,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Utensils,
  PackageCheck,
  Bike,
  Star,
  Heart,
} from 'lucide-react-native';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { currentOrder, orders, updateOrderStatus } = useApp();
  const [showFeedback, setShowFeedback] = useState(false);

  const order = currentOrder || orders[0];
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number; bearing?: number } | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotate3DAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 45,
        useNativeDriver: useNative,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: useNative,
      }),
      Animated.timing(rotate3DAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: useNative,
      }),
    ]).start();
  }, []);

  // Real-time WebSocket connection to receive status updates and rider coordinates
  useEffect(() => {
    if (!order?.id) return;

    // Connect to Node.js backend Socket.io server
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('Connected to backend WebSocket server');
      socket.emit('join-order', order.id);
    });

    // Listen for status changes for this specific order
    socket.on(`order_status_${order.id}`, (data) => {
      console.log('Received real-time order status update:', data.status);
      updateOrderStatus(order.id, data.status);
    });

    // Listen for rider location updates
    socket.on('rider-location-changed', (data) => {
      console.log('Rider location update received:', data);
      setRiderLocation(data);
    });

    // Listen for order status updates from simulation ending
    socket.on('order-status-changed', (data) => {
      console.log('Simulation status changed:', data.status);
      updateOrderStatus(order.id, data.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.id]);

  const rotateY = rotate3DAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['120deg', '0deg'],
  });

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/918667519735?text=Hi%20Amma%20Kitchen,%20checking%20status%20for%20Order%20${encodeURIComponent(
      order?.orderNumber || '#AK1024'
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleBackHome = () => {
    router.replace('/(tabs)' as any);
  };

  // Map order status to active step numbers
  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Received':
        return 0;
      case 'Preparing':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeStep = getStatusStepIndex(order?.status || 'Received');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Animated Celebration Icon with 3D Pop */}
        <View style={styles.celebrationContainer}>
          <Animated.View
            style={[
              styles.checkCircle,
              {
                opacity: fadeAnim,
                transform: [
                  { perspective: 800 },
                  { scale: scaleAnim },
                  { rotateY },
                ],
              },
            ]}
          >
            <View style={styles.checkInnerCircle}>
              <Check size={44} color="#FFFFFF" strokeWidth={3} />
            </View>
          </Animated.View>

          <Text style={styles.heading}>Your meal is on its way.</Text>
          <Text style={styles.subheading}>
            Thank you for choosing Amma's Kitchen Salem.
          </Text>

          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderLabel}>ORDER NUMBER</Text>
            <Text style={styles.orderNumber}>{order?.orderNumber || '#AK1024'}</Text>
          </View>
        </View>

        {/* Delivery ETA Card */}
        <View style={[styles.etaCard, Shadows.card]}>
          <View style={styles.etaHeaderRow}>
            <View style={styles.etaIconCircle}>
              <Clock size={20} color={Colors.terracotta} />
            </View>
            <View style={styles.etaTextCol}>
              <Text style={styles.etaLabel}>ESTIMATED DELIVERY</Text>
              <Text style={styles.etaValue}>30–45 mins</Text>
            </View>
            <View style={styles.freshTag}>
              <Sparkles size={12} color={Colors.goldDark} />
              <Text style={styles.freshTagText}>Cooking Live</Text>
            </View>
          </View>

          {/* Live Tracker Steps */}
          <View style={styles.trackerContainer}>
            {/* Step 0: Confirmed */}
            <View style={styles.trackerStep}>
              <View style={[styles.trackerDot, activeStep >= 0 && styles.trackerDotActive]}>
                <Check size={10} color={activeStep >= 0 ? "#FFFFFF" : Colors.textMuted} strokeWidth={3} />
              </View>
              <View style={activeStep > 0 ? styles.trackerLineActive : styles.trackerLine} />
              <Text style={activeStep >= 0 ? styles.trackerStepTextActive : styles.trackerStepText}>Order Confirmed</Text>
            </View>

            {/* Step 1: Fresh Cooking */}
            <View style={styles.trackerStep}>
              <View style={[styles.trackerDot, activeStep >= 1 && styles.trackerDotActive]}>
                <Utensils size={10} color={activeStep >= 1 ? "#FFFFFF" : Colors.textMuted} />
              </View>
              <View style={activeStep > 1 ? styles.trackerLineActive : styles.trackerLine} />
              <Text style={activeStep >= 1 ? styles.trackerStepTextActive : styles.trackerStepText}>Fresh Cooking</Text>
            </View>

            {/* Step 2: Dispatched */}
            <View style={styles.trackerStep}>
              <View style={[styles.trackerDot, activeStep >= 2 && styles.trackerDotActive]}>
                <Bike size={10} color={activeStep >= 2 ? "#FFFFFF" : Colors.textMuted} />
              </View>
              <View style={activeStep > 2 ? styles.trackerLineActive : styles.trackerLine} />
              <Text style={activeStep >= 2 ? styles.trackerStepTextActive : styles.trackerStepText}>Dispatched</Text>
            </View>

            {/* Step 3: Delivered */}
            <View style={styles.trackerStep}>
              <View style={[styles.trackerDot, activeStep >= 3 && styles.trackerDotActive]}>
                <ShieldCheck size={10} color={activeStep >= 3 ? "#FFFFFF" : Colors.textMuted} />
              </View>
              <Text style={activeStep >= 3 ? styles.trackerStepTextActive : styles.trackerStepText}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Live Rider Location Map Visualizer */}
        <RiderLiveTracker riderLocation={riderLocation} status={order?.status || 'Received'} />

        {/* Delivery Address & Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <MapPin size={16} color={Colors.terracotta} />
            <Text style={styles.detailsTitle}>Delivering to</Text>
          </View>
          <Text style={styles.addressText}>
            {order?.deliveryAddress || 'Fairlands, Salem, Tamil Nadu - 636016'}
          </Text>

          <View style={styles.detailsDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order?.paymentMethod || 'UPI Paid'} (₹{order?.total || 149})
            </Text>
          </View>
        </View>

        {/* WhatsApp Quick Update Action */}
        <TouchableOpacity
          onPress={handleOpenWhatsApp}
          activeOpacity={0.88}
          style={styles.whatsappCard}
        >
          <View style={styles.whatsappLeft}>
            <View style={styles.whatsappIconBg}>
              <MessageCircle size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.whatsappTitle}>Track live on WhatsApp</Text>
              <Text style={styles.whatsappSub}>
                Direct updates from Ganesh Ram & kitchen team
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.whatsappDark} />
        </TouchableOpacity>

        {/* Feedback & Review Prompt Card */}
        <TouchableOpacity
          onPress={() => setShowFeedback(true)}
          activeOpacity={0.88}
          style={styles.feedbackCard}
        >
          <View style={styles.feedbackLeft}>
            <View style={styles.feedbackIconBg}>
              <Star size={20} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Rate Your Kitchen Experience</Text>
              <Text style={styles.feedbackSub}>
                Share your words with Chef Ganesh Ram & elder cooks
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.goldMetallic} />
        </TouchableOpacity>

        {/* Kitchen Assurance */}
        <View style={styles.assuranceBox}>
          <ShieldCheck size={18} color={Colors.vegGreen} />
          <Text style={styles.assuranceText}>
            Cooked with wood-pressed oil & mother’s care in Salem.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Sticky Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleBackHome}
          activeOpacity={0.88}
          style={[styles.backHomeBtn, Shadows.subtle]}
        >
          <Home size={18} color="#FFFFFF" />
          <Text style={styles.backHomeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <FeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.vegGreenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  checkInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.vegGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.vegGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  orderNumberBadge: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.goldMetallic,
    letterSpacing: 1.5,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  etaCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 16,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.terracottaBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaTextCol: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  etaValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  freshTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  freshTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.goldMetallic,
  },
  trackerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  trackerStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  trackerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    zIndex: 2,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  trackerDotActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  trackerLine: {
    position: 'absolute',
    top: 11,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  trackerLineActive: {
    position: 'absolute',
    top: 11,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.terracotta,
    zIndex: 1,
  },
  trackerStepText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  trackerStepTextActive: {
    fontSize: 10,
    color: Colors.terracotta,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    borderRadius: 18,
    padding: 14,
  },
  whatsappLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  whatsappIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whatsappDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  whatsappSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 18,
    padding: 14,
  },
  feedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  feedbackIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  assuranceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
