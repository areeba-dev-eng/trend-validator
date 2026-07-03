// src/screens/SubscriptionScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, radii, typography, spacing } from '../theme';
import { upgradeToPremium } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const FREE_FEATURES = [
  { label: 'Trend search & validation',   included: true },
  { label: '25 analyses per month',        included: true },
  { label: 'Basic competitor insights',    included: true },
  { label: 'Google Trends data',           included: true },
  { label: 'Forecast trends 6 months',     included: false },
  { label: 'Unlimited deep analysis',      included: false },
  { label: 'Advanced AI market reports',   included: false },
  { label: 'Export & share reports',       included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Everything in Free',           included: true },
  { label: 'Unlimited trend analyses',     included: true },
  { label: 'Forecast trends 6 months',     included: true },
  { label: 'Advanced competitor insights', included: true },
  { label: 'Advanced AI market reports',   included: true },
  { label: 'Multi-source live data',       included: true },
  { label: 'Export & share reports',       included: true },
  { label: 'Priority support',             included: true },
];

export default function SubscriptionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = useCallback(async () => {
    if (!user) return;
    Alert.alert(
      'Upgrade to Premium',
      'Premium subscription: $30/month.\n\nPayment processing coming soon.\n\nUpgrade your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade Now',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              /* Mock: save premium status to Firestore */
              await upgradeToPremium(user.uid);
              Alert.alert(
                '🎉 Welcome to Premium!',
                'Your account has been upgraded. Enjoy unlimited deep analysis.',
                [{ text: 'Start Exploring', onPress: () => navigation.goBack() }],
              );
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }, [user]);

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={colors.gradAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
            <Ionicons name="rocket" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock Full Power</Text>
          <Text style={styles.heroSub}>
            Go premium to forecast trends months ahead and run unlimited analyses with advanced AI.
          </Text>
        </View>

        {/* FREE plan */}
        <GlassCard padded radius={radii.xxl} style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Free</Text>
              <Text style={styles.planPrice}>$0 / month</Text>
            </View>
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>CURRENT</Text>
            </View>
          </View>
          {FREE_FEATURES.map((f, i) => (
            <FeatureRow key={i} {...f} />
          ))}
        </GlassCard>

        {/* PREMIUM plan */}
        <View style={styles.premiumCard}>
          <LinearGradient
            colors={['rgba(139,124,255,0.25)', 'rgba(0,212,255,0.15)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
          />
          <BlurView
            intensity={Platform.OS === 'android' ? 20 : 32}
            tint="dark"
            style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
          />
          <View style={[StyleSheet.absoluteFill, styles.premiumBorder, { borderRadius: radii.xxl }]} pointerEvents="none" />
          <View style={styles.premiumHighlight} pointerEvents="none" />

          <View style={styles.premiumContent}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Premium</Text>
                <Text style={[styles.planPrice, { color: colors.accent }]}>$30 / month</Text>
              </View>
              <View style={styles.proBadgeLarge}>
                <Text style={styles.proTextLarge}>PRO</Text>
              </View>
            </View>

            {PREMIUM_FEATURES.map((f, i) => (
              <FeatureRow key={i} {...f} accent />
            ))}

            <View style={{ marginTop: 24 }}>
              <GradientButton
                title={loading ? 'Processing...' : 'Upgrade to Premium — $30/mo'}
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                onPress={handleUpgrade}
                icon={loading ? undefined : 'rocket-outline'}
              />
            </View>

            <Text style={styles.disclaimer}>
              Cancel anytime. Stripe payment integration required for live billing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureRow({ label, included, accent }) {
  return (
    <View style={fStyles.row}>
      <View style={[fStyles.iconWrap, { backgroundColor: included ? (accent ? 'rgba(0,212,255,0.14)' : 'rgba(52,229,176,0.12)') : 'rgba(255,255,255,0.05)' }]}>
        <Ionicons
          name={included ? 'checkmark' : 'close'}
          size={13}
          color={included ? (accent ? colors.accent : colors.success) : colors.textFaint}
        />
      </View>
      <Text style={[fStyles.label, !included && { color: colors.textFaint }]}>{label}</Text>
    </View>
  );
}

const fStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconWrap:{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label:   { ...typography.body, color: colors.text, flex: 1 },
});

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: colors.bg },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  backBtn:         { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle:     { ...typography.h3, color: colors.text },
  scroll:          { paddingHorizontal: spacing.xl },
  hero:            { alignItems: 'center', paddingVertical: 28 },
  heroIcon:        { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  heroTitle:       { ...typography.h1, color: colors.text, marginBottom: 10, textAlign: 'center' },
  heroSub:         { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 340 },
  planCard:        { marginBottom: 16 },
  planHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  planName:        { ...typography.h2, color: colors.text },
  planPrice:       { ...typography.body, color: colors.textMuted, marginTop: 2 },
  currentBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  currentText:     { ...typography.micro, color: colors.textDim },
  premiumCard:     { borderRadius: radii.xxl, overflow: 'hidden', marginBottom: 16 },
  premiumBorder:   { borderWidth: 1, borderColor: 'rgba(139,124,255,0.45)' },
  premiumHighlight:{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(139,124,255,0.40)', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl },
  premiumContent:  { padding: 22 },
  proBadgeLarge:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(0,212,255,0.18)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,212,255,0.45)' },
  proTextLarge:    { ...typography.micro, color: colors.accent, fontSize: 11 },
  disclaimer:      { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: 14, lineHeight: 18 },
});