import { ShiftType, ShiftDisplayInfo, CyclePattern } from '../types';
import { COLORS } from './colors';

export const SHIFT_DISPLAY: Record<ShiftType, ShiftDisplayInfo> = {
  morning: {
    type: 'morning',
    label: 'Sabah Vardiyasi',
    labelShort: 'S',
    color: COLORS.morning.background,
    textColor: COLORS.morning.text,
    icon: 'sun',
  },
  evening: {
    type: 'evening',
    label: 'Aksam Vardiyasi',
    labelShort: 'A',
    color: COLORS.evening.background,
    textColor: COLORS.evening.text,
    icon: 'sunset',
  },
  night: {
    type: 'night',
    label: 'Gece Vardiyasi',
    labelShort: 'G',
    color: COLORS.night.background,
    textColor: COLORS.night.text,
    icon: 'moon',
  },
  off: {
    type: 'off',
    label: 'Izinli',
    labelShort: 'İ',
    color: COLORS.off.background,
    textColor: COLORS.off.text,
    icon: 'sleep',
  },
  annual: {
    type: 'annual',
    label: 'Yillik Izin',
    labelShort: 'Y',
    color: COLORS.annual.background,
    textColor: COLORS.annual.text,
    icon: 'calendar',
  },
  training: {
    type: 'training',
    label: 'Egitim',
    labelShort: 'E',
    color: COLORS.training.background,
    textColor: COLORS.training.text,
    icon: 'book',
  },
  normal: {
    type: 'normal',
    label: 'Normal',
    labelShort: 'N',
    color: COLORS.normal.background,
    textColor: COLORS.normal.text,
    icon: 'briefcase',
  },
  sick: {
    type: 'sick',
    label: 'Raporlu',
    labelShort: 'R',
    color: COLORS.sick.background,
    textColor: COLORS.sick.text,
    icon: 'heart',
  },
  excuse: {
    type: 'excuse',
    label: 'Mazeret',
    labelShort: 'M',
    color: COLORS.excuse.background,
    textColor: COLORS.excuse.text,
    icon: 'alert',
  },
};

export const SHIFT_TIMES: Record<ShiftType, { start: string; end: string } | null> = {
  morning: { start: '06:00', end: '14:00' },
  evening: { start: '14:00', end: '22:00' },
  night: { start: '22:00', end: '06:00' },
  off: null,
  annual: null,
  training: { start: '09:00', end: '17:00' },
  normal: { start: '09:00', end: '18:00' },
  sick: null,
  excuse: null,
};

export const CYCLE_PATTERN: CyclePattern = [
  'morning', 'morning',
  'evening', 'evening',
  'night', 'night',
  'off', 'off',
] as const;

export const CYCLE_LENGTH = 8;

export const TEAMS_60 = ['60A', '60B', '60C', '60D'] as const;
export const TEAMS_30 = ['30A', '30B', '30C', '30D'] as const;

// Predefined cycle start dates for 60% system teams (first morning shift)
export const TEAM_60_CYCLE_STARTS: Record<typeof TEAMS_60[number], string> = {
  '60A': '2026-01-06',
  '60B': '2026-01-04',
  '60C': '2026-01-02',
  '60D': '2025-12-31',
};

export const SHIFT_ORDER: ShiftType[] = [
  'morning',
  'evening',
  'night',
  'off',
  'annual',
  'training',
  'normal',
  'sick',
  'excuse',
];
