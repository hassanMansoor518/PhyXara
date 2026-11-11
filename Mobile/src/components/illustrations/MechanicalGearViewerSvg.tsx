import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, Defs, LinearGradient, RadialGradient, Stop, G, Text as SvgText } from 'react-native-svg';

export const MechanicalGearViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
}> = ({ width = 290, height = 230, rotationAngle = 0 }) => {
  const driverAngle = rotationAngle;
  // Gear ratio 1:2 (driven gear rotates at half speed in opposite direction)
  const drivenAngle = -rotationAngle * 0.5;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          {/* Driver Gear Steel Gradient */}
          <RadialGradient id="driverGearGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="50%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1E3A8A" />
          </RadialGradient>

          {/* Driven Gear Bronze Gradient */}
          <RadialGradient id="drivenGearGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="50%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </RadialGradient>

          {/* Shaft Gradient */}
          <RadialGradient id="gearShaftGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="60%" stopColor="#94A3B8" />
            <Stop offset="100%" stopColor="#334155" />
          </RadialGradient>

          {/* Floor Shadow */}
          <RadialGradient id="gearShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Floor Shadow */}
        <Path d="M 30 230 C 30 210, 310 210, 310 230 C 310 250, 30 250, 30 230 Z" fill="url(#gearShadow)" />

        {/* --- DRIVER PINION (Left Gear, 10 teeth, radius 45) --- */}
        <G transform={`translate(105, 125)`}>
          <G transform={`rotate(${driverAngle})`}>
            {/* Gear Teeth */}
            {[...Array(10)].map((_, i) => {
              const deg = i * 36;
              return (
                <Rect
                  key={i}
                  x="-6"
                  y="-48"
                  width="12"
                  height="12"
                  rx="2"
                  fill="url(#driverGearGrad)"
                  stroke="#1E3A8A"
                  strokeWidth="1"
                  transform={`rotate(${deg})`}
                />
              );
            })}
            {/* Gear Body Circle */}
            <Circle cx="0" cy="0" r="42" fill="url(#driverGearGrad)" stroke="#1E3A8A" strokeWidth="2" />
            {/* Weight reduction holes */}
            {[...Array(4)].map((_, i) => (
              <Circle
                key={i}
                cx={Math.cos((i * 90 * Math.PI) / 180) * 24}
                cy={Math.sin((i * 90 * Math.PI) / 180) * 24}
                r="6"
                fill="#0F172A"
              />
            ))}
            {/* Central Shaft */}
            <Circle cx="0" cy="0" r="12" fill="url(#gearShaftGrad)" stroke="#334155" strokeWidth="1.5" />
            <Rect x="-2" y="-12" width="4" height="6" fill="#1E293B" rx="1" />
          </G>
          <SvgText x="0" y="65" fill="#2563EB" fontSize="10" fontWeight="bold" textAnchor="middle">
            DRIVER PINION (N₁)
          </SvgText>
        </G>

        {/* --- DRIVEN GEAR (Right Gear, 18 teeth, radius 70) --- */}
        <G transform={`translate(225, 125)`}>
          <G transform={`rotate(${drivenAngle})`}>
            {/* Gear Teeth */}
            {[...Array(18)].map((_, i) => {
              const deg = i * 20;
              return (
                <Rect
                  key={i}
                  x="-5"
                  y="-72"
                  width="10"
                  height="12"
                  rx="2"
                  fill="url(#drivenGearGrad)"
                  stroke="#78350F"
                  strokeWidth="1"
                  transform={`rotate(${deg})`}
                />
              );
            })}
            {/* Gear Body Circle */}
            <Circle cx="0" cy="0" r="66" fill="url(#drivenGearGrad)" stroke="#78350F" strokeWidth="2" />
            {/* Weight reduction holes */}
            {[...Array(6)].map((_, i) => (
              <Circle
                key={i}
                cx={Math.cos((i * 60 * Math.PI) / 180) * 40}
                cy={Math.sin((i * 60 * Math.PI) / 180) * 40}
                r="10"
                fill="#0F172A"
              />
            ))}
            {/* Central Shaft */}
            <Circle cx="0" cy="0" r="14" fill="url(#gearShaftGrad)" stroke="#334155" strokeWidth="1.5" />
            <Rect x="-2.5" y="-14" width="5" height="7" fill="#1E293B" rx="1" />
          </G>
          <SvgText x="0" y="88" fill="#D97706" fontSize="10" fontWeight="bold" textAnchor="middle">
            DRIVEN GEAR (N₂)
          </SvgText>
        </G>

        {/* Title Header */}
        <SvgText x="170" y="24" fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          SPUR GEAR POWER TRANSMISSION (i = N₂/N₁)
        </SvgText>
      </Svg>
    </View>
  );
};
export default MechanicalGearViewerSvg;
