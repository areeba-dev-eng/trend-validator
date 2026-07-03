// frontend/src/screens/ResultsScreen.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Platform, ActivityIndicator, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import ScoreRing from '../components/ScoreRing';
import StatPill from '../components/StatPill';
import SparklineChart from '../components/SparklineChart';
import CompetitorCard from '../components/CompetitorCard';

import { colors, radii, spacing, typography } from '../theme';
import { analyzeTrend } from '../services/api';

/* ---------- Helpers ---------- */

function formatNumber(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function confidenceLevel(score) {
  if (score >= 80) return { label: 'High Confidence',     color: colors.success };
  if (score >= 60) return { label: 'Moderate Confidence', color: colors.primaryLight };
  return             { label: 'Experimental',             color: colors.warning };
}

function MetricTile({ label, value, icon, tone = colors.text }) {
  return (
    <View style={metricStyles.tile}>
      <BlurView intensity={Platform.OS === 'android' ? 22 : 32} tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]} />
      <LinearGradient colors={colors.gradSurface} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]} />
      <View style={[StyleSheet.absoluteFill, {
        borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      }]} pointerEvents="none" />
      <View style={metricStyles.inner}>
        <View style={metricStyles.header}>
          <Ionicons name={icon} size={12} color={colors.textMuted} />
          <Text style={metricStyles.label}>{label}</Text>
        </View>
        <Text style={[metricStyles.value, { color: tone }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function RiskBar({ label, value, gradient }) {
  const safe = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <View>
      <View style={styles.riskHeader}>
        <Text style={styles.riskLabel}>{label}</Text>
        <Text style={styles.riskValue}>{safe}%</Text>
      </View>
      <View style={styles.riskTrack}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.riskFill, { width: `${safe}%` }]} />
      </View>
    </View>
  );
}

/* ---------- Screen ---------- */

