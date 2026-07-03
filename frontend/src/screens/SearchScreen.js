import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '../components/BackgroundGradient';
import SearchBar from '../components/SearchBar';
import { colors, radii, spacing, typography } from '../theme';

const SUGGESTIONS = [
  'AI startups',
  'Dropshipping business',
  'E-commerce trends',
  'Crypto trading',
  'Freelancing business',
  'AI tools',
];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const submit = (override) => {
    const value = override ?? q;

    if (!value?.trim()) return;

    navigation.navigate('Results', {
      query: value.trim(),
    });
  };

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      {/* Header */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Search</Text>

        <View style={styles.iconBtn}>
          <Ionicons name="sparkles" size={18} color={colors.primaryLight} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 140 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <SearchBar
          value={q}
          onChangeText={setQ}
          onSubmit={() => submit()}
          autoFocus
        />

        {/* Suggestions */}
        <Text style={styles.sectionTitle}>Live Suggestions</Text>

        <View style={{ gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => submit(s)}
              style={styles.suggestionRow}
            >
              <BlurView
                intensity={Platform.OS === 'android' ? 18 : 28}
                tint="dark"
                style={[
                  StyleSheet.absoluteFill,
                  { borderRadius: radii.lg },
                ]}
              />

              <View style={styles.suggestionTint} />

              <View style={styles.suggestionInner}>
                <View style={styles.suggestionIcon}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={colors.primaryLight}
                  />
                </View>

                <Text style={styles.suggestionText}>
                  {s}
                </Text>

                <Ionicons
                  name="arrow-up"
                  size={14}
                  color={colors.textDim}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Real data notice */}
        <View style={styles.noticeWrap}>
          <Text style={styles.noticeTitle}>
            Real Trend Analysis
          </Text>

          <Text style={styles.noticeText}>
            Search any keyword to analyze live market trends powered by real APIs and AI.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },

  suggestionRow: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  suggestionTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  suggestionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },

  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108,92,231,0.18)',
  },

  suggestionText: {
    ...typography.bodyLg,
    color: colors.text,
    flex: 1,
  },

  noticeWrap: {
    marginTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  noticeTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },

  noticeText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
