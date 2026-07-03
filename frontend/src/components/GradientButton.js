import React, { useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, typography, shadow } from '../theme';

/**
 * GradientButton v2 — purple→cyan gradient + inner top highlight.
 */
export default function GradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  fullWidth = false,
  disabled = false,
  style,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  const heights = { sm: 40, md: 50, lg: 58 };
  const fontSizes = { sm: 13, md: 15, lg: 16 };

  const Inner = (
    <View
      style={[
        styles.inner,
        { height: heights[size], paddingHorizontal: size === 'sm' ? 14 : 22 },
        fullWidth && styles.fullWidth,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={colors.text} style={styles.iconLeft} /> : null}
      <Text style={[styles.text, { fontSize: fontSizes[size] }]} numberOfLines={1}>
        {title}
      </Text>
      {trailingIcon ? (
        <Ionicons name={trailingIcon} size={18} color={colors.text} style={styles.iconRight} />
      ) : null}
    </View>
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], borderRadius: radii.pill },
        variant === 'primary' && shadow.glow,
        fullWidth && styles.fullWidth,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
        style={[styles.pressable, fullWidth && styles.fullWidth]}
      >
        {variant === 'primary' && (
          <>
            <LinearGradient
              colors={colors.gradAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
            />
            <View style={styles.topHighlight} pointerEvents="none" />
          </>
        )}
        {variant === 'subtle' && (
          <View style={[StyleSheet.absoluteFill, styles.subtle, { borderRadius: radii.pill }]} />
        )}
        {variant === 'ghost' && (
          <>
            <View style={[StyleSheet.absoluteFill, styles.ghost, { borderRadius: radii.pill }]} />
            <View style={styles.topHighlightSubtle} pointerEvents="none" />
          </>
        )}
        {Inner}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { borderRadius: radii.pill, overflow: 'hidden' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  text: { ...typography.bodyLg, fontWeight: '600', color: colors.text },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  fullWidth: { alignSelf: 'stretch' },
  subtle: {
    backgroundColor: 'rgba(124,108,240,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124,108,240,0.45)',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
  },
  topHighlightSubtle: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
  },
});
