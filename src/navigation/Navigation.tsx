import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  OnboardingScreen,
  TeamSelectionScreen,
  CycleStartDateScreen,
  MonthlyEntryScreen,
  ExcelImportScreen,
  HomeScreen,
  CalendarScreen,
  StatsScreen,
  SettingsScreen,
} from '../screens';
import { RootStackParamList, MainTabParamList } from '../types';
import { useAppStore } from '../store';
import { useTheme } from '../hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = keyof typeof Ionicons.glyphMap;

const TabIcon: React.FC<{ icon: IoniconsName; focused: boolean; colors: any }> = ({ icon, focused, colors }) => (
  <View style={[
    styles.tabIconContainer,
    focused && { backgroundColor: colors.primaryLight }
  ]}>
    <Ionicons
      name={icon}
      size={22}
      color={focused ? colors.primary : colors.textTertiary}
    />
  </View>
);

const MainTabs: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: Math.max(6, insets.bottom),
          height: 65 + insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Bugün',
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? "today" : "today-outline"} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Takvim',
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? "calendar" : "calendar-outline"} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'İstatistik',
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? "stats-chart" : "stats-chart-outline"} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ayarlar',
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? "settings" : "settings-outline"} focused={focused} colors={colors} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation: React.FC = () => {
  const { preferences } = useAppStore();
  const { colors, isDark } = useTheme();

  // Ensure boolean coercion for initialRouteName to avoid type casting issues
  const isOnboardingComplete = preferences.onboardingComplete === true;

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '900' as const },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName={isOnboardingComplete ? 'MainTabs' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="TeamSelection" component={TeamSelectionScreen} />
        <Stack.Screen name="CycleStartDate" component={CycleStartDateScreen} />
        <Stack.Screen name="MonthlyEntry" component={MonthlyEntryScreen} />
        <Stack.Screen name="ExcelImport" component={ExcelImportScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
