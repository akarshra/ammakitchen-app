import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Colors, Shadows } from '../constants/theme';
import { Sparkles, Phone, User, Mail, ArrowRight } from 'lucide-react-native';
import { BRAND_LOGO_BASE64 } from '../constants/brandLogoBase64';
import { Image } from 'expo-image';

export default function AuthScreen() {
  const { registerUser, loginUser } = useApp();
  
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validations
    if (phone.trim().length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (isRegister && name.trim().length < 2) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    
    let success = false;
    if (isRegister) {
      success = await registerUser(name, phone, email);
    } else {
      success = await loginUser(phone);
    }
    
    setLoading(false);
    
    if (!success && !isRegister) {
      // If login fails (user not found), ask if they want to switch to register
      alert('Account not found. Switching to registration screen.');
      setIsRegister(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Branding */}
          <View style={styles.headerContainer}>
            {/* Circular Logo Container with glow */}
            <View style={styles.logoCircleContainer}>
              {Platform.OS === 'web' ? (
                <img
                  src={BRAND_LOGO_BASE64}
                  alt="Amma's Kitchen Salem"
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    borderWidth: 1.8,
                    borderColor: Colors.goldMetallic,
                    backgroundColor: '#111620',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <View style={styles.logoCircle}>
                  <Image
                    source={{ uri: BRAND_LOGO_BASE64 }}
                    style={styles.logoImage}
                    contentFit="contain"
                  />
                </View>
              )}
            </View>

            <View style={styles.logoBadge}>
              <Sparkles size={11} color={Colors.goldMetallic} />
              <Text style={styles.logoBadgeText}>AMMA'S KITCHEN SALEM</Text>
            </View>
            <Text style={styles.headingTitle}>
              {isRegister ? 'Cooked with Love' : 'Welcome Back'}
            </Text>
            <Text style={styles.headingSubtitle}>
              {isRegister
                ? 'Register to order fresh, wood-pressed homestyle Salem meals.'
                : 'Sign in with your phone number to track active orders.'}
            </Text>
          </View>

          {/* Form Container */}
          <View style={[styles.formCard, Shadows.luxury]}>
            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={16} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={Colors.textSubtle}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={16} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={Colors.textSubtle}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    placeholderTextColor={Colors.textSubtle}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.88}
              disabled={loading}
              style={[styles.submitBtn, Shadows.subtle]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isRegister ? 'Register & Continue' : 'Sign In Now'}
                  </Text>
                  <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Register / Login */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isRegister ? 'Already ordered before?' : 'First time ordering here?'}
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
              <Text style={styles.toggleLink}>
                {isRegister ? 'Sign In (Phone Number)' : 'Create New Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background, // Luxury obsidian dark background
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  logoCircleContainer: {
    marginBottom: 16,
    shadowColor: Colors.goldMetallic,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111620',
    borderWidth: 1.8,
    borderColor: Colors.goldMetallic,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 66,
    height: 66,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    marginBottom: 14,
  },
  logoBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.goldMetallic,
    letterSpacing: 1.2,
  },
  headingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF', // Clean White
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headingSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.surfaceCard, // Obsidian card
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: Colors.surfaceBorder,
    padding: 24,
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1420', // Darker background for input wrapper
    borderWidth: 1.2,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#FFFFFF', // Clean White Text
    fontWeight: '600',
    height: '100%',
  },
  submitBtn: {
    backgroundColor: Colors.terracotta, // Hot terracotta accent
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  toggleLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.goldMetallic, // Accent Link Color
  },
});
