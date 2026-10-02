import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Leaf, Clock, Star } from 'lucide-react-native';

export interface SlideItem {
  id: string;
  dishId?: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: any;
  badgeColor: string;
  badgeBg: string;
  price: string;
  originalPrice?: string;
  tag: string;
  image: string;
}

export const SLIDES_DATA: SlideItem[] = [
  {
    id: 'slide-1',
    dishId: 'ak-south-indian-meals',
    title: 'Grand South Indian Meals',
    subtitle: '100% Wood-Pressed Oils & Salem Heritage Sambar',
    badge: "Chef Amma's Signature",
    badgeIcon: Sparkles,
    badgeColor: Colors.goldMetallic,
    badgeBg: 'rgba(251, 191, 36, 0.25)',
    price: '₹149',
    originalPrice: '₹179',
    tag: 'SAVE ₹30',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'slide-2',
    dishId: 'ak-senior-citizen-meal',
    title: 'Senior Citizen Care Meal',
    subtitle: 'Low-Salt, Low-Spice, Gentle Digestive Nutrition',
    badge: 'Salem Elder Care',
    badgeIcon: ShieldCheck,
    badgeColor: Colors.seniorPurple,
    badgeBg: 'rgba(192, 132, 252, 0.25)',
    price: '₹129',
    originalPrice: '₹159',
    tag: 'GUT FRIENDLY',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'slide-3',
    dishId: 'ak-idli-vada-combo',
    title: 'Idli & Vada Morning Feast',
    subtitle: 'Stone-Ground Fermented Batter with 2 Chutneys',
    badge: 'Fresh Morning Batch',
    badgeIcon: Leaf,
    badgeColor: Colors.forestGreenLight,
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    price: '₹89',
    originalPrice: '₹109',
    tag: 'TOP RATED',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'slide-4',
    dishId: 'ak-salem-thattu-vadai-set',
    title: 'Salem Street Crackers Set',
    subtitle: 'Iconic Artisanal Rice Discs with Fresh Veg Grate',
    badge: 'Salem Street Icon',
    badgeIcon: Flame,
    badgeColor: Colors.terracotta,
    badgeBg: 'rgba(255, 107, 74, 0.25)',
    price: '₹69',
    originalPrice: '₹89',
    tag: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'slide-5',
    dishId: 'ak-curd-rice',
    title: 'Tempered Curd Rice',
    subtitle: 'Velvety Thayir Sadam with Ruby Pomegranate',
    badge: 'Cooling Comfort',
    badgeIcon: Sparkles,
    badgeColor: Colors.goldMetallic,
    badgeBg: 'rgba(251, 191, 36, 0.25)',
    price: '₹79',
    originalPrice: '₹99',
    tag: 'ALL-DAY LIGHT',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  },
];

export const AutoImageSlider: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  // Maximum content width cap for tablets / web
  const containerWidth = Math.min(width, 640);
  const slideWidth = containerWidth - 40; // 20px padding on each side
  const slideHeight = Math.min(Math.max(slideWidth * 0.58, 220), 280);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<any>(null);

  // Smooth Auto-sliding effect
  useEffect(() => {
    if (isUserInteracting) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SLIDES_DATA.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * (slideWidth + 14),
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3800);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isUserInteracting, slideWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const itemFullWidth = slideWidth + 14;
    const index = Math.round(scrollOffset / itemFullWidth);
    if (index >= 0 && index < SLIDES_DATA.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleSlidePress = (slide: SlideItem) => {
    if (slide.dishId) {
      router.push(`/dish/${slide.dishId}` as any);
    } else {
      router.push('/explore' as any);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Header bar above slider with Live Indicator */}
      <View style={styles.sliderHeaderRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.sparkleIconBox}>
            <Sparkles size={14} color={Colors.goldMetallic} />
          </View>
          <Text style={styles.sliderSectionTitle}>TODAY'S KITCHEN HIGHLIGHTS</Text>
        </View>

        {/* Counter Badge */}
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {activeIndex + 1} <Text style={styles.counterDim}>/ {SLIDES_DATA.length}</Text>
          </Text>
        </View>
      </View>

      {/* Sliding Images Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideWidth + 14}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={128}
        onTouchStart={() => setIsUserInteracting(true)}
        onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 2000)}
        onScrollBeginDrag={() => setIsUserInteracting(true)}
        onScrollEndDrag={() => setTimeout(() => setIsUserInteracting(false), 2000)}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES_DATA.map((slide, idx) => {
          const BadgeIcon = slide.badgeIcon;
          const isCurrent = idx === activeIndex;

          return (
            <TouchableOpacity
              key={slide.id}
              activeOpacity={0.92}
              onPress={() => handleSlidePress(slide)}
              style={[
                styles.slideCard,
                {
                  width: slideWidth,
                  height: slideHeight,
                },
                Shadows.floating,
              ]}
            >
              {/* Background Food Image */}
              <Image
                source={{ uri: slide.image }}
                style={styles.slideImage}
                contentFit="cover"
                priority={idx === 0 ? 'high' : 'normal'}
                cachePolicy="memory-disk"
                transition={200}
              />

              {/* Luxury Gradient Dark Backdrop */}
              <View style={styles.darkGradientOverlay} />

              {/* Slide Content Overlay */}
              <View style={styles.slideInnerContent}>
                {/* Top Badge & Save Tag */}
                <View style={styles.topBadgeRow}>
                  <View style={[styles.badgeContainer, { backgroundColor: slide.badgeBg }]}>
                    <BadgeIcon size={12} color={slide.badgeColor} />
                    <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                      {slide.badge}
                    </Text>
                  </View>

                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{slide.tag}</Text>
                  </View>
                </View>

                {/* Bottom Details & CTA */}
                <View style={styles.bottomInfoBlock}>
                  <Text style={[styles.slideTitle, isSmallScreen && { fontSize: 18 }]} numberOfLines={1}>
                    {slide.title}
                  </Text>
                  <Text style={styles.slideSubtitle} numberOfLines={1}>
                    {slide.subtitle}
                  </Text>

                  <View style={styles.actionRow}>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceText, isSmallScreen && { fontSize: 20 }]}>
                        {slide.price}
                      </Text>
                      {slide.originalPrice && (
                        <Text style={styles.originalPriceText}>
                          {slide.originalPrice}
                        </Text>
                      )}
                    </View>

                    <View style={styles.orderNowButton}>
                      <Text style={styles.orderNowText}>Order Fresh</Text>
                      <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.8} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Animated Glowing Dot Indicators */}
      <View style={styles.paginationRow}>
        {SLIDES_DATA.map((_, dotIdx) => {
          const isActive = dotIdx === activeIndex;
          return (
            <TouchableOpacity
              key={dotIdx}
              onPress={() => {
                setActiveIndex(dotIdx);
                scrollRef.current?.scrollTo({
                  x: dotIdx * (slideWidth + 14),
                  animated: true,
                });
              }}
              activeOpacity={0.7}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 10,
    width: '100%',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(251, 191, 36, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 1.2,
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterDim: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  slideCard: {
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    backgroundColor: Colors.surfaceCard,
  },
  slideImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 15, 21, 0.72)',
  },
  slideInnerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tagBadge: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bottomInfoBlock: {
    gap: 3,
  },
  slideTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  slideSubtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
    opacity: 0.92,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  originalPriceText: {
    fontSize: 12.5,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  orderNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: Colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.goldMetallic,
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
