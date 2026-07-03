// // src/navigation/CustomTabBar.js
// import React, { useRef, useCallback } from 'react';
// import {
//   View, Text, Pressable, StyleSheet, Platform, Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { colors, radii, shadow, typography } from '../theme';

// const ICONS = {
//   Home:      { active: 'home',      inactive: 'home-outline' },
//   Analytics: { active: 'pie-chart', inactive: 'pie-chart-outline' },
//   History:   { active: 'time',      inactive: 'time-outline' },
//   Profile:   { active: 'person',    inactive: 'person-outline' },
// };

// export default function CustomTabBar({ state, navigation }) {
//   const insets = useSafeAreaInsets();

//   // FAB spring scale — one Animated.Value, stable ref
//   const fabScale = useRef(new Animated.Value(1)).current;

//   const onSearchPress = useCallback(() => {
//     navigation.getParent()?.navigate('Search');
//   }, [navigation]);

//   const onFabPressIn = useCallback(() => {
//     Animated.spring(fabScale, {
//       toValue: 0.91, speed: 40, bounciness: 0, useNativeDriver: true,
//     }).start();
//   }, []); // fabScale is a ref — stable, no dep needed

//   const onFabPressOut = useCallback(() => {
//     Animated.spring(fabScale, {
//       toValue: 1, speed: 28, bounciness: 7, useNativeDriver: true,
//     }).start();
//   }, []);

//   const tabs = state.routes.map((route, idx) => ({
//     name:    route.name,
//     key:     route.key,
//     focused: state.index === idx,
//   }));

//   return (
//     <View
//       // Preserve original SafeArea logic exactly
//       style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
//       pointerEvents="box-none"
//     >
//       <View style={[styles.barOuter, shadow.cardDeep]}>
//         <BlurView
//           intensity={Platform.OS === 'android' ? 32 : 50}
//           tint="dark"
//           style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
//         />
//         <View style={[StyleSheet.absoluteFill, styles.barTint,   { borderRadius: radii.xxl }]} />
//         <LinearGradient
//           colors={colors.gradSurface}
//           start={{ x: 0.5, y: 0 }}
//           end={{ x: 0.5, y: 1 }}
//           style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
//         />
//         <View
//           style={[StyleSheet.absoluteFill, styles.barBorder, { borderRadius: radii.xxl }]}
//           pointerEvents="none"
//         />
//         <View style={styles.topHighlight} pointerEvents="none" />

//         <View style={styles.row}>
//           {tabs.slice(0, 2).map((tab) => (
//             <TabButton key={tab.key} tab={tab} navigation={navigation} />
//           ))}
//           <View style={styles.fabSpacer} />
//           {tabs.slice(2).map((tab) => (
//             <TabButton key={tab.key} tab={tab} navigation={navigation} />
//           ))}
//         </View>
//       </View>

//       {/* FAB — animated wrapper, Pressable inside keeps hitSlop working */}
//       <Animated.View
//         style={[styles.fab, shadow.glowCyan, { transform: [{ scale: fabScale }] }]}
//         pointerEvents="box-none"
//       >
//         <Pressable
//           onPress={onSearchPress}
//           onPressIn={onFabPressIn}
//           onPressOut={onFabPressOut}
//           hitSlop={6}
//           style={styles.fabPressable}
//         >
//           <LinearGradient
//             colors={colors.gradAccent}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.fabGrad}
//           >
//             <View style={styles.fabTopHighlight} pointerEvents="none" />
//             <Ionicons name="search" size={22} color="#fff" />
//           </LinearGradient>
//         </Pressable>
//       </Animated.View>
//     </View>
//   );
// }

// // ── TabButton: self-contained, one Animated.Value per instance ──────────────
// function TabButton({ tab, navigation }) {
//   const scale   = useRef(new Animated.Value(1)).current;
//   const iconSet = ICONS[tab.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

//   const onPress = useCallback(() => {
//     if (!tab.focused) navigation.navigate(tab.name);
//   }, [tab.focused, tab.name, navigation]);

//   const onPressIn = useCallback(() => {
//     Animated.spring(scale, {
//       toValue: 0.86, speed: 50, bounciness: 0, useNativeDriver: true,
//     }).start();
//   }, []); // scale ref is stable

//   const onPressOut = useCallback(() => {
//     Animated.spring(scale, {
//       toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true,
//     }).start();
//   }, []);

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={onPressIn}
//       onPressOut={onPressOut}
//       style={styles.tab}
//       hitSlop={6}
//     >
//       <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
//         <Ionicons
//           name={tab.focused ? iconSet.active : iconSet.inactive}
//           size={22}
//           color={tab.focused ? colors.accent : colors.textDim}
//         />
//         <Text style={[styles.tabLabel, tab.focused && styles.tabLabelActive]}>
//           {tab.name}
//         </Text>
//       </Animated.View>

//       {tab.focused && <View style={styles.activeDot} />}
//     </Pressable>
//   );
// }

