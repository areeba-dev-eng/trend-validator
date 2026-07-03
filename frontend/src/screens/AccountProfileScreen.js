// src/screens/AccountProfileScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Platform, ActivityIndicator, Alert,
  Image, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import BackgroundGradient from '../components/BackgroundGradient';
import { colors, radii, typography, spacing } from '../theme';
import {
  getUserProfile,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
} from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const MAX_WIDTH = 560; // cap form width on tablet/web

/* ── Inline toast ──────────────────────────────────────────────────────────── */
function Toast({ message, type }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(translateY,  { toValue: 0, speed: 20, bounciness: 5, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  const bg     = type === 'error' ? 'rgba(255,92,124,0.15)' : 'rgba(52,229,176,0.15)';
  const border = type === 'error' ? 'rgba(255,92,124,0.45)' : 'rgba(52,229,176,0.45)';
  const icon   = type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline';
  const tint   = type === 'error' ? colors.danger : colors.success;

  return (
    <Animated.View
      style={[
        toastStyles.wrap,
        { backgroundColor: bg, borderColor: border, opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={icon} size={16} color={tint} />
      <Text style={[toastStyles.text, { color: tint }]} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: radii.lg, borderWidth: 1,
    marginBottom: 16,
  },
  text: { ...typography.body, fontWeight: '600', flex: 1 },
});

/* ── Clean input (no BlurView — avoids blurred/invisible text on web) ──────── */
function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType,
                 autoCapitalize, editable = true, prefix, note }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={fieldStyles.wrap}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View
        style={[
          fieldStyles.inputRow,
          focused && fieldStyles.inputFocused,
          !editable && fieldStyles.inputDisabled,
        ]}
      >
        {prefix ? <Text style={fieldStyles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.30)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primaryLight}
          style={[fieldStyles.input, !editable && { color: colors.textDim }]}
        />
        {!editable && (
          <Ionicons name="lock-closed-outline" size={14} color={colors.textFaint} />
        )}
      </View>
      {note ? <Text style={fieldStyles.note}>{note}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:         { marginBottom: 16 },
  label:        { ...typography.micro, color: colors.textDim, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    height: 50, borderRadius: radii.lg,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: colors.border,
  },
  inputFocused:  { borderColor: colors.primaryLight, backgroundColor: 'rgba(139,124,255,0.08)' },
  inputDisabled: { opacity: 0.55 },
  prefix:        { ...typography.bodyLg, color: colors.textMuted, marginRight: 4 },
  input:         { flex: 1, ...typography.bodyLg, color: colors.text, fontSize: 15, paddingVertical: 0 },
  note:          { ...typography.caption, color: colors.textFaint, marginTop: 5 },
});

/* ── Screen ─────────────────────────────────────────────────────────────────── */
export default function AccountProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const screenW = Dimensions.get('window').width;
  const formW   = Math.min(screenW - spacing.xl * 2, MAX_WIDTH);

  const [name,        setName]        = useState('');
  const [username,    setUsername]    = useState('');
  const [email,       setEmail]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [photoUri,    setPhotoUri]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid)
      .then((profile) => {
        setName(profile?.name     || user.displayName || '');
        setUsername(profile?.username || user.email?.split('@')[0] || '');
        setEmail(profile?.email   || user.email || '');
        setPhotoUri(profile?.photoUri || user.photoURL || null);
      })
      .catch(() => {
        setName(user.displayName || '');
        setUsername(user.email?.split('@')[0] || '');
        setEmail(user.email || '');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.65,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedUser = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      showToast('Name is required.', 'error');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPw) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setSaving(true);

      // ── 1. Update Firestore + Auth displayName ──
      await updateUserProfile(user.uid, {
        name:     trimmedName,
        username: trimmedUser,
        photoUri: photoUri || null,
      });

      // ── 2. Update email if changed ──
      if (trimmedEmail && trimmedEmail !== user.email) {
        try {
          await updateUserEmail(trimmedEmail);
        } catch (emailErr) {
          const code = emailErr?.code || '';
          if (code === 'auth/requires-recent-login') {
            showToast('Profile saved. To change email, please sign out and sign in again.', 'error');
            setSaving(false);
            return;
          }
          throw emailErr;
        }
      }

      // ── 3. Update password if provided ──
      if (newPassword) {
        try {
          await updateUserPassword(newPassword);
          setNewPassword('');
          setConfirmPw('');
        } catch (pwErr) {
          const code = pwErr?.code || '';
          if (code === 'auth/requires-recent-login') {
            showToast('Profile saved. To change password, please sign out and sign in again.', 'error');
            setSaving(false);
            return;
          }
          throw pwErr;
        }
      }

      showToast('Profile saved successfully!', 'success');
    } catch (err) {
      console.warn('AccountProfile save error:', err);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [user, name, username, email, newPassword, confirmPw, photoUri, showToast]);

  const initials = (name || user?.displayName || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Account & Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40, alignItems: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <View style={{ width: formW }}>
            {/* Toast */}
            {toast && (
              <Toast key={toast.key} message={toast.message} type={toast.type} />
            )}

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <Pressable onPress={pickImage} style={styles.avatarWrap}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                ) : (
                  <LinearGradient
                    colors={colors.gradPrimary}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.avatarGrad}
                  >
                    <Text style={styles.avatarInitial}>{initials}</Text>
                  </LinearGradient>
                )}
                <View style={styles.editBadge}>
                  <LinearGradient
                    colors={colors.gradAccent}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.editBadgeGrad}
                  >
                    <Ionicons name="camera" size={13} color="#fff" />
                  </LinearGradient>
                </View>
              </Pressable>
              <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>

            {/* Profile fields */}
            <Text style={styles.sectionHeader}>PROFILE</Text>
            <View style={styles.card}>
              <Field label="FULL NAME" value={name} onChangeText={setName} placeholder="Your full name" autoCapitalize="words" />
              <Field label="USERNAME" value={username} onChangeText={setUsername} placeholder="username" prefix="@" />
              <Field
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                note="Changing email requires recent sign-in for security."
              />
            </View>

            {/* Password section */}
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>CHANGE PASSWORD</Text>
            <View style={styles.card}>
              <Text style={styles.pwNote}>
                Leave blank to keep your current password.
              </Text>
              <Field label="NEW PASSWORD" value={newPassword} onChangeText={setNewPassword} placeholder="Min 6 characters" secureTextEntry />
              <View style={{ marginBottom: 0 }}>
                <Field label="CONFIRM PASSWORD" value={confirmPw} onChangeText={setConfirmPw} placeholder="Repeat new password" secureTextEntry />
              </View>
            </View>

            {/* Save button */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.65 },
              ]}
            >
              <LinearGradient
                colors={colors.gradAccent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.saveBtnGrad}
              >
                <View style={styles.saveBtnHighlight} pointerEvents="none" />
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  backBtn:       { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle:   { ...typography.h3, color: colors.text },
  scroll:        { paddingHorizontal: spacing.xl },
  loader:        { marginTop: 80 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatarWrap:    { width: 96, height: 96, borderRadius: 48, marginBottom: 10 },
  avatarImg:     { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.borderStrong },
  avatarGrad:    { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.borderStrong },
  avatarInitial: { color: '#fff', fontSize: 38, fontWeight: '700' },
  editBadge:     { position: 'absolute', bottom: 2, right: 2 },
  editBadgeGrad: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  avatarHint:    { ...typography.caption, color: colors.textDim },
  sectionHeader: { ...typography.micro, color: colors.textDim, marginBottom: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 8,
  },
  pwNote:     { ...typography.caption, color: colors.textFaint, marginBottom: 14, lineHeight: 18 },
  saveBtn:    { borderRadius: radii.pill, overflow: 'hidden', marginTop: 24 },
  saveBtnGrad:{ height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  saveBtnHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.28)' },
  saveBtnText:{ ...typography.bodyLg, fontWeight: '700', color: '#fff', fontSize: 16 },
});