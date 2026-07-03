import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  typography,
  spacing,
} from '../theme';

export default function SectionHeader({
  title,
  action,
  onPress,
}) {
  return (
    <View style={styles.row}>

      <Text style={styles.title}>
        {title}
      </Text>

      {!!action && (
        <Pressable
          onPress={onPress}
          hitSlop={10}
          style={styles.actionWrap}
        >
          <Text style={styles.actionText}>
            {action}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.primaryLight}
          />
        </Pressable>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: spacing.lg,
  },

  title: {
    ...typography.h1,
    color: colors.text,

    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 2,
  },

  actionText: {
    ...typography.body,

    color: colors.primaryLight,

    fontSize: 15,
    fontWeight: '700',
  },
});