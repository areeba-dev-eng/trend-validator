# Trend Validator — Premium Mobile UI

AI-powered trend search engine. **Expo SDK 52 · React 18.3.1 · React Native 0.76**.
No React 19. No custom native modules. Runs cleanly in **Expo Go**.

---

## Quick start

```bash
# 1. Install (use the lockfile-friendly install)
npm install
# or: yarn install

# 2. Start the dev server
npx expo start
```

Scan the QR code in **Expo Go** (iOS or Android). Press `i` for iOS sim, `a` for Android emulator, `w` for web.

If a dependency mismatch is reported by Expo at startup, run:
```bash
npx expo install --check
```
That auto-aligns versions to whatever your local SDK expects.

---

## What's inside

```
TrendValidator/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── src/
    ├── theme/
    │   ├── index.js          # tokens: colors, radii, spacing, typography, shadows
    │   └── navTheme.js       # React Navigation dark theme override
    ├── utils/
    │   └── charts.js         # smooth path generation (Catmull-Rom → bezier)
    ├── data/
    │   └── mockData.js       # trends, history, sample result
    ├── components/
    │   ├── BackgroundGradient.js  # SVG radial glow blobs (true soft glow on both OS)
    │   ├── GlassCard.js           # BlurView + tinted overlay (cross-platform glass)
    │   ├── GradientButton.js      # Pressable + gradient + spring scale
    │   ├── SearchBar.js           # Animated focus ring, mic + send
    │   ├── QuickAction.js         # Glass pill chip
    │   ├── ScoreRing.js           # SVG circular progress, gradient stroke
    │   ├── SparklineChart.js      # SVG smooth line + gradient area
    │   ├── TrendCard.js           # Aura-style large card with chart
    │   ├── HistoryItem.js         # List row with score chip
    │   ├── SectionHeader.js
    │   └── StatPill.js
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── SearchScreen.js
    │   ├── ResultsScreen.js
    │   ├── AnalyticsScreen.js
    │   ├── HistoryScreen.js
    │   └── ProfileScreen.js
    └── navigation/
        ├── RootNavigator.js   # native-stack: Tabs + Search (modal) + Results
        ├── TabNavigator.js    # bottom-tabs with custom bar
        └── CustomTabBar.js    # 4 tabs + center floating search FAB
```

---

## Architecture decisions

- **Expo SDK 52 (locked)** — last SDK on React 18.3.1 before React 19 ships. Honors your "no React 19" requirement *and* keeps Expo Go compatibility.
- **`newArchEnabled: false`** — the new architecture is stable but reanimated/screens edges still surface in Expo Go on some devices. Keeping it off until you ship.
- **No `react-native-reanimated`** — every animation uses RN core `Animated` API. Smaller bundle, simpler setup, no babel plugin landmine.
- **Charts via `react-native-svg`** — no chart library dep. The `pointsFromValues` + `smoothPath` helpers in `utils/charts.js` produce native-feeling Catmull-Rom curves with gradient area fills.
- **Glass via `expo-blur` + tint layer** — Android's BlurView is weaker, so `GlassCard` always layers a semi-opaque tint on top so the look is consistent.
- **Background via SVG `RadialGradient`** — RN doesn't have a native radial-gradient primitive. Drawing radial blobs in SVG gives identical output on iOS and Android (vs the cheap "big circle + opacity" hack which looks flat).
- **Custom tab bar** — the floating center search FAB needs absolute positioning that the default RN Navigation tab bar can't do cleanly. The custom bar dispatches navigation through `getParent()` to reach the Search modal in the root stack.

---

## Performance notes

- Sparkline path strings are generated per render — fine at this scale (≤16 points). For large datasets, memoize with `useMemo` keyed on the values array.
- BlurView is GPU-expensive. Profile before scaling: a single screen with >6 BlurView instances will drop frames on lower-end Android. If you see jank, swap interior `GlassCard` instances for solid `bgElev2` cards and keep blur only on tab bar + hero cards.
- All Pressable spring animations use `useNativeDriver: true`. Confirmed.

---

## Possible failure points (ranked)

1. **Android BlurView noise on older devices (API 28-)** — falls back to tinted view; visually still on-brand.
2. **iOS keyboard pushing the floating tab bar** — handled via `tabBarHideOnKeyboard: true` and `keyboardShouldPersistTaps: 'handled'` on the search list.
3. **Hairline border on Android** — `StyleSheet.hairlineWidth` renders as 0 on some MDPI Android devices. Replace with `1` if it disappears.
4. **`react-native-svg` major-version drift** — pin to `15.8.0` for SDK 52. Newer versions need SDK 53+.
5. **`expo-blur` v14 requires SDK 52** — don't auto-bump.

---

## Improvements you didn't ask for but should consider

1. **Wire to a real model** — current results are mock. Hook `ResultsScreen` to your trend-scoring API and stream the explanation token-by-token (`fetch` with `ReadableStream` works in Hermes).
2. **Cache layer** — `@react-native-async-storage/async-storage` for recent searches; lazy-hydrate `recentHistory` in `HomeScreen` from cache so the back-from-Results jump is instant.
3. **Skeleton states** — every glass card should have a shimmer skeleton while data loads. Avoids the "everything snaps in" feel.
4. **Haptics on score reveal & FAB tap** — `expo-haptics` is one line and dramatically lifts the perceived quality.
5. **Theming hook** — extract a `useTheme()` so you can ship a light variant later without mass refactoring.
6. **A11y** — every Pressable needs `accessibilityRole` and `accessibilityLabel`. Ship-blocker for App Store reviewers in 2026.
7. **Deep linking** — wire `Linking` config in `RootNavigator` so `trendvalidator://result?q=...` opens the Results screen directly. Useful for share links.
8. **EAS Build** — when leaving Expo Go, switch to EAS for builds. Keeps native updates consistent across devs.

---

## Theme tokens cheat sheet

```js
import { colors, radii, spacing, typography, shadow } from './src/theme';

colors.primary       // #6C5CE7
colors.primaryLight  // #A29BFE
colors.bg            // #0B0F1A
colors.gradPrimary   // ['#6C5CE7','#A29BFE']
radii.xxl            // 28
spacing.xl           // 20
typography.display   // 36/700/-1.2
shadow.glow          // primary purple glow
```
