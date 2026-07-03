// src/components/WelcomeModal.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, radii, typography } from '../theme';

export default function WelcomeModal({ name, onDismiss }) {
  // Three values total — overlay fade, card scale+slide
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale      = useRef(new Animated.Value(0.88)).current;
  const cardY          = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // ── Entrance: overlay first, then card ──────────────────────────────────
    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1, speed: 22, bounciness: 9, useNativeDriver: true,
        }),
        Animated.spring(cardY, {
          toValue: 0, speed: 20, bounciness: 6, useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ── Auto-dismiss at 2.8 s — long enough to read the name ───────────────
    const timer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: 260, useNativeDriver: true,
      }).start(() => onDismiss?.());
    }, 2800);

    return () => clearTimeout(timer);
  }, []); // empty — runs once, stable refs

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      {/* Tap anywhere to dismiss early */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: cardScale }, { translateY: cardY }] },
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'android' ? 30 : 52}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
        />
        <LinearGradient
          colors={colors.gradSurface}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
        />
        <View
          style={[StyleSheet.absoluteFill, styles.border, { borderRadius: radii.xxl }]}
          pointerEvents="none"
        />
        <View style={styles.topHighlight} pointerEvents="none" />

        <View style={styles.content}>
          <LinearGradient
            colors={colors.gradAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            <View style={styles.iconHighlight} pointerEvents="none" />
            <Ionicons name="sparkles" size={28} color="#fff" />
          </LinearGradient>

          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.sub}>Ready to validate your next big trend?</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 999,
  },
  card:         { width: 300, borderRadius: radii.xxl, overflow: 'hidden' },
  border:       { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong },
  topHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: colors.glassTopHighlight,
    borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
  },
  content:      { padding: 28, alignItems: 'center' },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  iconHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  greeting: { ...typography.h3, color: colors.textMuted, marginBottom: 4 },
  name:     {
    ...typography.h1, color: colors.text,
    fontSize: 26, marginBottom: 10, textAlign: 'center',
  },
  sub: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});