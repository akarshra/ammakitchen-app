import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import {
  ArrowLeft,
  Gift,
  Heart,
  Award,
  Share2,
  CheckCircle2,
  Send,
  MessageCircle,
} from 'lucide-react-native';

export default function LoyaltyRewardsScreen() {
  const router = useRouter();
  const { user, loyalty, fetchLoyalty, donateMeals } = useApp();
  const [loading, setLoading] = useState(false);

  // Gifting state
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [giftedCode, setGiftedCode] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLoyalty();
      setLoading(false);
    };
    init();
  }, [user]);

  const handlePointDonation = async () => {
    const currentPoints = loyalty?.points_balance || 0;
    if (currentPoints < 100) {
      alert('You need at least 100 points to donate a meal. Place more orders to earn points!');
      return;
    }

    setLoading(true);
    const success = await donateMeals(100, 1);
    if (success) {
      if (Platform.OS === 'web') {
        alert('Thank you! 100 points redeemed. 1 homestyle meal has been sponsored for a Salem senior citizen shelter.');
      }
    }
    setLoading(false);
  };

  const handleCashDonation = async () => {
    setLoading(true);
    // Sponsor meal via mock payment
    const success = await donateMeals(0, 1);
    if (success) {
      if (Platform.OS === 'web') {
        alert('Bless you! Meal sponsored successfully. You have earned 10 bonus points!');
      }
    }
    setLoading(false);
  };

  const handleGiftMeal = () => {
    if (!friendName.trim() || !friendPhone.trim()) {
      alert('Please fill out Friend Name and Phone Number.');
      return;
    }

    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `AMMAGIFT-${randomCode}`;
    setGiftedCode(code);

    const message = `Hi ${friendName}! I just gifted you a hot, fresh homestyle meal from Amma's Kitchen Salem. Use coupon code *${code}* during checkout to claim your blessing. Order here: exp://192.168.1.4:8085`;
    const whatsappUrl = `https://wa.me/91${friendPhone}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      alert(`Voucher code generated: ${code}. You can share this code with them!`);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Amma's Blessings</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loaderText}>Syncing Blessings Points...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Points Summary Card */}
            <View style={[styles.pointsCard, Shadows.card]}>
              <View style={styles.pointsHeader}>
                <Award size={20} color={Colors.goldMetallic} />
                <Text style={styles.pointsCardTitle}>YOUR POINTS BALANCE</Text>
              </View>
              <Text style={styles.pointsCount}>
                {loyalty?.points_balance || 0} <Text style={styles.pointsUnit}>Pts</Text>
              </Text>
              <Text style={styles.pointsHint}>
                Earn 10 points for every ₹100 spent. Redeem points for free meals or elder care donations.
              </Text>
            </View>

            {/* Donation Score Card */}
            <View style={[styles.donationsCard, Shadows.card]}>
              <View style={styles.donationsHeader}>
                <Heart size={18} color="#FFFFFF" fill={Colors.terracotta} />
                <Text style={styles.donationsTitle}>MEALS YOU DONATED</Text>
              </View>
              <Text style={styles.donationsCount}>
                {loyalty?.meals_donated || 0} <Text style={styles.donationsUnit}>Elders Fed</Text>
              </Text>
              <Text style={styles.donationsHint}>
                You are spreading mother's care across Salem. Every donation funds a hot, low-salt tiffin meal for elderly residents.
              </Text>
            </View>

            {/* Sponsor Meal section */}
            <Text style={styles.sectionTitle}>Sponsor a Meal to Salem Shelter</Text>
            <View style={styles.actionCard}>
              <Text style={styles.actionDesc}>
                Help us feed abandoned elderly citizens in Salem shelters. Each meal consists of soft idlis, cumin rasam, and ash gourd kootu.
              </Text>
              <View style={styles.donationActions}>
                <TouchableOpacity
                  onPress={handlePointDonation}
                  style={[styles.donateBtn, (loyalty?.points_balance || 0) < 100 && styles.donateBtnDisabled]}
                  activeOpacity={0.8}
                >
                  <Award size={14} color="#FFFFFF" />
                  <Text style={styles.donateBtnText}>Sponsor with 100 Pts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCashDonation}
                  style={[styles.donateBtn, styles.donateBtnCash]}
                  activeOpacity={0.8}
                >
                  <Heart size={14} color="#FFFFFF" />
                  <Text style={styles.donateBtnText}>Sponsor for ₹50</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gift a Meal section */}
            <Text style={styles.sectionTitle}>Gift a Meal to a Friend</Text>
            <View style={styles.actionCard}>
              <Text style={styles.actionDesc}>
                Send a warm, healthy homestyle meal voucher to your friends or family in Salem via WhatsApp.
              </Text>
              
              <View style={styles.giftForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Friend's Name"
                  placeholderTextColor={Colors.textSubtle}
                  value={friendName}
                  onChangeText={setFriendName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Friend's Phone (10 digits)"
                  placeholderTextColor={Colors.textSubtle}
                  keyboardType="phone-pad"
                  value={friendPhone}
                  onChangeText={setFriendPhone}
                />
                <TouchableOpacity
                  onPress={handleGiftMeal}
                  style={styles.giftBtn}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={14} color="#FFFFFF" />
                  <Text style={styles.giftBtnText}>Share Gift Code on WhatsApp</Text>
                </TouchableOpacity>
              </View>

              {giftedCode ? (
                <View style={styles.codeSuccessBox}>
                  <CheckCircle2 size={16} color={Colors.vegGreen} />
                  <Text style={styles.codeText}>Code Generated: {giftedCode}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrapper: {
    flex: 1,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  pointsCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    padding: 16,
    gap: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 1.5,
  },
  pointsCount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pointsUnit: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  pointsHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  donationsCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 107, 74, 0.25)',
    padding: 16,
    gap: 8,
  },
  donationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donationsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.terracottaLight,
    letterSpacing: 1.5,
  },
  donationsCount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  donationsUnit: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  donationsHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    gap: 12,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  donationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  donateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  donateBtnDisabled: {
    opacity: 0.5,
  },
  donateBtnCash: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  donateBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  giftForm: {
    gap: 10,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#FFFFFF',
  },
  giftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  giftBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  codeSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: 10,
    padding: 8,
    gap: 8,
    marginTop: 4,
  },
  codeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.vegGreen,
  },
});
