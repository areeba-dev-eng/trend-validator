// // src/screens/AnalyticsScreen.js

// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   ActivityIndicator,
//   Animated,
// } from 'react-native';

// import {
//   LineChart,
//   BarChart,
// } from 'react-native-chart-kit';

// import { Ionicons } from '@expo/vector-icons';

// import GlassCard from '../components/GlassCard';

// import { colors } from '../theme';
// import { auth } from '../config/firebase';

// import {
//   collection,
//   onSnapshot,
//   orderBy,
//   query,
// } from 'firebase/firestore';

// import { db } from '../config/firebase';

// const { width } = Dimensions.get('window');

// const chartConfig = {
//   backgroundGradientFrom: 'transparent',
//   backgroundGradientTo: 'transparent',
//   decimalPlaces: 0,
//   color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
//   labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
//   propsForDots: {
//     r: '4',
//     strokeWidth: '2',
//     stroke: '#22d3ee',
//   },
// };

// function AnimatedCounter({ value, suffix = '' }) {
//   const animatedValue = React.useRef(new Animated.Value(0)).current;
//   const [displayValue, setDisplayValue] = useState(0);

//   useEffect(() => {
//     Animated.timing(animatedValue, {
//       toValue: value,
//       duration: 1200,
//       useNativeDriver: false,
//     }).start();

//     const listener = animatedValue.addListener(({ value }) => {
//       setDisplayValue(Math.floor(value));
//     });

//     return () => {
//       animatedValue.removeListener(listener);
//     };
//   }, [value]);

//   return (
//     <Text style={styles.metricValue}>
//       {displayValue}
//       {suffix}
//     </Text>
//   );
// }

// export default function AnalyticsScreen() {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     const q = query(
//       collection(db, 'users', auth.currentUser.uid, 'history'),
//       orderBy('createdAt', 'desc')
//     );

//     const unsub = onSnapshot(q, (snapshot) => {
//       const data = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setHistory(data);
//       setLoading(false);
//     });

//     return unsub;
//   }, []);

//   const analytics = useMemo(() => {
//     if (!history.length) {
//       return {
//         totalAnalyses: 0,
//         avgScore: 0,
//         avgGrowth: 0,
//         successRate: 0,
//         topTrend: null,
//         chartLabels: [],
//         chartScores: [],
//         growthData: [],
//       };
//     }

//     const scores = history.map(item => Number(item.score || 0));
//     const growth = history.map(item => Number(item.growth || 0));

//     const totalAnalyses = history.length;

//     const avgScore = Math.round(
//       scores.reduce((a, b) => a + b, 0) / totalAnalyses
//     );

//     const avgGrowth = Math.round(
//       growth.reduce((a, b) => a + b, 0) / totalAnalyses
//     );

//     const successCount = history.filter(
//       item => Number(item.score || 0) >= 75
//     ).length;

//     const successRate = Math.round(
//       (successCount / totalAnalyses) * 100
//     );

//     const sorted = [...history].sort(
//       (a, b) => (b.score || 0) - (a.score || 0)
//     );

//     const topTrend = sorted[0];

//     const latest = history.slice(0, 7).reverse();

//     return {
//       totalAnalyses,
//       avgScore,
//       avgGrowth,
//       successRate,
//       topTrend,

//       chartLabels: latest.map((_, i) => `#${i + 1}`),

//       chartScores: latest.map(
//         item => Number(item.score || 0)
//       ),

//       growthData: latest.map(
//         item => Number(item.growth || 0)
//       ),
//     };
//   }, [history]);

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#22d3ee" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.content}
//       showsVerticalScrollIndicator={false}
//     >
//       <Text style={styles.overview}>OVERVIEW</Text>

//       <View style={styles.headerRow}>
//         <Text style={styles.title}>Analytics</Text>

//         <View style={styles.filterBtn}>
//           <Ionicons
//             name="options-outline"
//             size={22}
//             color={colors.text}
//           />
//         </View>
//       </View>

//       <GlassCard style={styles.heroCard}>
//         <Text style={styles.heroTitle}>
//           Real Trend Intelligence
//         </Text>

//         <Text style={styles.heroText}>
//           Analytics are powered by live Google Trends,
//           Reddit engagement, YouTube momentum, and
//           AI opportunity scoring.
//         </Text>
//       </GlassCard>

//       {/* Metrics */}

//       <View style={styles.grid}>
//         <GlassCard style={styles.metricCard}>
//           <Text style={styles.metricLabel}>
//             TOTAL ANALYSES
//           </Text>

