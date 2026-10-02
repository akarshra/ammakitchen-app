import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/theme';
import { BRAND_INFO, MENU_ITEMS } from '../data/menuData';
import {
  Star,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  CheckCircle2,
  ThumbsUp,
  Send,
} from 'lucide-react-native';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  defaultDishId?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Could be better 😕',
  2: 'Fair experience 🙂',
  3: 'Good & Homestyle 😊',
  4: 'Very Tasty & Authentic 😋',
  5: 'Outstanding Amma Love! ❤️',
};

const FEEDBACK_TAGS = [
  '🍛 Authentic Salem Taste',
  '🌿 Pure Wood-Pressed Oils',
  '🔥 Steaming Hot Delivery',
  '👴 Senior Friendly & Soft',
  '📦 Eco Spill-Proof Packaging',
  '👵 Cooked with Motherly Care',
  '⚡ Lightning Fast Delivery',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  defaultDishId,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '🍛 Authentic Salem Taste',
    '👵 Cooked with Motherly Care',
  ]);
  const [comments, setComments] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleShareWhatsApp = () => {
    const text = `🌟 *Customer Review for Amma's Kitchen Salem*\n\n⭐ Rating: ${rating}/5 (${RATING_LABELS[rating]})\n\n🏷️ Highlights:\n${selectedTags
      .map((t) => `• ${t}`)
      .join('\n')}\n\n💬 Comments: "${comments || 'Loved the authentic pure taste!'}"\n\n- ${
      customerName || 'Happy Salem Diner'
    }`;
    const url = `https://wa.me/918667519735?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setRating(5);
    setComments('');
    setCustomerName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleResetAndClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Sparkles size={13} color={Colors.goldMetallic} />
            <Text style={styles.headerSubtitle}>AMMA'S KITCHEN SALEM</Text>
          </View>
          <Text style={styles.headerTitle}>Rate Your Feast & Experience</Text>
          <TouchableOpacity
            onPress={handleResetAndClose}
            style={styles.closeBtn}
            activeOpacity={0.8}
          >
            <X size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!isSubmitted ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Star Rating Card */}
            <View style={[styles.card, Shadows.card]}>
              <Text style={styles.sectionHeading}>HOW WAS YOUR FOOD & SERVICE?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Star
                      size={36}
                      color={star <= rating ? Colors.goldMetallic : 'rgba(255, 255, 255, 0.2)'}
                      fill={star <= rating ? Colors.goldMetallic : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.ratingLabelPill}>
                <Text style={styles.ratingLabelText}>{RATING_LABELS[rating]}</Text>
              </View>
            </View>

            {/* Praise / Feedback Tags */}
            <View style={[styles.card, Shadows.card]}>
              <Text style={styles.sectionHeading}>WHAT DID YOU LOVE THE MOST?</Text>
              <View style={styles.tagsWrap}>
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.8}
                      style={[
                        styles.tagChip,
                        isSelected && styles.tagChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected && styles.tagChipTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment Box */}
            <View style={[styles.card, Shadows.card]}>
              <Text style={styles.sectionHeading}>MESSAGE TO CHEF GANESH RAM & AMMA</Text>
              <TextInput
                placeholder="Tell us about the taste, spice level, or any special moments with your family..."
                placeholderTextColor={Colors.textMuted}
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={3}
                style={styles.commentInput}
              />

              <View style={styles.nameInputRow}>
                <TextInput
                  placeholder="Your Name (Optional)"
                  placeholderTextColor={Colors.textMuted}
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={styles.nameInput}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.88}
              style={[styles.submitBtn, Shadows.floating]}
            >
              <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.submitBtnText}>Submit Kitchen Feedback</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          /* Thank You & Share Celebration Screen */
          <View style={styles.successContainer}>
            <View style={styles.successIconCircle}>
              <Heart size={44} color={Colors.terracotta} fill={Colors.terracotta} />
            </View>
            <Text style={styles.successTitle}>Nandri! Thank You So Much ❤️</Text>
            <Text style={styles.successDesc}>
              Your words mean the world to our kitchen team and elder cooks in Salem. Every feedback helps us maintain absolute purity.
            </Text>

            {/* WhatsApp Direct Share Action */}
            <TouchableOpacity
              onPress={handleShareWhatsApp}
              activeOpacity={0.88}
              style={[styles.shareWhatsAppBtn, Shadows.floating]}
            >
              <MessageCircle size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.shareWhatsAppBtnText}>
                Send Review to Chef on WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetAndClose}
              activeOpacity={0.7}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Close & Return to App</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: '#111620',
    position: 'relative',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  card: {
    backgroundColor: '#151C28',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 0.8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabelPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  ratingLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagChipActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderColor: Colors.goldMetallic,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tagChipTextActive: {
    color: Colors.goldMetallic,
    fontWeight: '800',
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 13.5,
    minHeight: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nameInputRow: {
    marginTop: 4,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: Colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(232, 90, 42, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 90, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  shareWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  shareWhatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  doneBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
