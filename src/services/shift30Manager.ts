import { format, parseISO, getDaysInMonth } from 'date-fns';
import { ShiftType, MonthlyShiftData } from '../types';
import { SHIFT_ORDER } from '../constants';

/**
 * Get the month key from a date
 */
export function getMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

/**
 * Get shift for a specific date from monthly data
 */
export function getShiftFromMonthlyData(
  date: string,
  monthlyData: MonthlyShiftData
): ShiftType | null {
  const monthKey = getMonthKey(date);
  const day = parseISO(date).getDate();

  return monthlyData[monthKey]?.[day] ?? null;
}

/**
 * Set shift for a specific date in monthly data
 * Returns new monthly data object (immutable)
 */
export function setShiftInMonthlyData(
  date: string,
  shift: ShiftType,
  monthlyData: MonthlyShiftData
): MonthlyShiftData {
  const monthKey = getMonthKey(date);
  const day = parseISO(date).getDate();

  return {
    ...monthlyData,
    [monthKey]: {
      ...monthlyData[monthKey],
      [day]: shift,
    },
  };
}

/**
 * Check if a month has complete data
 */
export function isMonthComplete(
  year: number,
  month: number,
  monthlyData: MonthlyShiftData
): boolean {
  const monthKey = format(new Date(year, month - 1, 1), 'yyyy-MM');
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthData = monthlyData[monthKey];

  if (!monthData) return false;

  for (let day = 1; day <= daysInMonth; day++) {
    if (!monthData[day]) return false;
  }

  return true;
}

/**
 * Get completion percentage for a month
 */
export function getMonthCompletionPercentage(
  year: number,
  month: number,
  monthlyData: MonthlyShiftData
): number {
  const monthKey = format(new Date(year, month - 1, 1), 'yyyy-MM');
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthData = monthlyData[monthKey];

  if (!monthData) return 0;

  const filledDays = Object.keys(monthData).length;
  return Math.round((filledDays / daysInMonth) * 100);
}

/**
 * Cycle to the next shift type (for tap-to-change UI)
 */
export function getNextShiftType(current: ShiftType | null): ShiftType {
  if (!current) return 'morning';

  const currentIndex = SHIFT_ORDER.indexOf(current);
  return SHIFT_ORDER[(currentIndex + 1) % SHIFT_ORDER.length];
}

/**
 * Get shift for today from monthly data
 */
export function getTodayShift30(monthlyData: MonthlyShiftData): ShiftType | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getShiftFromMonthlyData(today, monthlyData);
}

/**
 * Get shift for tomorrow from monthly data
 */
export function getTomorrowShift30(monthlyData: MonthlyShiftData): ShiftType | null {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  return getShiftFromMonthlyData(tomorrowStr, monthlyData);
}