export default function ResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const query        = route?.params?.query        || '';
  /* KEY: if opened from History, we use the stored result — no API call, no credit cost */
  const cachedResult = route?.params?.cachedResult ?? null;

  const [data,      setData]      = useState(cachedResult || null);
  const [loading,   setLoading]   = useState(!cachedResult);   // skip loading when cached
  const [error,     setError]     = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
  /* If opened from History, use stored result — no API call, no credit */
  if (cachedResult) {
    setData(cachedResult);
    setLoading(false);
    return;
  }

  if (!query) {
    setError({ message: 'No query provided.' });
    setLoading(false);
    return;
  }

  const controller = new AbortController();
  let cancelled = false;

  (async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeTrend(query, { signal: controller.signal });
      if (!cancelled) setData(result);
    } catch (err) {
      if (!cancelled) setError(err);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => {
    cancelled = true;
    controller.abort();
  };
}, [query, reloadKey, cachedResult]);

  const r = useMemo(() => {
    if (!data) return null;
    return {
      score:            Number(data.score || 0),
      verdict:          data.verdict || 'Unknown',
      duration:         data.duration || 'Live',
      growth:           data.growth || '+0%',
      engagement:       Number(data.engagement || 0),
      opportunity:      Number(data.opportunity || 0),
      searchVolume: Number(
  data.searchVolume ||
  data?.sources?.googleTrends?.stats?.average ||
  data?.stats?.average ||
  0
),
      marketDemand:     Number(data.marketDemand || 0),
      competitionLevel: Number(data.competitionLevel || 0),
      saturationLevel:  Number(data.saturationLevel || 0),
      viralProbability: Number(data.viralProbability || 0),
      risk:             Number(data.risk || 0),
      explanation:      data.explanation || 'No AI explanation available.',
      insights:         Array.isArray(data.insights) ? data.insights : [],
      competitors:      Array.isArray(data.competitors) ? data.competitors : [],
      series:
  Array.isArray(data?.trendData?.series) &&
  data.trendData.series.length >= 2
    ? data.trendData.series.map(item =>
        Number(item?.value || item?.values?.[0]?.extracted_value || 0)
      )
    : [12, 20, 28, 34, 48, 60, 72],
    };
  }, [data]);

  const confidence = useMemo(() => confidenceLevel(r?.score || 0), [r]);

  async function handleShare() {
    if (!r) return;
    try {
      await Share.share({
        message:
          `Trend Validator Report\n\n` +
          `Query: ${query}\n` +
          `Score: ${r.score}%\n` +
          `Growth: ${r.growth}\n` +
          `Opportunity: ${r.opportunity}%\n` +
          `Verdict: ${String(r.verdict).toUpperCase()}`,
      });
    } catch {}
  }

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerLabel}>TREND ANALYSIS</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{query}</Text>
        </View>

        <Pressable hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="bookmark-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
          <Text style={styles.stateTitle}>Analyzing...</Text>
          <Text style={styles.stateBody}>
            Processing live market intelligence signals for "{query}".
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.centerState}>
          <View style={styles.errorBadge}>
            <Ionicons name="alert-circle-outline" size={28} color="#ff5d5d" />
          </View>
          <Text style={styles.stateTitle}>Analysis failed</Text>
          <Text style={styles.stateBody}>{error?.message || 'Something went wrong.'}</Text>
          <View style={{ height: spacing.lg }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <GradientButton
              title="Retry"
              icon="refresh-outline"
              variant="primary"
              size="md"
              onPress={() => setReloadKey((k) => k + 1)}
            />
            <GradientButton
              title="Back"
              icon="chevron-back"
              variant="ghost"
              size="md"
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      )}

      {/* Results */}
      {!loading && !error && r && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 140 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Score card */}
          <GlassCard padded radius={radii.xxl} style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={styles.verdictPill}>
                <View style={[styles.verdictDot, { backgroundColor: confidence.color }]} />
                <Text style={[styles.verdictText, { color: confidence.color }]}>
                  {String(r.verdict).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.timeline}>LIVE DATA</Text>
            </View>

            <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
              <ScoreRing value={r.score} size={200} stroke={14} label="POTENTIAL" />
            </View>

            <View style={styles.confidenceWrap}>
              <Text style={[styles.confidenceText, { color: confidence.color }]}>
                {confidence.label}
              </Text>
            </View>

            <View style={styles.miniChart}>
              <SparklineChart
                values={r.series}
                width={300}
                height={64}
                color={colors.primaryLight}
                areaOpacity={0.4}
                glow
              />
            </View>

            <View style={styles.statRow}>
              <StatPill icon="trending-up"   label="GROWTH"      value={r.growth}            tone={colors.success} />
              <StatPill icon="people-outline" label="ENGAGE"      value={`${r.engagement}%`}  tone={colors.primaryLight} />
              <StatPill icon="rocket-outline" label="OPPORTUNITY" value={`${r.opportunity}%`} tone={colors.accent} />
            </View>
          </GlassCard>

          {/* Market metrics */}
          <Text style={styles.sectionTitle}>Market Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricTile label="SEARCH VOLUME" value={formatNumber(r.searchVolume)}        icon="search-outline" />
            <MetricTile label="MARKET DEMAND" value={`${Math.round(r.marketDemand)}%`}    icon="people-outline" />
            <MetricTile label="COMPETITION"   value={`${Math.round(r.competitionLevel)}%`} icon="trophy-outline"
              tone={r.competitionLevel > 70 ? colors.warning : colors.text} />
            <MetricTile label="SATURATION"    value={`${Math.round(r.saturationLevel)}%`}  icon="layers-outline"
              tone={r.saturationLevel > 70 ? colors.danger : colors.text} />
            <MetricTile label="VIRAL PROB"    value={`${Math.round(r.viralProbability)}%`} icon="flame-outline" />
            <MetricTile label="RISK"          value={`${Math.round(r.risk)}%`}             icon="alert-circle-outline"
              tone={r.risk > 65 ? colors.danger : colors.text} />
          </View>

          {/* Risk vs Opportunity */}
          <Text style={styles.sectionTitle}>Risk vs Opportunity</Text>
          <GlassCard padded radius={radii.xl}>
            <RiskBar label="Opportunity" value={r.opportunity} gradient={colors.gradSuccess} />
            <View style={{ height: 14 }} />
            <RiskBar label="Risk"        value={r.risk}        gradient={colors.gradDanger} />
          </GlassCard>

          {/* AI Explanation */}
          <Text style={styles.sectionTitle}>AI Explanation</Text>
          <GlassCard padded radius={radii.xl}>
            <View style={styles.aiHeader}>
              <LinearGradient colors={colors.gradPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.aiTitle}>Market Synthesis</Text>
            </View>
            <Text style={styles.aiBody}>{r.explanation}</Text>
          </GlassCard>

          {/* Key Insights */}
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <GlassCard padded radius={radii.xl}>
            {(Array.isArray(r.insights) ? r.insights : []).map((insight, idx) => (
              <View
                key={idx}
                style={[
                  styles.insightRow,
                  idx === r.insights.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={styles.bulletWrap}>
                  <Text style={styles.bulletNum}>{idx + 1}</Text>
                </View>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </GlassCard>

          {/* Competitors */}
          {r.competitors.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Competitors</Text>
              <View style={{ gap: 10 }}>
                {r.competitors.slice(0, 8).map((c, idx) => (
                  <CompetitorCard key={`${c.domain || c.name}-${idx}`} {...c} />
                ))}
              </View>
            </>
          )}

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <GradientButton
              title="Save"
              icon="bookmark-outline"
              variant="ghost"
              size="md"
              style={{ flex: 1 }}
              fullWidth
              onPress={() => {}}
            />
            <GradientButton
              title="Share"
              icon="share-outline"
              variant="primary"
              size="md"
              style={{ flex: 1 }}
              fullWidth
              onPress={handleShare}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- Styles (identical to original) ---------- */

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerLabel: { ...typography.micro, color: colors.textDim },
  headerTitle: { ...typography.h3, color: colors.text, marginTop: 2 },

  centerState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stateTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  stateBody:  { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 },
  errorBadge: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,93,93,0.12)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,93,93,0.4)',
  },

  scoreCard:   { marginTop: spacing.sm, overflow: 'hidden' },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verdictPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill,
    backgroundColor: 'rgba(0,229,160,0.10)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,229,160,0.35)',
  },
  verdictDot:  { width: 6, height: 6, borderRadius: 3 },
  verdictText: { ...typography.caption, fontWeight: '700' },
  timeline:    { ...typography.caption, color: colors.textDim },

  confidenceWrap: { alignItems: 'center', marginBottom: spacing.md },
  confidenceText: { fontSize: 13, fontWeight: '700' },
  miniChart:      { alignItems: 'center', marginBottom: spacing.lg },

  statRow:     { flexDirection: 'row', gap: 8 },
  sectionTitle: {
    ...typography.h3, color: colors.text,
    marginTop: spacing.xxl, marginBottom: spacing.md,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  riskHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  riskLabel: { ...typography.body, color: colors.textMuted, fontWeight: '600' },
  riskValue: { ...typography.bodyLg, color: colors.text, fontWeight: '700' },
  riskTrack: {
    height: 10, borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  riskFill:  { height: '100%', borderRadius: radii.pill },

  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  aiBadge:  { width: 28, height: 28, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  aiTitle:  { ...typography.h3, color: colors.text },
  aiBody:   { ...typography.bodyLg, color: colors.textMuted, lineHeight: 22 },

  insightRow: {
    flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start',
  },
  bulletWrap: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(108,92,231,0.20)',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  bulletNum:   { ...typography.caption, color: colors.primaryLight, fontWeight: '700' },
  insightText: { ...typography.bodyLg, color: colors.text, flex: 1, lineHeight: 22 },

  ctaRow: { flexDirection: 'row', gap: 12, marginTop: spacing.xxl },
});

const metricStyles = StyleSheet.create({
  tile:   { flexBasis: '48%', flexGrow: 1, minHeight: 78, borderRadius: radii.lg, overflow: 'hidden' },
  inner:  { padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label:  { ...typography.micro, color: colors.textDim, fontSize: 9, letterSpacing: 1 },
  value:  { ...typography.h2, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
});