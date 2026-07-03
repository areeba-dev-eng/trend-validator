import React, { useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, radii, typography } from '../theme';

/**
 * HistoryItem v2 — top highlight, surface gradient, refined chip.
 */
export default function HistoryItem({ query, timeAgo, icon, score, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const tone = score >= 80 ? colors.success : score >= 60 ? colors.accent : colors.warning;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.99, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={styles.wrap}
      >
        <BlurView
          intensity={Platform.OS === 'android' ? 22 : 32}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />
        <LinearGradient
          colors={colors.gradSurface}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />
        <View style={styles.topHighlight} pointerEvents="none" />
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={16} color={colors.accent} />
          </View>
          <View style={styles.body}>
            <Text style={styles.query} numberOfLines={1}>{query}</Text>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>
          <View style={styles.scorePill}>
            <View style={[styles.dot, { backgroundColor: tone }]} />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} style={{ marginLeft: 8 }} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: colors.glassTopHighlight,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  iconWrap: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: 'rgba(94,234,212,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(94,234,212,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  query: { ...typography.bodyLg, color: colors.text, fontWeight: '600' },
  time: { ...typography.caption, color: colors.textDim },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { ...typography.caption, color: colors.text, fontWeight: '700' },
});
