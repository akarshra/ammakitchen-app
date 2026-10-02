import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { CATEGORIES, CategoryType } from '../data/menuData';
import { Sparkles, Utensils, Flame, CalendarRange, Coffee, CupSoda, Dessert } from 'lucide-react-native';

interface CategoryPillsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const CATEGORY_ICONS: Record<CategoryType, any> = {
  All: Sparkles,
  Restaurant: Utensils,
  'Chat Corner': Flame,
  'Monthly Subscription': CalendarRange,
  'SKC Corner': Coffee,
  'Cold Beverages': CupSoda,
  'Ice Cream & Brownie': Dessert,
};

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const Icon = CATEGORY_ICONS[category] || Sparkles;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelectCategory(category)}
              activeOpacity={0.8}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
            >
              <Icon
                size={13}
                color={isSelected ? '#FFFFFF' : Colors.textMuted}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
  },
  pillSelected: {
    backgroundColor: Colors.forestGreen,
    borderColor: Colors.forestGreen,
  },
  pillUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
  },
  pillText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  pillTextUnselected: {
    color: Colors.textSecondary,
  },
});
