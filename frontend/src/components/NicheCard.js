// src/components/NicheCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import StatPill from './StatPill';
import { colors, radii, spacing, typography } from '../theme';

function scoreTone(score) {
  if (score >= 70) return colors.success;
  if (score >= 45) return colors.primaryLight;
  return colors.warning;
}

export default function NicheCard({ item, index }) {
  const tone = scoreTone(item.score);
  return (
    <GlassCard padded radius={radii.xl} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>{item.niche}</Text>
        <View style={[styles.scoreBadge, { borderColor: tone }]}>
          <Text style={[styles.scoreText, { color: tone }]}>{item.score}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatPill icon="flame-outline"  label="Demand"      value={item.demand}      tone={colors.accent} />
        <StatPill icon="shield-outline" label="Competition" value={item.competition} tone="#EC4899" />
        <StatPill icon="rocket-outline" label="Opportunity" value={item.opportunity} tone={colors.success} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { ...typography.bodyLg, color: colors.text, fontWeight: '700', flex: 1, fontSize: 16 },
  scoreBadge: {
    minWidth: 40, height: 32, paddingHorizontal: 8, borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scoreText: { ...typography.bodyLg, fontWeight: '800', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
});
