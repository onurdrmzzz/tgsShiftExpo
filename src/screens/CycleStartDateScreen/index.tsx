import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, subDays, addDays } from 'date-fns';
import { STRINGS } from '../../constants';
import { CycleStartDateScreenProps } from '../../types';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks';

export const CycleStartDateScreen: React.FC<CycleStartDateScreenProps> = ({
  navigation,
}) => {
  const { setCycleStartDate, setOnboardingComplete } = useAppStore();
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleConfirm = () => {
    setCycleStartDate(format(selectedDate, 'yyyy-MM-dd'));
    setOnboardingComplete(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handlePrevDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const formattedDate = `${selectedDate.getDate()} ${STRINGS.months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const dayName = STRINGS.days.short[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1];

  const CYCLE_PREVIEW = [
    { days: '1-2', label: 'Sabah', letter: 'S', color: colors.morning.background, textColor: colors.morning.text },
    { days: '3-4', label: 'Akşam', letter: 'A', color: colors.evening.background, textColor: colors.evening.text },
    { days: '5-6', label: 'Gece', letter: 'G', color: colors.night.background, textColor: colors.night.text },
    { days: '7-8', label: 'İzin', letter: 'İ', color: colors.off.background, textColor: colors.off.text },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>{STRINGS.cycleStart.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{STRINGS.cycleStart.subtitle}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Helper Text */}
        <Text style={[styles.helper, { color: colors.textSecondary }]}>{STRINGS.cycleStart.helper}</Text>

        {/* Date Selector Card */}
        <View style={[styles.dateCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={handlePrevDay}
            style={[styles.arrowButton, { backgroundColor: colors.primaryLight }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.arrow, { color: colors.primary }]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.dateDisplay}>
            <Text style={[styles.dayName, { color: colors.textSecondary }]}>{dayName}</Text>
            <Text style={[styles.dateText, { color: colors.text }]}>{formattedDate}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            style={[styles.arrowButton, { backgroundColor: colors.primaryLight }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Cycle Preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Döngü Önizleme</Text>
          <View style={styles.previewGrid}>
            {CYCLE_PREVIEW.map((item) => (
              <View key={item.days} style={styles.previewItem}>
                <View style={[styles.previewBadge, { backgroundColor: item.color }]}>
                  <Text style={[styles.previewLetter, { color: item.textColor }]}>
                    {item.letter}
                  </Text>
                </View>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.previewDays, { color: colors.textTertiary }]}>Gün {item.days}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              { backgroundColor: colors.primary },
              pressed && styles.confirmButtonPressed,
            ]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>{STRINGS.cycleStart.confirm}</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Döngü başlangıcını daha sonra ayarlardan değiştirebilirsiniz
        </Text>
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
    paddingBottom: 24,
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
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  helper: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  dateDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
  },
  previewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  previewLetter: {
    fontSize: 20,
    fontWeight: '700',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewDays: {
    fontSize: 11,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  confirmButton: {
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
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
