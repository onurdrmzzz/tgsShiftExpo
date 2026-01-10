import { differenceInDays, parseISO, format } from 'date-fns';
import { ShiftType } from '../types';
import { CYCLE_PATTERN, CYCLE_LENGTH } from '../constants';

/**
 * Calculate the shift type for any given date based on cycle start
 */
export function calculateShiftForDate(
  targetDate: string | Date,
  cycleStartDate: string
): ShiftType {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const cycleStart = parseISO(cycleStartDate);

  const daysDiff = differenceInDays(target, cycleStart);

  // Handle negative numbers correctly with modulo
  const cyclePosition = ((daysDiff % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;

  return CYCLE_PATTERN[cyclePosition];
}

/**
 * Generate shifts for an entire month
 */
export function generateMonthShifts(
  year: number,
  month: number,
  cycleStartDate: string
): Map<number, ShiftType> {
  const shifts = new Map<number, ShiftType>();
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
    shifts.set(day, calculateShiftForDate(dateStr, cycleStartDate));
  }

  return shifts;
}

/**
 * Get shift for today
 */
export function getTodayShift(cycleStartDate: string): ShiftType {
  return calculateShiftForDate(new Date(), cycleStartDate);
}

/**
 * Get shift for tomorrow
 */
export function getTomorrowShift(cycleStartDate: string): ShiftType {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return calculateShiftForDate(tomorrow, cycleStartDate);
}

/**
 * Get shifts for the next N days
 */
export function getUpcomingShifts(
  cycleStartDate: string,
  days: number = 7
): Array<{ date: Date; shift: ShiftType }> {
  const result: Array<{ date: Date; shift: ShiftType }> = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    result.push({
      date,
      shift: calculateShiftForDate(date, cycleStartDate),
    });
  }

  return result;
}
