import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { STRINGS, SHIFT_TIMES, SHIFT_ORDER } from '../../constants';
import { StatsScreenProps, ShiftType } from '../../types';
import { useAppStore } from '../../store';
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

// Animated Bar Component
const AnimatedBar: React.FC<{
  percentage: number;
  color: string;
  delay: number;
}> = ({ percentage, color, delay }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [percentage, delay]);

  return (
    <Animated.View
      style={[
        styles.barFill,
        {
          backgroundColor: color,
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  );
};

export const StatsScreen: React.FC<StatsScreenProps> = () => {
  const { getShiftForDate, activeSystem } = useAppStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Calculate stats for current month
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const shiftCounts: Partial<Record<ShiftType, number>> = {};
    let totalWorkHours = 0;
    let workDays = 0;
    let offDays = 0;

    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const shift = getShiftForDate(dateStr);

      if (shift) {
        shiftCounts[shift] = (shiftCounts[shift] || 0) + 1;

        const times = SHIFT_TIMES[shift];
        if (times) {
          // Calculate hours
          const startHour = parseInt(times.start.split(':')[0]);
          const endHour = parseInt(times.end.split(':')[0]);
          let hours = endHour - startHour;
          if (hours < 0) hours += 24; // Night shift
          totalWorkHours += hours;
          workDays++;
        } else {
          offDays++;
        }
      }
    });

    // Sort shifts by count
    const sortedShifts = SHIFT_ORDER
      .filter(shift => shiftCounts[shift])
      .sort((a, b) => (shiftCounts[b] || 0) - (shiftCounts[a] || 0));

    return {
      shiftCounts,
      sortedShifts,
      totalWorkHours,
      workDays,
      offDays,
      totalDays: days.length,
    };
  }, [getShiftForDate]);

  const getShiftDisplay = (shift: ShiftType) => ({
    color: colors[shift].background,
    textColor: colors[shift].text,
    label: STRINGS.shifts[shift],
  });

  const currentMonth = format(new Date(), 'MMMM yyyy');

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>İstatistikler</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {currentMonth}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.summaryValue}>{stats.totalWorkHours}</Text>
            <Text style={styles.summaryLabel}>Çalışma Saati</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
            <Text style={styles.summaryValue}>{stats.workDays}</Text>
            <Text style={styles.summaryLabel}>İş Günü</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.error }]}>
            <Text style={styles.summaryValue}>{stats.offDays}</Text>
            <Text style={styles.summaryLabel}>İzin Günü</Text>
          </View>
        </View>

        {/* Shift Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vardiya Dağılımı</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {stats.sortedShifts.length > 0 ? (
              stats.sortedShifts.map((shift, index) => {
                const count = stats.shiftCounts[shift] || 0;
                const percentage = Math.round((count / stats.totalDays) * 100);
                const display = getShiftDisplay(shift);

                return (
                  <View key={shift} style={styles.barRow}>
                    <View style={styles.barLabelContainer}>
                      <View style={[styles.barBadge, { backgroundColor: display.color }]}>
                        <Text style={[styles.barBadgeText, { color: display.textColor }]}>
                          {SHIFT_LETTERS[shift]}
                        </Text>
                      </View>
                      <Text style={[styles.barLabel, { color: colors.text }]}>
                        {display.label}
                      </Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
                        <AnimatedBar
                          percentage={percentage}
                          color={display.color}
                          delay={index * 100}
                        />
                      </View>
                      <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                        {count} gün ({percentage}%)
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                Bu ay için veri yok
              </Text>
            )}
          </View>
        </View>

        {/* Work Hours Detail */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Detaylı Bilgi</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Toplam Çalışma Saati
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {stats.totalWorkHours} saat
              </Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Ortalama Günlük Saat
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {stats.workDays > 0 ? (stats.totalWorkHours / stats.workDays).toFixed(1) : 0} saat
              </Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Çalışma Oranı
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {stats.totalDays > 0 ? Math.round((stats.workDays / stats.totalDays) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  barRow: {
    marginBottom: 16,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  barBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 80,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
  },
});
