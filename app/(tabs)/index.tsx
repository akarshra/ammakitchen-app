import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BRAND_INFO, MENU_ITEMS } from '../../data/menuData';
import { CategoryPills } from '../../components/CategoryPills';
import { SubCategoryPills } from '../../components/SubCategoryPills';
import { AutoImageSlider } from '../../components/AutoImageSlider';
import { KitchenStories } from '../../components/KitchenStories';
import { FoodCard } from '../../components/FoodCard';
import { HeroPickCard } from '../../components/HeroPickCard';
import { MadeWithCare } from '../../components/MadeWithCare';
import { SplashScreenModal } from '../../components/SplashScreenModal';
import { MovableStrip } from '../../components/MovableStrip';
import { FloatingSparkles } from '../../components/FloatingSparkles';
import { FloatingQuickCart } from '../../components/FloatingQuickCart';
import { WhatsAppFAB } from '../../components/WhatsAppFAB';
import { BRAND_LOGO_BASE64 } from '../../constants/brandLogoBase64';
import { Image } from 'expo-image';
import {
  Search,
  MapPin,
  Heart,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    searchQuery,
    setSearchQuery,
    filteredMenuItems,
    hasSeenSplash,
    setHasSeenSplash,
    filters,
    toggleFilter,
  } = useApp();

  const handleOpenWhatsApp = () => {
    Linking.openURL(BRAND_INFO.whatsappUrl).catch(() => {});
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push('/explore' as any);
    }
  };

  // For the home screen, show filtered or featured items
  const displayItems =
    selectedCategory === 'All'
      ? filteredMenuItems.slice(0, 6)
      : filteredMenuItems;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {!hasSeenSplash && (
        <SplashScreenModal onFinish={() => setHasSeenSplash(true)} />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { maxWidth: 640, width: '100%', alignSelf: 'center' }]}
      >
        {/* Top Brand Bar with Official Logo */}
        <View style={[styles.topBar, isSmallScreen && { paddingHorizontal: 14 }]}>
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              {Platform.OS === 'web' ? (
                <img
                  src={BRAND_LOGO_BASE64}
                  alt="Amma's Kitchen Salem"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  decoding="sync"
                  loading="eager"
                />
              ) : (
                <Image
                  source={{ uri: BRAND_LOGO_BASE64 }}
                  style={styles.headerLogoImage}
                  contentFit="contain"
                  priority="high"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              )}
            </View>
            <View style={styles.brandTextGroup}>
              <View style={styles.brandTitleRow}>
                <Text
                  style={[styles.brandTitle, isSmallScreen && { fontSize: 14.5 }]}
                  numberOfLines={1}
                >
                  Amma's Kitchen
                </Text>
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={11} color={Colors.goldMetallic} />
                </View>
              </View>
              <View style={styles.locationPill}>
                <MapPin size={10} color={Colors.terracotta} />
                <Text style={styles.locationText} numberOfLines={1}>
                  Salem, TN
                </Text>
                <Text style={styles.dotDivider}>•</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.greenDot} />
                  <Text style={styles.liveText}>Live Kitchen</Text>
                </View>
              </View>
              <Text style={styles.brandTagline} numberOfLines={1}>
                "Cooked with Love... Served with Care..."
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleOpenWhatsApp}
            activeOpacity={0.85}
            style={[
              styles.whatsappButton,
              isSmallScreen && { paddingHorizontal: 8, paddingVertical: 5 },
            ]}
          >
            <MessageCircle size={13} color="#FFFFFF" />
            <Text
              style={[
                styles.whatsappButtonText,
                { color: '#FFFFFF', textDecorationLine: 'none' },
                isSmallScreen && { fontSize: 11 },
              ]}
            >
              86675 19735
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Daily Kitchen Highlights / Stories */}
        <KitchenStories />

        {/* Startup Premium Features Shortcuts Scroll */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.shortcutsHeading}>STARTUP PREMIUM SERVICES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcutsScroll}
          >
            {/* Shortcut 1: Customize Menu */}
            <TouchableOpacity
              onPress={() => router.push('/meal-planner' as any)}
              activeOpacity={0.85}
              style={styles.shortcutCard}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: Colors.terracotta }]}>
                <Calendar size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.shortcutTitle}>Weekly Planner</Text>
              <Text style={styles.shortcutSubtitle}>Swap/skip daily slots</Text>
            </TouchableOpacity>

            {/* Shortcut 2: Elder Care */}
            <TouchableOpacity
              onPress={() => router.push('/elder-profiles' as any)}
              activeOpacity={0.85}
              style={styles.shortcutCard}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: '#9333EA' }]}>
                <Heart size={13} color="#FFFFFF" fill="#9333EA" />
              </View>
              <Text style={styles.shortcutTitle}>Elder Care</Text>
              <Text style={styles.shortcutSubtitle}>Custom diet alerts</Text>
            </TouchableOpacity>

            {/* Shortcut 3: Nutrition */}
            <TouchableOpacity
              onPress={() => router.push('/nutrition-dashboard' as any)}
              activeOpacity={0.85}
              style={styles.shortcutCard}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: Colors.vegGreen }]}>
                <Flame size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.shortcutTitle}>Nutrition Tracker</Text>
              <Text style={styles.shortcutSubtitle}>Calorie macro charts</Text>
            </TouchableOpacity>

            {/* Shortcut 4: Loyalty Points */}
            <TouchableOpacity
              onPress={() => router.push('/loyalty-rewards' as any)}
              activeOpacity={0.85}
              style={styles.shortcutCard}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: Colors.goldMetallic }]}>
                <Award size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.shortcutTitle}>Blessings Rewards</Text>
              <Text style={styles.shortcutSubtitle}>Donate/Gift meals</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Search Bar with Quick Filter Tags */}
        <View style={[styles.searchWrapper, isSmallScreen && { paddingHorizontal: 14 }]}>
          <View style={[styles.searchBox, Shadows.subtle]}>
            <Search size={18} color={Colors.goldMetallic} />
            <TextInput
              placeholder="Search dishes, Salem specials or ingredients..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <View style={styles.quickSearchRow}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('Restaurant');
                  setSelectedSubCategory('Lunch');
                }}
                style={styles.quickChip}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>🍛 Meals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('Restaurant');
                  setSelectedSubCategory('Breakfast');
                }}
                style={styles.quickChip}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>🥞 Tiffin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedSubCategory('All');
                  if (!filters.seniorOnly) {
                    toggleFilter('seniorOnly');
                  }
                }}
                style={styles.quickChip}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>🥣 Senior Care</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('Chat Corner');
                  setSelectedSubCategory('All');
                }}
                style={styles.quickChip}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>☕ Snacks</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Automatic Sliding Banner Carousel */}
        {selectedCategory === 'All' && !searchQuery && <AutoImageSlider />}

        {/* Categories Bar */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Subcategories Bar */}
        <SubCategoryPills
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
        />

        {/* Senior Care Banner Highlight */}
        {selectedCategory === 'All' && !searchQuery && (
          <View style={styles.seniorBannerContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('All');
                if (!filters.seniorOnly) {
                  toggleFilter('seniorOnly');
                }
                router.push('/explore' as any);
              }}
              activeOpacity={0.88}
              style={[styles.seniorBanner, Shadows.luxury]}
            >
              <View style={styles.seniorIconBox}>
                <ShieldCheck size={26} color={Colors.seniorPurple} />
              </View>
              <View style={styles.seniorBannerContent}>
                <View style={styles.seniorBadgeRow}>
                  <View style={styles.seniorPill}>
                    <Text style={styles.seniorBadge}>Salem Senior Citizen Care</Text>
                  </View>
                  <Text style={styles.seniorPriceTag}>From ₹79</Text>
                </View>
                <Text style={styles.seniorTitle}>
                  Low-Salt, Low-Spice & Gut-Friendly Meals
                </Text>
                <Text style={styles.seniorDesc}>
                  Tailored senior nutrition with ash gourd kootu, digestive pepper rasam & light steamed rice.
                </Text>
              </View>
              <ArrowRight size={18} color={Colors.seniorPurple} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section: Menu List / Highlights */}
        <View style={styles.menuSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleLeft}>
              <View style={styles.titleWithAccent}>
                <View style={styles.titleAccentBar} />
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'Popular Homestyle Meals' : `${selectedCategory}`}
                </Text>
              </View>
              <Text style={styles.sectionSubtitle} numberOfLines={2}>
                {displayItems.length} freshly crafted dishes available in today's kitchen batch
              </Text>
            </View>

            {selectedCategory === 'All' && (
              <TouchableOpacity
                onPress={() => router.push('/explore' as any)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>See all</Text>
                <ArrowRight size={13} color={Colors.terracotta} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dishes List */}
          <View style={styles.dishesList}>
            {displayItems.map((item, idx) => (
              <FoodCard key={item.id} item={item} index={idx} />
            ))}
          </View>
        </View>

        {/* Section: Made with Care (3 promise cards) */}
        <MadeWithCare />

        {/* Story / About Footer Card */}
        <View style={styles.storyCardContainer}>
          <View style={[styles.storyCard, Shadows.luxury]}>
            <View style={styles.quoteBadge}>
              <Sparkles size={12} color={Colors.goldMetallic} />
              <Text style={styles.quoteBadgeText}>A MESSAGE FROM OUR KITCHEN</Text>
            </View>
            <Text style={styles.storyQuote}>
              "Every single meal that leaves our kitchen in Salem is cooked exactly as we would feed our own parents and children — with absolute hygiene, pure wood-pressed oils, and unconditional care."
            </Text>
            <View style={styles.founderRow}>
              <View style={styles.founderInfo}>
                <Text style={styles.founderName}>Ganesh Ram</Text>
                <Text style={styles.founderRole} numberOfLines={1}>Founder & Head of Kitchen</Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenWhatsApp}
                activeOpacity={0.88}
                style={styles.callBadge}
              >
                <MessageCircle size={13} color="#FFFFFF" />
                <Text style={styles.callBadgeText}>Chat with Us</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Extra Bottom Padding so Floating WhatsApp FAB never overlaps */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Animated WhatsApp Radar FAB */}
      <WhatsAppFAB />

      {/* Animated Floating Quick Cart Bar */}
      <FloatingQuickCart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  shortcutsSection: {
    marginVertical: 14,
  },
  shortcutsHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginLeft: 20,
    marginBottom: 8,
  },
  shortcutsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  shortcutCard: {
    width: 136,
    borderRadius: 14,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 12,
    gap: 8,
  },
  shortcutIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shortcutSubtitle: {
    fontSize: 9,
    color: Colors.textMuted,
    lineHeight: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerLogoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextGroup: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  locationText: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dotDivider: {
    color: Colors.textMuted,
    fontSize: 10,
    opacity: 0.6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9.5,
    color: '#10B981',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  brandTagline: {
    fontSize: 9.5,
    color: Colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    flexShrink: 0,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  editorialHeader: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
  },
  royalHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  royalSuperTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: Colors.textGold,
    letterSpacing: 1.2,
  },
  mainHeading: {
    fontSize: 27,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  subHeading: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 19.5,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.2,
    borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  quickSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  quickChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  seniorBannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  seniorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
    borderColor: Colors.seniorPurpleBorder,
    gap: 14,
  },
  seniorIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.seniorPurpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seniorBannerContent: {
    flex: 1,
  },
  seniorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  seniorPill: {
    backgroundColor: Colors.seniorPurpleBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  seniorBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.seniorPurple,
    letterSpacing: 0.3,
  },
  seniorPriceTag: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.seniorPurple,
  },
  seniorTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  seniorDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitleLeft: {
    flex: 1,
    marginRight: 6,
  },
  titleWithAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleAccentBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.terracotta,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
    flexShrink: 0,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.terracotta,
  },
  dishesList: {
    marginTop: 4,
  },
  storyCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorderGold,
  },
  quoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.goldBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  quoteBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.6,
  },
  storyQuote: {
    fontSize: 14.5,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  founderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 10,
  },
  founderInfo: {
    flex: 1,
    marginRight: 6,
  },
  founderName: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  founderRole: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    borderRadius: 12,
    gap: 5,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: Colors.forestGreenDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  callBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