// // ── Styles — all size/spacing values identical to original ──────────────────
// const styles = StyleSheet.create({
//   wrap: {
//     position: 'absolute', left: 0, right: 0, bottom: 0,
//     paddingHorizontal: 16,
//     alignItems: 'center',
//   },
//   barOuter: {
//     width: '100%',
//     height: 70,          // unchanged — screens depend on paddingBottom: 140
//     borderRadius: radii.xxl,
//     overflow: 'hidden',
//   },
//   barTint:      { backgroundColor: 'rgba(15,14,30,0.55)' },
//   barBorder:    { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong },
//   topHighlight: {
//     position: 'absolute', top: 0, left: 0, right: 0, height: 1,
//     backgroundColor: colors.glassTopHighlight,
//     borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
//   },
//   row: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 3,
//     paddingVertical: 8,
//   },
//   tabInner:       { alignItems: 'center', gap: 3 },
//   tabLabel:       { ...typography.caption, color: colors.textDim, fontSize: 10 },
//   tabLabelActive: { color: colors.accent, fontWeight: '700' },
//   activeDot: {
//     position: 'absolute', bottom: 2,
//     width: 4, height: 4, borderRadius: 2,
//     backgroundColor: colors.accent,
//   },
//   fabSpacer: { width: 64 },   // unchanged
//   fab: {
//     position: 'absolute',
//     bottom: 38,               // unchanged
//     alignSelf: 'center',
//     width: 60,                // unchanged
//     height: 60,               // unchanged
//     borderRadius: 30,
//   },
//   fabPressable: {
//     width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
//   },
//   fabGrad: {
//     width: 60, height: 60, borderRadius: 30,
//     alignItems: 'center', justifyContent: 'center',
//     borderWidth: 2, borderColor: 'rgba(255,255,255,0.16)',
//     overflow: 'hidden',
//   },
//   fabTopHighlight: {
//     position: 'absolute', top: 0, left: 0, right: 0, height: 2,
//     backgroundColor: 'rgba(255,255,255,0.30)',
//   },
// });

// src/navigation/CustomTabBar.js
import React, { useRef, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadow, typography } from '../theme';

const ICONS = {
  Home:      { active: 'home',      inactive: 'home-outline' },
  Analytics: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  History:   { active: 'time',      inactive: 'time-outline' },
  Profile:   { active: 'person',    inactive: 'person-outline' },
};

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  const fabScale = useRef(new Animated.Value(1)).current;

  const onSearchPress = useCallback(() => {
    navigation.getParent()?.navigate('Search');
  }, [navigation]);

  const onFabPressIn = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 0.91, speed: 40, bounciness: 0, useNativeDriver: true,
    }).start();
  }, []);

  const onFabPressOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1, speed: 28, bounciness: 7, useNativeDriver: true,
    }).start();
  }, []);

  const tabs = state.routes.map((route, idx) => ({
    name:    route.name,
    key:     route.key,
    focused: state.index === idx,
  }));

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={[styles.barOuter, shadow.cardDeep]} pointerEvents="box-none">
        <BlurView
          intensity={Platform.OS === 'android' ? 32 : 50}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
          pointerEvents="none"
        />
        <View
          style={[StyleSheet.absoluteFill, styles.barTint, { borderRadius: radii.xxl }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={colors.gradSurface}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xxl }]}
          pointerEvents="none"
        />
        <View
          style={[StyleSheet.absoluteFill, styles.barBorder, { borderRadius: radii.xxl }]}
          pointerEvents="none"
        />
        <View style={styles.topHighlight} pointerEvents="none" />

        <View style={styles.row} pointerEvents="box-none">
          {tabs.slice(0, 2).map((tab) => (
            <TabButton key={tab.key} tab={tab} navigation={navigation} />
          ))}
          <View style={styles.fabSpacer} pointerEvents="none" />
          {tabs.slice(2).map((tab) => (
            <TabButton key={tab.key} tab={tab} navigation={navigation} />
          ))}
        </View>
      </View>

      <Animated.View
        style={[styles.fab, shadow.glowCyan, { transform: [{ scale: fabScale }] }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={onSearchPress}
          onPressIn={onFabPressIn}
          onPressOut={onFabPressOut}
          hitSlop={6}
          style={styles.fabPressable}
        >
          <LinearGradient
            colors={colors.gradAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGrad}
          >
            <View style={styles.fabTopHighlight} pointerEvents="none" />
            <Ionicons name="search" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function TabButton({ tab, navigation }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const iconSet = ICONS[tab.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

  const onPress = useCallback(() => {
    if (!tab.focused) navigation.navigate(tab.name);
  }, [tab.focused, tab.name, navigation]);

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.86, speed: 50, bounciness: 0, useNativeDriver: true,
    }).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.tab}
      hitSlop={6}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <Ionicons
          name={tab.focused ? iconSet.active : iconSet.inactive}
          size={22}
          color={tab.focused ? colors.accent : colors.textDim}
        />
        <Text style={[styles.tabLabel, tab.focused && styles.tabLabelActive]}>
          {tab.name}
        </Text>
      </Animated.View>

      {tab.focused && <View style={styles.activeDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  barOuter: {
    width: '100%',
    height: 70,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  barTint:      { backgroundColor: 'rgba(15,14,30,0.55)' },
  barBorder:    { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong },
  topHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: colors.glassTopHighlight,
    borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  tabInner:       { alignItems: 'center', gap: 3 },
  tabLabel:       { ...typography.caption, color: colors.textDim, fontSize: 10 },
  tabLabelActive: { color: colors.accent, fontWeight: '700' },
  activeDot: {
    position: 'absolute', bottom: 2,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: colors.accent,
  },
  fabSpacer: { width: 64 },
  fab: {
    position: 'absolute',
    bottom: 38,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fabPressable: {
    width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
  },
  fabGrad: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  fabTopHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
});