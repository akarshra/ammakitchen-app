import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Colors } from '../constants/theme';
import { Sparkles, Heart, Clock, ShieldCheck, Flame, Leaf } from 'lucide-react-native';

const TICKER_ITEMS = [
  { icon: Leaf, text: '100% Wood-Pressed Oil' },
  { icon: Heart, text: 'Cooked with Love by Amma' },
  { icon: ShieldCheck, text: 'Zero Soda • Zero Colors' },
  { icon: Clock, text: 'Fresh Batch Every 3 Hours' },
  { icon: Sparkles, text: 'Salem Senior Citizen Care' },
  { icon: Flame, text: 'Authentic Salem Masalas' },
];

export const MovableStrip: React.FC = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -1,
        duration: 16000,
        useNativeDriver: useNative,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = scrollAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-650, 0],
  });

  // Duplicate items for infinite marquee
  const duplicatedItems = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <View style={styles.container}>
      <View style={styles.stripWrapper}>
        <Animated.View
          style={[
            styles.stripTrack,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {duplicatedItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.stripItem}>
                <View style={styles.iconCircle}>
                  <Icon size={11} color={Colors.goldMetallic} strokeWidth={2.5} />
                </View>
                <Text style={styles.stripText}>{item.text}</Text>
                <Text style={styles.dotSeparator}>◆</Text>
              </View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
    overflow: 'hidden',
  },
  stripWrapper: {
    backgroundColor: Colors.forestGreenDark,
    paddingVertical: 8,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.goldBorder,
    shadowColor: Colors.forestGreenDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  stripTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 3500,
  },
  stripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    gap: 7,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: {
    color: '#FFF9ED',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dotSeparator: {
    color: Colors.goldMetallic,
    fontSize: 8,
    marginLeft: 12,
    opacity: 0.85,
  },
});
