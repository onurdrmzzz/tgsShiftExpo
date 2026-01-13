import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Team60, Team30 } from './shift.types';

/**
 * Root stack navigator param list
 */
export type RootStackParamList = {
  Onboarding: undefined;
  TeamSelection: { system?: 'system60' | 'system30' } | undefined;
  CycleStartDate: { team: Team60 };
  MonthlyEntry: { team?: Team30; month?: string } | undefined;
  ExcelImport: { team?: Team30 } | undefined;
  MainTabs: undefined;
  Settings: undefined;
};

/**
 * Bottom tab navigator param list
 */
export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};

/**
 * Screen props types
 */
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type TeamSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'TeamSelection'>;
export type CycleStartDateScreenProps = NativeStackScreenProps<RootStackParamList, 'CycleStartDate'>;
export type MonthlyEntryScreenProps = NativeStackScreenProps<RootStackParamList, 'MonthlyEntry'>;
export type ExcelImportScreenProps = NativeStackScreenProps<RootStackParamList, 'ExcelImport'>;
export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type CalendarScreenProps = BottomTabScreenProps<MainTabParamList, 'Calendar'>;
export type StatsScreenProps = BottomTabScreenProps<MainTabParamList, 'Stats'>;
export type SettingsScreenProps = BottomTabScreenProps<MainTabParamList, 'Settings'>;
