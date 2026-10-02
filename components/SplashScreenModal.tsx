import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors } from '../constants/theme';
import { ArrowRight } from 'lucide-react-native';
import { BRAND_LOGO_BASE64 } from '../constants/brandLogoBase64';

interface SplashScreenModalProps {
  onFinish?: () => void;
  autoHideDuration?: number;
}

export const SplashScreenModal: React.FC<SplashScreenModalProps> = ({
  onFinish,
  autoHideDuration = 800,
}) => {
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const [isDismissing, setIsDismissing] = useState(false);

  // Robust responsive logo size that never collapses to 0
  const safeWidth = width && width > 50 ? width : 390;
  const safeHeight = height && height > 50 ? height : 844;
  const isSmallScreen = safeWidth < 360;
  const logoSize = Math.max(150, Math.min(safeWidth * 0.46, safeHeight * 0.25, 190));
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: useNative,
    }).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: useNative,
    }).start(() => {
      onFinish?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDismiss}
        style={styles.fullTouchArea}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
                maxWidth: 440,
              },
            ]}
          >
          {/* Brand Crest / Official Logo with Guaranteed Sizing */}
          <View
            style={[
              styles.logoWrapper,
              {
                width: logoSize,
                height: logoSize,
                borderRadius: logoSize / 2,
                marginBottom: isSmallScreen ? 14 : 20,
              },
            ]}
          >
            {Platform.OS === 'web' ? (
              <img
                src={BRAND_LOGO_BASE64}
                alt="Amma's Kitchen Salem"
                style={{
                  width: logoSize - 8,
                  height: logoSize - 8,
                  borderRadius: (logoSize - 8) / 2,
                  objectFit: 'contain',
                  display: 'block',
                }}
                decoding="sync"
                loading="eager"
              />
            ) : (
              <Image
                source={{ uri: BRAND_LOGO_BASE64 }}
                style={{
                  width: logoSize - 8,
                  height: logoSize - 8,
                  borderRadius: (logoSize - 8) / 2,
                }}
                contentFit="contain"
                priority="high"
                cachePolicy="memory-disk"
                transition={0}
              />
            )}
          </View>

          {/* Brand Taglines */}
          <View style={styles.textGroup}>
            <View style={styles.healthyPill}>
              <Text
                style={[
                  styles.healthyPillText,
                  isSmallScreen && { fontSize: 11 },
                ]}
              >
                Healthy Food !!! Happy Life !!!
              </Text>
            </View>

            {/* WhatsApp Direct Badge from Logo */}
            <View style={styles.whatsappPill}>
              <Text
                style={[
                  styles.whatsappPillText,
                  { color: '#FFFFFF', textDecorationLine: 'none' },
                  isSmallScreen && { fontSize: 12 },
                ]}
              >
                ✆ 86675 19735
              </Text>
            </View>

            <Text
              style={[
                styles.careSubtitle,
                isSmallScreen && { fontSize: 12 },
              ]}
            >
              "Cooked with Love... Served with Care..."
            </Text>

            <Text style={styles.locationTag}>SALEM • TAMIL NADU</Text>
          </View>

          {/* Loading Indicator & Instant Continue Button */}
          <View
            style={[
              styles.bottomSection,
              { marginTop: isSmallScreen ? 20 : 28 },
            ]}
          >
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.forestGreen} />
              <Text
                style={[
                  styles.loadingText,
                  isSmallScreen && { fontSize: 11 },
                ]}
              >
                Preparing Fresh Kitchen Menu...
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.8}
              style={styles.skipBtn}
            >
              <Text style={styles.skipBtnText}>Enter Kitchen</Text>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0F15',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullTouchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  logoWrapper: {
    minWidth: 150,
    minHeight: 150,
    backgroundColor: '#151C28',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 3,
    borderColor: Colors.goldMetallic,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textGroup: {
    alignItems: 'center',
    gap: 7,
    width: '100%',
  },
  healthyPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: Colors.forestGreen,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  healthyPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  whatsappPill: {
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.goldMetallic,
  },
  whatsappPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  careSubtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    fontWeight: '600',
  },
  locationTag: {
    fontSize: 11,
    color: Colors.goldMetallic,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 3,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  skipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
