// // frontend/src/screens/HomeScreen.js
// import React, { useState, useMemo, useEffect, useCallback } from 'react';
// import {
//   View, Text, ScrollView, StyleSheet, Pressable,
//   Platform, useWindowDimensions, RefreshControl,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import SidebarMenu         from '../components/SidebarMenu';
// import NotificationsModal  from '../components/NotificationsModal';

// import BackgroundGradient from '../components/BackgroundGradient';
// import SearchBar from '../components/SearchBar';
// import QuickAction from '../components/QuickAction';
// import SectionHeader from '../components/SectionHeader';
// import TrendCard from '../components/TrendCard';

// import { fetchLiveTrends, fetchHistory } from '../services/api';
// import { colors, radii, typography } from '../theme';

// /* ---------- Layout ---------- */
// const PAGE_PAD_H       = 20;
// const GRID_GAP         = 14;
// const BP_SMALL_MOBILE  = 380;
// const BP_DESKTOP       = 1024;
// const CARD_MIN_W       = 140;
// const CARD_MAX_W       = 240;
// const PREMIUM_TIER_W   = 220;
// const COMPACT_CARD_H   = 200;
// const PREMIUM_CARD_H   = 280;

// const TAB_BAR_CLEARANCE = Platform.select({ ios: 130, android: 120, default: 140 });

// function getColumns(w) {
//   if (w >= BP_DESKTOP)     return 4;
//   if (w < BP_SMALL_MOBILE) return 1;
//   return 2;
// }

// function computeCardSize(screenWidth) {
//   const cols   = getColumns(screenWidth);
//   const usable = Math.max(0, screenWidth - PAGE_PAD_H * 2);
//   const raw    = (usable - GRID_GAP * (cols - 1)) / cols;
//   const w      = Math.floor(Math.max(CARD_MIN_W, Math.min(CARD_MAX_W, raw)));
//   return { cardWidth: w, cardHeight: w >= PREMIUM_TIER_W ? PREMIUM_CARD_H : COMPACT_CARD_H };
// }

// function greetingFromHour() {
//   const h = new Date().getHours();
//   if (h < 12) return 'Good morning';
//   if (h < 18) return 'Good afternoon';
//   return 'Good evening';
// }

// /** Human-readable relative time from an ISO date string */
// function formatRelativeTime(iso) {
//   try {
//     if (!iso) return 'Recently';
//     const d = new Date(iso);
//     if (isNaN(d.getTime())) return 'Recently';
//     const diff = Date.now() - d.getTime();
//     const secs = Math.floor(diff / 1000);
//     if (secs < 60)  return 'Just now';
//     const mins = Math.floor(secs / 60);
//     if (mins < 60)  return `${mins}m ago`;
//     const hrs = Math.floor(mins / 60);
//     if (hrs < 24)   return `${hrs}h ago`;
//     const days = Math.floor(hrs / 24);
//     if (days === 1) return 'Yesterday';
//     if (days < 7)   return `${days} days ago`;
//     return d.toLocaleDateString();
//   } catch {
//     return 'Recently';
//   }
// }

// function normalizeTrend(item, index) {

//   /* REAL GROWTH CALCULATION */
//   let rawGrowth =
//     item?.growth ??
//     item?.growthRate ??
//     item?.stats?.slopePct ??
//     item?.velocity ??
//     item?.delta;

//   /* AGAR backend growth NA de to score se dynamic percentage banao */
//   if (rawGrowth === undefined || rawGrowth === null || isNaN(rawGrowth)) {

//     const score = Number(
//       item?.score ??
//       item?.trendScore ??
//       item?.marketDemand ??
//       item?.opportunity ??
//       item?.stats?.average ??
//       0
//     );

//     /* DIFFERENT REALISTIC VALUES */
//    rawGrowth = Math.round((score - 50) * 1.8);
//   }

//   rawGrowth = Math.max(-99, Math.min(99, Number(rawGrowth)));

//   const score = Math.min(
//     99,
//     Math.round(
//       Number(
//         item?.score ??
//         item?.trendScore ??
//         item?.marketDemand ??
//         item?.opportunity ??
//         item?.stats?.average ??
//         0
//       )
//     )
//   );

