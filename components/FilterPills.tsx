import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { FilterState } from '../context/AppContext';
import { Sparkles, Leaf, Flame, IndianRupee, Heart } from 'lucide-react-native';

interface FilterPillsProps {
  filters: FilterState;
  onToggleFilter: (key: keyof FilterState) => void;
  onResetFilters: () => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  filters,
  onToggleFilter,
  onResetFilters,
}) => {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={onResetFilters}
            activeOpacity={0.7}
            style={[styles.chip, styles.chipReset]}
          >
            <Text style={styles.chipResetText}>Clear all</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onToggleFilter('vegOnly')}
          activeOpacity={0.7}
          style={[styles.chip, filters.vegOnly && styles.chipActiveVeg]}
        >
          <Leaf
            size={13}
            color={filters.vegOnly ? '#FFFFFF' : Colors.vegGreen}
            strokeWidth={2.2}
          />
          <Text style={[styles.chipText, filters.vegOnly && styles.chipTextActive]}>
            100% Veg
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onToggleFilter('popularOnly')}
          activeOpacity={0.7}
          style={[styles.chip, filters.popularOnly && styles.chipActiveGold]}
        >
          <Flame
            size={13}
            color={filters.popularOnly ? '#FFFFFF' : Colors.terracotta}
            strokeWidth={2.2}
          />
          <Text style={[styles.chipText, filters.popularOnly && styles.chipTextActive]}>
            Popular
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onToggleFilter('under150Only')}
          activeOpacity={0.7}
          style={[styles.chip, filters.under150Only && styles.chipActive]}
        >
          <IndianRupee
            size={13}
            color={filters.under150Only ? '#FFFFFF' : Colors.textSecondary}
            strokeWidth={2.2}
          />
          <Text style={[styles.chipText, filters.under150Only && styles.chipTextActive]}>
            Under ₹150
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onToggleFilter('seniorOnly')}
          activeOpacity={0.7}
          style={[styles.chip, filters.seniorOnly && styles.chipActivePurple]}
        >
          <Heart
            size={13}
            color={filters.seniorOnly ? '#FFFFFF' : Colors.seniorPurple}
            strokeWidth={2.2}
          />
          <Text style={[styles.chipText, filters.seniorOnly && styles.chipTextActive]}>
            Senior Care
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  chipReset: {
    backgroundColor: Colors.surfaceWarm,
    borderColor: Colors.surfaceBorder,
  },
  chipResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  chipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: Colors.goldMetallic,
  },
  chipActiveVeg: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: Colors.vegGreen,
  },
  chipActiveGold: {
    backgroundColor: 'rgba(255, 107, 74, 0.25)',
    borderColor: Colors.terracotta,
  },
  chipActivePurple: {
    backgroundColor: 'rgba(192, 132, 252, 0.25)',
    borderColor: Colors.seniorPurple,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
