import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';

export const ElectricMotorSideSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 280, height = 220, rotationAngle = 0 }) => {
  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          <LinearGradient id="casingSideGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="40%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
          <RadialGradient id="rotorCrossGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#CBD5E1" />
            <Stop offset="50%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#334155" />
          </RadialGradient>
          <LinearGradient id="copperCoilSide" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="40%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#7C2D12" />
          </LinearGradient>
          <RadialGradient id="floorShadowSide" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Floor shadow */}
        <Path d="M 50 230 C 50 210, 290 210, 290 230 C 290 250, 50 250, 50 230 Z" fill="url(#floorShadowSide)" />

        {/* Base Brackets */}
        <Path d="M 110 205 L 85 225 L 255 225 L 230 205 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <Circle cx="105" cy="216" r="4" fill="#64748B" />
        <Circle cx="235" cy="216" r="4" fill="#64748B" />

        {/* Outer Circular Stator Housing */}
        <Circle cx="170" cy="135" r="75" fill="url(#casingSideGrad)" stroke="#0F172A" strokeWidth="3" />

        {/* Cooling Ribs around outer perimeter */}
        <G stroke="#475569" strokeWidth="4" strokeLinecap="round">
          <Path d="M 170 56 L 170 48" />
          <Path d="M 226 79 L 233 74" />
          <Path d="M 249 135 L 257 135" />
          <Path d="M 226 191 L 233 196" />
          <Path d="M 170 214 L 170 222" />
          <Path d="M 114 191 L 107 196" />
          <Path d="M 91 135 L 83 135" />
          <Path d="M 114 79 L 107 74" />
        </G>

        {/* Stator Pole Magnets (North and South) */}
        <Path d="M 115 95 C 130 95, 130 175, 115 175 Z" fill="#DC2626" opacity="0.9" />
        <Path d="M 225 95 C 210 95, 210 175, 225 175 Z" fill="#2563EB" opacity="0.9" />

        {/* Rotating Armature Coils (Rotor) */}
        <G transform={`rotate(${rotationAngle} 170 135)`}>
          {/* Copper Windings 4-pole star */}
          <Path d="M 155 105 L 185 105 L 180 165 L 160 165 Z" fill="url(#copperCoilSide)" stroke="#7C2D12" strokeWidth="1" />
          <Path d="M 140 120 L 140 150 L 200 150 L 200 120 Z" fill="url(#copperCoilSide)" stroke="#7C2D12" strokeWidth="1" />
          {/* Center core */}
          <Circle cx="170" cy="135" r="30" fill="url(#rotorCrossGrad)" stroke="#1E293B" strokeWidth="2" />
        </G>

        {/* Carbon Brushes */}
        <Rect x="122" y="128" width="14" height="14" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
        <Rect x="204" y="128" width="14" height="14" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
        <Path d="M 122 135 L 100 135" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />
        <Path d="M 218 135 L 240 135" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2,2" />

        {/* Central Drive Shaft */}
        <Circle cx="170" cy="135" r="14" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
        <Circle cx="170" cy="135" r="4" fill="#64748B" />

        {/* Terminal Box Top */}
        <Rect x="145" y="42" width="50" height="18" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2" />
      </Svg>
    </View>
  );
};

export default ElectricMotorSideSvg;