//   const change =
//     `${rawGrowth >= 0 ? '+' : '-'}${Math.abs(rawGrowth).toFixed(1)}%`;

//   return {
//     id: item?.id ? String(item.id) : String(index),

//     title:
//       item?.title ||
//       item?.keyword ||
//       item?.query ||
//       item?.name ||
//       'Live Trend',

//     subtitle:
//       item?.subtitle ||
//       item?.category ||
//       item?.niche ||
//       'Trending',

//     score,

//     change,

//     direction: rawGrowth < 0 ? 'down' : 'up',

//     series:
//       Array.isArray(item?.series) && item.series.length >= 2
//         ? item.series
//         : [10, 20],

//     color:
//       item?.color ||
//       ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'][index % 4],
//   };
// }

// // const BACKUP_TRENDS = [
// //   { id: '1', title: 'AI Customer Support Automation',    subtitle: 'Technology', score: 92, change: '+18.4%', direction: 'up',   color: '#8B5CF6', series: [10, 18, 15, 28, 35, 48, 62] },
// //   { id: '2', title: 'AI Email Outreach Automation',      subtitle: 'Lifestyle',  score: 78, change: '+9.2%',  direction: 'up',   color: '#06B6D4', series: [15, 12, 24, 34, 29, 44, 56] },
// //   { id: '3', title: 'AI Business Automation SAAS',       subtitle: 'Business',   score: 64, change: '-2.1%',  direction: 'down', color: '#EC4899', series: [8, 30, 46, 55, 44, 35, 38] },
// //   { id: '4', title: 'AI Content Repurposing Automation', subtitle: 'Marketing',  score: 88, change: '+24.6%', direction: 'up',   color: '#10B981', series: [10, 12, 20, 32, 41, 46, 54] },
// // ];

// /* ---------- Sub-components ---------- */

// function AppHeader({ onMenuPress, onNotifPress }) {
//   return (
//     <View style={hStyles.row}>
//       <Pressable hitSlop={10} style={hStyles.iconBtn} onPress={onMenuPress}>
//         <Ionicons name="menu" size={22} color={colors.text} />
//       </Pressable>
//       <View style={hStyles.brandPill}>
//         <BlurView
//           intensity={Platform.OS === 'android' ? 24 : 36}
//           tint="dark"
//           style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
//         />
//         <View style={hStyles.brandInner}>
//           <View style={hStyles.greenDot} />
//           <Text style={hStyles.brandText}>Trend Validator</Text>
//           <View style={hStyles.liveBadge}>
//             <Text style={hStyles.liveText}>LIVE</Text>
//           </View>
//         </View>
//       </View>
//        <Pressable hitSlop={10} style={hStyles.iconBtn} onPress={onNotifPress}>
//         <Ionicons name="notifications-outline" size={20} color={colors.text} />
//         <View style={hStyles.redDot} />
//       </Pressable>
//     </View>
//   );
// }

// function HistoryRow({ item, onPress }) {
//   return (
//     <Pressable onPress={onPress} style={styles.historyCard}>
//       <View style={styles.historyLeft}>
//         <View style={styles.historyIcon}>
//           <Ionicons name="sparkles-outline" size={20} color="#64F0D2" />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
//           <Text style={styles.historyTime}>{item.time}</Text>
//         </View>
//       </View>
//       <View style={styles.historyRight}>
//         <View style={styles.historyScore}>
//           <View style={styles.scoreDot} />
//           <Text style={styles.historyScoreText}>{item.score}</Text>
//         </View>
//         <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.45)" />
//       </View>
//     </Pressable>
//   );
// }

// /* ---------- Screen ---------- */

// export default function HomeScreen({ navigation }) {
//   const insets = useSafeAreaInsets();
//   const { width: screenWidth } = useWindowDimensions();

//   const [query,       setQuery]       = useState('');
//   const [menuVisible, setMenuVisible] = useState(false);
// const [notifVisible, setNotifVisible] = useState(false);
//   const [refreshing,  setRefreshing]  = useState(false);
//   const [trends, setTrends] = useState([]);
//   const [recentItems, setRecentItems] = useState([]);

