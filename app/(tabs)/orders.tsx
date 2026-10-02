import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BRAND_INFO } from '../../data/menuData';
import { FeedbackModal } from '../../components/FeedbackModal';
import {
  ShoppingBag,
  Clock,
  MapPin,
  RotateCcw,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Utensils,
  Sparkles,
  Flame,
  Bike,
  Receipt,
  Star,
} from 'lucide-react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, addToCart } = useApp();
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOpenWhatsApp = (orderNumber: string) => {
    const url = `https://wa.me/918667519735?text=Hi%20Amma%27s%20Kitchen,%20inquiring%20about%20Order%20${encodeURIComponent(
      orderNumber
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleReorder = (order: any) => {
    order.items.forEach((ci: any) => {
      addToCart(ci.item, ci.quantity);
    });
    router.push('/cart' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainWrapper}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerSubtitleRow}>
            <Sparkles size={12} color={Colors.goldMetallic} />
            <Text style={styles.headerSubtitle}>AMMA'S KITCHEN SALEM</Text>
          </View>
          <Text style={styles.headerTitle}>My Orders & Receipts</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={42} color={Colors.goldMetallic} />
              </View>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                Order a comforting homestyle meal cooked with love, wood-pressed oils & fresh Salem ingredients.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/explore' as any)}
                activeOpacity={0.88}
                style={[styles.exploreBtn, Shadows.floating]}
              >
                <Sparkles size={16} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>Browse Today's Menu</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => {
                const isLive = order.status !== 'Delivered';
                return (
                  <View key={order.id} style={[styles.orderCard, Shadows.floating]}>
                    {/* Order Top Header */}
                    <View style={styles.orderTopBar}>
                      <View>
                        <View style={styles.orderNumberRow}>
                          <Receipt size={16} color={Colors.goldMetallic} />
                          <Text style={styles.orderNumberText}>{order.orderNumber}</Text>
                          <View
                            style={[
                              styles.statusPill,
                              isLive ? styles.statusPillLive : styles.statusPillDelivered,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                isLive
                                  ? styles.statusTextLive
                                  : styles.statusTextDelivered,
                              ]}
                            >
                              {order.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.orderTimeText}>{order.createdAt}</Text>
                      </View>

                      <Text style={styles.orderTotalText}>₹{order.total}</Text>
                    </View>

                    {/* Live Order Timeline Progress if Active */}
                    {isLive && (() => {
                      const riderName = order.riderName || order.rider_name;
                      const riderPhone = order.riderPhone || order.rider_phone;
                      const isPreparing = order.status === 'Preparing' || order.status === 'Out for Delivery' || order.status === 'Delivered';
                      const isOut = order.status === 'Out for Delivery' || order.status === 'Delivered';

                      let statusDescription = 'Waiting for kitchen approval...';
                      if (order.status === 'Preparing') {
                        statusDescription = "Cooking now! Prepared in Salem woodfire kitchen with pure cow ghee.";
                      } else if (order.status === 'Out for Delivery') {
                        statusDescription = riderName 
                          ? `Scooter dispatched! Your rider ${riderName} is on his way.` 
                          : "Out for delivery! Rider is on his way to Fairlands / Hasthampatti.";
                      }

                      return (
                        <View style={styles.timelineBox}>
                          <View style={styles.timelineHeader}>
                            <Flame size={14} color={Colors.terracotta} />
                            <Text style={styles.timelineHeaderText}>Live Kitchen Progress</Text>
                          </View>
                          <View style={styles.timelineStepsRow}>
                            <View style={styles.stepDotActive} />
                            <View style={[styles.stepLine, isPreparing ? styles.stepLineActive : styles.stepLineInactive]} />
                            <View style={isPreparing ? styles.stepDotActive : styles.stepDotInactive} />
                            <View style={[styles.stepLine, isOut ? styles.stepLineActive : styles.stepLineInactive]} />
                            <View style={isOut ? styles.stepDotActive : styles.stepDotInactive} />
                          </View>
                          <Text style={styles.timelineDesc}>
                            {statusDescription}
                          </Text>

                          {/* Assigned Rider Contact Box */}
                          {order.status === 'Out for Delivery' && riderName && (
                            <View style={styles.riderCallBox}>
                              <View style={styles.riderAvatarBox}>
                                <Bike size={16} color={Colors.goldMetallic} />
                                <View style={{ marginLeft: 6 }}>
                                  <Text style={styles.riderName}>{riderName}</Text>
                                  <Text style={styles.riderRole}>Amma's Delivery Partner</Text>
                                </View>
                              </View>
                              <TouchableOpacity
                                onPress={() => Linking.openURL(`tel:${riderPhone}`).catch(() => {})}
                                style={styles.riderCallBtn}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.riderCallText}>Call Rider</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })()}

                    {/* Items Summary Box */}
                    <View style={styles.itemsSummaryBox}>
                      {order.items.map((ci, idx) => (
                        <View key={idx} style={styles.itemSummaryRow}>
                          <View style={styles.qtyBadge}>
                            <Text style={styles.itemQty}>{ci.quantity}x</Text>
                          </View>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {ci.item.name}
                          </Text>
                          <Text style={styles.itemPrice}>
                            ₹{ci.item.price * ci.quantity}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Delivery Location */}
                    <View style={styles.addressRow}>
                      <MapPin size={13} color={Colors.terracotta} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {order.deliveryAddress || 'Fairlands, Salem'}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleOpenWhatsApp(order.orderNumber)}
                        activeOpacity={0.8}
                        style={styles.actionBtnWhatsApp}
                      >
                        <MessageCircle size={15} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={styles.actionBtnWhatsAppText}>
                          {isLive ? 'Track on WhatsApp' : 'Get Help'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowFeedback(true)}
                        activeOpacity={0.8}
                        style={styles.actionBtnFeedback}
                      >
                        <Star size={13} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                        <Text style={styles.actionBtnFeedbackText}>Rate Meal</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReorder(order)}
                        activeOpacity={0.8}
                        style={styles.actionBtnReorder}
                      >
                        <RotateCcw size={13} color={Colors.goldMetallic} strokeWidth={2.5} />
                        <Text style={styles.actionBtnReorderText}>Reorder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

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
  mainWrapper: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: '#111620',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 12,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillLive: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: Colors.goldBorder,
    borderWidth: 1,
  },
  statusPillDelivered: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  statusTextLive: {
    color: Colors.goldMetallic,
  },
  statusTextDelivered: {
    color: Colors.forestGreen,
  },
  orderTimeText: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  orderTotalText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: -0.3,
  },
  timelineBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timelineStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.terracotta,
  },
  stepLineActive: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.terracotta,
  },
  stepLineInactive: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  timelineDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  itemsSummaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
  },
  itemName: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 10,
  },
  actionBtnWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnWhatsAppText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionBtnFeedback: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.14)',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  actionBtnFeedbackText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  actionBtnReorder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 90, 42, 0.15)',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(232, 90, 42, 0.3)',
  },
  actionBtnReorderText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.terracotta,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  stepLine: {
    flex: 1,
    height: 3,
  },
  riderCallBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  riderAvatarBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  riderRole: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  riderCallBtn: {
    backgroundColor: Colors.goldMetallic,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  riderCallText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textDark,
  },
});
