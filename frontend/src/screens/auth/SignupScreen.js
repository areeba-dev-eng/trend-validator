// src/screens/auth/SignupScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../../components/BackgroundGradient';
import { colors, radii, typography, spacing } from '../../theme';
import { signupWithEmail } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
//   const { triggerWelcome } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signupWithEmail(email.trim(), password, name.trim());
      navigation.replace('Tabs');
    } catch (err) {
      console.log("REAL ERROR:", err);
setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <BackgroundGradient />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
          {/* Back */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>

          <Text style={styles.headline}>Create account</Text>
          <Text style={styles.sub}>Start validating trends for free</Text>

          <View style={styles.card}>
            <BlurView
              intensity={Platform.OS === 'android' ? 26 : 40}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
            />
            <LinearGradient
              colors={colors.gradSurface}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
            />
            <View style={[StyleSheet.absoluteFill, styles.cardBorder, { borderRadius: radii.xxl }]} pointerEvents="none" />
            <View style={styles.cardHighlight} pointerEvents="none" />

            <View style={styles.cardContent}>
              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <GlassInput icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} returnKeyType="next" />
              <View style={styles.gap} />
              <GlassInput icon="mail-outline" placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
              <View style={styles.gap} />
              <GlassInput
                icon="lock-closed-outline"
                placeholder="Password (min 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                rightSlot={
                  <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDim} />
                  </Pressable>
                }
              />

              <View style={{ height: 24 }} />

              <Pressable onPress={handleSignup} disabled={loading} style={styles.primaryBtn}>
                <LinearGradient
                  colors={colors.gradAccent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.primaryBtnGrad}
                >
                  <View style={styles.btnHighlight} pointerEvents="none" />
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.primaryBtnText}>Create Account</Text>}
                </LinearGradient>
              </Pressable>

              <Text style={styles.terms}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function GlassInput({ icon, rightSlot, ...props }) {
  return (
    <View style={inputStyles.wrap}>
      <BlurView intensity={Platform.OS === 'android' ? 18 : 26} tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, inputStyles.tint, { borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, inputStyles.border, { borderRadius: radii.xl }]} pointerEvents="none" />
      <View style={inputStyles.row}>
        <Ionicons name={icon} size={18} color={colors.textDim} style={{ marginRight: 10 }} />
        <TextInput {...props} style={inputStyles.input} placeholderTextColor="rgba(255,255,255,0.35)" selectionColor={colors.primaryLight} />
        {rightSlot}
      </View>
    </View>
  );
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'Email is already registered.',
    'auth/invalid-email':        'Invalid email address.',
    'auth/weak-password':        'Password is too weak.',
    'auth/network-request-failed': 'Network error. Check connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

const inputStyles = StyleSheet.create({
  wrap:   { borderRadius: radii.xl, overflow: 'hidden', height: 54 },
  tint:   { backgroundColor: 'rgba(255,255,255,0.04)' },
  border: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  row:    { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input:  { flex: 1, ...typography.bodyLg, color: colors.text, fontSize: 15, paddingVertical: 0 },
});

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.bg },
  scroll:        { paddingHorizontal: spacing.xl },
  backBtn:       { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 24 },
  headline:      { ...typography.display, fontSize: 32, color: colors.text, marginBottom: 8 },
  sub:           { ...typography.body, color: colors.textMuted, marginBottom: 32 },
  card:          { borderRadius: radii.xxl, overflow: 'hidden' },
  cardBorder:    { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  cardHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.glassTopHighlight, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl },
  cardContent:   { padding: 22 },
  gap:           { height: 12 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,92,124,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,92,124,0.35)', borderRadius: radii.md, padding: 10, marginBottom: 14 },
  errorText:     { ...typography.caption, color: colors.danger, flex: 1 },
  primaryBtn:    { borderRadius: radii.pill, overflow: 'hidden' },
  primaryBtnGrad:{ height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  btnHighlight:  { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.30)' },
  primaryBtnText:{ ...typography.bodyLg, fontWeight: '700', color: '#fff' },
  terms:         { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  bottomRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  bottomText:    { ...typography.body, color: colors.textMuted },
  linkText:      { ...typography.body, color: colors.primaryLight, fontWeight: '700' },
});