//           <AnimatedCounter
//             value={analytics.totalAnalyses}
//           />
//         </GlassCard>

//         <GlassCard style={styles.metricCard}>
//           <Text style={styles.metricLabel}>
//             AVG SCORE
//           </Text>

//           <AnimatedCounter
//             value={analytics.avgScore}
//             suffix="%"
//           />
//         </GlassCard>

//         <GlassCard style={styles.metricCard}>
//           <Text style={styles.metricLabel}>
//             SUCCESS RATE
//           </Text>

//           <AnimatedCounter
//             value={analytics.successRate}
//             suffix="%"
//           />
//         </GlassCard>

//         <GlassCard style={styles.metricCard}>
//           <Text style={styles.metricLabel}>
//             AVG GROWTH
//           </Text>

//           <AnimatedCounter
//             value={analytics.avgGrowth}
//             suffix="%"
//           />
//         </GlassCard>
//       </View>

//       {/* Empty State */}

//       {!history.length && (
//         <GlassCard style={styles.emptyCard}>
//           <Ionicons
//             name="analytics-outline"
//             size={44}
//             color="#22d3ee"
//           />

//           <Text style={styles.emptyTitle}>
//             No analytics yet
//           </Text>

//           <Text style={styles.emptyText}>
//             Start analyzing trends to generate
//             intelligent market insights.
//           </Text>
//         </GlassCard>
//       )}

//       {/* Charts */}

//       {history.length > 0 && (
//         <>
//           <Text style={styles.sectionTitle}>
//             Trend Performance
//           </Text>

//           <GlassCard style={styles.chartCard}>
//             <LineChart
//               data={{
//                 labels: analytics.chartLabels,
//                 datasets: [
//                   {
//                     data: analytics.chartScores,
//                   },
//                 ],
//               }}
//               width={width - 52}
//               height={220}
//               chartConfig={chartConfig}
//               bezier
//               withInnerLines={false}
//               withOuterLines={false}
//               style={styles.chart}
//             />
//           </GlassCard>

//           <Text style={styles.sectionTitle}>
//             Growth Comparison
//           </Text>

//           <GlassCard style={styles.chartCard}>
//             <BarChart
//               data={{
//                 labels: analytics.chartLabels,
//                 datasets: [
//                   {
//                     data: analytics.growthData,
//                   },
//                 ],
//               }}
//               width={width - 52}
//               height={240}
//               fromZero
//               showValuesOnTopOfBars
//               chartConfig={chartConfig}
//               style={styles.chart}
//             />
//           </GlassCard>

//           {/* Top Trend */}

//           {analytics.topTrend && (
//             <>
//               <Text style={styles.sectionTitle}>
//                 Top Performing Trend
//               </Text>

//               <GlassCard style={styles.topTrendCard}>
//                 <View style={styles.topRow}>
//                   <View style={styles.topIcon}>
//                     <Ionicons
//                       name="trending-up"
//                       size={22}
//                       color="#22d3ee"
//                     />
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.topTitle}>
//                       {analytics.topTrend.keyword ||
//                         analytics.topTrend.query ||
//                         'Trend'}
//                     </Text>

//                     <Text style={styles.topSubtitle}>
//                       Highest scoring analysis
//                     </Text>
//                   </View>

//                   <Text style={styles.topScore}>
//                     {analytics.topTrend.score || 0}%
//                   </Text>
//                 </View>
//               </GlassCard>
//             </>
//           )}

//           {/* Insights */}

//           <Text style={styles.sectionTitle}>
//             AI Insights
//           </Text>

//           <View style={styles.insightsGrid}>
//             <GlassCard style={styles.insightCard}>
//               <Ionicons
//                 name="sparkles-outline"
//                 size={20}
//                 color="#22d3ee"
//               />

//               <Text style={styles.insightTitle}>
//                 Momentum Rising
//               </Text>

//               <Text style={styles.insightText}>
//                 Your recent analyses show improving
//                 trend quality and stronger market signals.
//               </Text>
//             </GlassCard>

//             <GlassCard style={styles.insightCard}>
//               <Ionicons
//                 name="rocket-outline"
//                 size={20}
//                 color="#22d3ee"
//               />

//               <Text style={styles.insightTitle}>
//                 Opportunity Alert
//               </Text>

//               <Text style={styles.insightText}>
//                 High scoring trends indicate strong
//                 niche potential and audience demand.
//               </Text>
//             </GlassCard>
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.bg,
//   },

//   content: {
//     padding: 24,
//     paddingBottom: 140,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.bg,
//   },

