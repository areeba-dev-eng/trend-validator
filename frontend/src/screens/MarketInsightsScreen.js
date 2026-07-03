// src/screens/MarketInsightsScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import SearchBar from '../components/SearchBar';
import GradientButton from '../components/GradientButton';

import { colors, radii, spacing, typography } from '../theme';
import { fetchMarketInsights, ApiError } from '../services/api';

function competitionTone(level) {
  if (level === 'High')   return colors.warning;
  if (level === 'Medium') return colors.primaryLight;
  return colors.success;
}

function MetricTile({ label, value, icon, tone = colors.text }) {
  return (
    <View style={tileStyles.tile}>
      <BlurView intensity={Platform.OS === 'android' ? 22 : 32} tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]} />
      <LinearGradient colors={colors.gradSurface} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]} />
      <View style={[StyleSheet.absoluteFill, {
        borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      }]} pointerEvents="none" />
      <View style={tileStyles.inner}>
        <View style={tileStyles.header}>
          <Ionicons name={icon} size={12} color={colors.textMuted} />
          <Text style={tileStyles.label}>{label}</Text>
        </View>
        <Text style={[tileStyles.value, { color: tone }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function Chip({ label }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function MarketInsightsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [keyword, setKeyword] = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const submit = useCallback(async () => {
    const value = keyword.trim();
    if (!value) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchMarketInsights(value);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('Market insights failed.'));
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Market Insights</Text>
        <View style={styles.iconBtn}>
          <Ionicons name="bar-chart" size={18} color={colors.primaryLight} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 140 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SearchBar value={keyword} onChangeText={setKeyword} onSubmit={submit}
          placeholder="Enter a keyword, e.g. dropshipping" autoFocus />

        <View style={styles.ctaWrap}>
          <GradientButton
            title={loading ? 'Analyzing…' : 'Get Market Insights'}
            onPress={submit} disabled={loading || !keyword.trim()} fullWidth icon="analytics"
          />
        </View>

        {loading && (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.stateBody}>Pulling real Google Trends data…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateWrap}>
            <View style={styles.errorBadge}>
              <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
            </View>
            <Text style={styles.stateBody}>{error?.message || 'Something went wrong.'}</Text>
          </View>
        )}

        {!loading && !error && data && (
          <View style={styles.resultsWrap}>
            <View style={styles.grid}>
              <MetricTile label="Growth Rate" icon="trending-up"
                value={`${data.growthRate >= 0 ? '+' : ''}${data.growthRate}%`}
                tone={data.growthRate >= 0 ? colors.success : colors.warning} />
              <MetricTile label="Search Volume" icon="search" value={data.searchVolume.toLocaleString()} />
              <MetricTile label="Competition" icon="shield-outline"
                value={data.competition} tone={competitionTone(data.competition)} />
              <MetricTile label="Momentum" icon="speedometer-outline" value={data.momentumScore} />
            </View>

            {data.topCountries.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Top Countries</Text>
                <View style={styles.chipsWrap}>
                  {data.topCountries.map((c) => <Chip key={c.country} label={`${c.country} · ${c.value}`} />)}
                </View>
              </>
            )}

            {data.topRelatedQueries.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Related Queries</Text>
                <View style={styles.chipsWrap}>
                  {data.topRelatedQueries.map((q, i) => <Chip key={`${q}-${i}`} label={q} />)}
                </View>
              </>
            )}

            {data.topCountries.length === 0 && data.topRelatedQueries.length === 0 && (
              <Text style={styles.stateBody}>Limited region/related-query data available for this keyword.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerTitle: { ...typography.h3, color: colors.text },
  ctaWrap: { marginTop: spacing.md },
  stateWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 12 },
  stateBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
  errorBadge: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(245,158,11,0.3)',
  },
  resultsWrap: { marginTop: spacing.xl, paddingBottom: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

const tileStyles = StyleSheet.create({
  tile: { width: '47%', borderRadius: radii.lg, overflow: 'hidden', minHeight: 76 },
  inner: { padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  value: { ...typography.h3, fontWeight: '800', fontSize: 18 },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  text: { ...typography.caption, color: colors.text },
});
