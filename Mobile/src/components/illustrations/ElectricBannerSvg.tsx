import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';

export const ElectricBannerSvg: React.FC<{ width?: number; height?: number }> = ({
  width = 340,
  height = 140,
}) => {
  return (
    <View className="items-center justify-center overflow-hidden rounded-3xl">
      <Svg width={width} height={height} viewBox="0 0 360 150" fill="none">
        <Defs>
          <LinearGradient id="elecBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#080F2D" />
            <Stop offset="50%" stopColor="#101A43" />
            <Stop offset="100%" stopColor="#1E1B4B" />
          </LinearGradient>
          <RadialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#42D9FF" stopOpacity="0.8" />
            <Stop offset="40%" stopColor="#6C4DFF" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#080F2D" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="40%" stopColor="#42D9FF" />
            <Stop offset="100%" stopColor="#8F78FF" />
          </LinearGradient>
        </Defs>

        {/* Dark deep navy container */}
        <Rect x="0" y="0" width="360" height="150" rx="24" fill="url(#elecBg)" />

        {/* Center glowing energy sphere */}
        <Circle cx="180" cy="75" r="70" fill="url(#plasmaGlow)" />

        {/* Intricate Lightning Bolts / Plasma Arcs */}
        <G strokeLinecap="round" strokeLinejoin="round">
          {/* Main central bolt */}
          <Path
            d="M 60 75 L 110 70 L 135 85 L 165 60 L 185 80 L 220 65 L 255 85 L 300 75"
            stroke="url(#boltGrad)"
            strokeWidth="3.5"
          />
          <Path
            d="M 60 75 L 110 70 L 135 85 L 165 60 L 185 80 L 220 65 L 255 85 L 300 75"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Upper branching bolts */}
          <Path d="M 135 85 L 150 45 L 175 35" stroke="#42D9FF" strokeWidth="2" opacity="0.8" />
          <Path d="M 220 65 L 235 30 L 260 25" stroke="#42D9FF" strokeWidth="2" opacity="0.8" />

          {/* Lower branching bolts */}
          <Path d="M 165 60 L 155 105 L 135 125" stroke="#8F78FF" strokeWidth="2" opacity="0.8" />
          <Path d="M 185 80 L 195 120 L 225 130" stroke="#8F78FF" strokeWidth="2" opacity="0.8" />
        </G>

        {/* Sparkle particles */}
        <Circle cx="150" cy="45" r="2.5" fill="#FFFFFF" />
        <Circle cx="235" cy="30" r="2.5" fill="#FFFFFF" />
        <Circle cx="185" cy="80" r="3.5" fill="#FFFFFF" />
        <Circle cx="135" cy="125" r="2" fill="#42D9FF" />
        <Circle cx="225" cy="130" r="2" fill="#42D9FF" />
      </Svg>
    </View>
  );
};

export default ElectricBannerSvg;
