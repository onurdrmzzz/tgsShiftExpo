import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { ExcelImportScreenProps } from '../../types';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks';
import {
  parseExcelFile,
  findEmployeeBySicil,
  ParsedEmployee,
  ParseResult,
} from '../../services/excelParser';
import { STRINGS } from '../../constants/strings';

export const ExcelImportScreen: React.FC<ExcelImportScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const {
    preferences,
    setSicilNo,
    setBulkShifts,
    setOnboardingComplete,
  } = useAppStore();

  const [sicil, setSicil] = useState(preferences.sicilNo || '');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [foundEmployee, setFoundEmployee] = useState<ParsedEmployee | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Month selection state
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-indexed
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Generate month key in "YYYY-MM" format
  const getMonthKey = () => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  };

  // Try to find employee when sicil or parseResult changes
  useEffect(() => {
    if (parseResult?.success && sicil.trim()) {
      const employee = findEmployeeBySicil(parseResult.employees, sicil);
      setFoundEmployee(employee);
      if (!employee && parseResult.employees.length > 0) {
        setError('Bu sicil numarası dosyada bulunamadı');
      } else {
        setError(null);
      }
    } else {
      setFoundEmployee(null);
    }
  }, [sicil, parseResult]);

  const handlePickFile = async () => {
    try {
      setError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setFileName(file.name);
      setFileUri(file.uri);
      setLoading(true);

      const parsed = await parseExcelFile(file.uri, file.name, getMonthKey());
      setParseResult(parsed);

      // Update selected month from parsed result if available
      if (parsed.success && parsed.month) {
        const [year, month] = parsed.month.split('-');
        setSelectedYear(parseInt(year));
        setSelectedMonth(parseInt(month) - 1); // Convert to 0-indexed
      }

      if (!parsed.success) {
        setError(parsed.error || 'Dosya okunamadı');
      }
    } catch (err) {
      console.error('File pick error:', err);
      setError('Dosya seçilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Re-parse file when month changes
  const handleMonthChange = async (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowMonthPicker(false);

    if (fileUri && fileName) {
      setLoading(true);
      try {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const parsed = await parseExcelFile(fileUri, fileName, monthKey);
        setParseResult(parsed);

        if (!parsed.success) {
          setError(parsed.error || 'Dosya okunamadı');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Re-parse error:', err);
        setError('Dosya işlenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirm = () => {
    if (!foundEmployee) return;

    // Save sicil number
    setSicilNo(sicil.trim());

    // Import shifts
    setBulkShifts(foundEmployee.shifts);

    // Check if coming from onboarding or settings
    if (!preferences.onboardingComplete) {
      // First time - mark onboarding complete and go to main
      setOnboardingComplete(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      // Coming from settings - just go back
      navigation.goBack();
    }
  };

  const getShiftSummary = (employee: ParsedEmployee) => {
    const counts: Record<string, number> = {
      morning: 0,
      evening: 0,
      night: 0,
      off: 0,
      annual: 0,
      training: 0,
      normal: 0,
      sick: 0,
      excuse: 0,
    };
    // MonthlyShiftData is { "2026-01": { 1: "morning", 2: "evening", ... } }
    Object.values(employee.shifts).forEach((monthData) => {
      Object.values(monthData).forEach((shift) => {
        if (counts[shift] !== undefined) {
          counts[shift]++;
        }
      });
    });
    return counts;
  };

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
          <Text style={[styles.title, { color: colors.text }]}>Vardiya Yükleme</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Excel dosyasından içe aktar
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Sicil Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sicil Numaranız</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={sicil}
            onChangeText={setSicil}
            placeholder="Örn: 19266"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
          />
        </View>

        {/* File Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Excel Dosyası</Text>
          <TouchableOpacity
            style={[styles.fileButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handlePickFile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.fileIcon, { color: colors.primary }]}>📄</Text>
                <Text style={[styles.fileButtonText, { color: colors.text }]}>
                  {fileName || 'Dosya Seç'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {fileName && (
            <Text style={[styles.fileNameHint, { color: colors.textSecondary }]}>
              {fileName}
            </Text>
          )}
        </View>

        {/* Month Selector - shown after file is loaded */}
        {parseResult?.success && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ay Seçimi</Text>
            <TouchableOpacity
              style={[styles.monthSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowMonthPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.monthSelectorText, { color: colors.text }]}>
                {STRINGS.months[selectedMonth]} {selectedYear}
              </Text>
              <Text style={[styles.monthSelectorArrow, { color: colors.textSecondary }]}>▼</Text>
            </TouchableOpacity>
            <Text style={[styles.monthHint, { color: colors.textSecondary }]}>
              Farklı bir ay için veri yüklemek istiyorsanız değiştirin
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Found Employee Preview */}
        {foundEmployee && (
          <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {foundEmployee.name}
              </Text>
              <View style={[styles.teamBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.teamBadgeText, { color: colors.primary }]}>
                  {foundEmployee.team}
                </Text>
              </View>
            </View>
            <Text style={[styles.previewPosition, { color: colors.textSecondary }]}>
              {foundEmployee.position}
            </Text>

            {/* Shift Summary */}
            <View style={styles.shiftSummary}>
              {(() => {
                const summary = getShiftSummary(foundEmployee);
                const shiftTypes = [
                  { key: 'morning', label: 'S', color: colors.morning },
                  { key: 'evening', label: 'A', color: colors.evening },
                  { key: 'night', label: 'G', color: colors.night },
                  { key: 'off', label: 'İ', color: colors.off },
                  { key: 'annual', label: 'Y', color: colors.annual },
                  { key: 'training', label: 'E', color: colors.training },
                  { key: 'normal', label: 'N', color: colors.normal },
                  { key: 'sick', label: 'R', color: colors.sick },
                  { key: 'excuse', label: 'M', color: colors.excuse },
                ];
                // Only show types with count > 0
                const activeTypes = shiftTypes.filter(t => summary[t.key] > 0);
                return activeTypes.map((type) => (
                  <View
                    key={type.key}
                    style={[styles.summaryItem, { backgroundColor: type.color.background }]}
                  >
                    <Text style={[styles.summaryLabel, { color: type.color.text }]}>{type.label}</Text>
                    <Text style={[styles.summaryCount, { color: type.color.text }]}>{summary[type.key]}</Text>
                  </View>
                ));
              })()}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: foundEmployee ? colors.primary : colors.border },
          ]}
          onPress={handleConfirm}
          disabled={!foundEmployee}
          activeOpacity={0.8}
        >
          <Text style={[styles.confirmButtonText, { color: foundEmployee ? '#fff' : colors.textTertiary }]}>
            Onayla ve Devam Et
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingTitle, { color: colors.text }]}>
              Dosya İşleniyor
            </Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
              Excel dosyası okunuyor, lütfen bekleyin...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal transparent visible={showMonthPicker} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={[styles.monthPickerCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.monthPickerTitle, { color: colors.text }]}>Ay Seçin</Text>

            {/* Year Selector */}
            <View style={styles.yearSelector}>
              <TouchableOpacity
                style={[styles.yearButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setSelectedYear(selectedYear - 1)}
              >
                <Text style={[styles.yearButtonText, { color: colors.primary }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.yearText, { color: colors.text }]}>{selectedYear}</Text>
              <TouchableOpacity
                style={[styles.yearButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setSelectedYear(selectedYear + 1)}
              >
                <Text style={[styles.yearButtonText, { color: colors.primary }]}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {STRINGS.months.map((monthName, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    {
                      backgroundColor: selectedMonth === index ? colors.primary : colors.background,
                    },
                  ]}
                  onPress={() => handleMonthChange(selectedYear, index)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      {
                        color: selectedMonth === index ? '#fff' : colors.text,
                        fontWeight: selectedMonth === index ? '700' : '500',
                      },
                    ]}
                  >
                    {monthName.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={() => setShowMonthPicker(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  fileButton: {
    height: 80,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileNameHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  teamBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  teamBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewPosition: {
    fontSize: 14,
    marginBottom: 20,
  },
  shiftSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    width: 280,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  loadingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Month selector styles
  monthSelector: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthSelectorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthSelectorArrow: {
    fontSize: 14,
  },
  monthHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  // Month picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPickerCard: {
    width: 320,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  monthPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 24,
  },
  yearButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  yearText: {
    fontSize: 22,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  monthItemText: {
    fontSize: 15,
  },
  closeButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
