import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const MicrometerViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  // Spindle moves slightly with rotation angle to simulate precision measurement
  const spindleOffset = Math.sin((rotationAngle * Math.PI) / 180) * 14;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Cast Iron U-Frame Gradient */}
          <LinearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="30%" stopColor="#0F172A" />
            <Stop offset="70%" stopColor="#1E3A8A" />
            <Stop offset="100%" stopColor="#172554" />
          </LinearGradient>

          {/* Hardened Steel Spindle & Anvil */}
          <LinearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="30%" stopColor="#CBD5E1" />
            <Stop offset="70%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#475569" />
          </LinearGradient>

          {/* Chrome Plated Sleeve & Thimble */}
          <LinearGradient id="chromeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F1F5F9" />
            <Stop offset="25%" stopColor="#E2E8F0" />
            <Stop offset="60%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#64748B" />
          </LinearGradient>

          {/* Knurled Ratchet Texture Gradient */}
          <LinearGradient id="knurlGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="25%" stopColor="#64748B" />
            <Stop offset="50%" stopColor="#1E293B" />
            <Stop offset="75%" stopColor="#475569" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Floor Shadow */}
          <RadialGradient id="microShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 30 225 C 30 200, 310 200, 310 225 C 310 250, 30 250, 30 225 Z" fill="url(#microShadow)" />

        {/* --- MAIN MICROMETER U-FRAME --- */}
        <G transform={`rotate(${rotationAngle * 0.15}, 170, 130)`}>
          {/* Heavy Curved U-Frame */}
          <Path
            d="M 50 115 C 35 170, 60 215, 120 220 C 170 224, 200 185, 205 135 L 180 135 C 175 165, 155 198, 120 196 C 80 194, 62 160, 72 115 Z"
            fill="url(#frameGrad)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />

          {/* Specification Badge on Frame */}
          <Rect x="85" y="180" width="70" height="18" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <SvgText x="120" y="193" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">
            0-25mm 0.01mm
          </SvgText>

          {/* Fixed Anvil (Left) */}
          <Rect x="48" y="105" width="22" height="18" rx="2" fill="url(#steelGrad)" stroke="#334155" strokeWidth="1.2" />
          <Rect x="65" y="107" width="5" height="14" rx="1" fill="#E2E8F0" />

          {/* Movable Precision Spindle */}
          <Rect
            x={92 + spindleOffset}
            y="108"
            width={85 - spindleOffset}
            height="12"
            rx="1.5"
            fill="url(#steelGrad)"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Lock Nut Lever */}
          <Path d="M 172 96 L 176 108 L 180 96 Z" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
          <Circle cx="176" cy="108" r="4" fill="#475569" />

          {/* Sleeve / Barrel (Main Linear Scale) */}
          <Rect x="175" y="102" width="60" height="24" rx="3" fill="url(#chromeGrad)" stroke="#334155" strokeWidth="1.5" />
          {/* Datum Line */}
          <Line x1="178" y1="114" x2="230" y2="114" stroke="#0F172A" strokeWidth="1.2" />
          {/* Main Scale Graduation Marks (0, 5, 10, 15, 20, 25 mm) */}
          <Line x1="185" y1="108" x2="185" y2="114" stroke="#0F172A" strokeWidth="1" />
          <Line x1="195" y1="106" x2="195" y2="114" stroke="#0F172A" strokeWidth="1.2" />
          <Line x1="205" y1="108" x2="205" y2="114" stroke="#0F172A" strokeWidth="1" />
          <Line x1="215" y1="106" x2="215" y2="114" stroke="#0F172A" strokeWidth="1.2" />
          <Line x1="225" y1="108" x2="225" y2="114" stroke="#0F172A" strokeWidth="1" />
          {/* Sub-divisions (0.5 mm) below datum */}
          <Line x1="190" y1="114" x2="190" y2="120" stroke="#0F172A" strokeWidth="0.8" />
          <Line x1="200" y1="114" x2="200" y2="120" stroke="#0F172A" strokeWidth="0.8" />
          <Line x1="210" y1="114" x2="210" y2="120" stroke="#0F172A" strokeWidth="0.8" />
          <Line x1="220" y1="114" x2="220" y2="120" stroke="#0F172A" strokeWidth="0.8" />

          {/* Thimble (Circular Rotating Scale) with Knurling */}
          <G transform={`translate(${spindleOffset * 0.4}, 0)`}>
            {/* Beveled Collar with Circular Divisions */}
            <Path d="M 230 99 L 240 102 L 240 126 L 230 129 Z" fill="#CBD5E1" stroke="#334155" strokeWidth="1.2" />
            {/* Circular Scale Marks (0 to 50 divisions) */}
            <Line x1="233" y1="106" x2="238" y2="108" stroke="#0F172A" strokeWidth="1" />
            <Line x1="232" y1="114" x2="239" y2="114" stroke="#DC2626" strokeWidth="1.5" />
            <Line x1="233" y1="122" x2="238" y2="120" stroke="#0F172A" strokeWidth="1" />

            {/* Thimble Knurled Body */}
            <Rect x="240" y="100" width="48" height="28" rx="2" fill="url(#knurlGrad)" stroke="#1E293B" strokeWidth="1.5" />
            {/* Knurl hatch lines */}
            <Line x1="248" y1="101" x2="248" y2="127" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />
            <Line x1="256" y1="101" x2="256" y2="127" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />
            <Line x1="264" y1="101" x2="264" y2="127" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />
            <Line x1="272" y1="101" x2="272" y2="127" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />
            <Line x1="280" y1="101" x2="280" y2="127" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />

            {/* Ratchet Stop (Knurled End Knob) */}
            <Rect x="288" y="105" width="24" height="18" rx="3" fill="url(#chromeGrad)" stroke="#334155" strokeWidth="1.2" />
            <Line x1="294" y1="106" x2="294" y2="122" stroke="#1E293B" strokeWidth="0.8" />
            <Line x1="300" y1="106" x2="300" y2="122" stroke="#1E293B" strokeWidth="0.8" />
            <Line x1="306" y1="106" x2="306" y2="122" stroke="#1E293B" strokeWidth="0.8" />
          </G>
        </G>
      </Svg>
    </View>
  );
};

export default MicrometerViewerSvg;
