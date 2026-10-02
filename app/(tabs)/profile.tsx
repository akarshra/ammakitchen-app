import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp, API_BASE_URL, SubscriptionCustomization } from '../../context/AppContext';
import { BRAND_INFO, MENU_ITEMS } from '../../data/menuData';
import { BRAND_LOGO_BASE64 } from '../../constants/brandLogoBase64';
import { FeedbackModal } from '../../components/FeedbackModal';
import { Image } from 'expo-image';
import {
  ShoppingBag,
  Heart,
  MapPin,
  HelpCircle,
  Info,
  MessageCircle,
  ChevronRight,
  Instagram,
  Phone,
  Sparkles,
  ShieldCheck,
  Utensils,
  ExternalLink,
  X,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  HeartHandshake,
  Droplet,
  Leaf,
  Calendar,
  Star,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { favorites, orders, user, logout, subscriptions, skipSubscriptionDay, loyalty } = useApp();

  const [activeModal, setActiveModal] = useState<
    'favorites' | 'addresses' | 'about' | 'support' | 'feedback' | null
  >(null);

  const [selectedSubPlan, setSelectedSubPlan] = useState<SubscriptionCustomization | null>(null);
  const [showSkipAlert, setShowSkipAlert] = useState<{ planId: string; date: string } | null>(null);

  // Sync selected sub plan with updated context state (e.g. after a day skip)
  React.useEffect(() => {
    if (selectedSubPlan) {
      const updated = subscriptions.find((s) => s.planId === selectedSubPlan.planId);
      if (updated) {
        setSelectedSubPlan(updated);
      }
    }
  }, [subscriptions]);

  const favoriteItems = MENU_ITEMS.filter((m) => favorites.includes(m.id));

  const handleOpenWhatsApp = () => {
    Linking.openURL(BRAND_INFO.whatsappUrl).catch(() => {});
  };

  const handleCallChef = () => {
    Linking.openURL('tel:8667519735').catch(() => {});
  };

  const handleOpenInstagram = () => {
    Linking.openURL(BRAND_INFO.instagram).catch(() => {});
  };

  const handleOpenCRM = () => {
    Linking.openURL(`${API_BASE_URL}/crm`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainWrapper}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Sparkles size={13} color={Colors.goldMetallic} />
            <Text style={styles.headerSubtitle}>AMMA'S KITCHEN SALEM</Text>
          </View>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Royal Heritage Brand Flagship Card */}
          <View style={[styles.profileCard, Shadows.floating]}>
            <View style={styles.avatarRow}>
              <View style={styles.brandAvatar}>
                {Platform.OS === 'web' ? (
                  <img
                    src={BRAND_LOGO_BASE64}
                    alt="Amma's Kitchen Salem"
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Image
                    source={{ uri: BRAND_LOGO_BASE64 }}
                    style={styles.avatarLogoImage}
                    contentFit="contain"
                    priority="high"
                  />
                )}
              </View>
              <View style={styles.avatarInfo}>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandName}>{user?.name || "Amma's Kitchen"}</Text>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={12} color={Colors.goldMetallic} />
                  </View>
                </View>
                <Text style={styles.founderTitle}>{user?.phone || "Founded & Curated by Ganesh Ram"}</Text>
                <View style={styles.locationPill}>
                  <MapPin size={11} color={Colors.terracotta} />
                  <Text style={styles.locationText}>Fairlands & Hasthampatti, Salem</Text>
                </View>
              </View>
            </View>

            {/* Slogan Banner */}
            <View style={styles.profileTaglineBox}>
              <View style={styles.sparkleHeading}>
                <Sparkles size={11} color={Colors.goldMetallic} />
                <Text style={styles.brandTaglineMain}>HEALTHY FOOD • HAPPY LIFE</Text>
              </View>
              <Text style={styles.brandTaglineSub}>
                "Cooked with Love... Served with Care..."
              </Text>
            </View>

            {/* Dual Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={handleOpenWhatsApp}
                activeOpacity={0.88}
                style={[styles.whatsappDirectBtn, Shadows.subtle]}
              >
                <MessageCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.whatsappDirectBtnText}>WhatsApp Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCallChef}
                activeOpacity={0.88}
                style={[styles.callDirectBtn, Shadows.subtle]}
              >
                <Phone size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.callDirectBtnText}>86675 19735</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Subscriptions Dashboard */}
          {subscriptions.length > 0 && (
            <View style={styles.activeSubSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.groupHeading}>ACTIVE MEAL SUBSCRIPTIONS</Text>
                <View style={styles.activeSubBadge}>
                  <Text style={styles.activeSubBadgeText}>Live Calendar</Text>
                </View>
              </View>
              
              {subscriptions.map((sub) => {
                const totalDays = 30;
                const skippedCount = sub.history.filter((h) => h.status === 'Skipped').length;
                const deliveredCount = sub.history.filter((h) => h.status === 'Delivered').length;
                const remaining = totalDays - deliveredCount - skippedCount;
                
                return (
                  <TouchableOpacity
                    key={sub.planId}
                    activeOpacity={0.88}
                    onPress={() => setSelectedSubPlan(sub)}
                    style={[styles.subPlanCard, Shadows.luxury]}
                  >
                    <View style={styles.subPlanHeader}>
                      <View style={styles.subPlanIconBox}>
                        <Calendar size={18} color={Colors.goldMetallic} />
                      </View>
                      <View style={styles.subPlanTitleGroup}>
                        <Text style={styles.subPlanName}>{sub.planName}</Text>
                        <Text style={styles.subPlanRange}>
                          Valid: {sub.startDate} to {sub.endDate}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subStatsRow}>
                      <View style={styles.subStatItem}>
                        <Text style={styles.subStatVal}>{remaining}</Text>
                        <Text style={styles.subStatLbl}>Left</Text>
                      </View>
                      <View style={styles.subStatDivider} />
                      <View style={styles.subStatItem}>
                        <Text style={styles.subStatVal}>{deliveredCount}</Text>
                        <Text style={styles.subStatLbl}>Delivered</Text>
                      </View>
                      <View style={styles.subStatDivider} />
                      <View style={styles.subStatItem}>
                        <Text style={styles.subStatVal}>{skippedCount}</Text>
                        <Text style={styles.subStatLbl}>Skipped</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${(deliveredCount / totalDays) * 100}%` }]} />
                    </View>

                    <View style={styles.subPlanFooter}>
                      <Text style={styles.subPlanFooterText}>
                        Pref: {sub.preference} • Slot: {sub.timeSlot}
                      </Text>
                      <View style={styles.managePill}>
                        <Text style={styles.managePillText}>Manage Calendar</Text>
                        <ChevronRight size={12} color={Colors.goldMetallic} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 4 Pillars of Salem Culinary Purity */}
          <View style={styles.pillarsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.groupHeading}>OUR 4 PILLARS OF PURITY</Text>
              <Text style={styles.headerBadgeText}>Salem Promise</Text>
            </View>

            <View style={styles.pillarsGrid}>
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                  <Droplet size={18} color={Colors.goldMetallic} />
                </View>
                <Text style={styles.pillarTitle}>Wood-Pressed Oils</Text>
                <Text style={styles.pillarDesc}>
                  100% unrefined cold-pressed sesame & groundnut oils only. Zero palm oil.
                </Text>
              </View>

              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Leaf size={18} color={Colors.forestGreen} />
                </View>
                <Text style={styles.pillarTitle}>Zero Soda or Colors</Text>
                <Text style={styles.pillarDesc}>
                  Naturally fermented stone-ground batter. Zero chemical additives.
                </Text>
              </View>

              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(232, 90, 42, 0.15)' }]}>
                  <Flame size={18} color={Colors.terracotta} />
                </View>
                <Text style={styles.pillarTitle}>Fresh Daily Batches</Text>
                <Text style={styles.pillarDesc}>
                  Cooked fresh for morning, noon & night. Nothing re-heated or stored.
                </Text>
              </View>

              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}>
                  <HeartHandshake size={18} color={Colors.seniorPurple} />
                </View>
                <Text style={styles.pillarTitle}>Senior Citizen Care</Text>
                <Text style={styles.pillarDesc}>
                  Custom gut-friendly soft meals with digestive rasams and gentle spices.
                </Text>
              </View>
            </View>
          </View>

          {/* User Activity Dashboard Group */}
          <View style={styles.menuGroup}>
            <Text style={styles.groupHeading}>YOUR FOOD & ACTIVITY</Text>

            {/* Subscription Calendar */}
            <TouchableOpacity
              onPress={() => router.push('/meal-planner' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(232, 90, 42, 0.15)' }]}>
                  <Calendar size={18} color={Colors.terracotta} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Subscription Calendar</Text>
                  <Text style={styles.menuItemSubtitle}>Customize daily breakfast, lunch & dinner slots</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Elder Care Companion Profiles */}
            <TouchableOpacity
              onPress={() => router.push('/elder-profiles' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Heart size={18} color="#9333EA" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Elder Care Profiles</Text>
                  <Text style={styles.menuItemSubtitle}>Manage dietary restrictions and custom rider notes</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Calorie & Macro Tracker */}
            <TouchableOpacity
              onPress={() => router.push('/nutrition-dashboard' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Flame size={18} color={Colors.vegGreen} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Calorie & Macro Tracker</Text>
                  <Text style={styles.menuItemSubtitle}>Review 30-day nutrition averages and healthy tips</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Amma's Blessings Loyalty Points */}
            <TouchableOpacity
              onPress={() => router.push('/loyalty-rewards' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                  <Award size={18} color={Colors.goldMetallic} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Amma's Blessings Rewards</Text>
                  <Text style={styles.menuItemSubtitle}>Points balance: {loyalty?.points_balance || 0} Pts • Donate & Gift meals</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* My Orders */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/orders' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(232, 90, 42, 0.18)' }]}>
                  <ShoppingBag size={18} color={Colors.terracotta} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>My Orders</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed • Live receipts
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Favorites */}
            <TouchableOpacity
              onPress={() => setActiveModal('favorites')}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(233, 30, 99, 0.18)' }]}>
                  <Heart size={18} color="#E91E63" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Favorite Dishes</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {favorites.length} saved homestyle recipes
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Saved Addresses */}
            <TouchableOpacity
              onPress={() => setActiveModal('addresses')}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.18)' }]}>
                  <MapPin size={18} color={Colors.goldMetallic} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Saved Delivery Locations</Text>
                  <Text style={styles.menuItemSubtitle}>Home, Parents & Office in Salem</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Rate & Review Feedback */}
            <TouchableOpacity
              onPress={() => setActiveModal('feedback')}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.22)' }]}>
                  <Star size={18} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Rate & Review Amma's Kitchen</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Share food rating & message to Chef Amma
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Admin Console Group */}
          <View style={styles.menuGroup}>
            <Text style={styles.groupHeading}>ADMIN CONSOLE</Text>

            {/* Kitchen Admin Console */}
            <TouchableOpacity
              onPress={() => router.push('/admin' as any)}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                  <ShieldCheck size={18} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Kitchen Control Panel</Text>
                  <Text style={styles.menuItemSubtitle}>Manage active orders and toggle dish availability</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Open CRM Portal */}
            <TouchableOpacity
              onPress={handleOpenCRM}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]}>
                  <ExternalLink size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>CRM Operations Panel</Text>
                  <Text style={styles.menuItemSubtitle}>View customer orders, live analytics, and CRM dashboard</Text>
                </View>
              </View>
              <ExternalLink size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.8}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutBtnText}>Logout Account</Text>
          </TouchableOpacity>

          {/* Kitchen Timings & Location Card */}
          <View style={styles.timingsCard}>
            <View style={styles.timingsHeader}>
              <Clock size={16} color={Colors.goldMetallic} />
              <Text style={styles.timingsTitle}>Salem Kitchen Daily Batches</Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>🌅 Morning Tiffin</Text>
              <Text style={styles.timingValue}>7:00 AM – 11:30 AM</Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>🍲 Traditional Lunch</Text>
              <Text style={styles.timingValue}>12:00 PM – 3:30 PM</Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>🌙 Evening Dinner</Text>
              <Text style={styles.timingValue}>5:30 PM – 9:30 PM</Text>
            </View>
          </View>

          {/* Brand Information Group */}
          <View style={styles.menuGroup}>
            <Text style={styles.groupHeading}>ABOUT THE KITCHEN</Text>

            {/* About Amma Kitchen */}
            <TouchableOpacity
              onPress={() => setActiveModal('about')}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                  <Info size={18} color={Colors.textPrimary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>The Salem Kitchen Story</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Founder vision, hygiene & spice sourcing
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              onPress={() => setActiveModal('support')}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(34, 197, 94, 0.18)' }]}>
                  <HelpCircle size={18} color={Colors.forestGreen} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Direct Chef Support & Catering</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Custom requests, elderly care & bulk orders
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Instagram Link */}
            <TouchableOpacity
              onPress={handleOpenInstagram}
              activeOpacity={0.7}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(193, 53, 132, 0.18)' }]}>
                  <Instagram size={18} color="#C13584" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Follow Our Kitchen on Instagram</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {BRAND_INFO.instagramHandle} • Behind-the-scenes
                  </Text>
                </View>
              </View>
              <ExternalLink size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Salem Community Hashtags Cloud */}
          <View style={styles.hashtagsCard}>
            <Text style={styles.hashtagsTitle}>Salem Community & Heritage</Text>
            <View style={styles.hashtagsWrap}>
              {BRAND_INFO.hashtags.map((tag, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              Amma's Kitchen Salem • Artisanal Homestyle Food • Made with ❤️ in Salem
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* 1. Modal: Favorites */}
      <Modal
        visible={activeModal === 'favorites'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Favorites</Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {favoriteItems.length === 0 ? (
              <Text style={styles.modalEmpty}>No favorite dishes saved yet.</Text>
            ) : (
              favoriteItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setActiveModal(null);
                    router.push(`/dish/${item.id}` as any);
                  }}
                  style={styles.favItemRow}
                >
                  <View>
                    <Text style={styles.favItemName}>{item.name}</Text>
                    <Text style={styles.favItemPrice}>₹{item.price}</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.terracotta} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 2. Modal: Saved Addresses */}
      <Modal
        visible={activeModal === 'addresses'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Saved Delivery Locations</Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.addressModalCard}>
              <Text style={styles.addressModalLabel}>Home</Text>
              <Text style={styles.addressModalText}>
                42, Brindavan Road, Fairlands, Salem - 636016
              </Text>
            </View>
            <View style={styles.addressModalCard}>
              <Text style={styles.addressModalLabel}>Parents (Senior Care)</Text>
              <Text style={styles.addressModalText}>
                18, Ramakrishna Road, Hasthampatti, Salem - 636007
              </Text>
            </View>
            <View style={styles.addressModalCard}>
              <Text style={styles.addressModalLabel}>Office</Text>
              <Text style={styles.addressModalText}>
                Plot 7, Sarada College Main Rd, Alagapuram, Salem - 636004
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 3. Modal: About */}
      <Modal
        visible={activeModal === 'about'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About Amma Kitchen</Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.storyHeader}>The Story Behind The Brand</Text>
            <Text style={styles.storyParagraph}>{BRAND_INFO.story}</Text>
            <View style={styles.highlightPill}>
              <ShieldCheck size={16} color={Colors.forestGreen} />
              <Text style={styles.highlightPillText}>
                Zero Palm Oil • Wood-Pressed Gingelly & Groundnut Oils • Fresh Daily
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 4. Modal: Support */}
      <Modal
        visible={activeModal === 'support'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Direct Chef Support</Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.supportIntro}>
              Need assistance with an order, special senior citizen meal requests, or catering in Salem?
            </Text>
            <TouchableOpacity
              onPress={handleOpenWhatsApp}
              style={styles.supportActionBtn}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.supportActionText}>Chat with Ganesh Ram on WhatsApp</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 6. Modal: Subscription Calendar & Skip Portal */}
      <Modal
        visible={selectedSubPlan !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSubPlan(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          {selectedSubPlan && (
            <View style={{ flex: 1 }}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Subscription Calendar</Text>
                  <Text style={styles.modalSub}>{selectedSubPlan.planName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedSubPlan(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Sub-Header Stats Panel */}
              <View style={styles.calendarStatsPanel}>
                <View style={styles.calendarStat}>
                  <Text style={styles.calendarStatLbl}>Pref</Text>
                  <Text style={styles.calendarStatVal}>{selectedSubPlan.preference}</Text>
                </View>
                <View style={styles.calendarStatDivider} />
                <View style={styles.calendarStat}>
                  <Text style={styles.calendarStatLbl}>Slot</Text>
                  <Text style={styles.calendarStatVal}>{selectedSubPlan.timeSlot}</Text>
                </View>
                <View style={styles.calendarStatDivider} />
                <View style={styles.calendarStat}>
                  <Text style={styles.calendarStatLbl}>Ends On</Text>
                  <Text style={[styles.calendarStatVal, { color: Colors.goldMetallic }]}>
                    {selectedSubPlan.endDate}
                  </Text>
                </View>
              </View>

              {/* Scrollable Calendar Grid */}
              <ScrollView 
                contentContainerStyle={styles.calendarScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.calendarGridTitle}>Your 30-Day Delivery Timeline</Text>
                <Text style={styles.calendarGridDesc}>
                  Tap any upcoming green (Scheduled) day to pause/skip that delivery and extend your plan.
                </Text>

                {/* Inline Confirmation Alert */}
                {showSkipAlert && (
                  <View style={styles.skipConfirmAlert}>
                    <View style={styles.skipAlertHeader}>
                      <Flame size={16} color={Colors.terracotta} />
                      <Text style={styles.skipAlertTitle}>Pause Delivery?</Text>
                    </View>
                    <Text style={styles.skipAlertText}>
                      Skip delivery on {showSkipAlert.date}? You will not be charged, and a replacement delivery day will be appended to the end of your subscription (extended to tomorrow).
                    </Text>
                    <View style={styles.skipAlertActions}>
                      <TouchableOpacity
                        onPress={() => {
                          skipSubscriptionDay(showSkipAlert.planId, showSkipAlert.date);
                          setShowSkipAlert(null);
                        }}
                        style={styles.skipConfirmBtn}
                      >
                        <Text style={styles.skipConfirmBtnText}>Yes, Pause Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowSkipAlert(null)}
                        style={styles.skipCancelBtn}
                      >
                        <Text style={styles.skipCancelBtnText}>Go Back</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.calendarGrid}>
                  {selectedSubPlan.history.map((day, idx) => {
                    const dateObj = new Date(day.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const formattedDay = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    const isPending = day.status === 'Pending';
                    const isDelivered = day.status === 'Delivered';
                    const isSkipped = day.status === 'Skipped';

                    return (
                      <TouchableOpacity
                        key={day.date}
                        disabled={!isPending || showSkipAlert !== null}
                        onPress={() => setShowSkipAlert({ planId: selectedSubPlan.planId, date: day.date })}
                        style={[
                          styles.calendarDayCard,
                          isDelivered && styles.calendarDayDelivered,
                          isSkipped && styles.calendarDaySkipped,
                          isPending && styles.calendarDayPending,
                        ]}
                      >
                        <View style={styles.dayCardHeader}>
                          <Text style={styles.dayIndexText}>Day {idx + 1}</Text>
                          <View style={[
                            styles.statusDot,
                            isDelivered && { backgroundColor: Colors.goldMetallic },
                            isSkipped && { backgroundColor: Colors.textMuted },
                            isPending && { backgroundColor: '#10B981' },
                          ]} />
                        </View>
                        <Text style={styles.dayDateText}>{formattedDate}</Text>
                        <Text style={styles.dayWeekText}>{formattedDay}</Text>
                        
                        <View style={styles.statusLabelContainer}>
                          {isDelivered && <Text style={[styles.statusLabel, { color: Colors.goldMetallic }]}>Delivered</Text>}
                          {isSkipped && <Text style={[styles.statusLabel, { color: Colors.textMuted }]}>Skipped</Text>}
                          {isPending && <Text style={[styles.statusLabel, { color: '#10B981' }]}>Scheduled</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* 5. Modal: Customer Feedback & Review */}
      <FeedbackModal
        visible={activeModal === 'feedback'}
        onClose={() => setActiveModal(null)}
      />
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    gap: 18,
  },
  profileCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    gap: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111620',
    borderWidth: 2,
    borderColor: Colors.goldMetallic,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLogoImage: {
    width: '100%',
    height: '100%',
  },
  avatarInfo: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 6,
    padding: 2,
  },
  founderTitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 1,
    fontWeight: '600',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  profileTaglineBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    gap: 2,
  },
  sparkleHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandTaglineMain: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.6,
  },
  brandTaglineSub: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whatsappDirectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  whatsappDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  callDirectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  callDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pillarsSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.8,
  },
  headerBadgeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillarCard: {
    width: '48%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  pillarIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pillarDesc: {
    fontSize: 10.5,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  menuGroup: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  timingsCard: {
    backgroundColor: '#161E2E',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 8,
  },
  timingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timingsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  timingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  timingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  hashtagsCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  hashtagsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  hashtagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.goldMetallic,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: '#111620',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  modalEmpty: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  favItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  favItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  favItemPrice: {
    fontSize: 13,
    color: Colors.goldMetallic,
    fontWeight: '800',
    marginTop: 2,
  },
  addressModalCard: {
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  addressModalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addressModalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  storyHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  storyParagraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  highlightPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.forestGreen,
    flex: 1,
  },
  supportIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  supportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 12,
  },
  supportActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  activeSubSection: {
    gap: 12,
    marginBottom: 8,
  },
  activeSubBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  activeSubBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.goldMetallic,
    textTransform: 'uppercase',
  },
  subPlanCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    padding: 16,
    gap: 14,
  },
  subPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subPlanIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subPlanTitleGroup: {
    flex: 1,
  },
  subPlanName: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subPlanRange: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    paddingVertical: 10,
  },
  subStatItem: {
    alignItems: 'center',
  },
  subStatVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subStatLbl: {
    fontSize: 9.5,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  subStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.goldMetallic,
    borderRadius: 3,
  },
  subPlanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  subPlanFooterText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  managePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  managePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  calendarStatsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceWarm,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  calendarStat: {
    alignItems: 'center',
    flex: 1,
  },
  calendarStatLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarStatVal: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  calendarStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.surfaceBorder,
    alignSelf: 'center',
  },
  calendarScrollContent: {
    padding: 16,
    gap: 16,
  },
  calendarGridTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  calendarGridDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: -8,
  },
  skipConfirmAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  skipAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipAlertTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: Colors.terracotta,
  },
  skipAlertText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  skipAlertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  skipConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.terracotta,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  skipCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  skipCancelBtnText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  calendarDayCard: {
    width: '31.3%',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.2,
    gap: 4,
  },
  calendarDayPending: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  calendarDayDelivered: {
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  calendarDaySkipped: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.6,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dayIndexText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayDateText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dayWeekText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusLabelContainer: {
    marginTop: 6,
  },
  statusLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
