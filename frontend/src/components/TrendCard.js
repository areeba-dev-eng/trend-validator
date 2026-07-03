// frontend/src/components/TrendCard.js

import React, { useRef } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { colors, radii, typography, shadow } from '../theme';
import SparklineChart from './SparklineChart';

const FALLBACK_SERIES = [12, 22, 18, 34, 46, 58, 72];

/* ============================================================================
 * Sizing tiers
 * COMPACT  — phone compact cards (width < 220)
 * PREMIUM  — tablet / web tall cards (width >= 220)
 * ========================================================================== */

const COMPACT = {
  padding:    12,
  titleSize:  12,  titleLine: 15,
  subSize:    10.5, subLine:  13, subMt: 3,
  scorePadH:  7,   scorePadV: 3, scoreSize: 10,
  chartH:     60,  strokeWidth: 2.5,
  metricSize: 28,  metricLine: 30,
  unitSize:   8.5, unitMl: 5, unitMb: 4, unitLetter: 1.2,
  deltaIcon:  10,  deltaSize: 10,
  deltaPadH:  7,   deltaPadV: 4, deltaGap: 3,
};

const PREMIUM = {
  padding:    18,
  titleSize:  18,  titleLine: 22,
  subSize:    13,  subLine:   17, subMt: 4,
  scorePadH:  12,  scorePadV: 6, scoreSize: 12,
  chartH:     140, strokeWidth: 3,
  metricSize: 46,  metricLine: 48,
  unitSize:   12,  unitMl: 8, unitMb: 8, unitLetter: 2,
  deltaIcon:  13,  deltaSize: 12,
  deltaPadH:  12,  deltaPadV: 6, deltaGap: 4,
};

/* ============================================================================
 * Component
 * ========================================================================== */

