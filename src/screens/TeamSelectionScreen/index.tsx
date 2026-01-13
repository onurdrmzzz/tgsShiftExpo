import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEAMS_60, TEAMS_30, TEAM_60_CYCLE_STARTS } from '../../constants';
import { TeamSelectionScreenProps, Team60, Team30 } from '../../types';
import { useAppStore } from '../../store';
import { useTheme, useHaptic } from '../../hooks';

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const system = route.params?.system;
  const { setActiveSystem, setTeam60, setTeam30, setCycleStartDate, setOnboardingComplete } = useAppStore();
  const { colors } = useTheme();
  const haptic = useHaptic();

  // If system is provided, show only that system's teams (onboarding flow)
  // If no system, show all teams (settings flow)
  const showBothSystems = !system;

  const handleSelectTeam60 = (team: Team60) => {
    haptic.success();
    setActiveSystem('system60');
    setTeam60(team);
    setCycleStartDate(TEAM_60_CYCLE_STARTS[team]);
    setOnboardingComplete(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleSelectTeam30 = (team: Team30) => {
    haptic.success();
    setActiveSystem('system30');
    setTeam30(team);
    navigation.navigate('ExcelImport', { team });
  };

  const handleSelectTeam = (team: string) => {
    if (system === 'system60') {
      handleSelectTeam60(team as Team60);
    } else if (system === 'system30') {
      handleSelectTeam30(team as Team30);
    }
  };

  const renderTeamGrid = (teams: readonly string[], onSelect: (team: string) => void) => (
    <View style={styles.grid}>
      {teams.map((team) => (
        <Pressable
          key={team}
          style={({ pressed }) => [
            styles.teamCard,
            { backgroundColor: colors.surface },
            pressed && styles.teamCardPressed,
          ]}
          onPress={() => onSelect(team)}
        >
          <View style={[styles.teamIconContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.teamIcon, { color: colors.primary }]}>{team}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );

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
          <Text style={[styles.title, { color: colors.text }]}>Ekip Seçimi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {showBothSystems ? 'Ekibinizi seçin' : `${system === 'system60' ? '%60 Sistem' : '%30 Sistem'} için ekibinizi seçin`}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Show both systems or just one */}
          {showBothSystems ? (
            <>
              {/* %60 System Section */}
              <View style={styles.systemSection}>
                <Text style={[styles.systemTitle, { color: colors.text }]}>%60 Sistem</Text>
                <Text style={[styles.systemDescription, { color: colors.textSecondary }]}>
                  Otomatik vardiya hesaplama
                </Text>
                {renderTeamGrid(TEAMS_60, (team) => handleSelectTeam60(team as Team60))}
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* %30 System Section */}
              <View style={styles.systemSection}>
                <Text style={[styles.systemTitle, { color: colors.text }]}>%30 Sistem</Text>
                <Text style={[styles.systemDescription, { color: colors.textSecondary }]}>
                  Manuel vardiya girişi
                </Text>
                {renderTeamGrid(TEAMS_30, (team) => handleSelectTeam30(team as Team30))}
              </View>
            </>
          ) : (
            <>
              {/* Single system view (onboarding) */}
              {renderTeamGrid(
                system === 'system60' ? TEAMS_60 : TEAMS_30,
                handleSelectTeam
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Ekibinizi daha sonra ayarlardan değiştirebilirsiniz
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  systemSection: {
    marginBottom: 8,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  systemDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  teamCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  teamIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIcon: {
    fontSize: 22,
    fontWeight: '700',
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
