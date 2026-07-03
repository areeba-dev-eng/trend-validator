// src/screens/HelpSupportScreen.js  — replaces Alert for Terms/Privacy with in-app modal
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Linking, Alert, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import { colors, radii, typography, spacing } from '../theme';

const SUPPORT_EMAIL = 'support@trendvalidator.app';

/* ── Policy content ─────────────────────────────────────────────────────────── */
const TERMS_CONTENT = `Last updated: May 2026

1. ACCEPTANCE OF TERMS
By using Trend Validator, you agree to these Terms of Service. If you disagree, please discontinue use immediately.

2. SERVICE DESCRIPTION
Trend Validator is an AI-powered market trend analysis tool. It aggregates publicly available data from Google Trends, Reddit, YouTube, and other sources to provide market intelligence scores and insights.

3. USER ACCOUNTS
You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration. Accounts may not be shared or transferred.

4. ACCEPTABLE USE
You agree not to misuse the service, attempt to bypass usage limits, or use the platform for unlawful purposes. Commercial use of individual analysis reports is permitted for personal business decisions.

5. CREDITS & BILLING
Each analysis consumes one credit. Credits are non-refundable once consumed. Premium subscriptions grant unlimited analyses. Billing is processed securely through Stripe.

6. DATA & PRIVACY
We collect only the data necessary to provide our service. See our Privacy Policy for full details on how your data is handled.

7. DISCLAIMER
Trend data is provided for informational purposes only. Trend Validator does not guarantee the accuracy or completeness of any analysis. Investment decisions should not be made solely based on our scores.

8. LIMITATION OF LIABILITY
Trend Validator is not liable for any indirect, incidental, or consequential damages arising from use of the service.

9. CHANGES TO TERMS
We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the updated terms.

10. CONTACT
For questions about these terms, contact us at: legal@trendvalidator.app`;

const PRIVACY_CONTENT = `Last updated: May 2026

1. INFORMATION WE COLLECT
- Account information: name, email address, username
- Usage data: queries you analyse, analysis results, app usage patterns
- Device information: platform, operating system version

2. HOW WE USE YOUR INFORMATION
- To provide and improve the Trend Validator service
- To authenticate your account and maintain security
- To personalise your experience and display relevant history
- To send important service notifications (not marketing without consent)

3. DATA STORAGE
Your analysis history is stored in Firebase Firestore in a dedicated per-user collection. Only you can access your own data through your authenticated account.

4. DATA SHARING
We do not sell, trade, or transfer your personal information to third parties. We may share anonymised, aggregated usage statistics for product improvement.

5. THIRD-PARTY SERVICES
We use the following third-party services:
- Firebase (Google) — authentication and database
- SerpAPI — Google Trends and search data retrieval
- OpenAI / Groq — AI analysis synthesis
- Stripe — payment processing

Each has their own privacy policies governing their data practices.

6. COOKIES & LOCAL STORAGE
We use Firebase's secure token storage for authentication persistence. No third-party tracking cookies are used.

7. DATA RETENTION
Your account data is retained until you delete your account. Analysis history can be deleted at any time from the History screen.

8. YOUR RIGHTS
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and all associated data
- Export your analysis history

9. SECURITY
We implement industry-standard security practices including encrypted data transmission (HTTPS/TLS) and Firebase security rules.

10. CONTACT
Privacy questions: privacy@trendvalidator.app`;

