import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, radii, typography } from '../theme';

/**
 * StatPill v2 — top highlight, surface gradient, cyan default tint.
 */
export default function StatPill({ icon, label, value, tone = colors.accent }) {
  return (
    <View style={styles.wrap}>
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
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(94,234,212,0.14)' }]}>
          <Ionicons name={icon} size={14} color={tone} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
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
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  iconWrap: {
    width: 28, height: 28, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(94,234,212,0.25)',
  },
  label: { ...typography.micro, color: colors.textDim },
  value: { ...typography.h3, color: colors.text, marginTop: 2 },
});
