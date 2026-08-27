import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

export const ElectricMotorAnimatedSvg: React.FC<{
  isPlaying?: boolean;
  width?: number;
  height?: number;
}> = ({ isPlaying = true, width = 290, height = 230 }) => {
  const rotation = useSharedValue(0);
  const fluxWave = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
      fluxWave.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      cancelAnimation(fluxWave);
    }
  }, [isPlaying]);

  const animatedRotorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.4 * Math.sin((fluxWave.value * 2 * Math.PI)),
  }));

  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 340 260" fill="none">
        <Defs>
          <LinearGradient id="animCasing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="50%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
          <LinearGradient id="fluxCyan" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#42D9FF" stopOpacity="0.1" />
            <Stop offset="50%" stopColor="#42D9FF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="currentOrange" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FFB020" />
            <Stop offset="100%" stopColor="#EA580C" />
          </LinearGradient>
          <RadialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#42D9FF" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#42D9FF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Magnetic Field Glow in background */}
        <Circle cx="170" cy="130" r="100" fill="url(#fieldGlow)" />

        {/* Stator Shell & Base */}
        <Path
          d="M 100 65 L 240 65 C 265 65, 265 195, 240 195 L 100 195 C 75 195, 75 65, 100 65 Z"
          fill="url(#animCasing)"
          stroke="#0F172A"
          strokeWidth="3"
        />
        {/* Feet */}
        <Path d="M 90 195 L 75 220 L 135 220 L 130 195 Z" fill="#1E293B" stroke="#0F172A" />
        <Path d="M 210 195 L 205 220 L 265 220 L 250 195 Z" fill="#1E293B" stroke="#0F172A" />

        {/* Magnetic Poles (North & South) */}
        <Path d="M 95 85 L 125 85 L 125 175 L 95 175 Z" fill="#EF4444" opacity="0.9" />
        <Path d="M 215 85 L 245 85 L 245 175 L 215 175 Z" fill="#3B82F6" opacity="0.9" />

        {/* Magnetic Flux Lines (B-Field) - Glowing Cyan curves */}
        <Path
          d="M 125 95 C 170 75, 170 75, 215 95"
          stroke="#42D9FF"
          strokeWidth="2.5"
          strokeDasharray="5,4"
        />
        <Path
          d="M 125 115 C 170 105, 170 105, 215 115"
          stroke="#42D9FF"
          strokeWidth="2"
          strokeDasharray="5,4"
        />
        <Path
          d="M 125 135 L 215 135"
          stroke="#42D9FF"
          strokeWidth="3"
          strokeDasharray="6,4"
        />
        <Path
          d="M 125 155 C 170 165, 170 165, 215 155"
          stroke="#42D9FF"
          strokeWidth="2"
          strokeDasharray="5,4"
        />
        <Path
          d="M 125 175 C 170 195, 170 195, 215 175"
          stroke="#42D9FF"
          strokeWidth="2.5"
          strokeDasharray="5,4"
        />

        {/* Direction of Magnetic Field Arrows */}
        <Path d="M 175 131 L 182 135 L 175 139 Z" fill="#42D9FF" />
        <Path d="M 175 99 L 182 103 L 175 107 Z" fill="#42D9FF" />
        <Path d="M 175 163 L 182 167 L 175 171 Z" fill="#42D9FF" />

        {/* Current Flow arrows on the loop */}
        <Path d="M 145 92 L 155 92" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 152 89 L 157 92 L 152 95 Z" fill="#FFB020" />
        <Path d="M 195 178 L 185 178" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 188 175 L 183 178 L 188 181 Z" fill="#FFB020" />

        {/* Shaft */}
        <Circle cx="170" cy="135" r="16" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        <Circle cx="170" cy="135" r="6" fill="#334155" />
      </Svg>
    </View>
  );
};

export default ElectricMotorAnimatedSvg;
