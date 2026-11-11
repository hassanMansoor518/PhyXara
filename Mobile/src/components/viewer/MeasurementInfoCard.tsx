import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

export interface MeasurementSpecItem {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

interface MeasurementInfoCardProps {
  item: MeasurementSpecItem;
}

export const MeasurementInfoCard: React.FC<MeasurementInfoCardProps> = ({ item }) => {
  const IconComponent = item.icon;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <IconComponent size={16} color={VIEWER_TOKENS.colors.cyanAccent} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.value} numberOfLines={1}>
            {item.value}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {item.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: VIEWER_TOKENS.colors.cardBg,
    borderRadius: VIEWER_TOKENS.radius.lg,
    padding: VIEWER_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: VIEWER_TOKENS.colors.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(32, 200, 255, 0.25)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '600',
    color: VIEWER_TOKENS.colors.secondaryText,
    marginBottom: 2,
  },
  value: {
    fontSize: VIEWER_TOKENS.typography.value,
    fontWeight: '800',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 10.5,
    lineHeight: 14,
    color: VIEWER_TOKENS.colors.mutedText,
  },
});

export default MeasurementInfoCard;
