import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ShiftType } from '../../types';
import { SHIFT_DISPLAY } from '../../constants';

interface ShiftBadgeProps {
  shiftType: ShiftType;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
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

export const ShiftBadge: React.FC<ShiftBadgeProps> = ({
  shiftType,
  size = 'medium',
  showLabel = true,
  style,
}) => {
  const display = SHIFT_DISPLAY[shiftType];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: display.color },
        sizeStyles.container,
        style,
      ]}>
      <Text style={[sizeStyles.letter, { color: display.textColor }]}>
        {SHIFT_LETTERS[shiftType]}
      </Text>
      {showLabel && (
        <Text style={[styles.label, { color: display.textColor }, sizeStyles.label]}>
          {display.labelShort}
        </Text>
      )}
    </View>
  );
};

const SIZE_STYLES = {
  small: StyleSheet.create({
    container: {
      width: 28,
      height: 28,
      borderRadius: 8,
    },
    letter: {
      fontSize: 14,
      fontWeight: '700',
    },
    label: {
      fontSize: 10,
      marginTop: 1,
    },
  }),
  medium: StyleSheet.create({
    container: {
      width: 44,
      height: 44,
      borderRadius: 12,
    },
    letter: {
      fontSize: 20,
      fontWeight: '700',
    },
    label: {
      fontSize: 12,
      marginTop: 2,
    },
  }),
  large: StyleSheet.create({
    container: {
      width: 64,
      height: 64,
      borderRadius: 16,
    },
    letter: {
      fontSize: 32,
      fontWeight: '700',
    },
    label: {
      fontSize: 14,
      marginTop: 4,
    },
  }),
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