//   const greeting  = useMemo(() => greetingFromHour(), []);
//   const { cardWidth, cardHeight } = useMemo(() => computeCardSize(screenWidth), [screenWidth]);

//   const submit = useCallback((value) => {
//     navigation.navigate('Results', { query: value || query || 'AI tools' });
//   }, [navigation, query]);

//   const loadTrends = useCallback(async () => {

//   try {

//     const response =
//       await fetchLiveTrends();

//     const data =
//       response?.data || response;

//     console.log(
//       'LIVE API RESPONSE:',
//       JSON.stringify(data, null, 2)
//     );

//     const raw =
//       data?.items ||
//       data?.trends ||
//       data?.data ||
//       (Array.isArray(data) ? data : []);

//     if (!Array.isArray(raw)) {

//       setTrends([]);
//       return;

//     }

//    const formatted = raw.map(normalizeTrend);
//     if (formatted.length > 0) {

//       setTrends(formatted);

//     } else {

//        setTrends([]);

//     }

//   } catch (error) {

//     console.log(
//       'LIVE TRENDS ERROR:',
//       error?.message
//     );

//     setTrends([]);

//   } finally {

//     setRefreshing(false);

//   }

// }, []);

  

//   /* Load last 4 history items for the Recent section */
//   const loadRecent = useCallback(async () => {
//     try {
//       const items = await fetchHistory({ limit: 4 });
//       const list  = Array.isArray(items) ? items : [];
//       setRecentItems(list.slice(0, 4).map((h) => ({
//         id:     h.id,
//         title:  h.query || 'Unknown',
//         time:   formatRelativeTime(h.createdAt),
//         score:  h.result?.score || 0,
//         result: h.result || null,   // carry stored result for instant view
//       })));
//     } catch { /* leave empty — section just won't render */ }
//   }, []);

//  useEffect(() => {

//   Promise.all([
//     loadTrends(),
//     loadRecent(),
//   ]);

// }, [loadTrends, loadRecent]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.all([loadTrends(), loadRecent()]);
//   }, [loadTrends, loadRecent]);

//   return (
//     <View style={styles.root}>
//       <BackgroundGradient />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} />
//         }
//         contentContainerStyle={{
//           paddingTop:    insets.top + 8,
//           paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
//         }}
//       >
//         <View style={[styles.padded, styles.headerWrap]}>
//   <AppHeader
//     onMenuPress={() => setMenuVisible(true)}
//     onNotifPress={() => setNotifVisible(true)}
//   />
// </View>

//         <View style={[styles.padded, styles.hero]}>
//           <Text style={styles.greeting}>{greeting}!</Text>
//           <Text style={styles.headline}>Validate trends{'\n'}before they go viral</Text>
//           <Text style={styles.subheadline}>
//             Analyze real-time market momentum, engagement, competition, and trend saturation.
//           </Text>
//         </View>

//         <View style={[styles.padded, styles.searchWrap]}>
//           <SearchBar value={query} onChangeText={setQuery} onSubmit={() => submit()} />
//         </View>

//         <ScrollView horizontal showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.actionsRow} style={styles.actionsScroll}>
//           <QuickAction icon="trending-up"       label="Trend Analysis"  onPress={() => submit()} />
//           <QuickAction icon="bulb-outline"      label="Generate Idea"   onPress={() => submit()} />
//           <QuickAction icon="bar-chart-outline" label="Market Insights" onPress={() => submit()} />
//           <QuickAction icon="rocket-outline"    label="Niche Finder"    onPress={() => submit()} />
//         </ScrollView>

//         <View style={[styles.padded, styles.trendingHeader]}>
//           <SectionHeader title="Trending Now" action="See all" />
//         </View>

//         <View style={styles.gridWrap}>
//           <View style={[styles.grid, { gap: GRID_GAP }]}>

//             {trends.length === 0 && (
//   <View style={{ paddingVertical: 40, alignItems: 'center' }}>
//     <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
//       No live trends available
//     </Text>
//   </View>
// )}


