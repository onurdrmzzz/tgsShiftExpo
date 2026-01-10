import { useAppStore } from '../store';
import { LIGHT_COLORS, DARK_COLORS, ThemeColors } from '../constants/colors';
import { ThemeMode } from '../types';

interface UseThemeReturn {
  colors: ThemeColors;
  isDark: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  const theme = useAppStore((state) => state.preferences.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const isDark = theme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return {
    colors,
    isDark,
    theme,
    setTheme,
    toggleTheme,
  };
};
