import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CategoryPills } from '../../components/CategoryPills';
import { SubCategoryPills } from '../../components/SubCategoryPills';
import { FilterPills } from '../../components/FilterPills';
import { FoodCard } from '../../components/FoodCard';
import { FloatingQuickCart } from '../../components/FloatingQuickCart';
import { WhatsAppFAB } from '../../components/WhatsAppFAB';
import {
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  Flame,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilter,
    resetFilters,
    filteredMenuItems,
  } = useApp();

  const [layoutMode, setLayoutMode] = useState<'standard' | 'horizontal'>('standard');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainWrapper}>
        {/* Top Header with Layout Switcher */}
        <View style={[styles.header, isSmallScreen && { paddingHorizontal: 14 }]}>
          <View>
            <View style={styles.headerSubtitleRow}>
              <Sparkles size={12} color={Colors.goldMetallic} />
              <Text style={styles.headerSubtitle}>AMMA'S KITCHEN SALEM</Text>
            </View>
            <Text style={[styles.headerTitle, isSmallScreen && { fontSize: 22 }]}>
              Explore Pure Menu
            </Text>
          </View>

          {/* Luxury Layout Switcher */}
          <View style={styles.layoutToggle}>
            <TouchableOpacity
              onPress={() => setLayoutMode('standard')}
              style={[
                styles.layoutBtn,
                layoutMode === 'standard' && styles.layoutBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <LayoutGrid
                size={16}
                color={layoutMode === 'standard' ? Colors.goldMetallic : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLayoutMode('horizontal')}
              style={[
                styles.layoutBtn,
                layoutMode === 'horizontal' && styles.layoutBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <List
                size={16}
                color={layoutMode === 'horizontal' ? Colors.goldMetallic : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Box */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBox, Shadows.subtle]}>
            <Search size={18} color={Colors.goldMetallic} />
            <TextInput
              placeholder="Search dishes, Salem specials or ingredients..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Carousel */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Subcategory Carousel */}
        <SubCategoryPills
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
        />

        {/* Filter Pills (Dietary, Senior Care, Price) */}
        <FilterPills
          filters={filters}
          onToggleFilter={toggleFilter}
          onResetFilters={resetFilters}
        />

        {/* Menu Grid / List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Results Summary Bar */}
          <View style={styles.resultsInfoRow}>
            <Text style={styles.resultsCount}>
              Showing <Text style={styles.boldNumber}>{filteredMenuItems.length}</Text>{' '}
              {filteredMenuItems.length === 1 ? 'artisanal dish' : 'artisanal dishes'}
            </Text>
            {selectedCategory !== 'All' && (
              <TouchableOpacity
                onPress={() => setSelectedCategory('All')}
                style={styles.resetCatBadge}
                activeOpacity={0.8}
              >
                <Text style={styles.resetCatText}>In {selectedCategory} ✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Empty State */}
          {filteredMenuItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Search size={36} color={Colors.goldMetallic} />
              </View>
              <Text style={styles.emptyTitle}>No matching dishes</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or reset your dietary filters.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  resetFilters();
                }}
                activeOpacity={0.8}
                style={[styles.resetAllBtn, Shadows.floating]}
              >
                <RotateCcw size={15} color="#FFFFFF" />
                <Text style={styles.resetAllBtnText}>Show All Pure Dishes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* List of Dish Cards */
            <View style={styles.cardsContainer}>
              {filteredMenuItems.map((item, idx) => (
                <FoodCard key={item.id} item={item} layout={layoutMode} index={idx} />
              ))}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Animated WhatsApp Radar FAB */}
        <WhatsAppFAB />

        {/* Animated Floating Quick Cart Bar */}
        <FloatingQuickCart />
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  layoutToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  layoutBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
  },
  layoutBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderWidth: 1,
    borderColor: Colors.goldMetallic,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  resultsCount: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  boldNumber: {
    color: Colors.goldMetallic,
    fontWeight: '900',
  },
  resetCatBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  resetCatText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  cardsContainer: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  resetAllBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