//   overview: {
//     color: 'rgba(255,255,255,0.45)',
//     fontSize: 12,
//     fontWeight: '700',
//     letterSpacing: 2,
//     marginBottom: 10,
//   },

//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24,
//   },

//   title: {
//     color: colors.text,
//     fontSize: 52,
//     fontWeight: '900',
//   },

//   filterBtn: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.06)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.08)',
//   },

//   heroCard: {
//     marginBottom: 24,
//     padding: 24,
//   },

//   heroTitle: {
//     color: colors.text,
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 10,
//   },

//   heroText: {
//     color: 'rgba(255,255,255,0.72)',
//     fontSize: 16,
//     lineHeight: 26,
//   },

//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },

//   metricCard: {
//     width: '48%',
//     marginBottom: 18,
//     padding: 22,
//   },

//   metricLabel: {
//     color: 'rgba(255,255,255,0.45)',
//     fontSize: 13,
//     fontWeight: '700',
//     letterSpacing: 1.5,
//     marginBottom: 14,
//   },

//   metricValue: {
//     color: colors.text,
//     fontSize: 42,
//     fontWeight: '900',
//   },

//   sectionTitle: {
//     color: colors.text,
//     fontSize: 34,
//     fontWeight: '900',
//     marginTop: 24,
//     marginBottom: 18,
//   },

//   chartCard: {
//     paddingVertical: 20,
//     paddingRight: 16,
//     marginBottom: 24,
//   },

//   chart: {
//     borderRadius: 20,
//   },

//   topTrendCard: {
//     padding: 22,
//     marginBottom: 24,
//   },

//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   topIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: 'rgba(34,211,238,0.12)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },

//   topTitle: {
//     color: colors.text,
//     fontSize: 18,
//     fontWeight: '800',
//     marginBottom: 4,
//   },

//   topSubtitle: {
//     color: 'rgba(255,255,255,0.55)',
//     fontSize: 14,
//   },

//   topScore: {
//     color: '#22d3ee',
//     fontSize: 28,
//     fontWeight: '900',
//   },

//   insightsGrid: {
//     gap: 18,
//   },

//   insightCard: {
//     padding: 22,
//   },

//   insightTitle: {
//     color: colors.text,
//     fontSize: 18,
//     fontWeight: '800',
//     marginTop: 14,
//     marginBottom: 10,
//   },

//   insightText: {
//     color: 'rgba(255,255,255,0.68)',
//     lineHeight: 24,
//     fontSize: 15,
//   },

//   emptyCard: {
//     padding: 40,
//     alignItems: 'center',
//     marginTop: 24,
//   },

//   emptyTitle: {
//     color: colors.text,
//     fontSize: 24,
//     fontWeight: '800',
//     marginTop: 18,
//     marginBottom: 10,
//   },

//   emptyText: {
//     color: 'rgba(255,255,255,0.6)',
//     textAlign: 'center',
//     lineHeight: 24,
//     fontSize: 15,
//   },
// });

