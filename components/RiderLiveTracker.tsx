import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Shadows } from '../constants/theme';
import { Bike, MapPin, Compass, Navigation } from 'lucide-react-native';

interface RiderLocation {
  latitude: number;
  longitude: number;
  bearing?: number;
  status?: string;
}

interface RiderLiveTrackerProps {
  riderLocation: RiderLocation | null;
  status: string;
}

export const RiderLiveTracker: React.FC<RiderLiveTrackerProps> = ({ riderLocation, status }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const startLat = 11.6643;
  const startLng = 78.1460;
  const endLat = 11.6685;
  const endLng = 78.1565;

  const latDiff = endLat - startLat;
  const lngDiff = endLng - startLng;

  // Calculate progress percentage along the coordinate path
  let progress = 0;
  if (riderLocation) {
    const dLat = riderLocation.latitude - startLat;
    const dLng = riderLocation.longitude - startLng;
    const totalDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    const currentDist = Math.sqrt(dLat * dLat + dLng * dLng);
    progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
  } else if (status === 'Delivered') {
    progress = 1;
  }

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Interpolate position offsets for drawing on our custom map visual (percentage of width/height)
  const leftOffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '85%'],
  });

  const topOffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['70%', '25%'], // moves upwards and rightwards
  });

  const isActive = status === 'Out for Delivery' && riderLocation;

  return (
    <View style={[styles.container, Shadows.card]}>
      {/* Map Header */}
      <View style={styles.headerRow}>
        <View style={styles.liveIndicator}>
          <View style={[styles.pulseDot, isActive && styles.pulseDotActive]} />
          <Text style={styles.headerTitle}>
            {status === 'Delivered'
              ? 'Rider Arrived'
              : isActive
              ? 'Live Delivery Tracking'
              : 'Preparing for Dispatch'}
          </Text>
        </View>
        {isActive && (
          <View style={styles.telemetryBadge}>
            <Compass size={11} color={Colors.goldMetallic} />
            <Text style={styles.telemetryText}>GPS Active</Text>
          </View>
        )}
      </View>

      {/* Map Board */}
      <View style={styles.mapBoard}>
        {/* Salem Grid Lines / Roads Visual Mock */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />

        {/* Start Point Pin (Amma's Woodfire Kitchen) */}
        <View style={[styles.pinWrapper, { left: '15%', top: '70%' }]}>
          <View style={styles.kitchenCircle}>
            <MapPin size={12} color="#FFFFFF" fill={Colors.terracotta} />
          </View>
          <Text style={styles.pinLabel} numberOfLines={1}>Amma's Kitchen</Text>
        </View>

        {/* End Point Pin (Customer Home) */}
        <View style={[styles.pinWrapper, { left: '85%', top: '25%' }]}>
          <View style={styles.homeCircle}>
            <MapPin size={12} color="#FFFFFF" fill={Colors.vegGreen} />
          </View>
          <Text style={styles.pinLabel} numberOfLines={1}>Your Home</Text>
        </View>

        {/* Route Path Indicator Line */}
        <View style={styles.routeLine} />

        {/* Rider Indicator Icon (Animated along the path) */}
        {(isActive || status === 'Delivered') && (
          <Animated.View style={[styles.riderWrapper, { left: leftOffset, top: topOffset }]}>
            <View style={styles.riderCircle}>
              <Bike size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.riderPulse, { transform: [{ rotate: `${riderLocation?.bearing || 45}deg` }] }]}>
              <Navigation size={8} color={Colors.goldMetallic} fill={Colors.goldMetallic} />
            </View>
          </Animated.View>
        )}
      </View>

      {/* Rider Telemetry Panel */}
      <View style={styles.telemetryPanel}>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>DISTANCE</Text>
          <Text style={styles.telemetryValue}>
            {status === 'Delivered'
              ? '0.0 km'
              : isActive
              ? `${(2.1 * (1 - progress)).toFixed(1)} km`
              : '2.1 km'}
          </Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>SPEED</Text>
          <Text style={styles.telemetryValue}>
            {isActive ? '34 km/h' : '0 km/h'}
          </Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>HEADING</Text>
          <Text style={styles.telemetryValue}>
            {isActive ? 'Hasthampatti' : 'Fairlands'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    overflow: 'hidden',
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  pulseDotActive: {
    backgroundColor: Colors.vegGreen,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  telemetryText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.5,
  },
  mapBoard: {
    height: 140,
    backgroundColor: '#0F131A',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '35%',
    height: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '75%',
    height: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
    marginLeft: -40,
  },
  kitchenCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  homeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.vegGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  routeLine: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: '25%',
    bottom: '25%',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    borderStyle: 'dashed',
    borderRadius: 10,
    zIndex: 0,
  },
  riderWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    zIndex: 10,
  },
  riderCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.goldMetallic,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  riderPulse: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#0F131A',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldMetallic,
  },
  telemetryPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
  },
  telemetryValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
