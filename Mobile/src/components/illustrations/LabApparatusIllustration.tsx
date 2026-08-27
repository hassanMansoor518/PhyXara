import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';

export const LabApparatusIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 200,
}) => {
  return (
    <View className="items-center justify-center my-4">
      <Svg width={width} height={height} viewBox="0 0 320 220" fill="none">
        <Defs>
          <LinearGradient id="labBgGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#EEE9FF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#F5F6FF" stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#6C4DFF" />
            <Stop offset="100%" stopColor="#4B35C8" />
          </LinearGradient>
          <LinearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#42D9FF" />
            <Stop offset="100%" stopColor="#0284C7" />
          </LinearGradient>
          <LinearGradient id="magnetRed" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FF5C5C" />
            <Stop offset="100%" stopColor="#D92D20" />
          </LinearGradient>
          <LinearGradient id="magnetBlue" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0284C7" />
          </LinearGradient>
        </Defs>

        {/* Soft background glow */}
        <Circle cx="160" cy="110" r="95" fill="url(#labBgGlow)" />

        {/* Lab Table surface */}
        <Path
          d="M 30 185 L 290 185"
          stroke="#CBD5E1"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Path
          d="M 60 185 L 60 210 M 260 185 L 260 210"
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Horseshoe Magnet on left */}
        <G transform="translate(45, 120)">
          {/* North pole */}
          <Path d="M 10 10 C 10 -20, 50 -20, 50 10 L 40 10 C 40 -10, 20 -10, 20 10 Z" fill="url(#magnetRed)" />
          <Rect x="10" y="10" width="10" height="25" rx="2" fill="url(#magnetRed)" />
          <Rect x="40" y="10" width="10" height="25" rx="2" fill="url(#magnetBlue)" />
          {/* Pole tips */}
          <Rect x="10" y="30" width="10" height="15" rx="2" fill="#E2E8F0" />
          <Rect x="40" y="30" width="10" height="15" rx="2" fill="#E2E8F0" />
        </G>

        {/* Retort Stand / Laboratory Apparatus in middle */}
        <G transform="translate(115, 60)">
          {/* Base */}
          <Rect x="10" y="115" width="60" height="10" rx="3" fill="#64748B" />
          {/* Vertical Rod */}
          <Rect x="38" y="10" width="5" height="110" rx="2.5" fill="#94A3B8" />
          {/* Clamp */}
          <Rect x="30" y="45" width="22" height="8" rx="2" fill="#475569" />
          <Line x1="41" y1="49" x2="75" y2="49" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          {/* Suspended Coil / Motor Component */}
          <Circle cx="85" cy="70" r="18" fill="url(#purpleGrad)" opacity="0.9" />
          <Circle cx="85" cy="70" r="10" fill="#FFFFFF" />
          <Circle cx="85" cy="70" r="5" fill="#42D9FF" />
          {/* Connecting line */}
          <Line x1="75" y1="49" x2="85" y2="52" stroke="#6C4DFF" strokeWidth="2" strokeDasharray="3,3" />
        </G>

        {/* Smartphone on right with AR overlay projection */}
        <G transform="translate(195, 45)">
          {/* Phone body */}
          <Rect x="10" y="10" width="65" height="120" rx="14" fill="#080F2D" stroke="#1E293B" strokeWidth="3" />
          {/* Screen */}
          <Rect x="13" y="18" width="59" height="104" rx="10" fill="#101A43" />
          {/* Speaker / camera notch */}
          <Circle cx="42" cy="14" r="2" fill="#334155" />
          {/* AR Wireframe on screen */}
          <Circle cx="42" cy="70" r="20" stroke="#42D9FF" strokeWidth="1.5" strokeDasharray="4,2" />
          <Rect x="30" y="58" width="24" height="24" rx="4" stroke="#6C4DFF" strokeWidth="1.5" fill="#6C4DFF" fillOpacity="0.3" />
          {/* Scan rays */}
          <Line x1="18" y1="40" x2="67" y2="40" stroke="#32C978" strokeWidth="2" strokeLinecap="round" />
          <Path d="M 20 28 L 26 28 M 20 28 L 20 34" stroke="#42D9FF" strokeWidth="1.5" />
          <Path d="M 64 28 L 58 28 M 64 28 L 64 34" stroke="#42D9FF" strokeWidth="1.5" />
          <Path d="M 20 108 L 26 108 M 20 108 L 20 102" stroke="#42D9FF" strokeWidth="1.5" />
          <Path d="M 64 108 L 58 108 M 64 108 L 64 102" stroke="#42D9FF" strokeWidth="1.5" />
        </G>

        {/* AR Projection Beams connecting apparatus to phone */}
        <Path
          d="M 200 80 L 150 110 M 200 110 L 160 135"
          stroke="#42D9FF"
          strokeWidth="1.5"
          strokeDasharray="3,3"
          opacity="0.6"
        />

        {/* Sparkles / Floating physics symbols */}
        <Circle cx="80" cy="50" r="3" fill="#6C4DFF" />
        <Circle cx="120" cy="30" r="4" fill="#42D9FF" />
        <Circle cx="280" cy="70" r="3" fill="#32C978" />
      </Svg>
    </View>
  );
};

export default LabApparatusIllustration;
