import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEAMS_60, TEAMS_30, TEAM_60_CYCLE_STARTS } from '../../constants';
import { TeamSelectionScreenProps, Team60, Team30 } from '../../types';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks';

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { system } = route.params;
  const { setActiveSystem, setTeam60, setTeam30, setCycleStartDate, setOnboardingComplete } = useAppStore();
  const { colors } = useTheme();

  const teams = system === 'system60' ? TEAMS_60 : TEAMS_30;
  const systemLabel = system === 'system60' ? '%60 Sistem' : '%30 Sistem';

  const handleSelectTeam = (team: string) => {
    setActiveSystem(system);

    if (system === 'system60') {
      const teamKey = team as Team60;
      setTeam60(teamKey);
      // Auto-set cycle start date from predefined values
      setCycleStartDate(TEAM_60_CYCLE_STARTS[teamKey]);
      setOnboardingComplete(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      setTeam30(team as Team30);
      navigation.navigate('ExcelImport', { team: team as Team30 });
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Ekip Seçimi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {systemLabel} için ekibinizi seçin
          </Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.content}>
        <View style={styles.grid}>
          {teams.map((team, index) => (
            <Pressable
              key={team}
              style={({ pressed }) => [
                styles.teamCard,
                { backgroundColor: colors.surface },
                pressed && styles.teamCardPressed,
              ]}
              onPress={() => handleSelectTeam(team)}
            >
              <View style={[styles.teamIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.teamIcon, { color: colors.primary }]}>{team}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
