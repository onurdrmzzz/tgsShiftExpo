import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { STRINGS, SHIFT_TIMES, SHIFT_ORDER } from '../../constants';
import { HomeScreenProps, ShiftType } from '../../types';
import { useAppStore } from '../../store';
import { useTheme, useHaptic } from '../../hooks';
import { Ionicons } from '@expo/vector-icons';
import { getTeams60WithShift, formatMatchingTeams } from '../../services';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { activeSystem, getShiftForDate, getCurrentTeam, setShiftOverride } = useAppStore();
  const { colors, isDark } = useTheme();
  const haptic = useHaptic();
  const [refreshing, setRefreshing] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [quickActionDate, setQuickActionDate] = useState<string | null>(null);

  // Animation values
  const todayCardScale = useRef(new Animated.Value(1)).current;
  const tomorrowCardScale = useRef(new Animated.Value(1)).current;
  const legendHeight = useRef(new Animated.Value(0)).current;
  const legendRotation = useRef(new Animated.Value(0)).current;

  const toggleLegend = () => {
    const toValue = legendExpanded ? 0 : 1;
    setLegendExpanded(!legendExpanded);
    Animated.parallel([
      Animated.spring(legendHeight, {
        toValue,
        useNativeDriver: false,
        speed: 12,
        bounciness: 0,
      }),
      Animated.spring(legendRotation, {
        toValue,
        useNativeDriver: true,
        speed: 12,
        bounciness: 0,
      }),
    ]).start();
  };

  const legendRotateInterpolate = legendRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleLongPress = (dateStr: string) => {
    haptic.medium();
    setQuickActionDate(dateStr);
    setShowQuickAction(true);
  };

  const handleQuickShiftChange = (shift: ShiftType) => {
    if (quickActionDate) {
      setShiftOverride(quickActionDate, shift);
      haptic.success();
    }
    setShowQuickAction(false);
    setQuickActionDate(null);
  };

  const animatePressIn = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const animatePressOut = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in real app this could sync data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const team = getCurrentTeam();

  // Store'dan shift al - override'ları da içerir
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  const todayShift = getShiftForDate(todayStr);
  const tomorrowShift = getShiftForDate(tomorrowStr);

  // Haftalık vardiyalar - store'dan al
  const weekShifts: Array<{ date: Date; shift: ShiftType }> = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const shift = getShiftForDate(dateStr);
    if (shift) {
      weekShifts.push({ date, shift });
    }
  }

  // Shift display helper
  const getShiftDisplay = (shift: ShiftType) => ({
    color: colors[shift].background,
    textColor: colors[shift].text,
    label: STRINGS.shifts[shift],
  });

  // Get matching 60% teams for System30 users
  const todayMatchingTeams = activeSystem === 'system30' && todayShift
    ? getTeams60WithShift(today, todayShift)
    : [];
  const tomorrowMatchingTeams = activeSystem === 'system30' && tomorrowShift
    ? getTeams60WithShift(tomorrow, tomorrowShift)
    : [];

  // Greeting based on time
  const hour = today.getHours();
  let greeting = 'Günaydın';
  if (hour >= 12 && hour < 18) greeting = 'İyi günler';
  else if (hour >= 18) greeting = 'İyi akşamlar';

  const formattedDate = format(today, "d MMMM EEEE", { locale: tr });

  // Empty state
  if (!todayShift) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Vardiya Verisi Yok</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Ayarlardan vardiya bilgilerinizi girin
          </Text>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.emptyButtonText}>Ayarlara Git</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const todayDisplay = getShiftDisplay(todayShift);
  const todayTime = SHIFT_TIMES[todayShift];

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
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formattedDate}</Text>
          </View>
          {team && (
            <View style={[styles.teamBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.teamText}>{team}</Text>
            </View>
          )}
        </View>

        {/* Today's Shift Card */}
        <AnimatedPressable
          onPress={() => navigation.navigate('Calendar')}
          onLongPress={() => handleLongPress(todayStr)}
          delayLongPress={400}
          onPressIn={() => animatePressIn(todayCardScale)}
          onPressOut={() => animatePressOut(todayCardScale)}
          style={[
            styles.todayCard,
            { backgroundColor: todayDisplay.color },
            { transform: [{ scale: todayCardScale }] },
          ]}>
          <View style={styles.todayHeader}>
            <Text style={[styles.todayLabel, { color: todayDisplay.textColor }]}>
              BUGÜN
            </Text>
            <View style={[styles.shiftBadge, { backgroundColor: todayDisplay.textColor + '20' }]}>
              <Text style={[styles.shiftLetter, { color: todayDisplay.textColor }]}>
                {SHIFT_LETTERS[todayShift]}
              </Text>
            </View>
          </View>

          <Text style={[styles.shiftName, { color: todayDisplay.textColor }]}>
            {STRINGS.shifts[todayShift]}
          </Text>

          {todayTime && (
            <View style={[styles.timeBadge, { backgroundColor: todayDisplay.textColor + '15' }]}>
              <Text style={[styles.timeText, { color: todayDisplay.textColor }]}>
                {todayTime.start} - {todayTime.end}
              </Text>
            </View>
          )}

          {/* Matching 60% teams for System30 users */}
          {todayMatchingTeams.length > 0 && (
            <View style={styles.matchingTeamsRow}>
              <Text style={[styles.matchingTeamsText, { color: todayDisplay.textColor }]}>
                {formatMatchingTeams(todayMatchingTeams)}
              </Text>
            </View>
          )}
        </AnimatedPressable>

        {/* Tomorrow Card */}
        {tomorrowShift && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Yarın</Text>
            <AnimatedPressable
              onPress={() => navigation.navigate('Calendar')}
              onLongPress={() => handleLongPress(tomorrowStr)}
              delayLongPress={400}
              onPressIn={() => animatePressIn(tomorrowCardScale)}
              onPressOut={() => animatePressOut(tomorrowCardScale)}
              style={[styles.smallCard, { backgroundColor: getShiftDisplay(tomorrowShift).color }, { transform: [{ scale: tomorrowCardScale }] }]}
            >
              <View style={styles.smallCardContent}>
                <View>
                  <Text style={[styles.smallCardDate, { color: getShiftDisplay(tomorrowShift).textColor }]}>
                    {format(tomorrow, 'd MMMM', { locale: tr })}
                  </Text>
                  <Text style={[styles.smallCardShift, { color: getShiftDisplay(tomorrowShift).textColor }]}>
                    {STRINGS.shifts[tomorrowShift]}
                  </Text>
                  {tomorrowMatchingTeams.length > 0 && (
                    <Text style={[styles.smallCardTeams, { color: getShiftDisplay(tomorrowShift).textColor }]}>
                      {formatMatchingTeams(tomorrowMatchingTeams)}
                    </Text>
                  )}
                </View>
                <View style={[styles.smallBadge, { backgroundColor: getShiftDisplay(tomorrowShift).textColor + '20' }]}>
                  <Text style={[styles.smallBadgeText, { color: getShiftDisplay(tomorrowShift).textColor }]}>
                    {SHIFT_LETTERS[tomorrowShift]}
                  </Text>
                </View>
              </View>
            </AnimatedPressable>
          </View>
        )}

        {/* Week Preview */}
        {weekShifts.length > 0 && (() => {
          const todayBgColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
          const todayBorderColor = isDark ? '#ffffff' : '#000000';
          const todayTextColor = isDark ? '#ffffff' : '#000000';

          return (
            <Pressable
              style={styles.section}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Bu Hafta</Text>
              <View style={[styles.weekCard, { backgroundColor: colors.surface }]}>
                {weekShifts.map((item, index) => {
                  const dayIndex = item.date.getDay();
                  const dayName = STRINGS.days.narrow[dayIndex === 0 ? 6 : dayIndex - 1];
                  const isTodayDate = index === 0;
                  const display = getShiftDisplay(item.shift);

                  return (
                    <View key={index} style={[
                      styles.weekDay,
                      isTodayDate && {
                        backgroundColor: todayBgColor,
                        borderWidth: 2,
                        borderColor: todayBorderColor,
                      }
                    ]}>
                      <Text style={[
                        styles.weekDayName,
                        { color: isTodayDate ? todayTextColor : colors.textTertiary },
                        isTodayDate && { fontWeight: '800' }
                      ]}>
                        {dayName}
                      </Text>
                      <Text style={[
                        styles.weekDayNumber,
                        { color: isTodayDate ? todayTextColor : colors.text },
                        isTodayDate && { fontWeight: '800' }
                      ]}>
                        {item.date.getDate()}
                      </Text>
                      <View style={[styles.weekBadge, { backgroundColor: display.color }]}>
                        <Text style={[styles.weekBadgeText, { color: display.textColor }]}>
                          {SHIFT_LETTERS[item.shift]}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Pressable>
          );
        })()}

        {/* Legend - Collapsible */}
        <View style={[styles.legendCard, { backgroundColor: colors.surface }]}>
          <Pressable style={styles.legendHeader} onPress={toggleLegend}>
            <Text style={[styles.legendTitle, { color: colors.text }]}>Vardiya Açıklamaları</Text>
            <Animated.View style={{ transform: [{ rotate: legendRotateInterpolate }] }}>
              <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>
          <Animated.View style={[
            styles.legendContent,
            {
              maxHeight: legendHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: legendHeight,
            }
          ]}>
            <View style={styles.legendGrid}>
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
          </Animated.View>
        </View>
      </ScrollView>

      {/* Quick Action Modal */}
      <Modal
        visible={showQuickAction}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickAction(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowQuickAction(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Vardiya Değiştir
            </Text>
            {quickActionDate && (
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {format(new Date(quickActionDate), "d MMMM EEEE", { locale: tr })}
              </Text>
            )}
            <View style={styles.modalOptions}>
              {SHIFT_ORDER.map((shift) => {
                const display = getShiftDisplay(shift);
                const currentShift = quickActionDate ? getShiftForDate(quickActionDate) : null;
                const isCurrentShift = currentShift === shift;
                return (
                  <Pressable
                    key={shift}
                    style={[
                      styles.modalOption,
                      { backgroundColor: display.color },
                      isCurrentShift && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleQuickShiftChange(shift)}
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
                      <Ionicons name="checkmark" size={20} color={display.textColor} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={[styles.modalCancelButton, { backgroundColor: colors.border }]}
              onPress={() => setShowQuickAction(false)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  date: {
    fontSize: 15,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  teamBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  teamText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Today Card
  todayCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.7,
  },
  shiftBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftLetter: {
    fontSize: 22,
    fontWeight: '700',
  },
  shiftName: {
    fontSize: 32,
    fontWeight: '700',
  },
  timeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Matching Teams
  matchingTeamsRow: {
    marginTop: 12,
  },
  matchingTeamsText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Small Card (Tomorrow)
  smallCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  smallCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallCardDate: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  smallCardShift: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  smallCardTeams: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.8,
  },
  smallBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBadgeText: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Week Card
  weekCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  weekBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Legend
  legendCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendContent: {
    overflow: 'hidden',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
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

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
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
