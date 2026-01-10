import { System60Config, System30Config, MonthlyShiftData } from './shift.types';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User preferences and settings
 */
export interface UserPreferences {
  onboardingComplete: boolean;
  language: 'tr';
  firstDayOfWeek: 0 | 1;
  theme: ThemeMode;
  sicilNo: string | null;
}

/**
 * Complete app state for persistence
 */
export interface AppState {
  preferences: UserPreferences;
  shiftConfig: System60Config | System30Config | null;
  manualShifts: MonthlyShiftData;
  version: number;
}
