// src/components/SidebarMenu.js  — adds logout loading state + proper error handling
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable,
  Platform, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_W = Math.min(300, Dimensions.get('window').width * 0.82);

const NAV_ITEMS = [
  { id: 'home',        icon: 'home-outline',       label: 'Home',           dest: 'Home' },
  { id: 'analytics',  icon: 'pie-chart-outline',   label: 'Analytics',      dest: 'Analytics' },
  { id: 'history',    icon: 'time-outline',        label: 'History',        dest: 'History' },
  { id: 'sub',        icon: 'card-outline',        label: 'Subscription',   dest: 'Subscription' },
  { id: 'help',       icon: 'help-circle-outline', label: 'Help & Support', dest: 'HelpSupport' },
];

export default function SidebarMenu({ visible, onClose, navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const slideX   = useRef(new Animated.Value(-SIDEBAR_W)).current;
  const overlayO = useRef(new Animated.Value(0)).current;
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideX,   { toValue: 0,          speed: 22, bounciness: 0, useNativeDriver: true }),
        Animated.timing(overlayO, { toValue: 1, duration: 200,       useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX,   { toValue: -SIDEBAR_W, duration: 210, useNativeDriver: true }),
        Animated.timing(overlayO, { toValue: 0,           duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleNavItem = (item) => {
    onClose();
    setTimeout(() => navigation.navigate(item.dest), 180);
  };

 const doLogout = async () => {
  try {
    setLoggingOut(true);

    await logout();

    // App.js automatically switches to AuthNavigator
    // when user becomes null

  } catch (err) {
    console.warn('Logout error:', err);
    Alert.alert('Sign Out Failed', 'Please try again.');
  } finally {
    setLoggingOut(false);
  }
};
  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: doLogout },
        ],
      );
    }, 350);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'box-none' : 'none'}>
      <Animated.View
        style={[styles.overlay, { opacity: overlayO }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideX }], paddingTop: insets.top }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <BlurView intensity={Platform.OS === 'android' ? 40 : 65} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.sidebarBg]} />
        <View style={[StyleSheet.absoluteFill, styles.sidebarBorder]} pointerEvents="none" />

        {/* User info */}
        <View style={styles.userSection}>
          <LinearGradient colors={colors.gradPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textDim} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Nav items */}
        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleNavItem(item)}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <View style={styles.navIconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.primaryLight} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed, loggingOut && { opacity: 0.55 }]}
        >
          <View style={[styles.navIconWrap, { backgroundColor: 'rgba(255,92,124,0.12)' }]}>
            {loggingOut
              ? <ActivityIndicator size="small" color={colors.danger} />
              : <Ionicons name="log-out-outline" size={18} color={colors.danger} />}
          </View>
          <Text style={[styles.navLabel, { color: colors.danger }]}>
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </Text>
        </Pressable>

        <Text style={[styles.version, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          Trend Validator · v1.0.0
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sidebar:      { position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_W, overflow: 'hidden' },
  sidebarBg:    { backgroundColor: 'rgba(11,13,20,0.90)' },
  sidebarBorder:{ borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.borderStrong },
  userSection:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 22 },
  avatar:       { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { color: '#fff', fontSize: 20, fontWeight: '700' },
  userName:     { ...typography.bodyLg, color: colors.text, fontWeight: '700' },
  userEmail:    { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  closeBtn:     { width: 34, height: 34, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, flexShrink: 0 },
  divider:      { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 20, marginVertical: 4 },
  navList:      { paddingVertical: 6 },
  navItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, gap: 14 },
  navItemPressed:{ backgroundColor: 'rgba(255,255,255,0.05)' },
  navIconWrap:  { width: 34, height: 34, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(139,124,255,0.14)' },
  navLabel:     { ...typography.bodyLg, color: colors.text, fontWeight: '600', flex: 1 },
  version:      { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: 'auto', paddingTop: 20 },
});