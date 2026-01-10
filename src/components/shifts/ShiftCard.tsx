import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShiftType } from '../../types';
import { SHIFT_DISPLAY, SHIFT_TIMES, STRINGS } from '../../constants';
import { Card } from '../common/Card';

interface ShiftCardProps {
  shiftType: ShiftType;
  date: Date;
  label: string;
  teamId?: string;
  size?: 'normal' | 'large';
}

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

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shiftType,
  date,
  label,
  teamId,
  size = 'normal',
}) => {
  const display = SHIFT_DISPLAY[shiftType];
  const times = SHIFT_TIMES[shiftType];
  const isLarge = size === 'large';

  const formattedDate = `${date.getDate()} ${STRINGS.months[date.getMonth()]}`;

  return (
    <Card
      backgroundColor={display.color}
      style={isLarge ? styles.largeCard : styles.normalCard}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: display.textColor + '99' }]}>{label}</Text>
          <Text style={[styles.date, { color: display.textColor }]}>
            {formattedDate}
          </Text>
        </View>
        <View style={[styles.letterBadge, { backgroundColor: display.textColor + '20' }]}>
          <Text style={[styles.letterText, { color: display.textColor }]}>
            {SHIFT_LETTERS[shiftType]}
          </Text>
        </View>
      </View>

      <View style={styles.shiftInfo}>
        <Text
          style={[
            isLarge ? styles.largeShiftName : styles.normalShiftName,
            { color: display.textColor },
          ]}>
          {STRINGS.shifts[shiftType]}
        </Text>
        {times && (
          <Text style={[styles.times, { color: display.textColor + 'CC' }]}>
            {times.start} - {times.end}
          </Text>
        )}
      </View>

      {teamId && (
        <View style={[styles.teamBadge, { backgroundColor: display.textColor + '15' }]}>
          <Text style={[styles.teamText, { color: display.textColor }]}>
            {teamId}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  normalCard: {
    marginVertical: 6,
    padding: 16,
  },
  largeCard: {
    marginVertical: 8,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  letterBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 20,
    fontWeight: '800',
  },
  shiftInfo: {
    marginTop: 12,
  },
  normalShiftName: {
    fontSize: 22,
    fontWeight: '700',
  },
  largeShiftName: {
    fontSize: 28,
    fontWeight: '700',
  },
  times: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  teamBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
