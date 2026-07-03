// src/screens/NicheFinderScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import SearchBar from '../components/SearchBar';
import GradientButton from '../components/GradientButton';
import NicheCard from '../components/NicheCard';

import { colors, radii, spacing, typography } from '../theme';
import { findNiches, ApiError } from '../services/api';

export default function NicheFinderScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [keyword, setKeyword] = useState('');
  const [niches,  setNiches]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const submit = useCallback(async () => {
    const value = keyword.trim();
    if (!value) return;

    setLoading(true);
    setError(null);
    setNiches(null);

    try {
      const result = await findNiches(value);
      const list = Array.isArray(result?.niches) ? result.niches : [];
      setNiches([...list].sort((a, b) => b.score - a.score));
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('Niche discovery failed.'));
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
        <Text style={styles.headerTitle}>Niche Finder</Text>
        <View style={styles.iconBtn}>
          <Ionicons name="rocket" size={18} color={colors.primaryLight} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 140 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SearchBar value={keyword} onChangeText={setKeyword} onSubmit={submit}
          placeholder="Enter a broad market, e.g. fitness" autoFocus />

        <View style={styles.ctaWrap}>
          <GradientButton
            title={loading ? 'Discovering…' : 'Find 10 Niches'}
            onPress={submit} disabled={loading || !keyword.trim()} fullWidth icon="rocket"
          />
        </View>

        {loading && (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.stateBody}>Scanning sub-segments across real market signals…</Text>
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

        {!loading && !error && niches && niches.length === 0 && (
          <View style={styles.stateWrap}>
            <Text style={styles.stateBody}>No niches found for this keyword. Try a broader market.</Text>
          </View>
        )}

        {!loading && !error && niches && niches.length > 0 && (
          <View style={styles.resultsWrap}>
            <Text style={styles.resultsHeading}>{niches.length} niches in "{keyword.trim()}"</Text>
            {niches.map((item, i) => <NicheCard key={`${item.niche}-${i}`} item={item} index={i} />)}
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
  resultsHeading: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
});
