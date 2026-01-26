import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftType } from '../../types';
import { STRINGS, SHIFT_ORDER } from '../../constants';
import { useTheme } from '../../hooks';

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

interface CollapsibleLegendProps {
  initialExpanded?: boolean;
}

export const CollapsibleLegend: React.FC<CollapsibleLegendProps> = ({
  initialExpanded = false
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);
  const heightAnim = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  const rotationAnim = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue,
        useNativeDriver: false,
        speed: 12,
        bounciness: 0,
      }),
      Animated.spring(rotationAnim, {
        toValue,
        useNativeDriver: true,
        speed: 12,
        bounciness: 0,
      }),
    ]).start();
  };

  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getShiftDisplay = (shift: ShiftType) => ({
    color: colors[shift].background,
    textColor: colors[shift].text,
    label: STRINGS.shifts[shift],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Pressable style={styles.header} onPress={toggle}>
        <Text style={[styles.title, { color: colors.text }]}>Vardiya Açıklamaları</Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[
        styles.content,
        {
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          opacity: heightAnim,
        }
      ]}>
        <View style={styles.grid}>
          {SHIFT_ORDER.map((shift) => {
            const display = getShiftDisplay(shift);
            return (
              <View key={shift} style={styles.item}>
                <View style={[styles.badge, { backgroundColor: display.color }]}>
                  <Text style={[styles.badgeText, { color: display.textColor }]}>
                    {SHIFT_LETTERS[shift]}
                  </Text>
                </View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {STRINGS.shifts[shift]}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  item: {
    alignItems: 'center',
    width: '18%',
    paddingVertical: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
