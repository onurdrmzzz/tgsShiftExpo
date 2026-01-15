import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { STRINGS, SHIFT_TIMES, SHIFT_ORDER } from '../../constants';
import { CalendarScreenProps, ShiftType } from '../../types';
import { useAppStore } from '../../store';
import { useTheme, useHaptic } from '../../hooks';

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

export const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  const { getShiftForDate, setShiftOverride } = useAppStore();
  const { colors, isDark } = useTheme();
  const haptic = useHaptic();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getDay(startOfMonth(currentDate));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getShiftForDay = (day: number): ShiftType | null => {
    const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
    return getShiftForDate(dateStr);
  };

  // Shift display helper
  const getShiftDisplay = (shift: ShiftType) => ({
    color: colors[shift].background,
    textColor: colors[shift].text,
    label: STRINGS.shifts[shift],
  });

  const renderCalendar = () => {
    const days: React.ReactNode[] = [];
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Tema bazlı bugün renkleri
    const todayBgColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const todayBorderColor = isDark ? '#ffffff' : '#000000';
    const todayTextColor = isDark ? '#ffffff' : '#000000';

    for (let day = 1; day <= daysInMonth; day++) {
      const shift = getShiftForDay(day);
      const isTodayDate = isCurrentMonth && day === today.getDate();
      const isSelected = day === selectedDay;
      const display = shift ? getShiftDisplay(shift) : null;

      days.push(
        <Pressable
          key={day}
          style={({ pressed }) => [
            styles.dayCell,
            isTodayDate && {
              backgroundColor: todayBgColor,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: todayBorderColor,
            },
            isSelected && !isTodayDate && { backgroundColor: colors.primaryLight, borderRadius: 12 },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            haptic.selection();
            if (selectedDay === day) {
              // Double tap - show edit modal
              setEditingDay(day);
              setShowEditModal(true);
              haptic.medium();
            } else {
              setSelectedDay(day);
            }
          }}>
          <Text style={[
            styles.dayNumber,
            { color: colors.text },
            isTodayDate && { fontWeight: '800', color: todayTextColor },
            isSelected && !isTodayDate && { fontWeight: '700', color: colors.primaryDark },
          ]}>
            {day}
          </Text>
          {shift && display && (
            <View style={[styles.shiftBadge, { backgroundColor: display.color }]}>
              <Text style={[styles.shiftLetter, { color: display.textColor }]}>
                {SHIFT_LETTERS[shift]}
              </Text>
            </View>
          )}
        </Pressable>
      );
    }

    return days;
  };

  const handleShiftChange = (newShift: ShiftType) => {
    if (editingDay) {
      const dateStr = format(new Date(year, month, editingDay), 'yyyy-MM-dd');
      setShiftOverride(dateStr, newShift);
      haptic.success();
    }
    setShowEditModal(false);
    setEditingDay(null);
  };

  const selectedShift = selectedDay ? getShiftForDay(selectedDay) : null;
  const selectedDateObj = selectedDay ? new Date(year, month, selectedDay) : null;
  const selectedDateStr = selectedDateObj
    ? format(selectedDateObj, "d MMMM EEEE", { locale: tr })
    : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Takvim</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={[styles.navButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.navArrow, { color: colors.primary }]}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {STRINGS.months[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.navArrow, { color: colors.primary }]}>{'›'}</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
          {/* Week Headers */}
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

        {/* Selected Day Details */}
        {selectedDay && selectedShift && (() => {
          const display = getShiftDisplay(selectedShift);
          return (
            <View style={[styles.detailCard, { backgroundColor: display.color }]}>
              <View style={styles.detailHeader}>
                <Text style={[styles.detailDate, { color: display.textColor }]}>
                  {selectedDateStr}
                </Text>
                <View style={[styles.detailBadge, { backgroundColor: display.textColor + '20' }]}>
                  <Text style={[styles.detailLetter, { color: display.textColor }]}>
                    {SHIFT_LETTERS[selectedShift]}
                  </Text>
                </View>
              </View>
              <Text style={[styles.detailShift, { color: display.textColor }]}>
                {display.label}
              </Text>
              {SHIFT_TIMES[selectedShift] && (
                <View style={[styles.detailTimeBadge, { backgroundColor: display.textColor + '15' }]}>
                  <Text style={[styles.detailTime, { color: display.textColor }]}>
                    {SHIFT_TIMES[selectedShift]!.start} - {SHIFT_TIMES[selectedShift]!.end}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Legend */}
        <View style={[styles.legendCard, { backgroundColor: colors.surface }]}>
          {SHIFT_ORDER.map((shift) => {
            const display = getShiftDisplay(shift);
            return (
              <View key={shift} style={styles.legendItem}>
                <View style={[styles.legendBadge, { backgroundColor: display.color }]}>
                  <Text style={[styles.legendText, { color: display.textColor }]}>
                    {SHIFT_LETTERS[shift]}
                  </Text>
                </View>
                <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
                  {STRINGS.shifts[shift]}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Shift Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Vardiya Değiştir
            </Text>
            {editingDay && (
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {format(new Date(year, month, editingDay), "d MMMM EEEE", { locale: tr })}
              </Text>
            )}
            <View style={styles.modalOptions}>
              {SHIFT_ORDER.map((shift) => {
                const display = getShiftDisplay(shift);
                const isCurrentShift = editingDay && getShiftForDay(editingDay) === shift;
                return (
                  <Pressable
                    key={shift}
                    style={[
                      styles.modalOption,
                      { backgroundColor: display.color },
                      isCurrentShift && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleShiftChange(shift)}
                  >
                    <View style={[styles.modalOptionBadge, { backgroundColor: display.textColor + '20' }]}>
                      <Text style={[styles.modalOptionLetter, { color: display.textColor }]}>
                        {SHIFT_LETTERS[shift]}
                      </Text>
                    </View>
                    <Text style={[styles.modalOptionLabel, { color: display.textColor }]}>
                      {STRINGS.shifts[shift]}
                    </Text>
                    {isCurrentShift && (
                      <Text style={[styles.modalCurrentBadge, { color: display.textColor }]}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={[styles.modalCancelButton, { backgroundColor: colors.border }]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>İptal</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: '600',
  },
  calendarCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
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
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  shiftBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftLetter: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
    opacity: 0.7,
  },
  detailBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLetter: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailShift: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailTimeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  detailTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
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
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  modalOptions: {
    gap: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  modalOptionSelected: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  modalOptionBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalOptionLetter: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modalCurrentBadge: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancelButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
