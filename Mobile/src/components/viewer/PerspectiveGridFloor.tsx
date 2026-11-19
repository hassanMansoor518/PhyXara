import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface PerspectiveGridFloorProps {
  width?: number;
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const PerspectiveGridFloor: React.FC<PerspectiveGridFloorProps> = ({
  width = SCREEN_WIDTH - 32,
  height = 140,
}) => {
  const horizonY = 10;
  const bottomY = height;
  const centerX = width / 2;

  // Horizontal perspective lines (closer at top, further apart at bottom)
  const horizontalRatios = [0.08, 0.2, 0.36, 0.56, 0.78, 1.0];
  const horizontalLines = horizontalRatios.map((r, i) => {
    const y = horizonY + (bottomY - horizonY) * r;
    // widen with perspective
    const spread = (width * 0.4) + (width * 0.6) * r;
    return {
      key: `h-${i}`,
      x1: Math.max(0, centerX - spread),
      y1: y,
      x2: Math.min(width, centerX + spread),
      y2: y,
      opacity: 0.12 + r * 0.22,
    };
  });

  // Radiating perspective lines from horizon vanishing point
  const radialCount = 14;
  const radialLines = [];
  for (let i = 0; i <= radialCount; i++) {
    const bottomX = (width / radialCount) * i;
    const topX = centerX + (bottomX - centerX) * 0.35;
    radialLines.push({
      key: `r-${i}`,
      x1: topX,
      y1: horizonY,
      x2: bottomX,
      y2: bottomY,
      opacity: 0.18,
    });
  }

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#20C8FF" stopOpacity="0.05" />
            <Stop offset="40%" stopColor="#20C8FF" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#087BFF" stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#041226" stopOpacity="0" />
            <Stop offset="100%" stopColor="#061D3D" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={width} height={height} fill="url(#floorFade)" />

        {/* Radiating perspective lines */}
        {radialLines.map((line) => (
          <Line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#20C8FF"
            strokeWidth="0.9"
            strokeOpacity={line.opacity}
          />
        ))}

        {/* Horizontal perspective lines */}
        {horizontalLines.map((line) => (
          <Line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#20C8FF"
            strokeWidth="0.9"
            strokeOpacity={line.opacity}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default PerspectiveGridFloor;
