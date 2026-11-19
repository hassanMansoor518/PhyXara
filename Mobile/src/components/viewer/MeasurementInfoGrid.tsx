import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ruler, Maximize2, Target, Clock, Crosshair } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';
import { MeasurementInfoCard, MeasurementSpecItem } from './MeasurementInfoCard';

interface MeasurementInfoGridProps {
  customSpecs?: MeasurementSpecItem[];
  title?: string;
  subtitle?: string;
}

export const MICROMETER_SPECIFICATIONS: MeasurementSpecItem[] = [
  {
    id: 'pitch',
    title: 'Pitch',
    value: '0.5 mm',
    description: 'Distance moved by spindle in one full rotation.',
    icon: Maximize2,
  },
  {
    id: 'least_count',
    title: 'Least Count',
    value: '0.01 mm',
    description: 'Smallest value it can measure.',
    icon: Target,
  },
  {
    id: 'divisions',
    title: 'Thimble Divisions',
    value: '50',
    description: 'Total divisions on thimble.',
    icon: Clock,
  },
  {
    id: 'precision',
    title: 'Precision',
    value: '±0.005 mm',
    description: 'Measurement accuracy.',
    icon: Crosshair,
  },
];

export const MeasurementInfoGrid: React.FC<MeasurementInfoGridProps> = ({
  customSpecs,
  title = 'Measurement Information',
  subtitle = 'Key specifications of micrometer screw gauge',
}) => {
  const specs = customSpecs || MICROMETER_SPECIFICATIONS;

  // Split into pairs of 2 for 2-column grid layout
  const row1 = specs.slice(0, 2);
  const row2 = specs.slice(2, 4);

  return (
    <View style={styles.container}>
      {/* Header Row: Ruler Icon + Title & Subtitle */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ruler size={18} color={VIEWER_TOKENS.colors.cyanAccent} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>{title}</Text>
          <Text style={styles.subheading}>{subtitle}</Text>
        </View>
      </View>

      {/* 2x2 Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.row}>
          {row1.map((item) => (
            <MeasurementInfoCard key={item.id} item={item} />
          ))}
        </View>

        {/* Row 2 */}
        {row2.length > 0 && (
          <View style={styles.row}>
            {row2.map((item) => (
              <MeasurementInfoCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: VIEWER_TOKENS.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: VIEWER_TOKENS.spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VIEWER_TOKENS.colors.cyanAccentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  heading: {
    fontSize: VIEWER_TOKENS.typography.heading,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: VIEWER_TOKENS.typography.caption,
    color: VIEWER_TOKENS.colors.secondaryText,
    marginTop: 1,
  },
  grid: {
    gap: VIEWER_TOKENS.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: VIEWER_TOKENS.spacing.sm,
  },
});

export default MeasurementInfoGrid;