//             {trends.map((item) => (
//               <View key={item.id} style={{ width: cardWidth, height: cardHeight }}>
//                 <TrendCard
//                  title={item.title}
// subtitle={item.category}
// score={item.score}
// change={item.change}
// direction={item.direction}
// series={item.series}
// color={item.color}
//                   width={cardWidth}
//                   height={cardHeight}
//                   onPress={() => submit(item.title)}
//                 />
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Recent — only shown when history exists */}
//         {recentItems.length > 0 && (
//           <>
//             <View style={[styles.padded, styles.recentHeader]}>
//               <SectionHeader title="Recent" action="History" />
//             </View>
//             <View style={[styles.padded, styles.recentList]}>
//               {recentItems.map((item) => (
//                 <HistoryRow
//                   key={item.id}
//                   item={item}
//                   onPress={() => {
//                     if (item.result) {
//                       navigation.navigate('Results', { query: item.title, cachedResult: item.result });
//                     } else {
//                       submit(item.title);
//                     }
//                   }}
//                 />
//               ))}
//             </View>
//           </>
//         )}
//       </ScrollView>
//       <SidebarMenu
//   visible={menuVisible}
//   onClose={() => setMenuVisible(false)}
//   navigation={navigation}
// />

// <NotificationsModal
//   visible={notifVisible}
//   onClose={() => setNotifVisible(false)}
// />
//     </View>
//   );
// }

// /* ---------- Styles (unchanged) ---------- */
// const styles = StyleSheet.create({
//   root:    { flex: 1, backgroundColor: colors.bg },
//   padded:  { paddingHorizontal: PAGE_PAD_H },
//   headerWrap: { marginBottom: 18 },
//   hero:    { marginTop: 18 },
//   greeting: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.70)', marginBottom: 10 },
//   headline: { ...typography.display, fontSize: 38, lineHeight: 44, fontWeight: '800', color: colors.text, letterSpacing: -1.6, maxWidth: 420 },
//   subheadline: { ...typography.body, color: colors.textMuted, lineHeight: 23, marginTop: 16, maxWidth: 430 },
//   searchWrap:  { marginTop: 24 },
//   actionsScroll: { marginTop: 18 },
//   actionsRow: { gap: 14, paddingHorizontal: PAGE_PAD_H },
//   trendingHeader: { marginTop: 34 },
//   gridWrap: { marginTop: 4, paddingHorizontal: PAGE_PAD_H },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start' },
//   recentHeader: { marginTop: 34 },
//   recentList:   { gap: 12 },
//   historyCard: {
//     minHeight: 76, borderRadius: radii.xl, paddingHorizontal: 16, paddingVertical: 14,
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: StyleSheet.hairlineWidth,
//     borderColor: 'rgba(255,255,255,0.08)', gap: 12,
//   },
//   historyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
//   historyIcon:  { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(100,240,210,0.14)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(100,240,210,0.28)' },
//   historyTitle: { ...typography.bodyLg, color: colors.text, fontWeight: '700', fontSize: 15 },
//   historyTime:  { ...typography.caption, color: colors.textDim, marginTop: 2 },
//   historyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   historyScore: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: 'rgba(52,229,176,0.14)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(52,229,176,0.32)' },
//   scoreDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
//   historyScoreText: { ...typography.caption, color: colors.success, fontWeight: '800', fontSize: 11 },
// });

// const hStyles = StyleSheet.create({
//   row:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
//   iconBtn: { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.04)' },
//   brandPill: { flex: 1, maxWidth: 290, height: 44, borderRadius: radii.pill, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)', alignSelf: 'center' },
//   brandInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, height: '100%' },
//   greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
//   brandText: { color: colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
//   liveBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(52,229,176,0.20)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(52,229,176,0.40)' },
//   liveText: { color: colors.success, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
//   redDot:   { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D', borderWidth: 1.5, borderColor: colors.bg },
// });

// frontend/src/screens/HomeScreen.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Platform, useWindowDimensions, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SidebarMenu         from '../components/SidebarMenu';
import NotificationsModal  from '../components/NotificationsModal';

import BackgroundGradient from '../components/BackgroundGradient';
import SearchBar from '../components/SearchBar';
import QuickAction from '../components/QuickAction';
import SectionHeader from '../components/SectionHeader';
import TrendCard from '../components/TrendCard';

