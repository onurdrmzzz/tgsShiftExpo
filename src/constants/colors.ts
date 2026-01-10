// Theme color type
export interface ThemeColors {
  // Shift colors - vibrant and distinct
  morning: {
    background: string;
    text: string;
  };
  evening: {
    background: string;
    text: string;
  };
  night: {
    background: string;
    text: string;
  };
  off: {
    background: string;
    text: string;
  };
  annual: {
    background: string;
    text: string;
  };
  training: {
    background: string;
    text: string;
  };
  normal: {
    background: string;
    text: string;
  };
  sick: {
    background: string;
    text: string;
  };
  excuse: {
    background: string;
    text: string;
  };

  // UI colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceLight: string;  // Secondary surfaces, hover states
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

// Light Theme Colors - Based on skill file specifications
export const LIGHT_COLORS: ThemeColors = {
  // Shift colors - solid colors with white text (consistent with dark theme)
  morning: {
    background: '#22c55e',  // Green - Sabah
    text: '#ffffff',
  },
  evening: {
    background: '#f59e0b',  // Amber - Akşam
    text: '#ffffff',
  },
  night: {
    background: '#3b82f6',  // Blue - Gece
    text: '#ffffff',
  },
  off: {
    background: '#ef4444',  // Red - İzin
    text: '#ffffff',
  },
  annual: {
    background: '#8b5cf6',  // Purple - Yıllık İzin
    text: '#ffffff',
  },
  training: {
    background: '#06b6d4',  // Cyan - Eğitim
    text: '#ffffff',
  },
  normal: {
    background: '#64748b',  // Slate - Normal
    text: '#ffffff',
  },
  sick: {
    background: '#ec4899',  // Pink - Raporlu
    text: '#ffffff',
  },
  excuse: {
    background: '#f97316',  // Orange - Mazeret
    text: '#ffffff',
  },

  // UI colors - Light & Airy (from skill)
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#eef2ff',
  secondary: '#64748b',
  background: '#f8fafc',    // Slate-50
  surface: '#ffffff',
  surfaceLight: '#f1f5f9',  // Slate-100
  text: '#0f172a',          // Slate-900
  textSecondary: '#64748b', // Slate-500
  textTertiary: '#94a3b8',  // Slate-400
  border: '#e2e8f0',        // Slate-200
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

// Dark Theme Colors - Based on skill file specifications
export const DARK_COLORS: ThemeColors = {
  // Shift colors - solid colors with white text (per skill guidelines)
  morning: {
    background: '#22c55e',  // Green - Sabah
    text: '#ffffff',
  },
  evening: {
    background: '#f59e0b',  // Amber - Akşam
    text: '#ffffff',
  },
  night: {
    background: '#3b82f6',  // Blue - Gece
    text: '#ffffff',
  },
  off: {
    background: '#ef4444',  // Red - İzin
    text: '#ffffff',
  },
  annual: {
    background: '#8b5cf6',  // Purple - Yıllık İzin
    text: '#ffffff',
  },
  training: {
    background: '#06b6d4',  // Cyan - Eğitim
    text: '#ffffff',
  },
  normal: {
    background: '#64748b',  // Slate - Normal
    text: '#ffffff',
  },
  sick: {
    background: '#ec4899',  // Pink - Raporlu
    text: '#ffffff',
  },
  excuse: {
    background: '#f97316',  // Orange - Mazeret
    text: '#ffffff',
  },

  // UI colors - Dark mode with layered depth
  primary: '#6366f1',       // Indigo - primary actions
  primaryDark: '#4f46e5',   // Indigo-600
  primaryLight: '#1e1b4b',  // Indigo-950 for backgrounds
  secondary: '#9ca3af',
  background: '#0a0a0f',    // Deepest layer
  surface: '#12121a',       // Cards, elevated surfaces
  surfaceLight: '#1a1a24',  // Hover states, secondary surfaces
  text: '#ffffff',          // Primary text
  textSecondary: '#9ca3af', // Secondary text
  textTertiary: '#6b7280',  // Muted text
  border: '#1f1f2e',        // Subtle borders
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

// Default export for backwards compatibility (will be replaced by useTheme)
export const COLORS = LIGHT_COLORS;
