import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingScreenProps } from '../../types';
import { useTheme } from '../../hooks';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();

  const handleSelectSystem60 = () => {
    navigation.navigate('TeamSelection', { system: 'system60' });
  };

  const handleSelectSystem30 = () => {
    navigation.navigate('TeamSelection', { system: 'system30' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>TGS Vardiya</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Vardiya takip uygulamanız
          </Text>
        </View>

        {/* System Selection */}
        <View style={styles.cardsContainer}>
          <Text style={[styles.selectLabel, { color: colors.textSecondary }]}>
            Vardiya sisteminizi seçin
          </Text>

          {/* System 60 Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface },
              pressed && styles.cardPressed,
            ]}
            onPress={handleSelectSystem60}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.cardIcon, { color: colors.primary }]}>60</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>Otomatik</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>%60 Sistem</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              8 günlük döngü ile çalışan otomatik vardiya sistemi.
              Sabah, akşam, gece ve izin günleri otomatik hesaplanır.
            </Text>
          </Pressable>

          {/* System 30 Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface },
              pressed && styles.cardPressed,
            ]}
            onPress={handleSelectSystem30}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.cardIcon, { color: '#d97706' }]}>30</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#d97706' }]}>
                <Text style={styles.badgeText}>Manuel</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>%30 Sistem</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Aylık manuel vardiya girişi. Her ay için vardiyalarınızı
              kendiniz belirlersiniz.
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Dilediğiniz zaman ayarlardan değiştirebilirsiniz
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  cardsContainer: {
    flex: 1,
  },
  selectLabel: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
