// src/components/NotificationsModal.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable,
  ScrollView, Platform, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, typography, spacing } from '../theme';

const PANEL_W   = Math.min(340, Dimensions.get('window').width - 32);
const PANEL_MAX = 420; // max height

/* Static mock notifications — realistic, clearly labelled as demo */
const MOCK = [
  {
    id: '1',
    icon: 'trending-up-outline',
    iconColor: colors.success,
    title: 'New trend detected',
    body: '"AI Voice Agents" score jumped to 92',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    icon: 'sparkles-outline',
    iconColor: colors.primaryLight,
    title: 'Analysis completed',
    body: 'Your "Micro SaaS Ideas" report is ready',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    icon: 'arrow-up-circle-outline',
    iconColor: colors.accent,
    title: 'Trend score increased',
    body: '"No Code Automation" rose +12 points',
    time: '3h ago',
    read: true,
  },
  {
    id: '4',
    icon: 'bar-chart-outline',
    iconColor: colors.warning,
    title: 'Weekly insights ready',
    body: 'Your weekly trend digest is available',
    time: '1d ago',
    read: true,
  },
];

function NotifCard({ item }) {
  return (
    <View style={[cardStyles.wrap, item.read && cardStyles.wrapRead]}>
      <View style={[cardStyles.iconWrap, { backgroundColor: `${item.iconColor}18` }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.titleRow}>
          <Text style={cardStyles.title} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={cardStyles.unreadDot} />}
        </View>
        <Text style={cardStyles.bodyText} numberOfLines={2}>{item.body}</Text>
        <Text style={cardStyles.time}>{item.time}</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrap:       { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  wrapRead:   { opacity: 0.65 },
  iconWrap:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body:       { flex: 1 },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  title:      { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  unreadDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, flexShrink: 0 },
  bodyText:   { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  time:       { ...typography.caption, color: colors.textFaint, marginTop: 3 },
});

export default function NotificationsModal({ visible, onClose }) {
  const insets   = useSafeAreaInsets();
  const opacity  = useRef(new Animated.Value(0)).current;
  const scaleY   = useRef(new Animated.Value(0.92)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleY,     { toValue: 1, speed: 28, bounciness: 3, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 28, bounciness: 3, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  /* top offset = safe area top + header row (~56px) */
  const topOffset = insets.top + 60;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'box-none' : 'none'}>
      {/* Tap-outside dismiss */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        pointerEvents={visible ? 'auto' : 'none'}
      />

      {/* Floating panel — anchored top-right */}
      <Animated.View
        style={[
          styles.panel,
          {
            top:   topOffset,
            right: spacing.xl,
            opacity,
            transform: [{ scaleY }, { translateY }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <BlurView
          intensity={Platform.OS === 'android' ? 40 : 60}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]}
        />
        <View style={[StyleSheet.absoluteFill, styles.bg, { borderRadius: radii.xl }]} />
        <View style={[StyleSheet.absoluteFill, styles.border, { borderRadius: radii.xl }]} pointerEvents="none" />
        <View style={styles.topHighlight} pointerEvents="none" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerRight}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{MOCK.filter((n) => !n.read).length}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textDim} />
            </Pressable>
          </View>
        </View>

        {/* List */}
        <ScrollView
          style={{ maxHeight: PANEL_MAX - 56 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {MOCK.map((item) => (
            <NotifCard key={item.id} item={item} />
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Tap a notification to open</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position:     'absolute',
    width:         PANEL_W,
    borderRadius:  radii.xl,
    overflow:      'hidden',
    // Shadow
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.55, shadowRadius: 24 },
      android: { elevation: 18 },
      default: {},
    }),
  },
  bg:           { backgroundColor: 'rgba(11,13,20,0.92)' },
  border:       { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong },
  topHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.glassTopHighlight, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title:        { ...typography.h3, color: colors.text, fontSize: 15 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: colors.accent },
  countText:    { ...typography.micro, color: colors.bg, fontSize: 10 },
  closeBtn:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
  footer:       { paddingVertical: 10, alignItems: 'center' },
  footerText:   { ...typography.caption, color: colors.textFaint },
});