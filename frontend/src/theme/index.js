// import { Platform } from 'react-native';

// /**
//  * Design tokens — v2 (premium glass dark)
//  * --------------------------------------------------------------
//  * Reference targets: warm charcoal-navy base, cyan-led glow,
//  * top-inner-highlight on every glass surface, soft directional shadow.
//  * --------------------------------------------------------------
//  */

// export const colors = {
//   // ── Base surfaces ────────────────────────────────────────────────
//   bg: '#0E1018',
//   bgDeep: '#08090F',
//   bgElev: '#151826',
//   bgElev2: '#1B1F30',
//   bgElev3: '#22263A',

//   // ── Brand ────────────────────────────────────────────────────────
//   primary: '#7C6CF0',
//   primaryLight: '#A99CFF',
//   primaryDeep: '#4B3BC9',
//   primaryGlow: 'rgba(124,108,240,0.45)',

//   // ── Accents (cyan promoted to hero glow) ─────────────────────────
//   accent: '#5EEAD4',
//   accentBright: '#22D3EE',
//   accentDeep: '#0891B2',
//   accentGlow: 'rgba(94,234,212,0.40)',

//   // ── Semantic ─────────────────────────────────────────────────────
//   success: '#34E5B0',
//   warning: '#FFB547',
//   danger: '#FF5C7C',
//   pink: '#FF7AC6',

//   // ── Text ─────────────────────────────────────────────────────────
//   text: '#FFFFFF',
//   textMuted: 'rgba(255,255,255,0.68)',
//   textDim: 'rgba(255,255,255,0.42)',
//   textFaint: 'rgba(255,255,255,0.22)',

//   // ── Glass system ─────────────────────────────────────────────────
//   glassBase: 'rgba(255,255,255,0.04)',
//   glassStrong: 'rgba(255,255,255,0.07)',
//   glassTopHighlight: 'rgba(255,255,255,0.18)',
//   glassBottomShade: 'rgba(0,0,0,0.22)',
//   border: 'rgba(255,255,255,0.07)',
//   borderStrong: 'rgba(255,255,255,0.14)',

//   // ── Surface gradients ────────────────────────────────────────────
//   gradSurface: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'],
//   gradSurfaceDeep: ['rgba(255,255,255,0.07)', 'rgba(0,0,0,0.18)'],

//   // ── Brand gradients ──────────────────────────────────────────────
//   gradPrimary: ['#7C6CF0', '#A99CFF'],
//   gradAccent: ['#7C6CF0', '#5EEAD4'],
//   gradCyan: ['#22D3EE', '#5EEAD4'],
//   gradSuccess: ['#34E5B0', '#5EEAD4'],
//   gradDanger: ['#FF5C7C', '#FF7AC6'],
//   gradWarmGlow: ['rgba(124,108,240,0.18)', 'rgba(94,234,212,0.05)'],

//   // ── Legacy aliases (kept for any existing references) ────────────
//   gradCard: ['rgba(124,108,240,0.18)', 'rgba(169,156,255,0.04)'],
//   glass: 'rgba(255,255,255,0.05)',
// };

// export const radii = {
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 22,
//   xxl: 28,
//   xxxl: 32,
//   pill: 999,
// };

// export const spacing = {
//   xxs: 2,
//   xs: 4,
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 20,
//   xxl: 28,
//   xxxl: 36,
//   huge: 48,
// };

// const sysFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

// export const typography = {
//   display: { fontFamily: sysFont, fontSize: 36, fontWeight: '700', letterSpacing: -1.2, lineHeight: 42, color: colors.text },
//   h1: { fontFamily: sysFont, fontSize: 28, fontWeight: '700', letterSpacing: -0.6, lineHeight: 34, color: colors.text },
//   h2: { fontFamily: sysFont, fontSize: 22, fontWeight: '700', letterSpacing: -0.4, lineHeight: 28, color: colors.text },
//   h3: { fontFamily: sysFont, fontSize: 18, fontWeight: '600', letterSpacing: -0.2, lineHeight: 24, color: colors.text },
//   body: { fontFamily: sysFont, fontSize: 14, fontWeight: '500', lineHeight: 20, color: colors.textMuted },
//   bodyLg: { fontFamily: sysFont, fontSize: 16, fontWeight: '500', lineHeight: 22, color: colors.text },
//   caption: { fontFamily: sysFont, fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.2, color: colors.textMuted },
//   micro: { fontFamily: sysFont, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textDim },
// };

// export const shadow = {
//   card: Platform.select({
//     ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.45, shadowRadius: 28 },
//     android: { elevation: 10 },
//   }),
//   cardDeep: Platform.select({
//     ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.55, shadowRadius: 40 },
//     android: { elevation: 14 },
//   }),
//   glow: Platform.select({
//     ios: { shadowColor: '#7C6CF0', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.55, shadowRadius: 24 },
//     android: { elevation: 12 },
//   }),
//   glowCyan: Platform.select({
//     ios: { shadowColor: '#5EEAD4', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.50, shadowRadius: 22 },
//     android: { elevation: 12 },
//   }),
// };

