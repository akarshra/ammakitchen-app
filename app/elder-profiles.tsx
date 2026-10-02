import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
} from 'lucide-react-native';

const DIETARY_OPTIONS = [
  { value: 'none', label: 'No Restriction' },
  { value: 'low-salt', label: 'Low Salt & Spice' },
  { value: 'diabetic-friendly', label: 'Diabetic Friendly (Brown Rice/Millet)' },
  { value: 'soft-food', label: 'Soft Food (Mash/Easy Chew)' },
] as const;

export default function ElderProfilesScreen() {
  const router = useRouter();
  const {
    user,
    elderProfiles,
    fetchElderProfiles,
    addElderProfile,
    deleteElderProfile,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dietary, setDietary] = useState<'none' | 'low-salt' | 'diabetic-friendly' | 'soft-food'>('none');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchElderProfiles();
      setLoading(false);
    };
    init();
  }, [user]);

  const handleDelete = async (id: string, profileName: string) => {
    const performDelete = async () => {
      setLoading(true);
      const success = await deleteElderProfile(id);
      if (success) {
        if (Platform.OS === 'web') {
          alert(`Profile for ${profileName} deleted successfully.`);
        }
      }
      setLoading(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete profile for ${profileName}?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Profile',
        `Are you sure you want to delete ${profileName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: performDelete, style: 'destructive' },
        ]
      );
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill out Name, Phone, and Address.');
      return;
    }

    setLoading(true);
    const success = await addElderProfile({
      name,
      phone,
      address,
      dietary_restriction: dietary,
      delivery_notes: notes,
    });

    if (success) {
      setShowAddForm(false);
      // Reset fields
      setName('');
      setPhone('');
      setAddress('');
      setDietary('none');
      setNotes('');
      if (Platform.OS === 'web') {
        alert('Elder Profile added successfully!');
      }
    }
    setLoading(false);
  };

  const getDietaryLabel = (val: string) => {
    return DIETARY_OPTIONS.find((opt) => opt.value === val)?.label || 'No Restriction';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Elder Care Profiles</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={styles.addIconBtn}
            activeOpacity={0.8}
          >
            <Plus size={18} color={Colors.goldMetallic} />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loaderText}>Syncing Companion Profiles...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Intro Alert */}
            <View style={styles.introCard}>
              <Heart size={16} color={Colors.terracotta} fill={Colors.terracotta} />
              <Text style={styles.introText}>
                Set custom parameters for your elders. We adjust spices, salt, and delivery methods to prioritize their health.
              </Text>
            </View>

            {elderProfiles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <User size={48} color="rgba(255, 255, 255, 0.08)" />
                <Text style={styles.emptyTitle}>No Elder Profiles Added</Text>
                <Text style={styles.emptySub}>
                  Create profiles for your parents or seniors in Salem to order tailored meals for them.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddForm(true)}
                  style={styles.createBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createBtnText}>Add Profile Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              elderProfiles.map((profile) => (
                <View key={profile.id} style={[styles.profileCard, Shadows.card]}>
                  {/* Name Row */}
                  <View style={styles.profileHeader}>
                    <View style={styles.profileNameGroup}>
                      <View style={styles.profileAvatar}>
                        <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={styles.profileName}>{profile.name}</Text>
                        <Text style={styles.profilePhone}>✆ {profile.phone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(profile.id, profile.name)}
                      style={styles.deleteBtn}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={15} color={Colors.terracotta} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Dietary restriction */}
                  {profile.dietary_restriction !== 'none' && (
                    <View style={styles.dietaryTagRow}>
                      <ShieldAlert size={12} color={Colors.goldMetallic} />
                      <Text style={styles.dietaryText}>
                        {getDietaryLabel(profile.dietary_restriction)}
                      </Text>
                    </View>
                  )}

                  {/* Delivery Address */}
                  <View style={styles.infoBlock}>
                    <MapPin size={13} color={Colors.textMuted} />
                    <Text style={styles.infoText}>{profile.address}</Text>
                  </View>

                  {/* Delivery Notes */}
                  {profile.delivery_notes ? (
                    <View style={styles.notesBlock}>
                      <Text style={styles.notesLabel}>Rider Instruction:</Text>
                      <Text style={styles.notesText}>"{profile.delivery_notes}"</Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Add Profile Modal overlay */}
        {showAddForm && (
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Elder Profile</Text>

                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Saraswathi Amma"
                    placeholderTextColor={Colors.textSubtle}
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="10-digit number"
                    placeholderTextColor={Colors.textSubtle}
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Address in Salem</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                    placeholder="House details, street, area, Salem"
                    placeholderTextColor={Colors.textSubtle}
                  />
                </View>

                {/* Dietary restriction */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dietary Sizing & Spice Level</Text>
                  <View style={styles.dietOptionsGrid}>
                    {DIETARY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setDietary(opt.value)}
                        style={[styles.dietOptPill, dietary === opt.value && styles.dietOptPillActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dietOptText, dietary === opt.value && styles.textWhite]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Delivery Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Instructions for Rider (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. Ring bell twice, wait for parent to come to gate"
                    placeholderTextColor={Colors.textSubtle}
                  />
                </View>

                {/* Submit buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={handleCreate}
                    style={styles.submitBtn}
                    activeOpacity={0.8}
                  >
                    <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.submitBtnText}>Create Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowAddForm(false)}
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
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
  addIconBtn: {
    padding: 8,
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
  introCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.25)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
  introText: {
    fontSize: 11,
    color: Colors.terracottaLight,
    fontWeight: '700',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  createBtn: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    gap: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profilePhone: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  cardDivider: {
    height: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dietaryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 0.8,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dietaryText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    flex: 1,
  },
  notesBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  notesLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 3,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 9999,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textSecondary,
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
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  dietOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dietOptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dietOptPillActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  dietOptText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.vegGreen,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
