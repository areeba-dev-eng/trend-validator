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

import {
  colors,
  radii,
  typography,
} from '../theme';

export default function QuickAction({
  icon,
  label,
  onPress,
  tint = colors.accent,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >

      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 5,
          }).start()
        }
        style={styles.wrap}
      >

        <BlurView
          intensity={Platform.OS === 'android' ? 25 : 38}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            'rgba(255,255,255,0.06)',
            'rgba(255,255,255,0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topGlow} />

        <View style={styles.row}>

          <View style={styles.iconWrap}>
            <Ionicons
              name={icon}
              size={15}
              color={tint}
            />
          </View>

          <Text
            numberOfLines={1}
            style={styles.label}
          >
            {label}
          </Text>

        </View>

      </Pressable>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',

    borderRadius: radii.pill,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',

    paddingHorizontal: 18,
    paddingVertical: 14,

    minHeight: 58,

    justifyContent: 'center',
  },

  topGlow: {
    position: 'absolute',

    top: 0,
    left: 12,
    right: 12,

    height: 1,

    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  iconWrap: {
    width: 28,
    height: 28,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(94,234,212,0.16)',
  },

  label: {
    ...typography.body,

    color: colors.text,

    fontSize: 17,
    fontWeight: '700',
  },
});