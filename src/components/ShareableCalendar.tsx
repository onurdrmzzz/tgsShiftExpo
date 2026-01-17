import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDaysInMonth, startOfMonth, getDay, format } from 'date-fns';
import { ShiftType } from '../types';
import { STRINGS, LIGHT_COLORS } from '../constants';

const SHIFT_LETTERS: Record<ShiftType, string> = {
  morning: 'S',
  evening: 'A',
  night: 'G',
  off: 'İ',
  annual: 'Y',
  training: 'E',
  normal: 'N',
  sick: 'R',
  excuse: 'M',
};

const LEGEND_ITEMS: { shift: ShiftType; label: string }[] = [
  { shift: 'morning', label: 'Sabah' },
  { shift: 'evening', label: 'Aksam' },
  { shift: 'night', label: 'Gece' },
  { shift: 'off', label: 'Izin' },
];

interface ShareableCalendarProps {
  year: number;
  month: number;
  getShiftForDate: (dateStr: string) => ShiftType | null;
}

export const ShareableCalendar = forwardRef<View, ShareableCalendarProps>(
  ({ year, month, getShiftForDate }, ref) => {
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const firstDayOfMonth = getDay(startOfMonth(new Date(year, month)));
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const renderCalendarDays = () => {
      const days: React.ReactNode[] = [];

      // Empty cells for days before month starts
      for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
        const shift = getShiftForDate(dateStr);

        days.push(
          <View key={day} style={styles.dayCell}>
            <Text style={styles.dayNumber}>{day}</Text>
            {shift && (
              <View
                style={[
                  styles.shiftBadge,
                  { backgroundColor: LIGHT_COLORS[shift].background },
                ]}
              >
                <Text style={[styles.shiftLetter, { color: LIGHT_COLORS[shift].text }]}>
                  {SHIFT_LETTERS[shift]}
                </Text>
              </View>
            )}
          </View>
        );
      }

      return days;
    };

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>TGS Vardiya</Text>
          <Text style={styles.monthTitle}>
            {STRINGS.months[month]} {year}
          </Text>
        </View>

        {/* Week Headers */}
        <View style={styles.weekHeader}>
          {STRINGS.days.narrow.map((day, index) => (
            <Text key={index} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

        {/* Legend */}
        <View style={styles.legend}>
          {LEGEND_ITEMS.map(({ shift, label }) => (
            <View key={shift} style={styles.legendItem}>
              <View
                style={[
                  styles.legendBadge,
                  { backgroundColor: LIGHT_COLORS[shift].background },
                ]}
              >
                <Text style={[styles.legendLetter, { color: LIGHT_COLORS[shift].text }]}>
                  {SHIFT_LETTERS[shift]}
                </Text>
              </View>
              <Text style={styles.legendLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>tgsvardiya.app</Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    width: 380,
    borderRadius: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 2,
  },
  shiftBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftLetter: {
    fontSize: 10,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLetter: {
    fontSize: 10,
    fontWeight: '700',
  },
  legendLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
