import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { STRINGS, SHIFT_ORDER } from '../../constants';
import { MonthlyEntryScreenProps, ShiftType } from '../../types';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks';
import { getNextShiftType } from '../../services';

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

export const MonthlyEntryScreen: React.FC<MonthlyEntryScreenProps> = ({
  navigation,
}) => {
  const { setShiftForDate, setOnboardingComplete, monthlyShifts } = useAppStore();
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getDay(startOfMonth(currentDate));
  const monthKey = format(currentDate, 'yyyy-MM');

  const shifts = monthlyShifts[monthKey] || {};

  // Shift display helper
  const getShiftDisplay = (shift: ShiftType) => ({
    color: colors[shift].background,
    textColor: colors[shift].text,
    label: STRINGS.shifts[shift],
  });

  const handleDayPress = (day: number) => {
    const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
    const currentShift = shifts[day] || null;
    const nextShift = getNextShiftType(currentShift);
    setShiftForDate(dateStr, nextShift);
  };

  const handleSave = () => {
    setOnboardingComplete(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderCalendar = () => {
    const days: React.ReactNode[] = [];
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const shift = shifts[day] as ShiftType | undefined;
      const display = shift ? getShiftDisplay(shift) : null;

      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => handleDayPress(day)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dayNumber, { color: colors.text }]}>{day}</Text>
          {shift && display ? (
            <View style={[styles.shiftBadge, { backgroundColor: display.color }]}>
              <Text style={[styles.shiftLetter, { color: display.textColor }]}>
                {SHIFT_LETTERS[shift]}
              </Text>
            </View>
          ) : (
            <View style={[styles.emptyBadge, { borderColor: colors.border }]}>
              <Text style={[styles.plusSign, { color: colors.textTertiary }]}>+</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const completedDays = Object.keys(shifts).length;
  const progress = Math.round((completedDays / daysInMonth) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: colors.primary }]}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Vardiya Girişi</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Aylık vardiyalarınızı girin
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrow, { color: colors.primary }]}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {STRINGS.months[month]} {year}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrow, { color: colors.primary }]}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>İlerleme</Text>
              <Text style={[styles.progressPercent, { color: colors.success }]}>{progress}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.success }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textTertiary }]}>
              {completedDays} / {daysInMonth} gün tamamlandı
            </Text>
          </View>

          <Text style={[styles.helper, { color: colors.textSecondary }]}>
            Her güne dokunarak vardiya seçin
          </Text>

          {/* Calendar Card */}
          <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
            {/* Day Headers */}
            <View style={[styles.weekHeader, { borderBottomColor: colors.border }]}>
              {STRINGS.days.narrow.map((day, index) => (
                <Text key={index} style={[styles.weekDay, { color: colors.textTertiary }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>{renderCalendar()}</View>
          </View>

          {/* Legend */}
          <View style={[styles.legendCard, { backgroundColor: colors.surface }]}>
            {SHIFT_ORDER.map((shift) => {
              const display = getShiftDisplay(shift);
              return (
                <View key={shift} style={styles.legendItem}>
                  <View style={[styles.legendBadge, { backgroundColor: display.color }]}>
                    <Text style={[styles.legendLetter, { color: display.textColor }]}>
                      {SHIFT_LETTERS[shift]}
                    </Text>
                  </View>
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    {STRINGS.shifts[shift]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: completedDays === 0 ? colors.border : colors.primary },
            pressed && completedDays > 0 && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleSave}
          disabled={completedDays === 0}
        >
          <Text style={[
            styles.saveButtonText,
            { color: completedDays === 0 ? colors.textTertiary : '#fff' }
          ]}>
            Kaydet ve Devam Et
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  helper: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  shiftBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftLetter: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSign: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    alignItems: 'center',
    width: '18%',
    paddingVertical: 8,
  },
  legendBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  legendLetter: {
    fontSize: 12,
    fontWeight: '700',
  },
  legendText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
