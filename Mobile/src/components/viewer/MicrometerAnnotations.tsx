import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { VIEWER_TOKENS } from './tokens';

interface MicrometerAnnotationsProps {
  visible?: boolean;
  width: number;
  height: number;
}

export const MicrometerAnnotations: React.FC<MicrometerAnnotationsProps> = ({
  visible = true,
  width,
  height,
}) => {
  if (!visible) return null;

  // Relative coordinates scaled to viewport size (standard 320x220 reference)
  // Anvil annotation
  const anvilBadge = { x: width * 0.12, y: height * 0.14 };
  const anvilDot = { x: width * 0.22, y: height * 0.38 };

  // Spindle annotation
  const spindleBadge = { x: width * 0.35, y: height * 0.14 };
  const spindleDot = { x: width * 0.31, y: height * 0.42 };

  // Thimble annotation
  const thimbleBadge = { x: width * 0.65, y: height * 0.14 };
  const thimbleDot = { x: width * 0.65, y: height * 0.36 };

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {/* SVG Leader lines and glow dots */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {/* Anvil line */}
        <Line
          x1={anvilBadge.x + 18}
          y1={anvilBadge.y + 18}
          x2={anvilDot.x}
          y2={anvilDot.y}
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1.2"
        />
        <Circle
          cx={anvilDot.x}
          cy={anvilDot.y}
          r="3"
          fill={VIEWER_TOKENS.colors.cyanAccent}
        />
        <Circle
          cx={anvilDot.x}
          cy={anvilDot.y}
          r="5.5"
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1"
          strokeOpacity={0.4}
          fill="none"
        />

        {/* Spindle line */}
        <Line
          x1={spindleBadge.x + 22}
          y1={spindleBadge.y + 18}
          x2={spindleDot.x}
          y2={spindleDot.y}
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1.2"
        />
        <Circle
          cx={spindleDot.x}
          cy={spindleDot.y}
          r="3"
          fill={VIEWER_TOKENS.colors.cyanAccent}
        />
        <Circle
          cx={spindleDot.x}
          cy={spindleDot.y}
          r="5.5"
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1"
          strokeOpacity={0.4}
          fill="none"
        />

        {/* Thimble line */}
        <Line
          x1={thimbleBadge.x + 24}
          y1={thimbleBadge.y + 18}
          x2={thimbleDot.x}
          y2={thimbleDot.y}
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1.2"
        />
        <Circle
          cx={thimbleDot.x}
          cy={thimbleDot.y}
          r="3"
          fill={VIEWER_TOKENS.colors.cyanAccent}
        />
        <Circle
          cx={thimbleDot.x}
          cy={thimbleDot.y}
          r="5.5"
          stroke={VIEWER_TOKENS.colors.cyanAccent}
          strokeWidth="1"
          strokeOpacity={0.4}
          fill="none"
        />
      </Svg>

      {/* Label Cards */}
      {/* 1. Anvil */}
      <View style={[styles.labelBadge, { left: anvilBadge.x - 10, top: anvilBadge.y }]}>
        <Text style={styles.labelText}>Anvil</Text>
      </View>

      {/* 2. Spindle */}
      <View style={[styles.labelBadge, { left: spindleBadge.x - 4, top: spindleBadge.y }]}>
        <Text style={styles.labelText}>Spindle</Text>
      </View>

      {/* 3. Thimble */}
      <View style={[styles.labelBadge, { left: thimbleBadge.x - 4, top: thimbleBadge.y }]}>
        <Text style={styles.labelText}>Thimble</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  labelBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(7, 29, 59, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(32, 200, 255, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: VIEWER_TOKENS.colors.cyanAccent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.1,
  },
});

export default MicrometerAnnotations;
