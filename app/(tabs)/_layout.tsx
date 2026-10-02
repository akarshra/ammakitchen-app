import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { Home, Compass, ShoppingBag, User } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function TabsLayout() {
  const { orders } = useApp();
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.forestGreen,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: '#111620',
            borderTopColor: 'rgba(255, 255, 255, 0.08)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 86 : 70,
            paddingBottom: Platform.OS === 'ios' ? 26 : 10,
            paddingTop: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11.5,
            fontWeight: '800',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Home size={size} color={color} strokeWidth={focused ? 2.8 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size, focused }) => (
              <Compass size={size} color={color} strokeWidth={focused ? 2.8 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'My Orders',
            tabBarBadge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: Colors.terracotta,
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: '900',
            },
            tabBarIcon: ({ color, size, focused }) => (
              <ShoppingBag size={size} color={color} strokeWidth={focused ? 2.8 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Kitchen',
            tabBarIcon: ({ color, size, focused }) => (
              <User size={size} color={color} strokeWidth={focused ? 2.8 : 2} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
