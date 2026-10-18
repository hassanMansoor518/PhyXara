import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const VernierViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  const slidingOffset = Math.sin((rotationAngle * Math.PI) / 180) * 16;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Stainless Steel Beam Gradient */}
          <LinearGradient id="vernierBeamGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="20%" stopColor="#E2E8F0" />
            <Stop offset="60%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#64748B" />
          </LinearGradient>

          {/* Sliding Vernier Jaw Gradient */}
          <LinearGradient id="vernierSliderGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="30%" stopColor="#0284C7" />
            <Stop offset="70%" stopColor="#0369A1" />
            <Stop offset="100%" stopColor="#075985" />
          </LinearGradient>

          {/* Floor Shadow */}
          <RadialGradient id="vernierShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Shadow */}
        <Path d="M 20 225 C 20 200, 320 200, 320 225 C 320 250, 20 250, 20 225 Z" fill="url(#vernierShadow)" />

        <G transform={`rotate(${rotationAngle * 0.12}, 170, 130)`}>
          {/* --- MAIN FIXED SCALE BEAM --- */}
          <Rect x="40" y="100" width="270" height="26" rx="2" fill="url(#vernierBeamGrad)" stroke="#334155" strokeWidth="1.2" />

          {/* Fixed Outside Jaw (Bottom Left) */}
          <Path d="M 40 126 L 40 185 C 40 195, 45 200, 52 200 L 56 200 L 64 126 Z" fill="url(#vernierBeamGrad)" stroke="#334155" strokeWidth="1.2" />
          {/* Fixed Inside Jaw (Top Left) */}
          <Path d="M 40 100 L 40 55 C 40 48, 45 44, 52 44 L 56 44 L 64 100 Z" fill="url(#vernierBeamGrad)" stroke="#334155" strokeWidth="1.2" />

          {/* Main Scale Engraved Metric Graduations (0 to 15 cm) */}
          <Line x1="70" y1="118" x2="300" y2="118" stroke="#0F172A" strokeWidth="0.8" />
          {[...Array(24)].map((_, i) => (
            <Line
              key={i}
              x1={75 + i * 9.5}
              y1={i % 5 === 0 ? 104 : 110}
              x2={75 + i * 9.5}
              y2={118}
              stroke="#0F172A"
              strokeWidth={i % 5 === 0 ? 1.2 : 0.8}
            />
          ))}

          {/* --- SLIDING VERNIER JAW --- */}
          <G transform={`translate(${slidingOffset + 35}, 0)`}>
            {/* Sliding Collar Body */}
            <Rect x="75" y="94" width="70" height="38" rx="4" fill="url(#vernierSliderGrad)" stroke="#0369A1" strokeWidth="1.5" />

            {/* Sliding Outside Jaw (Bottom) */}
            <Path d="M 75 132 L 75 190 C 75 197, 80 200, 87 200 L 91 200 L 98 132 Z" fill="url(#vernierBeamGrad)" stroke="#334155" strokeWidth="1.2" />
            {/* Sliding Inside Jaw (Top) */}
            <Path d="M 75 94 L 75 50 C 75 45, 80 44, 87 44 L 91 44 L 98 94 Z" fill="url(#vernierBeamGrad)" stroke="#334155" strokeWidth="1.2" />

            {/* Vernier Scale Window & Divisions (0 to 10) */}
            <Rect x="85" y="104" width="52" height="18" rx="2" fill="#F8FAFC" stroke="#0284C7" strokeWidth="1" />
            {[...Array(10)].map((_, i) => (
              <Line
                key={i}
                x1={88 + i * 5}
                y1={104}
                x2={88 + i * 5}
                y2={i % 5 === 0 ? 116 : 112}
                stroke="#DC2626"
                strokeWidth={i === 0 ? 1.5 : 0.9}
              />
            ))}

            {/* Thumb Rest Screw */}
            <Rect x="128" y="88" width="12" height="8" rx="2" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
            <Path d="M 134 88 L 134 94" stroke="#F8FAFC" strokeWidth="1" />
          </G>

          {/* Depth Measuring Probe (Extends to the right) */}
          <Rect x={306 + slidingOffset * 0.5} y="112" width="22" height="2" fill="#CBD5E1" stroke="#475569" strokeWidth="0.5" />
        </G>
      </Svg>
    </View>
  );
};

export default VernierViewerSvg;
