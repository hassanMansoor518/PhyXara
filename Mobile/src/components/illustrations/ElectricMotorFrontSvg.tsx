import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';

export const ElectricMotorFrontSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 280, height = 220, rotationAngle = 0 }) => {
  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Metallic Cast Iron Casing */}
          <LinearGradient id="casingGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="30%" stopColor="#334155" />
            <Stop offset="70%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Steel Drive Shaft */}
          <LinearGradient id="shaftGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F8FAFC" />
            <Stop offset="35%" stopColor="#CBD5E1" />
            <Stop offset="70%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#475569" />
          </LinearGradient>

          {/* Shiny Copper Windings */}
          <LinearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="25%" stopColor="#F97316" />
            <Stop offset="60%" stopColor="#C2410C" />
            <Stop offset="100%" stopColor="#7C2D12" />
          </LinearGradient>

          {/* Terminal Box */}
          <LinearGradient id="terminalGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#64748B" />
            <Stop offset="50%" stopColor="#475569" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>

          {/* Drop shadow */}
          <RadialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Shadow under motor */}
        <Path d="M 40 230 C 40 200, 300 200, 300 230 C 300 260, 40 260, 40 230 Z" fill="url(#floorShadow)" />

        {/* Mounting Feet / Base Brackets */}
        <G>
          <Path d="M 80 200 L 60 225 L 110 225 L 115 200 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Path d="M 230 200 L 225 225 L 280 225 L 260 200 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="85" cy="216" r="4" fill="#64748B" />
          <Circle cx="255" cy="216" r="4" fill="#64748B" />
        </G>

        {/* Main Cylindrical Stator Frame */}
        <G>
          {/* Rear end bell */}
          <Path d="M 230 75 C 275 75, 275 195, 230 195 Z" fill="#334155" stroke="#1E293B" strokeWidth="2" />

          {/* Cooling Fins / Housing Body */}
          <Path
            d="M 120 70 L 240 70 C 265 70, 265 200, 240 200 L 120 200 C 95 200, 95 70, 120 70 Z"
            fill="url(#casingGrad)"
            stroke="#0F172A"
            strokeWidth="3"
          />

          {/* Cooling Ribs */}
          <Path d="M 135 70 L 135 200" stroke="#64748B" strokeWidth="3" />
          <Path d="M 155 70 L 155 200" stroke="#64748B" strokeWidth="3" />
          <Path d="M 175 70 L 175 200" stroke="#64748B" strokeWidth="3" />
          <Path d="M 195 70 L 195 200" stroke="#64748B" strokeWidth="3" />
          <Path d="M 215 70 L 215 200" stroke="#64748B" strokeWidth="3" />
        </G>

        {/* Front End Bell & Bearing Housing */}
        <G>
          <Path
            d="M 120 70 C 85 70, 85 200, 120 200 C 145 200, 145 70, 120 70 Z"
            fill="url(#casingGrad)"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          {/* Bearing hub */}
          <Circle cx="105" cy="135" r="28" fill="#334155" stroke="#1E293B" strokeWidth="2" />
          <Circle cx="105" cy="135" r="16" fill="#1E293B" />
        </G>

        {/* Copper Armature / Rotor visible through cutaway or front */}
        <G transform={`rotate(${rotationAngle} 105 135)`}>
          {/* Copper Coil Bundles */}
          <Path d="M 140 100 Q 185 85 230 100 Q 230 115 140 115 Z" fill="url(#copperGrad)" />
          <Path d="M 140 120 Q 185 110 230 120 Q 230 135 140 135 Z" fill="url(#copperGrad)" />
          <Path d="M 140 145 Q 185 140 230 145 Q 230 160 140 160 Z" fill="url(#copperGrad)" />
          <Path d="M 140 170 Q 185 165 230 170 Q 230 180 140 180 Z" fill="url(#copperGrad)" />
        </G>

        {/* Terminal Box on top */}
        <G>
          <Path d="M 160 40 L 220 40 L 225 70 L 155 70 Z" fill="url(#terminalGrad)" stroke="#1E293B" strokeWidth="2" />
          <Rect x="165" y="36" width="50" height="8" rx="2" fill="#475569" />
          <Circle cx="190" cy="55" r="4" fill="#94A3B8" />
        </G>

        {/* Steel Output Drive Shaft protruding to left */}
        <G>
          <Path d="M 105 125 L 30 125 L 30 145 L 105 145 Z" fill="url(#shaftGrad)" stroke="#475569" strokeWidth="1.5" />
          {/* Shaft Keyway */}
          <Rect x="40" y="128" width="25" height="4" rx="1" fill="#64748B" />
          {/* Shaft End Bevel */}
          <Path d="M 30 125 C 24 125, 24 145, 30 145 Z" fill="#94A3B8" stroke="#475569" />
        </G>

        {/* Split Ring Commutator Collar */}
        <G>
          <Rect x="90" y="122" width="12" height="26" rx="2" fill="url(#copperGrad)" stroke="#7C2D12" strokeWidth="1" />
          <Line x1="96" y1="122" x2="96" y2="148" stroke="#1E293B" strokeWidth="1" />
        </G>

        {/* Metallic Highlights & Reflections */}
        <Path d="M 125 76 L 235 76" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <Path d="M 32 127 L 100 127" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </Svg>
    </View>
  );
};

export default ElectricMotorFrontSvg;
