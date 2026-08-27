import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';

export const ElectricMotorExplodedSvg: React.FC<{
  width?: number;
  height?: number;
  separation?: number; // 0 (assembled) to 1 (fully separated)
}> = ({ width = 290, height = 220, separation = 1 }) => {
  const sep = separation;
  const statorShift = -35 * sep;
  const rotorShift = 25 * sep;
  const commutatorShift = 65 * sep;
  const brushShiftY = 40 * sep;

  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 360 260" fill="none">
        <Defs>
          <LinearGradient id="expCasing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="50%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
          <LinearGradient id="expCopper" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="30%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#7C2D12" />
          </LinearGradient>
          <LinearGradient id="expSteel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="50%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#475569" />
          </LinearGradient>
          <RadialGradient id="expShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Floor shadows under parts */}
        <Path d="M 30 235 C 30 220, 330 220, 330 235 C 330 250, 30 250, 30 235 Z" fill="url(#expShadow)" />

        {/* Common Center Axis Line (Assembly Guide) */}
        <Path
          d="M 20 135 L 340 135"
          stroke="#818CF8"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          opacity="0.6"
        />

        {/* 1. STATOR CASING (Left side) */}
        <G transform={`translate(${statorShift}, 0)`}>
          {/* Main outer shell */}
          <Path
            d="M 70 85 L 140 85 C 155 85, 155 185, 140 185 L 70 185 C 55 185, 55 85, 70 85 Z"
            fill="url(#expCasing)"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          {/* Ribs */}
          <Path d="M 85 85 L 85 185 M 105 85 L 105 185 M 125 85 L 125 185" stroke="#64748B" strokeWidth="2.5" />
          {/* Base foot */}
          <Path d="M 65 185 L 55 210 L 120 210 L 115 185 Z" fill="#1E293B" stroke="#0F172A" />
          {/* Internal hollow bore */}
          <Circle cx="138" cy="135" r="32" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        </G>

        {/* 2. ROTOR / ARMATURE CORE (Center right) */}
        <G transform={`translate(${rotorShift}, 0)`}>
          {/* Central shaft passing through */}
          <Path d="M 130 130 L 260 130 L 260 140 L 130 140 Z" fill="url(#expSteel)" stroke="#475569" strokeWidth="1" />

          {/* Copper Winding bundle */}
          <Rect x="165" y="95" width="60" height="80" rx="8" fill="url(#expCopper)" stroke="#7C2D12" strokeWidth="1.5" />
          {/* Armature core laminations */}
          <Line x1="175" y1="95" x2="175" y2="175" stroke="#9A3412" strokeWidth="2" />
          <Line x1="195" y1="95" x2="195" y2="175" stroke="#9A3412" strokeWidth="2" />
          <Line x1="215" y1="95" x2="215" y2="175" stroke="#9A3412" strokeWidth="2" />
        </G>

        {/* 3. SPLIT RING COMMUTATOR (Far right) */}
        <G transform={`translate(${commutatorShift}, 0)`}>
          <Rect x="250" y="115" width="22" height="40" rx="3" fill="url(#expCopper)" stroke="#7C2D12" strokeWidth="1.5" />
          {/* Split isolation gap */}
          <Line x1="261" y1="115" x2="261" y2="155" stroke="#0F172A" strokeWidth="2" />
        </G>

        {/* 4. CARBON BRUSHES (Top & Bottom separation) */}
        <G transform={`translate(${commutatorShift}, ${-brushShiftY})`}>
          {/* Top Brush */}
          <Rect x="254" y="85" width="14" height="14" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <Line x1="261" y1="85" x2="261" y2="65" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />
          <Circle cx="261" cy="65" r="3" fill="#F59E0B" />
        </G>
        <G transform={`translate(${commutatorShift}, ${brushShiftY})`}>
          {/* Bottom Brush */}
          <Rect x="254" y="170" width="14" height="14" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <Line x1="261" y1="184" x2="261" y2="204" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2,2" />
          <Circle cx="261" cy="204" r="3" fill="#3B82F6" />
        </G>

        {/* 5. DRIVE SHAFT EXTENSION */}
        <G transform={`translate(${statorShift - 20 * sep}, 0)`}>
          <Path d="M 50 130 L 15 130 L 15 140 L 50 140 Z" fill="url(#expSteel)" stroke="#475569" strokeWidth="1" />
        </G>
      </Svg>
    </View>
  );
};

export default ElectricMotorExplodedSvg;
