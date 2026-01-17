import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { addDays, format, startOfDay } from 'date-fns';
import { ShiftType } from '../types';
import { SHIFT_TIMES, STRINGS } from '../constants';

const CALENDAR_NAME = 'TGS Vardiya';
const CALENDAR_COLOR = '#3B82F6';

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function getOrCreateAppCalendar(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // Look for existing TGS Vardiya calendar
  const existingCalendar = calendars.find(cal => cal.title === CALENDAR_NAME);
  if (existingCalendar) {
    return existingCalendar.id;
  }

  // Create new calendar
  const defaultCalendarSource = Platform.OS === 'ios'
    ? calendars.find(cal => cal.source.name === 'iCloud')?.source
      ?? calendars.find(cal => cal.source.name === 'Default')?.source
      ?? calendars[0]?.source
    : { isLocalAccount: true, name: CALENDAR_NAME, type: Calendar.SourceType.LOCAL };

  if (!defaultCalendarSource) {
    return null;
  }

  try {
    const newCalendarId = await Calendar.createCalendarAsync({
      title: CALENDAR_NAME,
      color: CALENDAR_COLOR,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: CALENDAR_NAME,
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return newCalendarId;
  } catch (error) {
    console.error('Error creating calendar:', error);
    return null;
  }
}

function getEventTimes(date: Date, shift: ShiftType): { startDate: Date; endDate: Date } | null {
  const times = SHIFT_TIMES[shift];
  if (!times) {
    return null;
  }

  const [startHour, startMin] = times.start.split(':').map(Number);
  const [endHour, endMin] = times.end.split(':').map(Number);

  const startDate = new Date(date);
  startDate.setHours(startHour, startMin, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(endHour, endMin, 0, 0);

  // Handle night shift that ends next day
  if (shift === 'night') {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { startDate, endDate };
}

export async function createShiftEvent(
  calendarId: string,
  date: Date,
  shift: ShiftType
): Promise<string | null> {
  const eventTimes = getEventTimes(date, shift);

  // Skip shifts without times (off, annual, sick, excuse)
  if (!eventTimes) {
    return null;
  }

  const shiftLabel = STRINGS.shifts[shift];
  const dateStr = format(date, 'dd.MM.yyyy');

  try {
    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `${shiftLabel} Vardiyası`,
      notes: `TGS Vardiya - ${shiftLabel}\n${dateStr}`,
      startDate: eventTimes.startDate,
      endDate: eventTimes.endDate,
      timeZone: 'Europe/Istanbul',
      alarms: [{ relativeOffset: -60 }], // 1 hour before
    });
    return eventId;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

export async function exportShiftsToCalendar(
  startDate: Date,
  days: number,
  getShiftForDate: (dateStr: string) => ShiftType | null
): Promise<{ success: boolean; count: number; error?: string }> {
  // Request permissions
  const hasPermission = await requestCalendarPermissions();
  if (!hasPermission) {
    return { success: false, count: 0, error: 'Takvim izni verilmedi' };
  }

  // Get or create calendar
  const calendarId = await getOrCreateAppCalendar();
  if (!calendarId) {
    return { success: false, count: 0, error: 'Takvim oluşturulamadı' };
  }

  let exportedCount = 0;
  const start = startOfDay(startDate);

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(start, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const shift = getShiftForDate(dateStr);

    if (shift && SHIFT_TIMES[shift]) {
      const eventId = await createShiftEvent(calendarId, currentDate, shift);
      if (eventId) {
        exportedCount++;
      }
    }
  }

  return { success: true, count: exportedCount };
}

export async function deleteAppCalendar(): Promise<boolean> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const appCalendar = calendars.find(cal => cal.title === CALENDAR_NAME);

    if (appCalendar) {
      await Calendar.deleteCalendarAsync(appCalendar.id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting calendar:', error);
    return false;
  }
}
