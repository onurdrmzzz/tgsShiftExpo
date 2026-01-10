/**
 * Shift types available in the system
 * - morning: Sabah (S, SB)
 * - evening: Akşam (A, AB)
 * - night: Gece (G)
 * - off: İzin (I)
 * - annual: Yıllık İzin (Y)
 * - training: Eğitim (E)
 * - normal: Normal/Gündüz (N)
 * - sick: Raporlu (R)
 * - excuse: Mazeret (M)
 */
export type ShiftType =
  | 'morning'
  | 'evening'
  | 'night'
  | 'off'
  | 'annual'
  | 'training'
  | 'normal'
  | 'sick'
  | 'excuse';

/**
 * Shift system type
 */
export type ShiftSystem = 'system60' | 'system30';

/**
 * Team identifiers for %60 system
 */
export type Team60 = '60A' | '60B' | '60C' | '60D';

/**
 * Team identifiers for %30 system
 */
export type Team30 = '30A' | '30B' | '30C' | '30D';

/**
 * Combined team type
 */
export type TeamId = Team60 | Team30;

/**
 * Represents a single shift entry
 */
export interface ShiftEntry {
  date: string;
  shiftType: ShiftType;
  isManual: boolean;
}

/**
 * Configuration for %60 automatic shift system
 */
export interface System60Config {
  type: 'system60';
  team: Team60;
  cycleStartDate: string;
}

/**
 * Configuration for %30 manual shift system
 */
export interface System30Config {
  type: 'system30';
  team: Team30;
}

/**
 * Monthly shift data for %30 system
 * Key format: "YYYY-MM" (e.g., "2026-01")
 */
export interface MonthlyShiftData {
  [monthKey: string]: {
    [dayOfMonth: number]: ShiftType;
  };
}

/**
 * Display information for a shift
 */
export interface ShiftDisplayInfo {
  type: ShiftType;
  label: string;
  labelShort: string;
  color: string;
  textColor: string;
  icon: string;
}

/**
 * The 8-day cycle pattern for %60 system
 */
export type CyclePattern = readonly [
  ShiftType, ShiftType,
  ShiftType, ShiftType,
  ShiftType, ShiftType,
  ShiftType, ShiftType
];
