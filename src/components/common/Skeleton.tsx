import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%" as `${number}%`,
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const backgroundColor = isDark ? colors.surfaceLight : colors.border;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton layouts
export const CardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={60} height={14} />
        <Skeleton width={48} height={48} borderRadius={14} />
      </View>
      <Skeleton width={150} height={32} style={{ marginTop: 16 }} />
      <Skeleton width={100} height={24} borderRadius={8} style={{ marginTop: 12 }} />
    </View>
  );
};

export const WeekCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.weekCard, { backgroundColor: colors.surface }]}>
      {[...Array(7)].map((_, i) => (
        <View key={i} style={styles.weekDay}>
          <Skeleton width={20} height={12} />
          <Skeleton width={24} height={15} style={{ marginTop: 4 }} />
          <Skeleton width={28} height={28} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
  },
});
