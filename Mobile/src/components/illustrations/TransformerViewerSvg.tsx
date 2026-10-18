import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const TransformerViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Iron Core Laminated Gradient */}
          <LinearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="30%" stopColor="#1E293B" />
            <Stop offset="70%" stopColor="#0F172A" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>

          {/* Copper Primary Coil (Red/Orange Copper) */}
          <LinearGradient id="primaryCopperGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="40%" stopColor="#FB923C" />
            <Stop offset="70%" stopColor="#C2410C" />
            <Stop offset="100%" stopColor="#9A3412" />
          </LinearGradient>

          {/* Copper Secondary Coil (Gold/Copper) */}
          <LinearGradient id="secCopperGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="40%" stopColor="#FBBF24" />
            <Stop offset="70%" stopColor="#B45309" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* Magnetic Flux Path Glow */}
          <LinearGradient id="fluxGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#0284C7" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
          </LinearGradient>

          {/* Floor Shadow */}
          <RadialGradient id="transShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 40 230 C 40 210, 300 210, 300 230 C 300 250, 40 250, 40 230 Z" fill="url(#transShadow)" />

        <G transform={`rotate(${rotationAngle * 0.12}, 170, 125)`}>
          {/* Laminated Soft Iron Outer Core */}
          <Rect
            x="70"
            y="40"
            width="200"
            height="170"
            rx="12"
            fill="url(#coreGrad)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Inner Core Window cutout */}
          <Rect
            x="120"
            y="75"
            width="100"
            height="100"
            rx="8"
            fill="#090D16"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Core Laminations Hatching */}
          <Line x1="75" y1="55" x2="265" y2="55" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
          <Line x1="75" y1="195" x2="265" y2="195" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
          <Line x1="85" y1="42" x2="85" y2="208" stroke="#334155" strokeWidth="0.8" />
          <Line x1="255" y1="42" x2="255" y2="208" stroke="#334155" strokeWidth="0.8" />

          {/* Magnetic Flux Path Dashed Loop */}
          <Rect
            x="95"
            y="58"
            width="150"
            height="134"
            rx="8"
            fill="none"
            stroke="url(#fluxGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Primary Coil (Left Limb - Step-up has FEWER turns) */}
          <G id="primaryCoil">
            <Rect x="58" y="80" width="34" height="14" rx="4" fill="url(#primaryCopperGrad)" stroke="#7C2D12" strokeWidth="1" />
            <Rect x="58" y="100" width="34" height="14" rx="4" fill="url(#primaryCopperGrad)" stroke="#7C2D12" strokeWidth="1" />
            <Rect x="58" y="120" width="34" height="14" rx="4" fill="url(#primaryCopperGrad)" stroke="#7C2D12" strokeWidth="1" />
            <Rect x="58" y="140" width="34" height="14" rx="4" fill="url(#primaryCopperGrad)" stroke="#7C2D12" strokeWidth="1" />

            {/* Primary Terminals */}
            <Path d="M 40 85 L 58 85" stroke="#FB923C" strokeWidth="2.5" />
            <Path d="M 40 150 L 58 150" stroke="#FB923C" strokeWidth="2.5" />
            <Circle cx="38" cy="85" r="3.5" fill="#FB923C" />
            <Circle cx="38" cy="150" r="3.5" fill="#FB923C" />
            <SvgText x="38" y="75" fill="#FB923C" fontSize="9" fontWeight="bold" textAnchor="middle">AC IN (Vp)</SvgText>
            <SvgText x="75" y="172" fill="#FED7AA" fontSize="8" fontWeight="bold" textAnchor="middle">Np = 4 Turns</SvgText>
          </G>

          {/* Secondary Coil (Right Limb - Step-up has MANY turns) */}
          <G id="secondaryCoil">
            <Rect x="248" y="75" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="88" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="101" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="114" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="127" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="140" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />
            <Rect x="248" y="153" width="34" height="10" rx="3" fill="url(#secCopperGrad)" stroke="#78350F" strokeWidth="1" />

            {/* Secondary Terminals */}
            <Path d="M 282 80 L 302 80" stroke="#FBBF24" strokeWidth="2.5" />
            <Path d="M 282 158 L 302 158" stroke="#FBBF24" strokeWidth="2.5" />
            <Circle cx="304" cy="80" r="3.5" fill="#FBBF24" />
            <Circle cx="304" cy="158" r="3.5" fill="#FBBF24" />
            <SvgText x="304" y="70" fill="#FBBF24" fontSize="9" fontWeight="bold" textAnchor="middle">AC OUT (Vs)</SvgText>
            <SvgText x="265" y="180" fill="#FDE68A" fontSize="8" fontWeight="bold" textAnchor="middle">Ns = 7 Turns</SvgText>
          </G>

          {/* Magnetic Core Central Badge */}
          <Rect x="135" y="115" width="70" height="20" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
          <SvgText x="170" y="129" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">Φ Magnetic Core</SvgText>
        </G>
      </Svg>
    </View>
  );
};
