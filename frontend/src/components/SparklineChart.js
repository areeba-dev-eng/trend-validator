// frontend/src/components/SparklineChart.js

import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  RadialGradient as SvgRadial,
} from 'react-native-svg';

import {
  colors,
} from '../theme';

import {
  pointsFromValues,
  smoothPath,
  areaPath,
} from '../utils/charts';

/**
 * PREMIUM LIVE SPARKLINE
 * stable for real API data
 * UI-safe
 * no blank graphs
 */

export default function SparklineChart({
  values,
  width = 160,
  height = 60,
  color = colors.accent,
  showDot = true,
  areaOpacity = 0.45,
  strokeWidth = 2,
  glow = false,
}) {

  const safeValues =
    Array.isArray(values) &&
    values.length >= 2
      ? values.map((v) =>
          Number(v) || 0
        )
      : [
          12,
          18,
          22,
          35,
          44,
          58,
          76,
        ];

  const pts =
    pointsFromValues(
      safeValues,
      width,
      height,
      6
    );

  if (
    !pts ||
    pts.length < 2
  ) {
    return (
      <View
        style={{
          width,
          height,
        }}
      />
    );
  }

  const last =
    pts[
      pts.length - 1
    ];

  const safeColor =
    color ||
    colors.accent;

  const id =
    `${Math.round(width)}-${Math.round(height)}-${safeColor
      .replace('#', '')
      .replace(
        /[^a-zA-Z0-9]/g,
        ''
      )}`;

  return (
    <View
      style={{
        width,
        height,
      }}
    >
      <Svg
        width={width}
        height={height}
      >
        <Defs>

          {/* AREA */}

          <LinearGradient
            id={`fill-${id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop
              offset="0%"
              stopColor={
                safeColor
              }
              stopOpacity={
                areaOpacity
              }
            />

            <Stop
              offset="60%"
              stopColor={
                safeColor
              }
              stopOpacity={
                areaOpacity *
                0.35
              }
            />

            <Stop
              offset="100%"
              stopColor={
                safeColor
              }
              stopOpacity={0}
            />
          </LinearGradient>

          {/* LINE */}

          <LinearGradient
            id={`stroke-${id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <Stop
              offset="0%"
              stopColor={
                safeColor
              }
              stopOpacity={0.55}
            />

            <Stop
              offset="60%"
              stopColor={
                safeColor
              }
              stopOpacity={0.95}
            />

            <Stop
              offset="100%"
              stopColor="#FFFFFF"
              stopOpacity={1}
            />
          </LinearGradient>

          {/* GLOW */}

          {glow && (
            <SvgRadial
              id={`halo-${id}`}
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop
                offset="0%"
                stopColor={
                  safeColor
                }
                stopOpacity={0.55}
              />

              <Stop
                offset="60%"
                stopColor={
                  safeColor
                }
                stopOpacity={0.18}
              />

              <Stop
                offset="100%"
                stopColor={
                  safeColor
                }
                stopOpacity={0}
              />
            </SvgRadial>
          )}
        </Defs>

        {/* AREA PATH */}

        <Path
          d={areaPath(
            pts,
            height
          )}
          fill={`url(#fill-${id})`}
        />

        {/* MAIN LINE */}

        <Path
          d={smoothPath(
            pts
          )}
          stroke={`url(#stroke-${id})`}
          strokeWidth={
            strokeWidth
          }
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* END DOT */}

        {showDot && (
          <>
            {glow && (
              <Circle
                cx={last.x}
                cy={last.y}
                r={14}
                fill={`url(#halo-${id})`}
              />
            )}

            <Circle
              cx={last.x}
              cy={last.y}
              r={6}
              fill={
                safeColor
              }
              opacity={0.30}
            />

            <Circle
              cx={last.x}
              cy={last.y}
              r={3.2}
              fill="#FFFFFF"
            />
          </>
        )}
      </Svg>
    </View>
  );
}

export const sparkStyles =
  StyleSheet.create({});