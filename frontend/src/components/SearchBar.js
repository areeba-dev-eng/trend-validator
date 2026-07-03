import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  TextInput,
  Pressable,
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

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onMicPress,
  placeholder = 'Search trends, ideas, insights…',
  autoFocus = false,
}) {

  const [focused, setFocused] = useState(false);

  const focusAnim = useRef(
    new Animated.Value(0)
  ).current;

  const animateFocus = (to) => {
    Animated.timing(focusAnim, {
      toValue: to,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const borderOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.outer}>

      {/* FOCUS BORDER */}

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: borderOpacity,
            borderRadius: radii.xxl,
          },
        ]}
      >
        <LinearGradient
          colors={[
            '#7C6CF0',
            '#00D4FF',
            '#8B7CFF',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: radii.xxl,
            },
          ]}
        />
      </Animated.View>

      {/* INNER */}

      <View style={styles.inner}>

        <BlurView
          intensity={Platform.OS === 'android' ? 26 : 38}
          tint="dark"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radii.xxl,
            },
          ]}
        />

        <LinearGradient
          colors={[
            'rgba(255,255,255,0.06)',
            'rgba(255,255,255,0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radii.xxl,
            },
          ]}
        />

        {/* TOP HIGHLIGHT */}

        <View style={styles.topGlow} />

        {/* CONTENT */}

        <View style={styles.row}>

          <Ionicons
            name="search"
            size={22}
            color={
              focused
                ? colors.primaryLight
                : colors.textMuted
            }
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            autoFocus={autoFocus}
            returnKeyType="search"
            selectionColor={colors.primaryLight}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.38)"
            style={styles.input}
            onFocus={() => {
              setFocused(true);
              animateFocus(1);
            }}
            onBlur={() => {
              setFocused(false);
              animateFocus(0);
            }}
          />

          {/* MIC */}

          <Pressable
            onPress={onMicPress}
            hitSlop={10}
            style={styles.micBtn}
          >
            <Ionicons
              name="mic-outline"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>

          {/* SEND */}

          <Pressable
            onPress={onSubmit}
            hitSlop={10}
            style={styles.sendWrap}
          >

            <LinearGradient
              colors={[
                '#7C6CF0',
                '#00D4FF',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >

              <View style={styles.sendTopGlow} />

              <Ionicons
                name="arrow-up"
                size={18}
                color="#fff"
              />

            </LinearGradient>

          </Pressable>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  outer: {
    borderRadius: radii.xxl,

    padding: 1.5,

    overflow: 'hidden',
  },

  inner: {
    overflow: 'hidden',

    borderRadius: radii.xxl,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  topGlow: {
    position: 'absolute',

    top: 0,
    left: 16,
    right: 16,

    height: 1,

    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,

    paddingVertical:
      Platform.OS === 'ios'
        ? 18
        : 12,

    gap: 12,
  },

  input: {
    flex: 1,

    ...typography.bodyLg,

    color: colors.text,

    fontSize: 17,

    paddingVertical: 6,
  },

  micBtn: {
    padding: 4,
  },

  sendWrap: {
    overflow: 'hidden',
    borderRadius: 999,
  },

  sendBtn: {
    width: 42,
    height: 42,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
  },

  sendTopGlow: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    height: 1,

    backgroundColor: 'rgba(255,255,255,0.35)',
  },

});