import { Platform } from 'react-native';

/*
|--------------------------------------------------------------------------
| PREMIUM DARK GLASS THEME
|--------------------------------------------------------------------------
| Exact premium UI tuning
|--------------------------------------------------------------------------
*/

export const colors = {

  /*
  |--------------------------------------------------------------------------
  | BASE
  |--------------------------------------------------------------------------
  */

  bg: '#0B0D14',
  bgDeep: '#07090F',

  bgElev: '#141824',
  bgElev2: '#1A1F2D',
  bgElev3: '#222738',

  /*
  |--------------------------------------------------------------------------
  | PRIMARY
  |--------------------------------------------------------------------------
  */

  primary: '#8B7CFF',
  primaryLight: '#B5ABFF',
  primaryDeep: '#4B3BC9',

  primaryGlow: 'rgba(139,124,255,0.45)',

  /*
  |--------------------------------------------------------------------------
  | ACCENT
  |--------------------------------------------------------------------------
  */

  accent: '#00D4FF',
  accentBright: '#67E8F9',
  accentDeep: '#0891B2',

  accentGlow: 'rgba(0,212,255,0.38)',

  /*
  |--------------------------------------------------------------------------
  | SEMANTIC
  |--------------------------------------------------------------------------
  */

  success: '#34E5B0',
  warning: '#FFB547',
  danger: '#FF5C7C',

  pink: '#FF7AC6',

  /*
  |--------------------------------------------------------------------------
  | TEXT
  |--------------------------------------------------------------------------
  */

  text: '#FFFFFF',

  textMuted: 'rgba(255,255,255,0.68)',
  textDim: 'rgba(255,255,255,0.42)',
  textFaint: 'rgba(255,255,255,0.20)',

  /*
  |--------------------------------------------------------------------------
  | GLASS
  |--------------------------------------------------------------------------
  */

  glassBase: 'rgba(255,255,255,0.04)',
  glassStrong: 'rgba(255,255,255,0.07)',

  glassTopHighlight: 'rgba(255,255,255,0.22)',

  glassBottomShade: 'rgba(0,0,0,0.22)',

  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',

  /*
  |--------------------------------------------------------------------------
  | SURFACE GRADIENTS
  |--------------------------------------------------------------------------
  */

  gradSurface: [
    'rgba(255,255,255,0.10)',
    'rgba(255,255,255,0.02)',
  ],

  gradSurfaceDeep: [
    'rgba(255,255,255,0.07)',
    'rgba(0,0,0,0.18)',
  ],

  /*
  |--------------------------------------------------------------------------
  | BRAND GRADIENTS
  |--------------------------------------------------------------------------
  */

  gradPrimary: [
    '#8B7CFF',
    '#B5ABFF',
  ],

  gradAccent: [
    '#8B7CFF',
    '#00D4FF',
  ],

  gradCyan: [
    '#22D3EE',
    '#67E8F9',
  ],

  gradSuccess: [
    '#34E5B0',
    '#5EEAD4',
  ],

  gradDanger: [
    '#FF5C7C',
    '#FF7AC6',
  ],

  gradWarmGlow: [
    'rgba(139,124,255,0.18)',
    'rgba(0,212,255,0.05)',
  ],

  /*
  |--------------------------------------------------------------------------
  | LEGACY
  |--------------------------------------------------------------------------
  */

  gradCard: [
    'rgba(139,124,255,0.18)',
    'rgba(181,171,255,0.04)',
  ],

  glass: 'rgba(255,255,255,0.05)',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 30,
  xxxl: 36,
  pill: 999,
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  huge: 52,
};

const sysFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {

  display: {
    fontFamily: sysFont,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 54,
    color: colors.text,
  },

  h1: {
    fontFamily: sysFont,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 34,
    color: colors.text,
  },

  h2: {
    fontFamily: sysFont,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 28,
    color: colors.text,
  },

  h3: {
    fontFamily: sysFont,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 24,
    color: colors.text,
  },

  body: {
    fontFamily: sysFont,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.textMuted,
  },

  bodyLg: {
    fontFamily: sysFont,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  },

  caption: {
    fontFamily: sysFont,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.textMuted,
  },

  micro: {
    fontFamily: sysFont,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
};

export const shadow = {

  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 18,
      },
      shadowOpacity: 0.45,
      shadowRadius: 32,
    },

    android: {
      elevation: 10,
    },
  }),

  cardDeep: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 26,
      },
      shadowOpacity: 0.58,
      shadowRadius: 52,
    },

    android: {
      elevation: 16,
    },
  }),

  glow: Platform.select({
    ios: {
      shadowColor: '#8B7CFF',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.55,
      shadowRadius: 24,
    },

    android: {
      elevation: 12,
    },
  }),

  glowCyan: Platform.select({
    ios: {
      shadowColor: '#00D4FF',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.50,
      shadowRadius: 22,
    },

    android: {
      elevation: 12,
    },
  }),
};
