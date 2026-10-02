import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import {
  ArrowLeft,
  Flame,
  Award,
  Heart,
  Activity,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';

export default function NutritionDashboardScreen() {
  const router = useRouter();
  const { user, nutrition, fetchNutritionSummary } = useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNutritionSummary();
      setLoading(false);
    };
    init();
  }, [user]);

  // Provide mock health data if user hasn't ordered enough yet
  const hasOrders = nutrition && nutrition.totalMealsOrdered > 0;
  const activeData = hasOrders
    ? nutrition
    : {
        totalCalories: 8240,
        totalMealsOrdered: 18,
        vegMealsCount: 14,
        nonVegMealsCount: 4,
        macros: {
          protein: 215,
          carbs: 1040,
          fat: 190,
        },
        averageDailyCalories: 274,
      };

  const macroTotal = activeData.macros.protein + activeData.macros.carbs + activeData.macros.fat;
  const carbPercent = Math.round((activeData.macros.carbs / macroTotal) * 100) || 55;
  const proteinPercent = Math.round((activeData.macros.protein / macroTotal) * 100) || 20;
  const fatPercent = Math.round((activeData.macros.fat / macroTotal) * 100) || 25;

  const vegPercent = Math.round((activeData.vegMealsCount / activeData.totalMealsOrdered) * 100) || 80;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition Tracker</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loaderText}>Crunching Macro Metrics...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Calorie Ring Summary */}
            <View style={[styles.calorieCard, Shadows.card]}>
              <View style={styles.calorieRingContainer}>
                <View style={styles.calorieRingInner}>
                  <Flame size={24} color={Colors.terracotta} />
                  <Text style={styles.calorieCount}>{activeData.totalCalories}</Text>
                  <Text style={styles.calorieLabel}>KCAL CONSUED</Text>
                </View>
              </View>

              <View style={styles.calorieStatsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{activeData.totalMealsOrdered}</Text>
                  <Text style={styles.statLabel}>Meals Ordered</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{activeData.averageDailyCalories} kcal</Text>
                  <Text style={styles.statLabel}>Daily Average</Text>
                </View>
              </View>
            </View>

            {/* Macro Tracker */}
            <Text style={styles.sectionTitle}>Macronutrients</Text>
            <View style={[styles.macroCard, Shadows.card]}>
              {/* Carbs */}
              <View style={styles.macroProgressRow}>
                <View style={styles.macroMeta}>
                  <Text style={styles.macroName}>Carbohydrates</Text>
                  <Text style={styles.macroValue}>{activeData.macros.carbs}g ({carbPercent}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${carbPercent}%`, backgroundColor: Colors.goldMetallic }]} />
                </View>
              </View>

              {/* Protein */}
              <View style={styles.macroProgressRow}>
                <View style={styles.macroMeta}>
                  <Text style={styles.macroName}>Proteins</Text>
                  <Text style={styles.macroValue}>{activeData.macros.protein}g ({proteinPercent}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${proteinPercent}%`, backgroundColor: Colors.terracotta }]} />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.macroProgressRow}>
                <View style={styles.macroMeta}>
                  <Text style={styles.macroName}>Healthy Fats</Text>
                  <Text style={styles.macroValue}>{activeData.macros.fat}g ({fatPercent}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${fatPercent}%`, backgroundColor: Colors.vegGreen }]} />
                </View>
              </View>
            </View>

            {/* Dietary Preference Card */}
            <Text style={styles.sectionTitle}>Dietary Balance</Text>
            <View style={[styles.balanceCard, Shadows.card]}>
              <View style={styles.balanceMetaRow}>
                <Text style={styles.balanceText}>Veg Ratio: {vegPercent}%</Text>
                <Text style={styles.balanceText}>Non-Veg Ratio: {100 - vegPercent}%</Text>
              </View>
              <View style={styles.balanceBarBg}>
                <View style={[styles.balanceBarVeg, { width: `${vegPercent}%` }]} />
                <View style={[styles.balanceBarNonVeg, { width: `${100 - vegPercent}%` }]} />
              </View>
              <Text style={styles.balanceHint}>
                Excellent choice! Homestyle veg meals prepared in pure cow ghee promote alkaline levels and healthy digestion.
              </Text>
            </View>

            {/* Amma Lakshmi's Health Tips */}
            <Text style={styles.sectionTitle}>Amma Lakshmi's Health Wisdom</Text>
            <View style={styles.tipsCard}>
              <View style={styles.tipRow}>
                <View style={styles.tipIconCircle}>
                  <Heart size={14} color="#FFFFFF" fill={Colors.terracotta} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Beat Salem Summer Heat</Text>
                  <Text style={styles.tipDesc}>
                    Add "Cooling Pearl Millet Porridge" to your tiffin planner. Millets are packed with probiotic curd that keeps your gut calm and cool.
                  </Text>
                </View>
              </View>

              <View style={styles.tipDivider} />

              <View style={styles.tipRow}>
                <View style={styles.tipIconCircle}>
                  <Activity size={14} color="#FFFFFF" fill={Colors.vegGreen} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Stomach Comfort</Text>
                  <Text style={styles.tipDesc}>
                    Indulge in a light "Jeera Rasam" bowl in the evening. Cumin extracts flush out toxins and help digest food faster with zero soda.
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
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
  calorieCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  calorieRingContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#111620',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.goldBorder,
    gap: 4,
  },
  calorieCount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calorieLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  calorieStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  macroCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    gap: 14,
  },
  macroProgressRow: {
    gap: 6,
  },
  macroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  macroValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  balanceCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    gap: 12,
  },
  balanceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.nonVegRedBg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  balanceBarVeg: {
    height: '100%',
    backgroundColor: Colors.vegGreen,
  },
  balanceBarNonVeg: {
    height: '100%',
    backgroundColor: Colors.nonVegRed,
  },
  balanceHint: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tipDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipDivider: {
    height: 0.8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
});
