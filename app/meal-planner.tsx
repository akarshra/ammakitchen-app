import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  RefreshCw,
  MinusCircle,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react-native';

const SLOTS = ['Breakfast', 'Lunch', 'Dinner'] as const;

export default function MealPlannerScreen() {
  const router = useRouter();
  const {
    user,
    mealPlans,
    swapMealPlan,
    skipMealPlan,
    fetchMealPlans,
    filteredMenuItems,
  } = useApp();

  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeSwapSlot, setActiveSwapSlot] = useState<'Breakfast' | 'Lunch' | 'Dinner' | null>(null);

  // Generate 7 days starting from today
  const getWeekDates = () => {
    const dates = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      dates.push({
        dateString,
        dayNum: d.getDate(),
        dayName: daysOfWeek[d.getDay()],
        label: i === 0 ? 'Today' : `${daysOfWeek[d.getDay()]} ${d.getDate()}`,
      });
    }
    return dates;
  };

  const weekDays = getWeekDates();
  const activeDay = weekDays[selectedDayOffset];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMealPlans();
      setLoading(false);
    };
    init();
  }, [user]);

  // Seed default calendar meals if they are empty
  useEffect(() => {
    if (mealPlans.length === 0 && !loading && user) {
      const seedDefaults = async () => {
        // Find default items in local fallback menu items
        const bfastItem = filteredMenuItems.find(i => i.subCategory === 'Breakfast') || filteredMenuItems[0];
        const lunchItem = filteredMenuItems.find(i => i.subCategory === 'Lunch') || filteredMenuItems[0];
        const dinnerItem = filteredMenuItems.find(i => i.subCategory === 'Dinner') || filteredMenuItems[0];

        // Seed next 7 days in parallel
        for (const day of weekDays) {
          await swapMealPlan(day.dateString, 'Breakfast', bfastItem.id);
          await swapMealPlan(day.dateString, 'Lunch', lunchItem.id);
          await swapMealPlan(day.dateString, 'Dinner', dinnerItem.id);
        }
        await fetchMealPlans();
      };
      seedDefaults();
    }
  }, [mealPlans]);

  const getPlansForDate = (dateStr: string) => {
    return mealPlans.filter((plan) => plan.plan_date === dateStr);
  };

  const dayPlans = getPlansForDate(activeDay.dateString);

  const getSlotPlan = (slot: 'Breakfast' | 'Lunch' | 'Dinner') => {
    return dayPlans.find((p) => p.meal_slot === slot);
  };

  const handleSkipSlot = async (slot: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setLoading(true);
    const success = await skipMealPlan(activeDay.dateString, slot);
    if (success) {
      if (Platform.OS === 'web') {
        alert(`${slot} for ${activeDay.label} has been marked as Skipped. Meal count refunded to subscription balance.`);
      } else {
        Alert.alert('Meal Skipped', `${slot} has been skipped. Meal count credited back.`);
      }
    }
    setLoading(false);
  };

  const handleSwapSelect = async (menuItemId: string) => {
    if (!activeSwapSlot) return;
    setLoading(true);
    const success = await swapMealPlan(activeDay.dateString, activeSwapSlot, menuItemId);
    if (success) {
      setActiveSwapSlot(null);
    }
    setLoading(false);
  };

  // Filter swap choices by subcategory compatibility
  const getSwapChoices = () => {
    if (!activeSwapSlot) return [];
    
    // Match category
    if (activeSwapSlot === 'Breakfast') {
      return filteredMenuItems.filter(item => item.subCategory === 'Breakfast' || item.category === 'Restaurant');
    }
    if (activeSwapSlot === 'Lunch') {
      return filteredMenuItems.filter(item => item.subCategory === 'Lunch' || item.category === 'Restaurant');
    }
    return filteredMenuItems.filter(item => item.subCategory === 'Dinner' || item.category === 'Restaurant' || item.category === 'Chat Corner');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customize Menu</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Date Selector Row */}
        <View style={styles.calendarRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
            {weekDays.map((day, idx) => {
              const isSelected = idx === selectedDayOffset;
              return (
                <TouchableOpacity
                  key={day.dateString}
                  onPress={() => setSelectedDayOffset(idx)}
                  style={[styles.datePill, isSelected && styles.datePillSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayName, isSelected && styles.textWhite]}>{day.dayName}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.textWhite]}>{day.dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loaderText}>Syncing Menu Calendar...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Intro Ribbon */}
            <View style={styles.infoBanner}>
              <Sparkles size={14} color={Colors.goldMetallic} />
              <Text style={styles.infoBannerText}>
                Pause, skip or swap any meal by 8:00 PM the previous day.
              </Text>
            </View>

            {/* Slots List */}
            {SLOTS.map((slot) => {
              const plan = getSlotPlan(slot);
              const isSkipped = plan?.status === 'Skipped';

              return (
                <View key={slot} style={[styles.slotCard, isSkipped && styles.slotCardSkipped]}>
                  {/* Slot Title Bar */}
                  <View style={styles.slotHeader}>
                    <Text style={styles.slotTitle}>{slot.toUpperCase()}</Text>
                    {isSkipped ? (
                      <View style={styles.skippedTag}>
                        <Text style={styles.skippedTagText}>SKIPPED</Text>
                      </View>
                    ) : (
                      <View style={styles.scheduledTag}>
                        <Text style={styles.scheduledTagText}>SCHEDULED</Text>
                      </View>
                    )}
                  </View>

                  {/* Dish Info Row */}
                  {plan && plan.menu_item_id && !isSkipped ? (
                    <View style={styles.dishRow}>
                      {plan.dish_image && (
                        <Image source={{ uri: plan.dish_image }} style={styles.dishImage} contentFit="cover" />
                      )}
                      <View style={styles.dishMeta}>
                        <Text style={styles.dishName} numberOfLines={1}>{plan.dish_name}</Text>
                        <Text style={styles.dishStatusText}>Cooked fresh with cold-pressed oil</Text>
                      </View>
                    </View>
                  ) : isSkipped ? (
                    <View style={styles.skippedMsgRow}>
                      <Text style={styles.skippedMsgText}>
                        No delivery scheduled. Your meal count is saved.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.emptySlotRow}>
                      <HelpCircle size={16} color={Colors.textMuted} />
                      <Text style={styles.emptySlotText}>No meal selected for this slot</Text>
                    </View>
                  )}

                  {/* Actions Bar */}
                  <View style={styles.actionsBar}>
                    {!isSkipped ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setActiveSwapSlot(slot)}
                          style={styles.actionBtn}
                          activeOpacity={0.8}
                        >
                          <RefreshCw size={12} color={Colors.goldMetallic} />
                          <Text style={styles.actionBtnText}>Swap Dish</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleSkipSlot(slot)}
                          style={[styles.actionBtn, styles.actionBtnSkip]}
                          activeOpacity={0.8}
                        >
                          <MinusCircle size={12} color={Colors.terracotta} />
                          <Text style={[styles.actionBtnText, { color: Colors.terracotta }]}>Skip Meal</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setActiveSwapSlot(slot)}
                        style={styles.actionBtnResume}
                        activeOpacity={0.8}
                      >
                        <PlusCircle size={13} color="#FFFFFF" />
                        <Text style={styles.actionBtnResumeText}>Resume Meal Delivery</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Swap Selection Modal overlay if active */}
        {activeSwapSlot && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Dish for {activeSwapSlot}</Text>
              <ScrollView style={styles.swapList}>
                {getSwapChoices().map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSwapSelect(item.id)}
                    style={styles.swapItemRow}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.image }} style={styles.swapImage} contentFit="cover" />
                    <View style={styles.swapMeta}>
                      <Text style={styles.swapName}>{item.name}</Text>
                      <Text style={styles.swapDesc} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <CheckCircle2 size={16} color={Colors.goldMetallic} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setActiveSwapSlot(null)}
                style={styles.closeModalBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.closeModalText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrapper: {
    flex: 1,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calendarRow: {
    backgroundColor: '#111620',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  calendarScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  datePill: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  datePillSelected: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
  infoBannerText: {
    fontSize: 11,
    color: Colors.goldMetallic,
    fontWeight: '700',
    flex: 1,
  },
  slotCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    gap: 12,
  },
  slotCardSkipped: {
    opacity: 0.65,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  scheduledTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 0.8,
    borderColor: Colors.forestGreen,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scheduledTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: Colors.forestGreen,
  },
  skippedTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 0.8,
    borderColor: Colors.terracotta,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  skippedTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: Colors.terracotta,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  dishMeta: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dishStatusText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  skippedMsgRow: {
    paddingVertical: 8,
  },
  skippedMsgText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptySlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptySlotText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  actionsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnSkip: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  actionBtnResume: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnResumeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    width: '100%',
    maxHeight: '75%',
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  swapList: {
    gap: 8,
  },
  swapItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  swapImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  swapMeta: {
    flex: 1,
    gap: 2,
  },
  swapName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  swapDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  closeModalBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
