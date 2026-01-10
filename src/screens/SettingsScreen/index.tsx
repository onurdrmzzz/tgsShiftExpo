import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRINGS } from '../../constants';
import { SettingsScreenProps } from '../../types';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  colors: any;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
  colors,
}) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <View style={styles.rowLeft}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: danger ? '#fee2e2' : colors.primaryLight }
      ]}>
        <Text style={[
          styles.icon,
          { color: danger ? colors.error : colors.primary }
        ]}>
          {icon}
        </Text>
      </View>
      <Text style={[
        styles.rowLabel,
        { color: danger ? colors.error : colors.text }
      ]}>
        {label}
      </Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>}
      {showChevron && onPress && (
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

interface SettingsToggleProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  colors: any;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  icon,
  label,
  value,
  onToggle,
  colors,
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.icon, { color: colors.primary }]}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor="#fff"
    />
  </View>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSystem, getCurrentTeam, cycleStartDate, resetApp } = useAppStore();
  const { colors, isDark, toggleTheme } = useTheme();

  const team = getCurrentTeam();
  const systemLabel = activeSystem === 'system60' ? '%60 Sistem' : '%30 Sistem';

  const handleReset = () => {
    Alert.alert(
      'Uygulamayı Sıfırla',
      'Tüm verileriniz silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetApp();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' as const }],
            });
          },
        },
      ]
    );
  };

  const handleChangeTeam = () => {
    if (activeSystem) {
      navigation.navigate('TeamSelection', { system: activeSystem });
    }
  };

  const handleChangeCycleStart = () => {
    if (activeSystem === 'system60' && team) {
      navigation.navigate('CycleStartDate', { team: team as any });
    }
  };

  const handleEditShifts = () => {
    navigation.navigate('MonthlyEntry');
  };

  const handleImportExcel = () => {
    navigation.navigate('ExcelImport');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        </View>

        {/* Current Configuration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Mevcut Yapılandırma
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingsItem
              icon="S"
              label="Sistem"
              value={systemLabel}
              showChevron={false}
              colors={colors}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingsItem
              icon="E"
              label="Ekip"
              value={team || '-'}
              showChevron={false}
              colors={colors}
            />
            {activeSystem === 'system60' && cycleStartDate && (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <SettingsItem
                  icon="D"
                  label="Döngü Başlangıcı"
                  value={cycleStartDate}
                  showChevron={false}
                  colors={colors}
                />
              </>
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Görünüm
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingsToggle
              icon="T"
              label="Koyu Tema"
              value={isDark}
              onToggle={toggleTheme}
              colors={colors}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Düzenle
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingsItem
              icon="E"
              label="Ekip Değiştir"
              onPress={handleChangeTeam}
              colors={colors}
            />
            {activeSystem === 'system60' && (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <SettingsItem
                  icon="D"
                  label="Döngü Başlangıcını Değiştir"
                  onPress={handleChangeCycleStart}
                  colors={colors}
                />
              </>
            )}
            {activeSystem === 'system30' && (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <SettingsItem
                  icon="Y"
                  label="Vardiya Yükle (Excel)"
                  onPress={handleImportExcel}
                  colors={colors}
                />
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <SettingsItem
                  icon="V"
                  label="Vardiyaları Düzenle"
                  onPress={handleEditShifts}
                  colors={colors}
                />
              </>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Hakkında
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingsItem
              icon="i"
              label="Uygulama Versiyonu"
              value="1.0.0"
              showChevron={false}
              colors={colors}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              Uygulamayı Sıfırla
            </Text>
          </TouchableOpacity>
          <Text style={[styles.dangerHint, { color: colors.textTertiary }]}>
            Tüm verileriniz silinecek ve baştan başlayacaksınız
          </Text>
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
    paddingBottom: 40,
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

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Card
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    marginLeft: 64,
  },

  // Danger Button
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
