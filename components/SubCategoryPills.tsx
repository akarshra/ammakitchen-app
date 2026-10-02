import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { CategoryType } from '../data/menuData';

interface SubCategoryPillsProps {
  selectedCategory: CategoryType;
  selectedSubCategory: string;
  onSelectSubCategory: (subCategory: string) => void;
}

const SUBCATEGORIES: Record<string, string[]> = {
  Restaurant: ['All', 'Breakfast', 'Lunch', 'Dinner'],
  'Chat Corner': ['All', 'Burger', 'Pizza', 'Pani Puri', 'Samosa Dahi Chat', 'Channa Masla Dhahi Sundal'],
  'Monthly Subscription': ['All', 'Breakfast only', 'Lunch only', 'Dinner only', 'Monthly Subscription'],
  'SKC Corner': ['All', 'Sweet', 'Karam', 'Coffee'],
};

export const SubCategoryPills: React.FC<SubCategoryPillsProps> = ({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
}) => {
  const subCats = SUBCATEGORIES[selectedCategory];

  if (!subCats) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {subCats.map((subCat) => {
          const isSelected = selectedSubCategory === subCat;
          return (
            <TouchableOpacity
              key={subCat}
              onPress={() => onSelectSubCategory(subCat)}
              activeOpacity={0.85}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {subCat}
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
    marginVertical: 4,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  container: {
    paddingHorizontal: 20,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillSelected: {
    backgroundColor: 'rgba(255, 107, 74, 0.18)',
    borderColor: Colors.terracotta,
  },
  pillUnselected: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pillTextSelected: {
    color: Colors.terracotta,
  },
  pillTextUnselected: {
    color: Colors.textMuted,
  },
});
