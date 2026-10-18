import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const GeneratorViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* North Magnetic Pole Gradient (Red) */}
          <LinearGradient id="genNorthGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="60%" stopColor="#DC2626" />
            <Stop offset="100%" stopColor="#991B1B" />
          </LinearGradient>

          {/* South Magnetic Pole Gradient (Blue) */}
          <LinearGradient id="genSouthGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="60%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1E40AF" />
          </LinearGradient>

          {/* Armature Copper Coil */}
          <LinearGradient id="genArmatureGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="50%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#B45309" />
          </LinearGradient>

          {/* Slip Rings Brass */}
          <LinearGradient id="slipRingGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FDE68A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>

          {/* Floor Shadow */}
          <RadialGradient id="genShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 40 225 C 40 205, 300 205, 300 225 C 300 245, 40 245, 40 225 Z" fill="url(#genShadow)" />

        {/* Magnetic Field Lines (Left to Right) */}
        <Line x1="85" y1="90" x2="255" y2="90" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />
        <Line x1="85" y1="120" x2="255" y2="120" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.7" />
        <Line x1="85" y1="150" x2="255" y2="150" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />

        {/* Permanent Magnet North Pole (Left) */}
        <Path
          d="M 30 70 L 85 70 C 95 95, 95 145, 85 170 L 30 170 Z"
          fill="url(#genNorthGrad)"
          stroke="#B91C1C"
          strokeWidth="1.5"
        />
        <SvgText x="55" y="127" fill="#FFFFFF" fontSize="22" fontWeight="bold" textAnchor="middle">
          N
        </SvgText>

        {/* Permanent Magnet South Pole (Right) */}
        <Path
          d="M 310 70 L 255 70 C 245 95, 245 145, 255 170 L 310 170 Z"
          fill="url(#genSouthGrad)"
          stroke="#1D4ED8"
          strokeWidth="1.5"
        />
        <SvgText x="285" y="127" fill="#FFFFFF" fontSize="22" fontWeight="bold" textAnchor="middle">
          S
        </SvgText>

        {/* Rotating Armature Coil (Center) */}
        <G transform={`rotate(${rotationAngle}, 170, 120)`}>
          {/* Armature Wire Frame Loop */}
          <Rect
            x="120"
            y="70"
            width="100"
            height="100"
            rx="6"
            fill="none"
            stroke="url(#genArmatureGrad)"
            strokeWidth="6"
          />
          {/* Central Axle / Shaft */}
          <Line x1="170" y1="40" x2="170" y2="200" stroke="#64748B" strokeWidth="4" />
          <Circle cx="170" cy="120" r="7" fill="#334155" stroke="#38BDF8" strokeWidth="1" />
        </G>

        {/* Continuous Slip Rings (Front Bottom Axle) */}
        <G id="slipRingsGroup">
          {/* Slip Ring 1 */}
          <Circle cx="170" cy="180" r="11" fill="url(#slipRingGrad)" stroke="#78350F" strokeWidth="1.5" />
          <Circle cx="170" cy="180" r="5" fill="#090D16" />
          {/* Carbon Brush 1 (Left) */}
          <Rect x="145" y="176" width="14" height="8" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
          <Line x1="145" y1="180" x2="120" y2="180" stroke="#FBBF24" strokeWidth="2" />

          {/* Slip Ring 2 */}
          <Circle cx="170" cy="198" r="11" fill="url(#slipRingGrad)" stroke="#78350F" strokeWidth="1.5" />
          <Circle cx="170" cy="198" r="5" fill="#090D16" />
          {/* Carbon Brush 2 (Right) */}
          <Rect x="181" y="194" width="14" height="8" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
          <Line x1="195" y1="198" x2="220" y2="198" stroke="#FBBF24" strokeWidth="2" />
        </G>

        {/* AC Output Indicator & Galvanometer */}
        <Path d="M 120 180 L 120 220 L 155 220" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <Path d="M 220 198 L 220 220 L 185 220" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <Circle cx="170" cy="220" r="14" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
        <SvgText x="170" y="225" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
          ~ AC
        </SvgText>
      </Svg>
    </View>
  );
};
