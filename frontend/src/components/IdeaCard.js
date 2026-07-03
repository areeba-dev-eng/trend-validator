// src/components/IdeaCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { colors, radii, spacing, typography } from '../theme';

function ScoreBar({ label, value, gradient }) {
  const safe = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <View>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{safe}</Text>
      </View>
      <View style={styles.scoreTrack}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.scoreFill, { width: `${safe}%` }]} />
      </View>
    </View>
  );
}

export default function IdeaCard({ idea, index }) {
  return (
    <GlassCard padded radius={radii.xl} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{idea.title}</Text>
      </View>

      {!!idea.description && (
        <Text style={styles.description} numberOfLines={4}>{idea.description}</Text>
      )}

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={13} color={colors.textDim} />
        <Text style={styles.metaText} numberOfLines={1}>{idea.audience || 'General audience'}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="cash-outline" size={13} color={colors.textDim} />
        <Text style={styles.metaText} numberOfLines={1}>{idea.monetization || 'Not specified'}</Text>
      </View>

      <View style={styles.scoresWrap}>
        <ScoreBar label="Demand" value={idea.demandScore} gradient={['#22D3EE', '#34E5B0']} />
        <ScoreBar label="Competition" value={idea.competitionScore} gradient={['#EC4899', '#F97316']} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  indexBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(94,234,212,0.16)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(94,234,212,0.32)',
    marginTop: 2,
  },
  indexText: { ...typography.caption, color: colors.accent, fontWeight: '800', fontSize: 11 },
  title: { ...typography.bodyLg, color: colors.text, fontWeight: '700', flex: 1, fontSize: 16 },
  description: { ...typography.body, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { ...typography.caption, color: colors.textDim, flex: 1 },
  scoresWrap: { marginTop: 14, gap: 10 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scoreLabel: { ...typography.caption, color: colors.textDim },
  scoreValue: { ...typography.caption, color: colors.text, fontWeight: '700' },
  scoreTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3 },
});