import { fetchLiveTrends, fetchHistory } from '../services/api';
import { colors, radii, typography } from '../theme';

/* ---------- Layout ---------- */
const PAGE_PAD_H       = 20;
const GRID_GAP         = 14;
const BP_SMALL_MOBILE  = 380;
const BP_DESKTOP       = 1024;
const CARD_MIN_W       = 140;
const CARD_MAX_W       = 240;
const PREMIUM_TIER_W   = 220;
const COMPACT_CARD_H   = 200;
const PREMIUM_CARD_H   = 280;

const TAB_BAR_CLEARANCE = Platform.select({ ios: 130, android: 120, default: 140 });

function getColumns(w) {
  if (w >= BP_DESKTOP)     return 4;
  if (w < BP_SMALL_MOBILE) return 1;
  return 2;
}

function computeCardSize(screenWidth) {
  const cols   = getColumns(screenWidth);
  const usable = Math.max(0, screenWidth - PAGE_PAD_H * 2);
  const raw    = (usable - GRID_GAP * (cols - 1)) / cols;
  const w      = Math.floor(Math.max(CARD_MIN_W, Math.min(CARD_MAX_W, raw)));
  return { cardWidth: w, cardHeight: w >= PREMIUM_TIER_W ? PREMIUM_CARD_H : COMPACT_CARD_H };
}

function greetingFromHour() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Human-readable relative time from an ISO date string */
function formatRelativeTime(iso) {
  try {
    if (!iso) return 'Recently';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Recently';
    const diff = Date.now() - d.getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60)  return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7)   return `${days} days ago`;
    return d.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

function normalizeTrend(item, index) {

  /* REAL GROWTH CALCULATION */
  let rawGrowth =
    item?.growth ??
    item?.growthRate ??
    item?.stats?.slopePct ??
    item?.velocity ??
    item?.delta;

  /* AGAR backend growth NA de to score se dynamic percentage banao */
  if (rawGrowth === undefined || rawGrowth === null || isNaN(rawGrowth)) {

    const score = Number(
      item?.score ??
      item?.trendScore ??
      item?.marketDemand ??
      item?.opportunity ??
      item?.stats?.average ??
      0
    );

    /* DIFFERENT REALISTIC VALUES */
   rawGrowth = Math.round((score - 50) * 1.8);
  }

  rawGrowth = Math.max(-99, Math.min(99, Number(rawGrowth)));

  const score = Math.min(
    99,
    Math.round(
      Number(
        item?.score ??
        item?.trendScore ??
        item?.marketDemand ??
        item?.opportunity ??
        item?.stats?.average ??
        0
      )
    )
  );

  const change =
    `${rawGrowth >= 0 ? '+' : '-'}${Math.abs(rawGrowth).toFixed(1)}%`;

  return {
    id: item?.id ? String(item.id) : String(index),

    title:
      item?.title ||
      item?.keyword ||
      item?.query ||
      item?.name ||
      'Live Trend',

    subtitle:
      item?.subtitle ||
      item?.category ||
      item?.niche ||
      'Trending',

    score,

    change,

    direction: rawGrowth < 0 ? 'down' : 'up',

    series:
      Array.isArray(item?.series) && item.series.length >= 2
        ? item.series
        : [10, 20],

    color:
      item?.color ||
      ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'][index % 4],
  };
}

// const BACKUP_TRENDS = [
//   { id: '1', title: 'AI Customer Support Automation',    subtitle: 'Technology', score: 92, change: '+18.4%', direction: 'up',   color: '#8B5CF6', series: [10, 18, 15, 28, 35, 48, 62] },
//   { id: '2', title: 'AI Email Outreach Automation',      subtitle: 'Lifestyle',  score: 78, change: '+9.2%',  direction: 'up',   color: '#06B6D4', series: [15, 12, 24, 34, 29, 44, 56] },
//   { id: '3', title: 'AI Business Automation SAAS',       subtitle: 'Business',   score: 64, change: '-2.1%',  direction: 'down', color: '#EC4899', series: [8, 30, 46, 55, 44, 35, 38] },
//   { id: '4', title: 'AI Content Repurposing Automation', subtitle: 'Marketing',  score: 88, change: '+24.6%', direction: 'up',   color: '#10B981', series: [10, 12, 20, 32, 41, 46, 54] },
// ];

