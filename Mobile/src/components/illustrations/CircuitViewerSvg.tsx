import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const CircuitViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  // Needle deflection dynamics based on interactive rotation
  const ammeterAngle = -20 + Math.sin((rotationAngle * Math.PI) / 180) * 15;
  const voltmeterAngle = -15 + Math.cos((rotationAngle * Math.PI) / 180) * 12;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Copper Wire Gradient */}
          <LinearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0284C7" />
          </LinearGradient>

          {/* Meter Housing Gradient */}
          <RadialGradient id="meterGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="70%" stopColor="#F1F5F9" />
            <Stop offset="100%" stopColor="#CBD5E1" />
          </RadialGradient>

          {/* Battery Plate Gradients */}
          <LinearGradient id="posPlateGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#B91C1C" />
          </LinearGradient>
          <LinearGradient id="negPlateGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#64748B" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>

          {/* Floor Shadow */}
          <RadialGradient id="circShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 40 235 C 40 215, 300 215, 300 235 C 300 255, 40 255, 40 235 Z" fill="url(#circShadow)" />

        {/* Main Circuit Loop Wires */}
        <Path
          d="M 60 70 L 280 70 L 280 190 L 60 190 Z"
          stroke="url(#wireGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Current Flow Indicator Arrows */}
        <Path d="M 120 66 L 128 70 L 120 74 Z" fill="#0284C7" />
        <Path d="M 284 130 L 280 138 L 276 130 Z" fill="#0284C7" />
        <Path d="M 210 194 L 202 190 L 210 186 Z" fill="#0284C7" />

        {/* --- DC POWER BATTERY (Bottom Wire) --- */}
        <G transform="translate(100, 175)">
          {/* Positive Long Plate */}
          <Rect x="0" y="0" width="4" height="30" rx="1.5" fill="url(#posPlateGrad)" />
          {/* Negative Short Thick Plate */}
          <Rect x="12" y="5" width="6" height="20" rx="1.5" fill="url(#negPlateGrad)" />
          {/* Positive Sign */}
          <SvgText x="-12" y="20" fill="#EF4444" fontSize="14" fontWeight="bold">+</SvgText>
          {/* Negative Sign */}
          <SvgText x="24" y="20" fill="#64748B" fontSize="16" fontWeight="bold">−</SvgText>
        </G>

        {/* --- PLUG KEY SWITCH (Bottom Right) --- */}
        <G transform="translate(230, 185)">
          <Circle cx="0" cy="5" r="4.5" fill="#0284C7" />
          <Circle cx="20" cy="5" r="4.5" fill="#0284C7" />
          <Line x1="0" y1="5" x2="18" y2="-4" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <SvgText x="6" y="20" fill="#64748B" fontSize="9" fontWeight="bold">KEY</SvgText>
        </G>

        {/* --- AMMETER IN SERIES (Top Left) --- */}
        <G transform="translate(90, 70)">
          <Circle cx="0" cy="0" r="22" fill="url(#meterGrad)" stroke="#0284C7" strokeWidth="2" />
          <SvgText x="0" y="-8" fill="#0F172A" fontSize="12" fontWeight="bold" textAnchor="middle">A</SvgText>
          {/* Ammeter Scale Arc */}
          <Path d="M -12 4 A 14 14 0 0 1 12 4" stroke="#64748B" strokeWidth="1" fill="none" />
          {/* Deflection Needle */}
          <Line
            x1="0"
            y1="8"
            x2={Math.sin((ammeterAngle * Math.PI) / 180) * 14}
            y2={8 - Math.cos((ammeterAngle * Math.PI) / 180) * 14}
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Circle cx="0" cy="8" r="2" fill="#0F172A" />
        </G>

        {/* --- RESISTOR (Top Center) --- */}
        <G transform="translate(145, 70)">
          {/* Resistor Body */}
          <Rect x="0" y="-10" width="50" height="20" rx="4" fill="#F8FAFC" stroke="#334155" strokeWidth="1.8" />
          {/* Color Code Bands */}
          <Rect x="10" y="-10" width="4" height="20" fill="#EA580C" />
          <Rect x="20" y="-10" width="4" height="20" fill="#1E293B" />
          <Rect x="30" y="-10" width="4" height="20" fill="#DC2626" />
          <Rect x="40" y="-10" width="3" height="20" fill="#F59E0B" />
          <SvgText x="25" y="-14" fill="#0F172A" fontSize="10" fontWeight="bold" textAnchor="middle">R (Ω)</SvgText>
        </G>

        {/* --- VOLTMETER IN PARALLEL (Across Resistor) --- */}
        <Path d="M 140 70 L 140 25 L 200 25 L 200 70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
        <G transform="translate(170, 25)">
          <Circle cx="0" cy="0" r="18" fill="url(#meterGrad)" stroke="#F59E0B" strokeWidth="2" />
          <SvgText x="0" y="-6" fill="#0F172A" fontSize="11" fontWeight="bold" textAnchor="middle">V</SvgText>
          {/* Voltmeter Needle */}
          <Line
            x1="0"
            y1="6"
            x2={Math.sin((voltmeterAngle * Math.PI) / 180) * 11}
            y2={6 - Math.cos((voltmeterAngle * Math.PI) / 180) * 11}
            stroke="#DC2626"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <Circle cx="0" cy="6" r="1.5" fill="#0F172A" />
        </G>

        {/* --- RHEOSTAT / VARIABLE RESISTOR (Right Wire) --- */}
        <G transform="translate(280, 100)">
          <Rect x="-8" y="0" width="16" height="30" rx="3" fill="#E2E8F0" stroke="#334155" strokeWidth="1.5" />
          {/* Sliding Arrow */}
          <Path d="M -16 15 L -6 15 L -6 11 L 0 15 L -6 19 L -6 15" fill="#DC2626" stroke="#991B1B" strokeWidth="0.5" />
          <SvgText x="-12" y="38" fill="#475569" fontSize="8" fontWeight="bold">Rh</SvgText>
        </G>

        {/* Header Title */}
        <SvgText x="170" y="248" fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          OHM’S LAW VERIFICATION CIRCUIT
        </SvgText>
      </Svg>
    </View>
  );
};
export default CircuitViewerSvg;
