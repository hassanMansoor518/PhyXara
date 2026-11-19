import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const AcMotorViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Outer Housing Gradient */}
          <LinearGradient id="acHousingGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="35%" stopColor="#334155" />
            <Stop offset="70%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Stator Core Lamination Gradient */}
          <RadialGradient id="statorLamination" cx="50%" cy="50%" r="50%">
            <Stop offset="65%" stopColor="#64748B" />
            <Stop offset="80%" stopColor="#475569" />
            <Stop offset="100%" stopColor="#1E293B" />
          </RadialGradient>

          {/* Squirrel Cage Rotor Core Gradient */}
          <RadialGradient id="rotorCageGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E2E8F0" />
            <Stop offset="60%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#475569" />
          </RadialGradient>

          {/* Copper Bar Gradient */}
          <LinearGradient id="copperBarGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="50%" stopColor="#F97316" />
            <Stop offset="100%" stopColor="#C2410C" />
          </LinearGradient>

          {/* Shaft Steel Gradient */}
          <RadialGradient id="acShaftGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="40%" stopColor="#CBD5E1" />
            <Stop offset="100%" stopColor="#475569" />
          </RadialGradient>

          {/* Floor Shadow */}
          <RadialGradient id="acFloorShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 40 232 C 40 212, 300 212, 300 232 C 300 252, 40 252, 40 232 Z" fill="url(#acFloorShadow)" />

        {/* Heavy Mounting Base Feet */}
        <Path d="M 90 210 L 70 228 L 270 228 L 250 210 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <Circle cx="86" cy="220" r="4.5" fill="#64748B" />
        <Circle cx="254" cy="220" r="4.5" fill="#64748B" />

        {/* External Cooling Fins / Ribs (12 perimeter fins) */}
        <G stroke="#334155" strokeWidth="4.5" strokeLinecap="round">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 170 + Math.cos(angle) * 78;
            const y1 = 130 + Math.sin(angle) * 78;
            const x2 = 170 + Math.cos(angle) * 88;
            const y2 = 130 + Math.sin(angle) * 88;
            return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </G>

        {/* Main Cylindrical Stator Frame */}
        <Circle cx="170" cy="130" r="78" fill="url(#acHousingGrad)" stroke="#0F172A" strokeWidth="2.5" />

        {/* Stator Laminated Core Ring */}
        <Circle cx="170" cy="130" r="62" fill="url(#statorLamination)" stroke="#334155" strokeWidth="1.5" />

        {/* 3-Phase Stator Windings (U: Red, V: Yellow, W: Blue) */}
        <G>
          {/* Phase A (U) */}
          <Circle cx="170" cy="74" r="8" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          <Circle cx="170" cy="186" r="8" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />

          {/* Phase B (V) */}
          <Circle cx="121" cy="102" r="8" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
          <Circle cx="219" cy="158" r="8" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />

          {/* Phase C (W) */}
          <Circle cx="121" cy="158" r="8" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
          <Circle cx="219" cy="102" r="8" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
        </G>

        {/* Air Gap ring */}
        <Circle cx="170" cy="130" r="46" fill="#0F172A" />

        {/* --- ROTATING SQUIRREL-CAGE ROTOR --- */}
        <G transform={`rotate(${rotationAngle}, 170, 130)`}>
          {/* Laminated Rotor Core */}
          <Circle cx="170" cy="130" r="44" fill="url(#rotorCageGrad)" stroke="#475569" strokeWidth="1.2" />

          {/* Conductive Copper Rotor Bars (8 bars around circumference) */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const cx = 170 + Math.cos(angle) * 35;
            const cy = 130 + Math.sin(angle) * 35;
            return (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r="4"
                fill="url(#copperBarGrad)"
                stroke="#7C2D12"
                strokeWidth="1"
              />
            );
          })}

          {/* End-Ring Connection Ring */}
          <Circle cx="170" cy="130" r="35" fill="none" stroke="url(#copperBarGrad)" strokeWidth="2.5" strokeDasharray="6 3" />

          {/* Central Motor Shaft with Keyway */}
          <Circle cx="170" cy="130" r="14" fill="url(#acShaftGrad)" stroke="#334155" strokeWidth="1.5" />
          <Rect x="167" y="117" width="6" height="5" fill="#1E293B" rx="1" />
        </G>

        {/* Status / Type Labels */}
        <SvgText x="170" y="25" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          3-PHASE AC INDUCTION MOTOR
        </SvgText>
      </Svg>
    </View>
  );
};
export default AcMotorViewerSvg;