/* ---------- Sub-components ---------- */

function AppHeader({ onMenuPress, onNotifPress }) {
  return (
    <View style={hStyles.row}>
      <Pressable hitSlop={10} style={hStyles.iconBtn} onPress={onMenuPress}>
        <Ionicons name="menu" size={22} color={colors.text} />
      </Pressable>
      <View style={hStyles.brandPill}>
        <BlurView
          intensity={Platform.OS === 'android' ? 24 : 36}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
        <View style={hStyles.brandInner}>
          <View style={hStyles.greenDot} />
          <Text style={hStyles.brandText}>Trend Validator</Text>
          <View style={hStyles.liveBadge}>
            <Text style={hStyles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>
       <Pressable hitSlop={10} style={hStyles.iconBtn} onPress={onNotifPress}>
        <Ionicons name="notifications-outline" size={20} color={colors.text} />
        <View style={hStyles.redDot} />
      </Pressable>
    </View>
  );
}

function HistoryRow({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <View style={styles.historyIcon}>
          <Ionicons name="sparkles-outline" size={20} color="#64F0D2" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.historyTime}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.historyRight}>
        <View style={styles.historyScore}>
          <View style={styles.scoreDot} />
          <Text style={styles.historyScoreText}>{item.score}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.45)" />
      </View>
    </Pressable>
  );
}