export default function TrendCard({
  title,
  subtitle,
  score     = 80,
  change,
  direction = 'up',
  series,
  color     = colors.accent,
  onPress,
  width     = 168,
  height    = 200,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const safeSeries   = Array.isArray(series) && series.length > 1 ? series : FALLBACK_SERIES;
  const safeScore    = Number(score) || 80;
  const safeTitle    = title    || 'Live Trend';
  const safeSubtitle = subtitle || 'Trending';
const n = parseFloat(String(change ?? '0'));
const safeChange = Number.isFinite(n)
  ? `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
  : '+0.0%';
  const upTone       = direction === 'up' ? colors.success : colors.danger;

  const T = width >= 220 ? PREMIUM : COMPACT;

  /* Chart height — auto-shrinks when card is shorter than tier prefers */
  const headerEst      = T.titleLine * 2 + T.subLine + T.subMt;
  const footerEst      = T.metricLine + 6;
  const maxChart       = Math.max(36, height - T.padding * 2 - headerEst - footerEst - 8);
  const chartHeight    = Math.min(T.chartH, maxChart);
  const chartWidth     = Math.max(80, width - T.padding * 2);

  const pressIn  = () =>
    Animated.spring(scale, { toValue: 0.97,  useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, bounciness: 5, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[{ width, height, transform: [{ scale }] }, shadow.cardDeep]}
    >
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.wrap, { borderRadius: radii.xxl, padding: T.padding }]}
      >
        {/* Glass layers */}
        <BlurView
          intensity={Platform.OS === 'android' ? 24 : 45}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
        />
        <LinearGradient
          colors={colors.gradWarmGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
        />
        <LinearGradient
          colors={colors.gradSurface}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
        />
        <View
          style={[StyleSheet.absoluteFill, styles.border]}
          pointerEvents="none"
        />
        <View style={styles.topHighlight} pointerEvents="none" />

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            {/*
              numberOfLines={2}  — allows the full title to wrap to a 2nd line.
              No ellipsizeMode   — removes "..." so nothing is ever cut off.
              Long titles like "AI Content Repurposing Automation" fit cleanly.
            */}
            <Text
              style={[
                styles.title,
                { fontSize: T.titleSize, lineHeight: T.titleLine },
              ]}
              numberOfLines={2}
            >
              {safeTitle}
            </Text>

            <Text
              style={[
                styles.subtitle,
                { fontSize: T.subSize, lineHeight: T.subLine, marginTop: T.subMt },
              ]}
              numberOfLines={1}
            >
              {safeSubtitle}
            </Text>
          </View>

          <View
            style={[
              styles.scorePill,
              { paddingHorizontal: T.scorePadH, paddingVertical: T.scorePadV },
            ]}
          >
            <Text style={[styles.scoreText, { fontSize: T.scoreSize }]}>
              {safeScore}%
            </Text>
          </View>
        </View>

        {/* ── Chart ──────────────────────────────────────────── */}
        <View style={styles.chartArea}>
          <SparklineChart
            values={safeSeries}
            width={chartWidth}
            height={chartHeight}
            color={color}
            areaOpacity={0.58}
            strokeWidth={T.strokeWidth}
            glow
          />
        </View>

        {/* ── Footer ─────────────────────────────────────────── */}
        <View style={styles.footerRow}>
          <View style={styles.metricRow}>
            <Text
              style={[
                styles.metric,
                { fontSize: T.metricSize, lineHeight: T.metricLine },
              ]}
              numberOfLines={1}
            >
              {safeScore}
            </Text>
            <Text
              style={[
                styles.metricUnit,
                {
                  fontSize:      T.unitSize,
                  marginLeft:    T.unitMl,
                  marginBottom:  T.unitMb,
                  letterSpacing: T.unitLetter,
                },
              ]}
            >
              SCORE
            </Text>
          </View>

          <View
            style={[
              styles.deltaPill,
              {
                paddingHorizontal: T.deltaPadH,
                paddingVertical:   T.deltaPadV,
                gap:               T.deltaGap,
              },
            ]}
          >
            <Ionicons
              name={direction === 'up' ? 'arrow-up' : 'arrow-down'}
              size={T.deltaIcon}
              color={upTone}
            />
            <Text
              style={[styles.deltaText, { color: upTone, fontSize: T.deltaSize }]}
              numberOfLines={1}
            >
              {safeChange}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================================
 * Styles — zero visual changes
 * ========================================================================== */

const styles = StyleSheet.create({
  wrap: {
    flex:            1,
    overflow:        'hidden',
    justifyContent:  'space-between',
    backgroundColor: 'rgba(20,20,35,0.58)',
  },
  border: {
    borderRadius: radii.xxl,
    borderWidth:  StyleSheet.hairlineWidth,
    borderColor:  colors.borderStrong,
  },
  topHighlight: {
    position:            'absolute',
    top: 0, left: 0, right: 0,
    height:              1,
    backgroundColor:     colors.glassTopHighlight,
    borderTopLeftRadius:  radii.xxl,
    borderTopRightRadius: radii.xxl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           6,
  },
  titleBlock: {
    flex:        1,
    paddingRight: 6,
  },
  title: {
    ...typography.h3,
    color:         colors.text,
    fontWeight:    '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textDim,
  },
  scorePill: {
    borderRadius:    radii.pill,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexShrink:      0,
  },
  scoreText: {
    ...typography.caption,
    color:      colors.text,
    fontWeight: '700',
  },

  chartArea: {
    alignItems:    'center',
    justifyContent: 'center',
    marginTop:     4,
    marginBottom:  2,
  },

  footerRow: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
    gap:            6,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    flexShrink:    1,
  },
  metric: {
    ...typography.h1,
    color:         colors.text,
    fontWeight:    '800',
    letterSpacing: -0.5,
  },
  metricUnit: {
    ...typography.micro,
  },
  deltaPill: {
    flexDirection:   'row',
    alignItems:      'center',
    borderRadius:    radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.10)',
    flexShrink:      0,
  },
  deltaText: {
    ...typography.caption,
    fontWeight: '700',
  },
});