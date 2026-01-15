import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ShiftSystem,
  Team60,
  Team30,
  ShiftType,
  MonthlyShiftData,
  UserPreferences,
  ThemeMode,
} from '../types';
import { calculateShiftForDate } from '../services/shift60Calculator';
import { getShiftFromMonthlyData, setShiftInMonthlyData } from '../services/shift30Manager';

// Shift usage statistics
type ShiftUsageStats = Partial<Record<ShiftType, number>>;

// Shift overrides - allows overriding calculated shifts for specific dates
type ShiftOverrides = Record<string, ShiftType>; // date string -> shift type

interface AppStore {
  // User preferences
  preferences: UserPreferences;
  setOnboardingComplete: (complete: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setSicilNo: (sicil: string) => void;

  // Active system
  activeSystem: ShiftSystem | null;
  setActiveSystem: (system: ShiftSystem) => void;

  // %60 System
  team60: Team60 | null;
  cycleStartDate: string | null;
  setTeam60: (team: Team60) => void;
  setCycleStartDate: (date: string) => void;

  // %30 System
  team30: Team30 | null;
  monthlyShifts: MonthlyShiftData;
  setTeam30: (team: Team30) => void;
  setShiftForDate: (date: string, shift: ShiftType) => void;
  setBulkShifts: (shifts: MonthlyShiftData) => void;

  // Shift overrides (for manual changes)
  shiftOverrides: ShiftOverrides;
  setShiftOverride: (date: string, shift: ShiftType) => void;
  clearShiftOverride: (date: string) => void;

  // Shift usage statistics
  shiftUsageStats: ShiftUsageStats;
  incrementShiftUsage: (shift: ShiftType) => void;
  getTopShifts: () => ShiftType[];

  // Computed / helpers
  getShiftForDate: (date: string) => ShiftType | null;
  getCurrentTeam: () => Team60 | Team30 | null;

  // Reset
  resetApp: () => void;
}

const initialPreferences: UserPreferences = {
  onboardingComplete: false,
  language: 'tr',
  firstDayOfWeek: 1,
  theme: 'light',
  sicilNo: null,
};

const initialState = {
  preferences: initialPreferences,
  activeSystem: null as ShiftSystem | null,
  team60: null as Team60 | null,
  cycleStartDate: null as string | null,
  team30: null as Team30 | null,
  monthlyShifts: {} as MonthlyShiftData,
  shiftOverrides: {} as ShiftOverrides,
  shiftUsageStats: {} as ShiftUsageStats,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOnboardingComplete: (complete) =>
        set((state) => ({
          preferences: { ...state.preferences, onboardingComplete: complete === true },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setSicilNo: (sicil) =>
        set((state) => ({
          preferences: { ...state.preferences, sicilNo: sicil },
        })),

      setActiveSystem: (system) => set({ activeSystem: system }),

      setTeam60: (team) => set({ team60: team }),

      setCycleStartDate: (date) => set({ cycleStartDate: date }),

      setTeam30: (team) => set({ team30: team }),

      setShiftForDate: (date, shift) =>
        set((state) => ({
          monthlyShifts: setShiftInMonthlyData(date, shift, state.monthlyShifts),
        })),

      setBulkShifts: (shifts: MonthlyShiftData) =>
        set((state) => {
          // Deep merge monthly shifts
          const merged = { ...state.monthlyShifts };
          for (const monthKey of Object.keys(shifts)) {
            merged[monthKey] = {
              ...merged[monthKey],
              ...shifts[monthKey],
            };
          }
          return { monthlyShifts: merged };
        }),

      setShiftOverride: (date, shift) =>
        set((state) => ({
          shiftOverrides: { ...state.shiftOverrides, [date]: shift },
        })),

      clearShiftOverride: (date) =>
        set((state) => {
          const { [date]: _, ...rest } = state.shiftOverrides;
          return { shiftOverrides: rest };
        }),

      incrementShiftUsage: (shift: ShiftType) =>
        set((state) => ({
          shiftUsageStats: {
            ...state.shiftUsageStats,
            [shift]: (state.shiftUsageStats[shift] || 0) + 1,
          },
        })),

      getTopShifts: () => {
        const state = get();
        const stats = state.shiftUsageStats;
        const entries = Object.entries(stats) as [ShiftType, number][];
        return entries
          .sort((a, b) => b[1] - a[1])
          .map(([shift]) => shift);
      },

      getShiftForDate: (date) => {
        const state = get();
        // Check for manual override first
        if (state.shiftOverrides[date]) {
          return state.shiftOverrides[date];
        }
        // Otherwise use system-based calculation
        if (state.activeSystem === 'system60' && state.cycleStartDate) {
          return calculateShiftForDate(date, state.cycleStartDate);
        }
        if (state.activeSystem === 'system30') {
          return getShiftFromMonthlyData(date, state.monthlyShifts);
        }
        return null;
      },

      getCurrentTeam: () => {
        const state = get();
        return state.activeSystem === 'system60' ? state.team60 : state.team30;
      },

      resetApp: () => set(initialState),
    }),
    {
      name: 'tgs-shift-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Ensure proper types after rehydration
        if (state && state.preferences) {
          state.preferences.onboardingComplete = state.preferences.onboardingComplete === true;
          // Ensure theme has a valid value
          if (!state.preferences.theme || (state.preferences.theme !== 'light' && state.preferences.theme !== 'dark')) {
            state.preferences.theme = 'light';
          }
        }
      },
    }
  )
);
