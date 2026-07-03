// frontend/src/components/CompetitorCard.js

import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  BlurView,
} from 'expo-blur';

import {
  colors,
  radii,
  typography,
} from '../theme';

const positionTone = {
  Leader: {
    bg:
      'rgba(52,229,176,0.18)',

    border:
      'rgba(52,229,176,0.40)',

    text:
      colors.success,
  },

  Challenger: {
    bg:
      'rgba(0,212,255,0.18)',

    border:
      'rgba(0,212,255,0.40)',

    text:
      colors.accent,
  },

  Niche: {
    bg:
      'rgba(139,124,255,0.18)',

    border:
      'rgba(139,124,255,0.40)',

    text:
      colors.primaryLight,
  },

  'New entrant': {
    bg:
      'rgba(255,181,71,0.18)',

    border:
      'rgba(255,181,71,0.40)',

    text:
      colors.warning,
  },
};

const growthTone = {
  Surging:
    colors.success,

  Growing:
    colors.accent,

  Stable:
    colors.primaryLight,

  Declining:
    colors.danger,
};

const growthIcon = {
  Surging:
    'flame',

  Growing:
    'trending-up',

  Stable:
    'remove',

  Declining:
    'trending-down',
};

const trafficLabel = {
  high:
    'HIGH TRAFFIC',

  mid:
    'MID TRAFFIC',

  low:
    'LOW TRAFFIC',
};

function safePopularity(n) {
  const num =
    Number(n);

  if (!Number.isFinite(num)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(num)
    )
  );
}

export default function CompetitorCard({
  name,
  website,
  domain,
  popularity = 0,
  position = 'Niche',
  pricing,
  growthStatus = 'Stable',
  trafficBand = 'mid',
}) {
  const tone =
    positionTone[position] ||
    positionTone.Niche;

  const popularityScore =
    safePopularity(
      popularity
    );

  const growthColor =
    growthTone[
      growthStatus
    ] ||
    colors.primaryLight;

  async function openWebsite() {
    if (!website) {
      return;
    }

    try {
      await Linking.openURL(
        website
      );
    } catch {}
  }

  return (
    <Pressable
      onPress={openWebsite}
      android_ripple={{
        color:
          'rgba(255,255,255,0.05)',
      }}
      style={styles.wrap}
    >
      <BlurView
        intensity={
          Platform.OS ===
          'android'
            ? 22
            : 34
        }
        tint="dark"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius:
              radii.xl,
          },
        ]}
      />

      <LinearGradient
        colors={
          colors.gradSurface
        }
        start={{
          x: 0.5,
          y: 0,
        }}
        end={{
          x: 0.5,
          y: 1,
        }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius:
              radii.xl,
          },
        ]}
      />

      <View
        style={[
          StyleSheet.absoluteFill,
          styles.border,
        ]}
        pointerEvents="none"
      />

      <View
        style={
          styles.topHighlight
        }
        pointerEvents="none"
      />

      <View style={styles.row}>
        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {(name || '?')
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.content
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={
                styles.name
              }
              numberOfLines={1}
            >
              {name || 'Unknown'}
            </Text>

            <View
              style={[
                styles.positionPill,
                {
                  backgroundColor:
                    tone.bg,

                  borderColor:
                    tone.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.positionText,
                  {
                    color:
                      tone.text,
                  },
                ]}
              >
                {position}
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.domain
            }
            numberOfLines={1}
          >
            {domain ||
              website ||
              'Unknown domain'}
          </Text>

          <View
            style={
              styles.popularityWrap
            }
          >
            <View
              style={
                styles.popularityTop
              }
            >
              <Text
                style={
                  styles.popularityLabel
                }
              >
                POPULARITY
              </Text>

              <Text
                style={
                  styles.popularityValue
                }
              >
                {
                  popularityScore
                }
                %
              </Text>
            </View>

            <View
              style={
                styles.popTrack
              }
            >
              <LinearGradient
                colors={
                  popularityScore >=
                  75
                    ? colors.gradSuccess
                    : popularityScore >=
                      50
                    ? colors.gradAccent
                    : colors.gradDanger
                }
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={[
                  styles.popFill,
                  {
                    width:
                      `${popularityScore}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={
              styles.metaRow
            }
          >
            {pricing ? (
              <MetaPill
                icon="pricetag-outline"
                label={pricing}
              />
            ) : null}

            <MetaPill
              icon={
                growthIcon[
                  growthStatus
                ] ||
                'remove'
              }
              label={
                growthStatus
              }
              color={
                growthColor
              }
            />

            <MetaPill
              icon="globe-outline"
              label={
                trafficLabel[
                  trafficBand
                ] ||
                'MID TRAFFIC'
              }
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MetaPill({
  icon,
  label,
  color =
    colors.textMuted,
}) {
  return (
    <View
      style={
        styles.metaPill
      }
    >
      <Ionicons
        name={icon}
        size={11}
        color={color}
      />

      <Text
        style={[
          styles.metaText,
          {
            color,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrap: {
      borderRadius:
        radii.xl,

      overflow: 'hidden',

      padding: 14,

      minHeight: 100,
    },

    border: {
      borderRadius:
        radii.xl,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        colors.border,
    },

    topHighlight: {
      position: 'absolute',

      top: 0,
      left: 0,
      right: 0,

      height: 1,

      backgroundColor:
        colors.glassTopHighlight,

      opacity: 0.7,
    },

    row: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 12,
    },

    avatar: {
      width: 42,
      height: 42,

      borderRadius:
        radii.md,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(139,124,255,0.18)',

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        'rgba(139,124,255,0.30)',
    },

    avatarText: {
      ...typography.h3,

      color:
        colors.primaryLight,

      fontWeight: '800',
    },

    content: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: 'row',

      alignItems:
        'center',

      gap: 8,

      marginBottom: 3,
    },

    name: {
      ...typography.bodyLg,

      color:
        colors.text,

      fontWeight: '700',

      flexShrink: 1,
    },

    positionPill: {
      paddingHorizontal: 8,

      paddingVertical: 3,

      borderRadius:
        radii.pill,

      borderWidth:
        StyleSheet.hairlineWidth,

      flexShrink: 0,
    },

    positionText: {
      fontSize: 9,

      fontWeight: '800',

      letterSpacing: 0.6,
    },

    domain: {
      ...typography.caption,

      color:
        colors.textDim,

      marginBottom: 10,
    },

    popularityWrap: {
      marginBottom: 10,
    },

    popularityTop: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      marginBottom: 6,
    },

    popularityLabel: {
      ...typography.caption,

      color:
        colors.textMuted,

      fontSize: 10,

      letterSpacing: 0.6,
    },

    popularityValue: {
      ...typography.caption,

      color:
        colors.text,

      fontWeight: '700',
    },

    popTrack: {
      height: 5,

      borderRadius:
        radii.pill,

      backgroundColor:
        'rgba(255,255,255,0.06)',

      overflow: 'hidden',
    },

    popFill: {
      height: '100%',

      borderRadius:
        radii.pill,
    },

    metaRow: {
      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 6,
    },

    metaPill: {
      flexDirection: 'row',

      alignItems:
        'center',

      gap: 4,

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius:
        radii.pill,

      backgroundColor:
        'rgba(255,255,255,0.04)',

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        'rgba(255,255,255,0.08)',

      maxWidth: '100%',
    },

    metaText: {
      ...typography.caption,

      fontSize: 10,

      fontWeight: '600',

      letterSpacing: 0.3,
    },
  });