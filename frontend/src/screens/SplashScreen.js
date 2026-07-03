// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors, typography } from '../theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // ── Animated values (all useNativeDriver: true) ──────────────────────────
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY       = useRef(new Animated.Value(16)).current;
  const logoScale      = useRef(new Animated.Value(0.84)).current;

  // Three individual dot opacities — avoids array creation on render
  const dot0 = useRef(new Animated.Value(1.0)).current;
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;

  // Ref to hold the loop so we can stop it on unmount (no memory leak)
  const dotLoop = useRef(null);

  useEffect(() => {
    // ── 1. Entrance: opacity + slide + logo scale, all parallel ────────────
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.spring(contentY, {
        toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, speed: 11, bounciness: 7, useNativeDriver: true,
      }),
    ]).start(() => {
      // ── 2. Dot pulse loop — starts only after entrance finishes ──────────
      // Each step: one dot full opacity, other two dim. 300 ms per step.
      dotLoop.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot0, { toValue: 1.0, duration: 280, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 0.25, duration: 280, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.25, duration: 280, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot0, { toValue: 0.25, duration: 280, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 1.0, duration: 280, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.25, duration: 280, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot0, { toValue: 0.25, duration: 280, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 0.25, duration: 280, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 1.0, duration: 280, useNativeDriver: true }),
          ]),
        ]),
      );
      dotLoop.current.start();
    });

    return () => {
      dotLoop.current?.stop();
    };
  }, []); // empty — runs once, refs are stable

  return (
    <View style={styles.root}>
      {/* Background — identical layers to BackgroundGradient */}
      <LinearGradient
        colors={[colors.bgDeep, colors.bg, '#0F0E1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="sp1" cx="85%" cy="8%" rx="60%" ry="42%" fx="85%" fy="8%">
            <Stop offset="0%"   stopColor="#7C6CF0" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#7C6CF0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="sp2" cx="10%" cy="90%" rx="55%" ry="38%" fx="10%" fy="90%">
            <Stop offset="0%"   stopColor="#5EEAD4" stopOpacity="0.20" />
            <Stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#sp1)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#sp2)" />
      </Svg>

      {/* Content: opacity + slide up */}
      <Animated.View
        style={[
          styles.center,
          { opacity: contentOpacity, transform: [{ translateY: contentY }] },
        ]}
      >
        {/* Logo: independent scale spring */}
        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <LinearGradient
            colors={colors.gradAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            <View style={styles.iconHighlight} pointerEvents="none" />
            <Ionicons name="sparkles" size={36} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.appName}>Trend Validator</Text>
        <Text style={styles.tagline}>Validate trends before they go viral</Text>

        {/* Pulsing dots — Animated.View, no interpolation needed */}
        <View style={styles.dotRow}>
          <Animated.View style={[styles.dot, styles.dotSide, { opacity: dot0 }]} />
          <Animated.View style={[styles.dot, styles.dotCenter, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, styles.dotSide, { opacity: dot2 }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 90, height: 90, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 28, overflow: 'hidden',
  },
  iconHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  appName:   { ...typography.display, fontSize: 34, color: colors.text, textAlign: 'center', marginBottom: 10 },
  tagline:   { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  dotRow:    { flexDirection: 'row', gap: 8, marginTop: 48 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  dotCenter: { backgroundColor: colors.accent },
  dotSide:   { backgroundColor: colors.primaryLight },
});