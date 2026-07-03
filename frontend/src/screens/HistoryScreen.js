// frontend/src/screens/HistoryScreen.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import BackgroundGradient from '../components/BackgroundGradient';
import SearchBar from '../components/SearchBar';
import { colors, spacing, typography } from '../theme';
import { fetchHistory } from '../services/api';

function formatDate(iso) {
  try {
    if (!iso) return 'Recently';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function scoreColor(score) {
  if (score >= 80) return '#34E5B0';
  if (score >= 60) return '#22D3EE';
  if (score >= 40) return '#FFD166';
  return '#FF7A7A';
}

export default function HistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [q,       setQ]       = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    try {
      setLoading(true);
      const items = await fetchHistory({ limit: 100 });
      setHistory(Array.isArray(items) ? items : []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  /* Reload whenever screen comes into focus so new analyses appear */
  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const filtered = useMemo(
    () => history.filter((h) =>
      (h.query || '').toLowerCase().includes(q.toLowerCase())),
    [history, q],
  );

  return (
    <View style={styles.root}>
      <BackgroundGradient />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>YOUR LIBRARY</Text>
        <Text style={styles.title}>History</Text>

        <View style={{ marginTop: spacing.xl }}>
          <SearchBar value={q} onChangeText={setQ} placeholder="Search history..." onSubmit={() => {}} />
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading analyses...</Text>
          </View>
        )}

        {!loading && filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyBody}>Your analyzed trends will appear here.</Text>
          </View>
        )}

        {!loading && filtered.map((item) => {
          const score = item?.result?.score || 0;
          return (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => {
                /* Open stored result instantly — no re-fetch, no credit cost */
                if (item.result) {
                  navigation.navigate('Results', { query: item.query, cachedResult: item.result });
                }
              }}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.query}>{item.query}</Text>
                  <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.scorePill, { borderColor: scoreColor(score) }]}>
                  <Text style={[styles.scoreText, { color: scoreColor(score) }]}>{score}%</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>Growth</Text>
                  <Text style={styles.statValue}>{item?.result?.growth ?? '—'}%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Demand</Text>
                  <Text style={styles.statValue}>{item?.result?.marketDemand ?? '—'}</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Competition</Text>
                  <Text style={styles.statValue}> {item?.result?.competitionLevel ?? '—'}%</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl },
  label:  { ...typography.micro, color: colors.textDim },
  title:  { ...typography.display, fontSize: 32, lineHeight: 36, color: colors.text, marginTop: 4 },
  loader: { marginTop: 80, alignItems: 'center' },
  loadingText: { marginTop: 14, color: colors.textMuted },
  empty:  { alignItems: 'center', justifyContent: 'center', marginTop: spacing.huge, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 8 },
  emptyBody:  { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: {
    marginTop: 18, borderRadius: 28, padding: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTop:   { flexDirection: 'row', alignItems: 'center' },
  query:     { fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 26 },
  meta:      { marginTop: 6, color: colors.textMuted, fontSize: 13 },
  scorePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  scoreText: { fontSize: 15, fontWeight: '700' },
  statsRow:  { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
});