// src/screens/AnalyticsScreen.js
import React, {
  useCallback, useEffect, useMemo,
  useRef, useState,
} from 'react';
import {
  ActivityIndicator, Animated, Dimensions,
  Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard         from '../components/GlassCard';
import SectionHeader     from '../components/SectionHeader';
import { colors, radii, spacing, typography } from '../theme';
import { fetchHistory, fetchLiveTrends } from '../services/api';

/* ─── Layout constants ───────────────────────────────────────────────────────── */
const { width: SCREEN_W } = Dimensions.get('window');
// -2 so the SVG doesn't clip at hairline border
const CHART_W = Math.min(SCREEN_W - spacing.xl * 2 - 2, 620);
const CHART_H = 188;

/* ─── react-native-chart-kit theme (transparent bg, dark labels) ─────────────── */
const CHART_CONFIG = {
  backgroundGradientFrom:        '#0B0D14',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo:          '#0B0D14',
  backgroundGradientToOpacity:   0,
  decimalPlaces:                 0,
  color:      (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.50})`,
  strokeWidth: 2.5,
  propsForDots: {
    r: '4', strokeWidth: '2', stroke: '#00D4FF', fill: '#00D4FF',
  },
  propsForBackgroundLines: {
    stroke: 'rgba(255,255,255,0.07)', strokeDasharray: '', strokeWidth: 1,
  },
  propsForLabels: { fontSize: 9 },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * SAFE DATA EXTRACTORS
 * Each function handles every possible missing/malformed field — never throws.
 * ═══════════════════════════════════════════════════════════════════════════════ */

/** Primary display name for a history item */
const safeName = (h) =>
  (h?.query ?? h?.keyword ?? h?.topic ?? h?.title ?? '').trim() || 'Unknown';

/** Score clamped 0–100 */
const safeScore = (h) =>
  Math.max(0, Math.min(100, Math.round(Number(h?.result?.score ?? h?.score ?? 0))));

/** Parse any growth representation ("+18.4%", "-5", 18.4, …) → number */
const parseGrowthNum = (raw) => {
  if (raw === null || raw === undefined) return 0;
  const str = typeof raw === 'string' ? raw : String(raw);
  const n   = parseFloat(str.replace('%', '').trim());
  return Number.isFinite(n) ? n : 0;
};

/** Growth number from a history item */
const safeGrowth = (h) =>
  parseGrowthNum(h?.result?.growth ?? h?.growth ?? 0);

/** Trend series as a clean number array */
const safeSeries = (h) => {
  const raw = h?.result?.series ?? h?.trendSeries ?? h?.series ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(Number).filter((v) => Number.isFinite(v) && v >= 0);
};

/** Parse any date field → Date | null */
const safeDate = (h) => {
  const s = h?.createdAt ?? h?.analytics?.analyzedAt ?? null;
  if (!s) return null;
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
};

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const formatChartDate = (d) =>
  d ? `${d.getMonth() + 1}/${d.getDate()}` : '';

const formatRelative = (d) => {
  if (!d) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins <  1)  return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS — all defensive, no crashes on missing data
 * ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Animated number counter ────────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = '', style }) {
  const anim    = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const animation = Animated.timing(anim, {
      toValue: value, duration: 900, useNativeDriver: false,
    });
    animation.start();
    const id = anim.addListener(({ value: v }) => setShown(Math.round(v)));
    return () => { animation.stop(); anim.removeListener(id); };
  }, [value]);

  return <Text style={style}>{shown}{suffix}</Text>;
}

/* ── Summary metric card ─────────────────────────────────────────────────────── */
function MetricCard({ label, value, suffix = '', icon, tone }) {
  return (
    <GlassCard padded radius={radii.xl} style={metricS.card}>
      <View style={metricS.iconRow}>
        <View style={[metricS.icon, { backgroundColor: `${tone}18` }]}>
          <Ionicons name={icon} size={13} color={tone} />
        </View>
        <Text style={metricS.label}>{label}</Text>
      </View>
      <AnimatedCounter value={value} suffix={suffix} style={[metricS.value, { color: tone }]} />
    </GlassCard>
  );
}

const metricS = StyleSheet.create({
  card:    { flexBasis: '48%', flexGrow: 1, minWidth: 140 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  icon:    { width: 26, height: 26, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  label:   { ...typography.micro, color: colors.textDim },
  value:   { ...typography.h1, fontSize: 28, fontWeight: '800' },
});

/* ── Trend progress bar row ──────────────────────────────────────────────────── */
function TrendProgressRow({ rank, name, score, growth }) {
  const isUp = growth >= 0;
  const pct  = `${Math.max(2, score)}%`;

  return (
    <View style={progS.wrap}>
      <View style={progS.header}>
        <View style={progS.rank}>
          <Text style={progS.rankNum}>{rank}</Text>
        </View>
        <Text style={progS.name} numberOfLines={1}>{capitalize(name)}</Text>
        <View style={[progS.badge, { backgroundColor: isUp ? 'rgba(52,229,176,0.12)' : 'rgba(255,92,124,0.12)' }]}>
          <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={10} color={isUp ? colors.success : colors.danger} />
          <Text style={[progS.badgeText, { color: isUp ? colors.success : colors.danger }]}>
            {Math.abs(growth).toFixed(1)}%
          </Text>
        </View>
      </View>
      <View style={progS.track}>
        <LinearGradient
          colors={score >= 75 ? colors.gradSuccess : score >= 50 ? colors.gradAccent : colors.gradDanger}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[progS.fill, { width: pct }]}
        />
      </View>
      <Text style={progS.pts}>{score} pts</Text>
    </View>
  );
}

const progS = StyleSheet.create({
  wrap:      { marginBottom: 16 },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  rank:      { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rankNum:   { ...typography.micro, color: colors.textDim, fontSize: 9 },
  name:      { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radii.pill, flexShrink: 0 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  track:     { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 3 },
  pts:       { ...typography.caption, color: colors.textFaint, marginTop: 4, textAlign: 'right' },
});

/* ── Recent analysis row ─────────────────────────────────────────────────────── */
function RecentRow({ item, isLast }) {
  const score   = safeScore(item);
  const growth  = safeGrowth(item);
  const date    = safeDate(item);
  const verdict = item?.result?.verdict || '';
  const isUp    = growth >= 0;
  const tone    = score >= 75 ? colors.success : score >= 50 ? colors.accent : colors.danger;

  return (
    <View style={[rowS.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={[rowS.circle, { borderColor: tone }]}>
        <Text style={[rowS.circleNum, { color: tone }]}>{score}</Text>
      </View>
      <View style={rowS.mid}>
        <Text style={rowS.name} numberOfLines={1}>{capitalize(safeName(item))}</Text>
        {!!verdict && <Text style={rowS.verdict}>{verdict}</Text>}
      </View>
      <View style={rowS.right}>
        <Text style={[rowS.growth, { color: isUp ? colors.success : colors.danger }]}>
          {isUp ? '+' : ''}{growth.toFixed(1)}%
        </Text>
        <Text style={rowS.time}>{formatRelative(date)}</Text>
      </View>
    </View>
  );
}

const rowS = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  circle:    { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  circleNum: { fontSize: 13, fontWeight: '800' },
  mid:       { flex: 1 },
  name:      { ...typography.body, color: colors.text, fontWeight: '600' },
  verdict:   { ...typography.caption, color: colors.textFaint, marginTop: 2 },
  right:     { alignItems: 'flex-end' },
  growth:    { fontSize: 13, fontWeight: '700' },
  time:      { ...typography.caption, color: colors.textFaint, marginTop: 2 },
});

/* ── Insight mini card ───────────────────────────────────────────────────────── */
function InsightCard({ icon, label, value, tone, sub }) {
  return (
    <View style={insS.card}>
      <LinearGradient
        colors={[`${tone}22`, `${tone}08`]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
      />
      <View style={[StyleSheet.absoluteFill, insS.border, { borderRadius: radii.lg }]} pointerEvents="none" />
      <View style={insS.inner}>
        <Ionicons name={icon} size={20} color={tone} style={{ marginBottom: 8 }} />
        <Text style={[insS.num, { color: tone }]}>{value}</Text>
        <Text style={insS.label}>{label}</Text>
        {sub ? <Text style={insS.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const insS = StyleSheet.create({
  card:   { flex: 1, borderRadius: radii.lg, overflow: 'hidden', minWidth: 100 },
  border: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  inner:  { padding: 14 },
  num:    { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  label:  { ...typography.micro, color: colors.textDim, marginTop: 5 },
  sub:    { ...typography.caption, color: colors.textFaint, marginTop: 3 },
});

/* ── Empty state ─────────────────────────────────────────────────────────────── */
function EmptySection({ icon = 'bar-chart-outline', msg }) {
  return (
    <View style={emptyS.wrap}>
      <Ionicons name={icon} size={28} color={colors.textFaint} />
      <Text style={emptyS.text}>{msg}</Text>
    </View>
  );
}

const emptyS = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 26, gap: 10 },
  text: { ...typography.body, color: colors.textFaint, textAlign: 'center', maxWidth: 280 },
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN SCREEN
 * ═══════════════════════════════════════════════════════════════════════════════ */
export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();

  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  /* ── Load both endpoints in parallel; Promise.allSettled so one failure
   *    doesn't block the other ──────────────────────────────────────────── */
  const loadAll = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [histResult] = await Promise.allSettled([
        fetchHistory({ limit: 100 }),
      ]);

      if (histResult.status === 'fulfilled') {
        const raw = histResult.value;
        setHistory(Array.isArray(raw) ? raw : []);
      } else {
        console.warn('fetchHistory failed:', histResult.reason?.message);
        setError('Could not load history data.');
      }
    } catch (err) {
      console.warn('AnalyticsScreen.loadAll:', err?.message);
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll(true);
  }, [loadAll]);

  /* ── All computed analytics — one useMemo, zero crashes ─────────────────── */
  const A = useMemo(() => {
    const empty = {
      total: 0, avgScore: 0, successRate: 0, avgGrowth: 0,
      highPotCount: 0, stableCount: 0, decliningCount: 0,
      positiveCount: 0, negativeCount: 0,
      thisWeekAvg: 0, lastWeekAvg: 0,
      timelineItems: [], topTrends: [], recentItems: [],
    };
    if (!history.length) return empty;

    const scores  = history.map(safeScore);
    const growths = history.map(safeGrowth);
    const total   = history.length;

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);

    // const highPotCount  = scores.filter((s) => s >= 75).length;
    const highPotCount = scores.filter((s) => s >= 60).length;
    const successRate = Math.round((highPotCount / total) * 100);
    // const successRate   = Math.round((highPotCount / total) * 100);

    const validG  = growths.filter(Number.isFinite);
    const avgGrowth = validG.length
      ? Math.round(validG.reduce((a, b) => a + b, 0) / validG.length)
      : 0;

    const verdicts      = history.map((h) => h?.result?.verdict || '');
    const stableCount   = verdicts.filter((v) => v === 'Stable' || v === 'Emerging').length;
    const decliningCount= verdicts.filter((v) => v === 'Declining' || v === 'Low Potential').length;

    const positiveCount = growths.filter((g) => g > 0).length;
    const negativeCount = growths.filter((g) => g < 0).length;

    /* Items with a parseable date, sorted oldest→newest */
    const dated = history
      .map((h)  => ({ h, d: safeDate(h) }))
      .filter(({ d }) => d !== null)
      .sort((a, b) => a.d - b.d);

    const timelineItems = dated.slice(-10);          // last 10 for chart
    const topTrends     = [...history]
      .sort((a, b) => safeScore(b) - safeScore(a))
      .slice(0, 5);
    const recentItems   = dated.slice().reverse().slice(0, 5).map(({ h }) => h);

    /* Week-over-week */
    const now   = Date.now();
    const wk1   = now - 7  * 864e5;
    const wk2   = now - 14 * 864e5;

    const weekAvg = (items) =>
      items.length
        ? Math.round(items.map(safeScore).reduce((a, b) => a + b, 0) / items.length)
        : 0;

    const thisWeekAvg = weekAvg(history.filter((h) => { const d = safeDate(h); return d && d.getTime() >= wk1; }));
    const lastWeekAvg = weekAvg(history.filter((h) => { const d = safeDate(h); return d && d.getTime() >= wk2 && d.getTime() < wk1; }));

    return {
      total, avgScore, successRate, avgGrowth,
      highPotCount, stableCount, decliningCount,
      positiveCount, negativeCount,
      thisWeekAvg, lastWeekAvg,
      timelineItems, topTrends, recentItems,
    };
  }, [history]);

  /* ── Chart data — only recalculated when timeline changes ────────────────── */
  const chartData = useMemo(() => {
    if (A.timelineItems.length < 2) return null;
    return {
      labels: A.timelineItems.map(({ d }) => formatChartDate(d)),
      datasets: [{
        data: A.timelineItems.map(({ h }) =>
          // chart-kit crashes on NaN — guarantee valid numbers
          Math.max(0, Math.min(100, safeScore(h))),
        ),
        color:       (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
        strokeWidth: 2.5,
      }],
    };
  }, [A.timelineItems]);

  const weekDelta    = A.thisWeekAvg - A.lastWeekAvg;
  const weekDeltaPos = weekDelta >= 0;
  const showWeek     = A.thisWeekAvg > 0 || A.lastWeekAvg > 0;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <View style={styles.root}>
      <BackgroundGradient />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: 140 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.overviewLabel}>OVERVIEW</Text>
            <Text style={styles.title}>Analytics</Text>
          </View>
          <Pressable onPress={() => loadAll()} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* ── Loading ── */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.centerText}>Loading analytics…</Text>
          </View>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
            <Text style={[styles.centerText, { color: colors.danger }]}>{error}</Text>
            <Pressable onPress={() => loadAll()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* ── Content ── */}
        {!loading && !error && (
          <>
            {/* 1 ── Summary metrics */}
            <View style={styles.metricGrid}>
              <MetricCard
                label="TOTAL ANALYSES"
                value={A.total}
                icon="bar-chart-outline"
                tone={colors.primaryLight}
              />
              <MetricCard
                label="AVG SCORE"
                value={A.avgScore}
                suffix="%"
                icon="trophy-outline"
                tone={colors.accent}
              />
              <MetricCard
                label="SUCCESS RATE"
                value={A.successRate}
                suffix="%"
                icon="checkmark-circle-outline"
                tone={colors.success}
              />
              <MetricCard
                label="AVG GROWTH"
                value={Math.abs(A.avgGrowth)}
                suffix="%"
                icon={A.avgGrowth >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                tone={A.avgGrowth >= 0 ? colors.success : colors.danger}
              />
            </View>

            {/* 2 ── Score timeline chart */}
            <View style={styles.section}>
              <SectionHeader title="Score Timeline" />
              <GlassCard radius={radii.xl} style={styles.chartCard}>
                {chartData ? (
                  <LineChart
                    data={chartData}
                    width={CHART_W}
                    height={CHART_H}
                    chartConfig={CHART_CONFIG}
                    bezier
                    withInnerLines
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLabels
                    withVerticalLabels
                    fromZero={false}
                    style={styles.chart}
                  />
                ) : (
                  <EmptySection
                    icon="bar-chart-outline"
                    msg={
                      A.total === 0
                        ? 'Run your first trend analysis to populate the score timeline.'
                        : 'Need at least 2 timestamped analyses to display the chart.'
                    }
                  />
                )}
              </GlassCard>
            </View>

            {/* 3 ── Verdict breakdown */}
            <View style={styles.section}>
              <SectionHeader title="Market Breakdown" />
              <View style={styles.insightRow}>
                <InsightCard
                  icon="rocket-outline"
                  label="HIGH POTENTIAL"
                  value={A.highPotCount}
                  tone={colors.success}
                  sub="score ≥ 60"
                />
                <InsightCard
                  icon="radio-button-on-outline"
                  label="STABLE"
                  value={A.stableCount}
                  tone={colors.accent}
                  sub="emerging"
                />
                <InsightCard
                  icon="trending-down-outline"
                  label="DECLINING"
                  value={A.decliningCount}
                  tone={colors.danger}
                  sub="low potential"
                />
              </View>
            </View>

            {/* 4 ── Week-over-week (only when data exists) */}
            {showWeek && (
              <View style={styles.section}>
                <SectionHeader title="Weekly Comparison" />
                <GlassCard padded radius={radii.xl}>
                  <View style={styles.weekRow}>
                    <View style={styles.weekCol}>
                      <Text style={styles.weekLabel}>THIS WEEK</Text>
                      <Text style={[styles.weekVal, { color: colors.accent }]}>
                        {A.thisWeekAvg}%
                      </Text>
                      <Text style={styles.weekSub}>avg score</Text>
                    </View>
                    <View style={styles.weekDivider} />
                    <View style={styles.weekMid}>
                      <Ionicons
                        name={weekDeltaPos ? 'arrow-up-circle' : 'arrow-down-circle'}
                        size={30}
                        color={weekDeltaPos ? colors.success : colors.danger}
                      />
                      <Text style={[styles.weekDelta, { color: weekDeltaPos ? colors.success : colors.danger }]}>
                        {weekDeltaPos ? '+' : ''}{weekDelta} pts
                      </Text>
                    </View>
                    <View style={styles.weekDivider} />
                    <View style={styles.weekCol}>
                      <Text style={styles.weekLabel}>LAST WEEK</Text>
                      <Text style={[styles.weekVal, { color: colors.textMuted }]}>
                        {A.lastWeekAvg}%
                      </Text>
                      <Text style={styles.weekSub}>avg score</Text>
                    </View>
                  </View>
                </GlassCard>
              </View>
            )}

            {/* 5 ── Top performing trends */}
            <View style={styles.section}>
              <SectionHeader title="Top Performing Trends" />
              <GlassCard padded radius={radii.xl}>
                {A.topTrends.length === 0 ? (
                  <EmptySection
                    icon="trophy-outline"
                    msg="No analyses yet. Search a trend to start building your leaderboard."
                  />
                ) : (
                  A.topTrends.map((item, i) => (
                    <TrendProgressRow
                      key={item?.id ?? i}
                      rank={i + 1}
                      name={safeName(item)}
                      score={safeScore(item)}
                      growth={safeGrowth(item)}
                    />
                  ))
                )}
              </GlassCard>
            </View>

            {/* 6 ── Growth distribution */}
            {A.total > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Growth Distribution" />
                <GlassCard padded radius={radii.xl}>
                  <View style={styles.distRow}>
                    <View style={styles.distItem}>
                      <View style={[styles.distDot, { backgroundColor: colors.success }]} />
                      <Text style={styles.distLabel}>Positive</Text>
                      <Text style={[styles.distVal, { color: colors.success }]}>{A.positiveCount}</Text>
                    </View>
                    <View style={styles.distItem}>
                      <View style={[styles.distDot, { backgroundColor: colors.danger }]} />
                      <Text style={styles.distLabel}>Negative</Text>
                      <Text style={[styles.distVal, { color: colors.danger }]}>{A.negativeCount}</Text>
                    </View>
                  </View>
                  {/* Combined bar: pos green / neg red */}
                  <View style={styles.combBar}>
                    <View
                      style={[
                        styles.combPos,
                        { flex: A.positiveCount + 1 },   // +1 avoids flex:0
                      ]}
                    />
                    <View
                      style={[
                        styles.combNeg,
                        { flex: A.negativeCount },
                      ]}
                    />
                  </View>
                  <Text style={styles.distMeta}>
                    {A.total} total · {A.avgGrowth >= 0 ? '+' : ''}{A.avgGrowth}% average growth
                  </Text>
                </GlassCard>
              </View>
            )}

            {/* 7 ── Recent analyses */}
            <View style={styles.section}>
              <SectionHeader title="Recent Analyses" />
              <GlassCard padded radius={radii.xl}>
                {A.recentItems.length === 0 ? (
                  <EmptySection
                    icon="time-outline"
                    msg="No analyses in your history yet. Search a trend to get started."
                  />
                ) : (
                  A.recentItems.map((item, i) => (
                    <RecentRow
                      key={item?.id ?? i}
                      item={item}
                      isLast={i === A.recentItems.length - 1}
                    />
                  ))
                )}
              </GlassCard>
            </View>

            {/* 8 ── Market intelligence */}
            <View style={[styles.section, { marginBottom: 0 }]}>
              <SectionHeader title="Market Intelligence" />
              <GlassCard padded radius={radii.xl}>
                <Text style={styles.marketText}>
                  Your analytics engine tracks real market momentum, competition pressure, audience
                  engagement, and trend saturation using live multi-source signals — Google Trends,
                  Reddit, YouTube, and AI opportunity scoring.
                </Text>
                {A.total > 0 && (
                  <View style={styles.mktStats}>
                    {[
                      { num: A.total,       lbl: 'analyses'      },
                      { num: A.highPotCount,lbl: 'high potential' },
                      { num: `${A.successRate}%`, lbl: 'success rate' },
                    ].map((s, i, arr) => (
                      <React.Fragment key={s.lbl}>
                        <View style={styles.mktStat}>
                          <Text style={styles.mktNum}>{s.num}</Text>
                          <Text style={styles.mktLbl}>{s.lbl}</Text>
                        </View>
                        {i < arr.length - 1 && <View style={styles.mktDivider} />}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </GlassCard>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  scroll:       { paddingHorizontal: spacing.xl },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.xl },
  overviewLabel:{ ...typography.micro, color: colors.textDim },
  title:        { ...typography.display, fontSize: 32, color: colors.text, marginTop: 4 },
  iconBtn:      { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  center:       { marginTop: 80, alignItems: 'center', gap: 14 },
  centerText:   { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  retryBtn:     { paddingHorizontal: 24, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  retryText:    { ...typography.body, color: colors.text, fontWeight: '600' },
  metricGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xl },
  section:      { marginBottom: spacing.xl },
  chartCard:    { overflow: 'hidden' },
  chart:        { borderRadius: radii.xl },
  insightRow:   { flexDirection: 'row', gap: 10 },
  weekRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  weekCol:      { alignItems: 'center', flex: 1 },
  weekLabel:    { ...typography.micro, color: colors.textDim },
  weekVal:      { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
  weekSub:      { ...typography.caption, color: colors.textFaint, marginTop: 3 },
  weekDivider:  { width: StyleSheet.hairlineWidth, height: 60, backgroundColor: colors.border },
  weekMid:      { alignItems: 'center', gap: 4 },
  weekDelta:    { fontSize: 13, fontWeight: '700' },
  distRow:      { flexDirection: 'row', gap: 20, marginBottom: 14 },
  distItem:     { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  distDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  distLabel:    { ...typography.caption, color: colors.textMuted, flex: 1 },
  distVal:      { fontSize: 17, fontWeight: '800' },
  combBar:      { height: 7, borderRadius: 3.5, overflow: 'hidden', flexDirection: 'row' },
  combPos:      { height: '100%', backgroundColor: colors.success, opacity: 0.72 },
  combNeg:      { height: '100%', backgroundColor: colors.danger,  opacity: 0.72 },
  distMeta:     { ...typography.caption, color: colors.textFaint, marginTop: 10, textAlign: 'center' },
  marketText:   { ...typography.body, color: colors.textMuted, lineHeight: 24 },
  mktStats:     { flexDirection: 'row', marginTop: 18, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  mktStat:      { flex: 1, alignItems: 'center' },
  mktNum:       { fontSize: 20, fontWeight: '800', color: colors.text },
  mktLbl:       { ...typography.caption, color: colors.textFaint, marginTop: 3 },
  mktDivider:   { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
