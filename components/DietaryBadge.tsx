import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface DietaryBadgeProps {
  isVeg: boolean;
  size?: number;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ isVeg, size = 16 }) => {
  const outerBorder = isVeg ? Colors.vegGreen : Colors.nonVegRed;
  const innerColor = isVeg ? Colors.vegGreen : Colors.nonVegRed;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderColor: outerBorder,
          borderRadius: 3,
        },
      ]}
    >
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.45,
            height: size * 0.45,
            backgroundColor: innerColor,
            borderRadius: isVeg ? size * 0.45 : 1,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {},
});
