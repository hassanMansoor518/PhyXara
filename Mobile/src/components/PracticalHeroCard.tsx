
import { FileText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { LabApparatus } from './LabApparatus';
import { VernierHeroIllustration } from './illustrations/VernierHeroIllustration';

const heroTitles = [
  'Cross-sectional area', 'Cylinder volume', 'Measuring thickness', 'Ball on a ramp',
  'Free-fall gravity', 'Limiting friction', 'Rolling friction', 'Principle of moments',
  'Vector addition of forces', 'Finding an unknown mass', 'Simple pendulum', 'Spring extension',
  'Density of a solid', 'Density of a liquid', 'Specific heat capacity', 'Heating curve',
];

interface PracticalHeroCardProps {
  number: number;
  title: string;
  model: string;
  pages: string;
  frameWidth: number;
  onOpenManual?: () => void;
}

export function PracticalHeroCard({
  number,
  title,
  model,
  pages,
  frameWidth,
  onOpenManual,
}: PracticalHeroCardProps) {

  // Reference design is based on a 390px mobile viewport.
  const scale = Math.min(frameWidth / 390, 1.15);

  const artWidth = 199 * scale;
  const cardHeight = 187 * scale;
  const practicalTitle = heroTitles[number - 1] ?? title;

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: cardHeight,
          borderRadius: 19 * scale,
          paddingHorizontal: 13 * scale,
          paddingTop: 13 * scale,
          paddingBottom: 11 * scale,
        },
      ]}
    >

      {/* Background gradient */}
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient
            id="heroBackground"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#EDF3FF" />
            <Stop offset="55%" stopColor="#E8F0FF" />
            <Stop offset="100%" stopColor="#D5E7FF" />
          </LinearGradient>
        </Defs>

        <Rect
          width="100%"
          height="100%"
          fill="url(#heroBackground)"
        />
      </Svg>

      {/* Decorative blue shapes */}
      <Svg
        pointerEvents="none"
        width={235 * scale}
        height={230 * scale}
        viewBox="0 0 210 210"
        style={[
          styles.decoration,
          {
            right: -29 * scale,
            top: -15 * scale,
          },
        ]}
      >
        <Circle
          cx="129"
          cy="83"
          r="88"
          fill="#C7DCFB"
        />

        <Path
          d="M24 174 Q88 162 125 97 Q156 49 210 49 V210 H26Z"
          fill="#A5C9FA"
          opacity={0.65}
        />

        <Path
          d="M94 210 Q118 133 177 102 L210 90 V210Z"
          fill="#78AEF7"
          opacity={0.55}
        />

        <Path
          d="M0 136 Q70 168 114 140 T210 133 V171 Q146 167 98 187 T0 166Z"
          fill="#F7FAFF"
          opacity={0.75}
        />
      </Svg>

      {/* Equipment illustration */}
      <View
        pointerEvents="none"
        style={[
          styles.illustration,
          {
            width: artWidth,
            right: 0,
            top: 4 * scale,
            bottom: 4 * scale,
          },
        ]}
      >
        {model === 'caliper' ? (
          <VernierHeroIllustration width={artWidth} height={177 * scale} />
        ) : (
          <LabApparatus
            model={model}
            compact
            compactHeight={154 * scale}
          />
        )}
      </View>

      {/* Practical badge */}
      <View style={styles.content}>
        <View
          style={[
            styles.badge,
            {
              paddingHorizontal: 10 * scale,
              paddingVertical: 4 * scale,
              marginBottom: 9 * scale,
              borderRadius: 20 * scale,
            },
          ]}
        >
          <Text
            style={{
              color: '#1451EB',
              fontSize: 14 * scale,
              fontWeight: '800',
            }}
            numberOfLines={1}
          >
            Class 9 • Practical {String(number).padStart(2, '0')}
          </Text>
        </View>

        {/* Practical title */}
        <Text accessibilityRole="header" accessibilityLabel={title}
          style={{
            color: '#101B48',
            fontSize: 23 * scale,
            lineHeight: 27 * scale,
            fontWeight: '800',
            letterSpacing: -0.6 * scale,
            width: '100%',
          }}
        >
          {practicalTitle}
        </Text>
      </View>

      {/* PDF manual reference */}
      <Pressable
        accessibilityRole={onOpenManual ? 'link' : undefined}
        disabled={!onOpenManual}
        onPress={onOpenManual}
        style={[
          styles.manual,
          {
            marginTop: 'auto',
            paddingTop: 8 * scale,
            gap: 6 * scale,
          },
        ]}
      >
        <FileText
          size={22 * scale}
          color="#1754E9"
          strokeWidth={2}
        />

        <Text
          style={{
            color: '#101B48',
            fontSize: 14 * scale,
            fontWeight: '500',
          }}
          numberOfLines={1}
        >
          Practical manual • PDF pp. {pages}
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E8EFFD',
    overflow: 'hidden',
    position: 'relative',
  },

  decoration: {
    position: 'absolute',
  },

  illustration: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    width: '51%',
    zIndex: 2,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#AFCEFC',
  },

  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    zIndex: 3,
  },
});
