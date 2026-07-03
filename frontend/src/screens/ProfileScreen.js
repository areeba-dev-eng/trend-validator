// src/screens/ProfileScreen.js  (MODIFIED — removes 3 items, wires navigation + logout)
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import { colors, radii, spacing, typography } from '../theme';
import { fetchHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* Notifications, Privacy & Security, Appearance REMOVED */
const SETTINGS = [
  { id: 's1', icon: 'person-outline',      label: 'Account & Profile', tone: colors.primaryLight, screen: 'AccountProfile' },
  { id: 's3', icon: 'card-outline',         label: 'Subscription',      tone: colors.success,      screen: 'Subscription', badge: 'PRO' },
  { id: 's6', icon: 'help-circle-outline',  label: 'Help & Support',    tone: colors.primaryLight, screen: null },
  { id: 's7', icon: 'log-out-outline',      label: 'Sign out',          tone: colors.danger,       screen: null, isLogout: true },
];

function Stat({ value, label }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ searches: '—', validated: '—', avgScore: '—' });

  const loadStats = useCallback(async () => {
    try {
      const items = await fetchHistory({ limit: 500 });
      const list  = Array.isArray(items) ? items : [];
      const scores    = list.map((h) => h.result?.score || 0).filter(Boolean);
      setStats({
        searches:  String(list.length),
        validated: String(list.filter((h) => (h.result?.score || 0) >= 70).length),
        avgScore:  scores.length
          ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
          : '0',
      });
    } catch { /* keep placeholders */ }
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

 const handleSettingPress = useCallback(
  async (setting) => {
    if (setting.isLogout) {
      try {
        await logout();
      } catch (e) {
        console.log('LOGOUT ERROR:', e);
      }
      return;
    }

    if (setting.screen) {
      navigation.navigate(setting.screen);
      return;
    }

    if (setting.id === 's6') {
      navigation.navigate('HelpSupport');
      return;
    }
  },
  [navigation, logout]
);  /* Display name: Firebase user name > email prefix > 'User' */
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const handle = `@${(user?.email?.split('@')[0] || 'user').toLowerCase()}`;

  return (
    <View style={styles.root}>
      <BackgroundGradient />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>PROFILE</Text>
        <Text style={styles.title}>You</Text>

        {/* Identity card */}
        <GlassCard padded radius={radii.xxl} style={{ marginTop: spacing.xl }}>
          <View style={styles.identity}>
            <LinearGradient colors={colors.gradPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.handle}>{handle} · Pro Member</Text>
            </View>
            <Pressable
              style={styles.editBtn}
              hitSlop={8}
              onPress={() => navigation.navigate('AccountProfile')}
            >
              <Ionicons name="create-outline" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <Stat value={stats.searches}  label="Searches" />
            <View style={styles.divider} />
            <Stat value={stats.validated} label="Validated" />
            <View style={styles.divider} />
            <Stat value={stats.avgScore}  label="Avg Score" />
          </View>
        </GlassCard>

        {/* Pro upsell */}
        <View style={{ marginTop: spacing.xl }}>
          <Pressable onPress={() => navigation.navigate('Subscription')} style={styles.upsell}>
            <LinearGradient colors={['#6C5CE7', '#A29BFE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]} />
            <View style={styles.upsellContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.upsellTitle}>Unlock unlimited{'\n'}deep analysis</Text>
                <Text style={styles.upsellBody}>Forecast trends 6 months ahead</Text>
              </View>
              <View style={styles.upsellCta}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.upsellCtaText}>Upgrade</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Settings */}
        <View style={{ marginTop: spacing.xl, gap: 8 }}>
          {SETTINGS.map((s) => (
            <Pressable key={s.id} onPress={() => handleSettingPress(s)} style={styles.settingRow}>
              <BlurView intensity={Platform.OS === 'android' ? 18 : 28} tint="dark"
                style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]} />
              <View style={styles.settingTint} />
              <View style={styles.settingInner}>
                <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(108,92,231,0.18)' }]}>
                  <Ionicons name={s.icon} size={16} color={s.tone} />
                </View>
                <Text style={[styles.settingLabel, s.isLogout && { color: colors.danger }]}>{s.label}</Text>
                {s.badge && (
                  <View style={styles.proBadge}>
                    <Text style={styles.proText}>{s.badge}</Text>
                  </View>
                )}
                {!s.isLogout && (
                  <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.versionText}>Trend Validator · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

/* Styles identical to original — no visual changes */
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl },
  label:  { ...typography.micro, color: colors.textDim },
  title:  { ...typography.display, fontSize: 32, lineHeight: 36, color: colors.text, marginTop: 4 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:   { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name:     { ...typography.h2, color: colors.text },
  handle:   { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  editBtn:  { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textDim, marginTop: 4 },
  divider:   { width: StyleSheet.hairlineWidth, height: 30, backgroundColor: colors.border },
  upsell:        { borderRadius: radii.xxl, overflow: 'hidden', padding: 18, minHeight: 110 },
  upsellContent: { flexDirection: 'row', alignItems: 'center' },
  upsellTitle:   { ...typography.h2, color: '#fff', fontWeight: '700' },
  upsellBody:    { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  upsellCta:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: 'rgba(0,0,0,0.30)' },
  upsellCtaText: { ...typography.body, color: '#fff', fontWeight: '700' },
  settingRow:     { borderRadius: radii.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  settingTint:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.03)' },
  settingInner:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIconWrap:{ width: 32, height: 32, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  settingLabel:   { ...typography.bodyLg, color: colors.text, flex: 1, fontWeight: '600' },
  proBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(0,229,160,0.18)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,229,160,0.35)' },
  proText:        { ...typography.micro, color: colors.success, fontSize: 9 },
  versionText:    { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: spacing.xxl },
});