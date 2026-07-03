import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Circle, G } from 'react-native-svg';
import { colors, typography } from '../theme';

/**
 * ScoreRing v2 — purple→cyan gradient stroke + inner halo.
 */
export default function ScoreRing({ value = 87, size = 180, stroke = 14, label = 'POTENTIAL' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const offset = c * (1 - v / 100);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="55%" stopColor={colors.primaryLight} />
            <Stop offset="100%" stopColor={colors.accent} />
          </LinearGradient>
          <RadialGradient id="ringHalo" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0" />
            <Stop offset="80%" stopColor={colors.accent} stopOpacity="0.10" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r - stroke / 2} fill="url(#ringHalo)" />
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{Math.round(v)}</Text>
        <Text style={styles.percent}>%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { ...typography.display, fontSize: 52, lineHeight: 56, color: colors.text },
  percent: { position: 'absolute', right: -20, top: 6, ...typography.h3, color: colors.textMuted },
  label: { ...typography.micro, marginTop: 2 },
});