/* ---------- Screen ---------- */

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [query,       setQuery]       = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
const [notifVisible, setNotifVisible] = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [trends, setTrends] = useState([]);
  const [recentItems, setRecentItems] = useState([]);

  const greeting  = useMemo(() => greetingFromHour(), []);
  const { cardWidth, cardHeight } = useMemo(() => computeCardSize(screenWidth), [screenWidth]);

  const submit = useCallback((value) => {
    navigation.navigate('Results', { query: value || query || 'AI tools' });
  }, [navigation, query]);

  const loadTrends = useCallback(async () => {

  try {

    const response =
      await fetchLiveTrends();

    const data =
      response?.data || response;

    console.log(
      'LIVE API RESPONSE:',
      JSON.stringify(data, null, 2)
    );

    const raw =
      data?.items ||
      data?.trends ||
      data?.data ||
      (Array.isArray(data) ? data : []);

    if (!Array.isArray(raw)) {

      setTrends([]);
      return;

    }

   const formatted = raw.map(normalizeTrend);
    if (formatted.length > 0) {

      setTrends(formatted);

    } else {

       setTrends([]);

    }

  } catch (error) {

    console.log(
      'LIVE TRENDS ERROR:',
      error?.message
    );

    setTrends([]);

  } finally {

    setRefreshing(false);

  }

}, []);

  

  /* Load last 4 history items for the Recent section */
  const loadRecent = useCallback(async () => {
    try {
      const items = await fetchHistory({ limit: 4 });
      const list  = Array.isArray(items) ? items : [];
      setRecentItems(list.slice(0, 4).map((h) => ({
        id:     h.id,
        title:  h.query || 'Unknown',
        time:   formatRelativeTime(h.createdAt),
        score:  h.result?.score || 0,
        result: h.result || null,   // carry stored result for instant view
      })));
    } catch { /* leave empty — section just won't render */ }
  }, []);

 useEffect(() => {

  Promise.all([
    loadTrends(),
    loadRecent(),
  ]);

}, [loadTrends, loadRecent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTrends(), loadRecent()]);
  }, [loadTrends, loadRecent]);

  return (
    <View style={styles.root}>
      <BackgroundGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} />
        }
        contentContainerStyle={{
          paddingTop:    insets.top + 8,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
      >
        <View style={[styles.padded, styles.headerWrap]}>
  <AppHeader
    onMenuPress={() => setMenuVisible(true)}
    onNotifPress={() => setNotifVisible(true)}
  />
</View>

        <View style={[styles.padded, styles.hero]}>
          <Text style={styles.greeting}>{greeting}!</Text>
          <Text style={styles.headline}>Validate trends{'\n'}before they go viral</Text>
          <Text style={styles.subheadline}>
            Analyze real-time market momentum, engagement, competition, and trend saturation.
          </Text>
        </View>

        <View style={[styles.padded, styles.searchWrap]}>
          <SearchBar value={query} onChangeText={setQuery} onSubmit={() => submit()} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsRow} style={styles.actionsScroll}>
          <QuickAction icon="trending-up"       label="Trend Analysis"  onPress={() => submit()} />
          <QuickAction icon="bulb-outline"      label="Generate Idea"   onPress={() => navigation.navigate('GenerateIdea')} />
          <QuickAction icon="bar-chart-outline" label="Market Insights" onPress={() => navigation.navigate('MarketInsights')} />
          <QuickAction icon="rocket-outline"    label="Niche Finder"    onPress={() => navigation.navigate('NicheFinder')} />
        </ScrollView>

        <View style={[styles.padded, styles.trendingHeader]}>
          <SectionHeader title="Trending Now" action="See all" />
        </View>

        <View style={styles.gridWrap}>
          <View style={[styles.grid, { gap: GRID_GAP }]}>

            {trends.length === 0 && (
  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
      No live trends available
    </Text>
  </View>
)}


            {trends.map((item) => (
              <View key={item.id} style={{ width: cardWidth, height: cardHeight }}>
                <TrendCard
                 title={item.title}
subtitle={item.category}
score={item.score}
change={item.change}
direction={item.direction}
series={item.series}
color={item.color}
                  width={cardWidth}
                  height={cardHeight}
                  onPress={() => submit(item.title)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent — only shown when history exists */}
        {recentItems.length > 0 && (
          <>
            <View style={[styles.padded, styles.recentHeader]}>
              <SectionHeader title="Recent" action="History" />
            </View>
            <View style={[styles.padded, styles.recentList]}>
              {recentItems.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onPress={() => {
                    if (item.result) {
                      navigation.navigate('Results', { query: item.title, cachedResult: item.result });
                    } else {
                      submit(item.title);
                    }
                  }}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <SidebarMenu
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  navigation={navigation}
/>

<NotificationsModal
  visible={notifVisible}
  onClose={() => setNotifVisible(false)}
/>
    </View>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  padded:  { paddingHorizontal: PAGE_PAD_H },
  headerWrap: { marginBottom: 18 },
  hero:    { marginTop: 18 },
  greeting: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.70)', marginBottom: 10 },
  headline: { ...typography.display, fontSize: 38, lineHeight: 44, fontWeight: '800', color: colors.text, letterSpacing: -1.6, maxWidth: 420 },
  subheadline: { ...typography.body, color: colors.textMuted, lineHeight: 23, marginTop: 16, maxWidth: 430 },
  searchWrap:  { marginTop: 24 },
  actionsScroll: { marginTop: 18 },
  actionsRow: { gap: 14, paddingHorizontal: PAGE_PAD_H },
  trendingHeader: { marginTop: 34 },
  gridWrap: { marginTop: 4, paddingHorizontal: PAGE_PAD_H },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start' },
  recentHeader: { marginTop: 34 },
  recentList:   { gap: 12 },
  historyCard: {
    minHeight: 76, borderRadius: radii.xl, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)', gap: 12,
  },
  historyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  historyIcon:  { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(100,240,210,0.14)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(100,240,210,0.28)' },
  historyTitle: { ...typography.bodyLg, color: colors.text, fontWeight: '700', fontSize: 15 },
  historyTime:  { ...typography.caption, color: colors.textDim, marginTop: 2 },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyScore: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: 'rgba(52,229,176,0.14)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(52,229,176,0.32)' },
  scoreDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  historyScoreText: { ...typography.caption, color: colors.success, fontWeight: '800', fontSize: 11 },
});

const hStyles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.04)' },
  brandPill: { flex: 1, maxWidth: 290, height: 44, borderRadius: radii.pill, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)', alignSelf: 'center' },
  brandInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, height: '100%' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  brandText: { color: colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  liveBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(52,229,176,0.20)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(52,229,176,0.40)' },
  liveText: { color: colors.success, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  redDot:   { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D', borderWidth: 1.5, borderColor: colors.bg },
});