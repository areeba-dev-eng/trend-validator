import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

/**
 * Layered ambient background — v2
 *  - warmer charcoal-navy base
 *  - 4 radial blobs: top-right purple, mid-left deep violet,
 *    bottom-left cyan rim (hero accent), top-center subtle lift
 */
export default function BackgroundGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.bgDeep, colors.bg, '#0F0E1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bgPurple" cx="85%" cy="8%" rx="60%" ry="42%" fx="85%" fy="8%">
            <Stop offset="0%" stopColor="#7C6CF0" stopOpacity="0.45" />
            <Stop offset="55%" stopColor="#7C6CF0" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7C6CF0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bgDeepViolet" cx="-12%" cy="48%" rx="58%" ry="50%" fx="-12%" fy="48%">
            <Stop offset="0%" stopColor="#3D2EA8" stopOpacity="0.42" />
            <Stop offset="100%" stopColor="#3D2EA8" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bgCyan" cx="10%" cy="92%" rx="55%" ry="38%" fx="10%" fy="92%">
            <Stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bgLift" cx="50%" cy="-5%" rx="65%" ry="30%" fx="50%" fy="-5%">
            <Stop offset="0%" stopColor="#A99CFF" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#A99CFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgDeepViolet)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgPurple)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgCyan)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgLift)" />
      </Svg>
    </View>
  );
}