/* ── Policy modal ───────────────────────────────────────────────────────────── */
function PolicyModal({ title, content, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={!!content}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[modalStyles.root, { paddingTop: insets.top + 8 }]}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={modalStyles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[modalStyles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={modalStyles.body}>{content}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title:   { ...typography.h2, color: colors.text },
  closeBtn:{ width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  scroll:  { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  body:    { ...typography.body, color: colors.textMuted, lineHeight: 24 },
});

/* ── FAQ items ──────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  { id: 'f1', q: 'What does the trend score mean?', a: 'The trend score (0–100) reflects real-time momentum from Google Trends, Reddit engagement, YouTube activity, and AI market signals. Above 70 indicates high market potential.' },
  { id: 'f2', q: 'How is growth percentage calculated?', a: 'Growth compares the first and last values in the Google Trends timeline over the selected period. Positive = upward trend; negative = decline.' },
  { id: 'f3', q: 'Why does analysis take time?', a: 'Each analysis fetches live data from multiple sources — Google Trends, Reddit, YouTube, Product Hunt — then runs AI synthesis. Typically 5–15 seconds.' },
  { id: 'f4', q: 'Can I re-analyse the same trend?', a: 'Yes. Tap any item in History to view stored results instantly. Searching again runs a fresh live analysis and uses one credit.' },
  { id: 'f5', q: 'How do I upgrade to Premium?', a: 'Profile → Subscription. Premium unlocks unlimited analyses, 6-month forecasts, and advanced competitor insights.' },
  { id: 'f6', q: 'Is my data stored securely?', a: 'All history is stored in your personal Firebase Firestore document, accessible only with your account. We do not share or sell your data.' },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      style={({ pressed }) => [faqS.wrap, pressed && faqS.pressed]}
    >
      <View style={[StyleSheet.absoluteFill, faqS.tint, { borderRadius: radii.lg }]} />
      <View style={[StyleSheet.absoluteFill, faqS.border, { borderRadius: radii.lg }]} pointerEvents="none" />
      <View style={faqS.row}>
        <Text style={faqS.q}>{item.q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textDim} style={{ flexShrink: 0 }} />
      </View>
      {open && (
        <View style={faqS.aWrap}>
          <View style={faqS.divider} />
          <Text style={faqS.a}>{item.a}</Text>
        </View>
      )}
    </Pressable>
  );
}

const faqS = StyleSheet.create({
  wrap:   { borderRadius: radii.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  pressed:{ opacity: 0.80 },
  tint:   { backgroundColor: 'rgba(255,255,255,0.03)' },
  border: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  q:      { ...typography.bodyLg, color: colors.text, fontWeight: '600', flex: 1, lineHeight: 22 },
  aWrap:  { paddingHorizontal: 16, paddingBottom: 16 },
  divider:{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginBottom: 12 },
  a:      { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});

/* ── Action rows ─────────────────────────────────────────────────────────────── */
function ActionRow({ item }) {
  return (
    <Pressable
      onPress={item.onPress}
      style={({ pressed }) => [actS.wrap, pressed && actS.pressed]}
    >
      <View style={[StyleSheet.absoluteFill, actS.tint, { borderRadius: radii.lg }]} />
      <View style={[StyleSheet.absoluteFill, actS.border, { borderRadius: radii.lg }]} pointerEvents="none" />
      <View style={actS.inner}>
        <View style={[actS.icon, { backgroundColor: 'rgba(139,124,255,0.14)' }]}>
          <Ionicons name={item.icon} size={18} color={item.tone} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={actS.label}>{item.label}</Text>
          <Text style={actS.sub}>{item.sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}

const actS = StyleSheet.create({
  wrap:   { borderRadius: radii.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  pressed:{ opacity: 0.80 },
  tint:   { backgroundColor: 'rgba(255,255,255,0.03)' },
  border: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  inner:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  icon:   { width: 34, height: 34, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  label:  { ...typography.bodyLg, color: colors.text, fontWeight: '600' },
  sub:    { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});

/* ── Screen ──────────────────────────────────────────────────────────────────── */
export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [policyTitle,   setPolicyTitle]   = useState('');
  const [policyContent, setPolicyContent] = useState('');

  const openPolicy = (title, content) => {
    setPolicyTitle(title);
    setPolicyContent(content);
  };
  const closePolicy = () => {
    setPolicyTitle('');
    setPolicyContent('');
  };

  const openEmail = (subject) => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
    Linking.canOpenURL(url)
      .then((ok) => {
        if (ok) return Linking.openURL(url);
        Alert.alert(subject, `Email us at:\n${SUPPORT_EMAIL}`);
      })
      .catch(() => Alert.alert(subject, `Email us at:\n${SUPPORT_EMAIL}`));
  };

  const ACTION_ITEMS = [
    { id: 'email', icon: 'mail-outline',              label: 'Contact Support',  sub: 'Get help from our team',   tone: colors.primaryLight, onPress: () => openEmail('Trend Validator Support') },
    { id: 'bug',   icon: 'bug-outline',               label: 'Report an Issue',  sub: 'Help us improve the app',  tone: colors.warning,      onPress: () => openEmail('Bug Report - Trend Validator') },
    { id: 'terms', icon: 'document-text-outline',     label: 'Terms of Service', sub: 'Read our terms',           tone: colors.textMuted,    onPress: () => openPolicy('Terms of Service', TERMS_CONTENT) },
    { id: 'priv',  icon: 'shield-checkmark-outline',  label: 'Privacy Policy',   sub: 'How we handle your data',  tone: colors.success,      onPress: () => openPolicy('Privacy Policy', PRIVACY_CONTENT) },
  ];

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <GlassCard padded radius={radii.xxl} style={styles.introCard}>
          <View style={styles.introRow}>
            <LinearGradient colors={colors.gradAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.introIcon}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>How can we help?</Text>
              <Text style={styles.introBody}>Browse FAQs or reach our support team directly.</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
        <View style={styles.list}>
          {FAQ_ITEMS.map((item) => <FaqItem key={item.id} item={item} />)}
        </View>

        <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
        <View style={styles.list}>
          {ACTION_ITEMS.map((item) => <ActionRow key={item.id} item={item} />)}
        </View>
      </ScrollView>

      {/* In-app policy modal — no blank browser tabs */}
      <PolicyModal title={policyTitle} content={policyContent} onClose={closePolicy} />
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  backBtn:     { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle: { ...typography.h3, color: colors.text },
  scroll:      { paddingHorizontal: spacing.xl },
  introCard:   { marginBottom: spacing.xxl },
  introRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  introIcon:   { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  introTitle:  { ...typography.h3, color: colors.text, marginBottom: 4 },
  introBody:   { ...typography.body, color: colors.textMuted, lineHeight: 20 },
  sectionLabel:{ ...typography.micro, color: colors.textDim, marginBottom: spacing.md },
  list:        { gap: 8, marginBottom: spacing.xxl },
});