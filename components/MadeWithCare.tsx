import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../constants/theme';
import { Sparkles, HeartHandshake, PackageCheck, ShieldCheck } from 'lucide-react-native';

export const MadeWithCare: React.FC = () => {
  const cards = [
    {
      id: 'fresh',
      title: 'Artisanal Small Batches',
      desc: 'Cooked fresh after your order in small batches. Zero pre-mixes, zero white soda, and zero artificial colors.',
      badge: 'Fresh Batch',
      icon: Sparkles,
      color: Colors.goldMetallic,
      bg: 'rgba(212, 175, 55, 0.12)',
    },
    {
      id: 'taste',
      title: 'Traditional Salem Recipes',
      desc: 'Authentic ancestral Salem recipes with 100% cold wood-pressed oils, hand-pounded masalas & Amma’s care.',
      badge: 'Wood-Pressed Oils',
      icon: HeartHandshake,
      color: Colors.forestGreen,
      bg: Colors.forestGreenBg,
    },
    {
      id: 'pack',
      title: 'Spill-Proof Warm Packaging',
      desc: 'Food-grade, eco-friendly heat retaining packaging ensuring your meals reach piping hot to your doorstep.',
      badge: 'Eco Safe Box',
      icon: PackageCheck,
      color: Colors.terracotta,
      bg: Colors.terracottaBg,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.accentLine} />
          <Text style={styles.sectionTitle}>The 3 Pillars of Amma's Kitchen</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Uncompromising purity, wholesome nutrition & authentic Salem flavours
        </Text>
      </View>

      <View style={styles.cardsGrid}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <View key={card.id} style={[styles.careCard, Shadows.subtle]}>
              <View style={[styles.iconCircle, { backgroundColor: card.bg }]}>
                <Icon size={20} color={card.color} strokeWidth={2.2} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <View style={[styles.badge, { backgroundColor: card.bg }]}>
                    <Text style={[styles.badgeText, { color: card.color }]}>
                      {card.badge}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{card.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 28,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  accentLine: {
    width: 4,
    height: 20,
    backgroundColor: Colors.goldMetallic,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  cardsGrid: {
    gap: 12,
  },
  careCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
