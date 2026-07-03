import { DarkTheme } from '@react-navigation/native';
import { colors } from './index';

export const navTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: 'transparent',
    notification: colors.primary,
  },
};
