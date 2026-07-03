import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadow } from '../theme';

/**
 * GlassCard v2 — premium glass surface
 * Layers (bottom→top):
 *   1. BlurView (backdrop frost)
 *   2. base tint
 *   3. surface gradient overlay (top-lit)
 *   4. content
 *   5. border ring + 1px top inner highlight (rim light)
 */
export default function GlassCard({
  intensity = 40,
  tint = 'dark',
  padded = false,
  radius = radii.xl,
  border = true,
  style,
  children,
}) {
  return (
    <View style={[styles.wrap, { borderRadius: radius }, shadow.card, style]}>
      <BlurView
        intensity={Platform.OS === 'android' ? Math.min(intensity, 30) : intensity}
        tint={tint}
        style={[styles.fill, { borderRadius: radius }]}
      />
      <View style={[styles.fill, styles.tintBase, { borderRadius: radius }]} />
      <LinearGradient
        colors={colors.gradSurface}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.fill, { borderRadius: radius }]}
      />
      {border && (
        <>
          <View
            style={[
              styles.fill,
              {
                borderRadius: radius,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
              },
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.topHighlight,
              { borderTopLeftRadius: radius, borderTopRightRadius: radius },
            ]}
            pointerEvents="none"
          />
        </>
      )}
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: 'transparent' },
  fill: { ...StyleSheet.absoluteFillObject },
  tintBase: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(20,18,40,0.55)' : colors.glassBase,
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: colors.glassTopHighlight,
    opacity: 0.9,
  },
  content: { position: 'relative' },
  padded: { padding: 18 },
});
