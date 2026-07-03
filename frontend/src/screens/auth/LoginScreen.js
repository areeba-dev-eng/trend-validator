// src/screens/auth/LoginScreen.js
'use strict';

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Platform, ActivityIndicator, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GoogleAuthProvider,
  signInWithPopup,       // ← web only
  signInWithCredential,  // ← native only
} from 'firebase/auth';
import { auth } from '../../config/firebase';

/* expo-auth-session is only used on native (iOS / Android) */
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import BackgroundGradient from '../../components/BackgroundGradient';
import { colors, radii, typography, spacing } from '../../theme';
import { loginWithEmail } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

/* Required for expo-auth-session to work correctly on native */
WebBrowser.maybeCompleteAuthSession();

/* ─── Friendly error messages ─────────────────────────────────────────────── */
function friendlyError(code) {
  const map = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/invalid-email':          'Invalid email address.',
    'auth/too-many-requests':      'Too many attempts. Try again later.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user':   'Google sign-in was cancelled.',
    'auth/popup-blocked':          'Popup blocked. Allow popups for this site.',
    'auth/cancelled-popup-request':'Sign-in cancelled.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function LoginScreen({ navigation }) {
  const insets          = useSafeAreaInsets();
  const { triggerWelcome } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState('');

  /* Entrance animation */
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  /* ── expo-auth-session hook (required at top level — used on native only) ─ */
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    /*
     * webClientId   : used when running on web or Android
     * iosClientId   : used when running on iOS native
     * Leave expoClientId unset — proxy is only for Expo Go classic workflow
     */
    webClientId: '272170158396-qjchndohd6fcje6p75tgsbbuastap184.apps.googleusercontent.com',
    // iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',  // add when building for iOS
  });

  /* ── Handle expo-auth-session response (native only) ─────────────────────
   *
   * On web we use signInWithPopup instead, so this effect is a no-op on web.
   * id_token (not accessToken) is required by GoogleAuthProvider.credential().
   */
  useEffect(() => {
    if (Platform.OS === 'web') return;           // web uses popup — skip
    if (googleResponse?.type !== 'success') return;

    const idToken = googleResponse.params?.id_token;
    if (!idToken) {
      setError('Google sign-in failed: no ID token returned.');
      return;
    }

    setGLoading(true);
    const credential = GoogleAuthProvider.credential(idToken); // idToken in first param
    signInWithCredential(auth, credential)
      .then((cred) => {
        triggerWelcome(cred.user.displayName || cred.user.email?.split('@')[0] || 'there');
        navigation.replace('Tabs');
      })
      .catch((err) => setError(friendlyError(err.code)))
      .finally(() => setGLoading(false));
  }, [googleResponse]);

  /* ── Google sign-in handler — platform-aware ──────────────────────────────
   *
   * WEB  → Firebase signInWithPopup: no redirect URI needed, handles OAuth
   *         internally via /__/auth/handler. Works on localhost out of the box.
   *
   * NATIVE → expo-auth-session promptAsync: generates the correct native
   *         redirect URI automatically for Expo Go / standalone builds.
   */
  async function handleGoogleLogin() {
    setError('');

    if (Platform.OS === 'web') {
      /* ── Web: Firebase popup flow ───────────────────────────────────────── */
      try {
        setGLoading(true);
        const provider   = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await signInWithPopup(auth, provider);

        triggerWelcome(
          result.user.displayName ||
          result.user.email?.split('@')[0] ||
          'there',
        );
        navigation.replace('Tabs');
      } catch (err) {
        console.log('Google web login error:', err.code, err.message);
        setError(friendlyError(err.code));
      } finally {
        setGLoading(false);
      }
    } else {
      /* ── Native: expo-auth-session ──────────────────────────────────────── */
      promptGoogleAsync();
      // result handled in the useEffect above
    }
  }

  /* ── Email / password login ───────────────────────────────────────────────*/
  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const user = await loginWithEmail(email.trim(), password);
      triggerWelcome(user.displayName || user.email?.split('@')[0] || 'there');
      navigation.replace('Tabs');
    } catch (err) {
      console.log('Email login error:', err.code, err.message);
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────────*/
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

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={colors.gradAccent}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.logo}
            >
              <View style={styles.logoHighlight} pointerEvents="none" />
              <Ionicons name="sparkles" size={26} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to your account</Text>

          {/* Glass card */}
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
            <View
              style={[StyleSheet.absoluteFill, styles.cardBorder, { borderRadius: radii.xxl }]}
              pointerEvents="none"
            />
            <View style={styles.cardHighlight} pointerEvents="none" />

            <View style={styles.cardContent}>

              {/* Error box */}
              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Email */}
              <GlassInput
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                textContentType="emailAddress"
              />

              <View style={styles.gap} />

              {/* Password */}
              <GlassInput
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                textContentType="password"
                rightSlot={
                  <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={10}>
                    <Ionicons
                      name={showPw ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textDim}
                    />
                  </Pressable>
                }
              />

              {/* Forgot */}
              <Pressable
                style={styles.forgotRow}
                onPress={() => Alert.alert('Reset Password', 'Enter your email and we will send a reset link.')}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {/* Sign In button */}
              <Pressable onPress={handleLogin} disabled={loading || gLoading} style={styles.primaryBtn}>
                <LinearGradient
                  colors={colors.gradAccent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.primaryBtnGrad}
                >
                  <View style={styles.btnHighlight} pointerEvents="none" />
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.primaryBtnText}>Sign In</Text>}
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google button */}
              <Pressable
                onPress={handleGoogleLogin}
                disabled={gLoading || loading}
                style={[styles.googleBtn, (gLoading || loading) && { opacity: 0.65 }]}
              >
                <BlurView
                  intensity={Platform.OS === 'android' ? 18 : 28}
                  tint="dark"
                  style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
                />
                <View
                  style={[StyleSheet.absoluteFill, styles.googleTint, { borderRadius: radii.pill }]}
                />
                {gLoading ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <>
                    {/* Google "G" — reliable across all platforms, no Image needed */}
                    <View style={styles.googleIconWrap}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </Pressable>

            </View>
          </View>

          {/* Signup link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
              <Text style={styles.linkText}>Sign Up</Text>
            </Pressable>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ─── Glass input — unchanged from original ──────────────────────────────── */
function GlassInput({ icon, rightSlot, ...props }) {
  return (
    <View style={inputStyles.wrap}>
      <BlurView
        intensity={Platform.OS === 'android' ? 18 : 26}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]}
      />
      <View style={[StyleSheet.absoluteFill, inputStyles.tint,   { borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, inputStyles.border, { borderRadius: radii.xl }]} pointerEvents="none" />
      <View style={inputStyles.row}>
        <Ionicons name={icon} size={18} color={colors.textDim} style={{ marginRight: 10 }} />
        <TextInput
          {...props}
          style={inputStyles.input}
          placeholderTextColor="rgba(255,255,255,0.35)"
          selectionColor={colors.primaryLight}
          underlineColorAndroid="transparent"
          keyboardAppearance="dark"
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
        />
        {rightSlot}
      </View>
    </View>
  );
}

/* ─── Styles — identical to original, no visual changes ──────────────────── */
const inputStyles = StyleSheet.create({
  wrap:   { borderRadius: radii.xl, overflow: 'hidden', height: 54 },
  tint:   { backgroundColor: 'rgba(255,255,255,0.04)' },
  border: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  row:    { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input:  { flex: 1, ...typography.bodyLg, color: colors.text, fontSize: 15, paddingVertical: 0 },
});

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  scroll:       { paddingHorizontal: spacing.xl },
  logoWrap:     { alignItems: 'center', marginBottom: 28 },
  logo:         { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  logoHighlight:{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  headline:     { ...typography.display, fontSize: 32, color: colors.text, textAlign: 'center', marginBottom: 8 },
  sub:          { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  card:         { borderRadius: radii.xxl, overflow: 'hidden' },
  cardBorder:   { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  cardHighlight:{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.glassTopHighlight, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl },
  cardContent:  { padding: 22 },
  gap:          { height: 12 },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,92,124,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,92,124,0.35)', borderRadius: radii.md, padding: 10, marginBottom: 14 },
  errorText:    { ...typography.caption, color: colors.danger, flex: 1 },
  forgotRow:    { alignItems: 'flex-end', marginTop: 8, marginBottom: 20 },
  forgotText:   { ...typography.caption, color: colors.primaryLight },
  primaryBtn:   { borderRadius: radii.pill, overflow: 'hidden' },
  primaryBtnGrad: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  btnHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.30)' },
  primaryBtnText: { ...typography.bodyLg, fontWeight: '700', color: '#fff' },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine:  { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText:  { ...typography.caption, color: colors.textDim },
  googleBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: radii.pill, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  googleTint:   { backgroundColor: 'rgba(255,255,255,0.04)' },
  googleIconWrap: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  googleIconText: { fontSize: 13, fontWeight: '800', color: '#4285F4', lineHeight: 16 },
  googleBtnText:{ ...typography.bodyLg, color: colors.text, fontWeight: '600' },
  bottomRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  bottomText:   { ...typography.body, color: colors.textMuted },
  linkText:     { ...typography.body, color: colors.primaryLight, fontWeight: '700' },
});