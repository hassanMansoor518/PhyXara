import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export const AIAvatarSvg: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <Defs>
          <LinearGradient id="botBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#42D9FF" />
            <Stop offset="100%" stopColor="#6C4DFF" />
          </LinearGradient>
          <LinearGradient id="botFace" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#E0E7FF" />
          </LinearGradient>
        </Defs>

        {/* Circular backing */}
        <Circle cx="30" cy="30" r="28" fill="url(#botBg)" />

        {/* Robot Head */}
        <Rect x="15" y="16" width="30" height="26" rx="8" fill="url(#botFace)" stroke="#312E81" strokeWidth="1.5" />

        {/* Antenna */}
        <Path d="M 30 16 L 30 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="30" cy="9" r="3" fill="#42D9FF" />

        {/* Robot Visor / Eyes */}
        <Rect x="19" y="22" width="22" height="10" rx="5" fill="#0F172A" />
        <Circle cx="25" cy="27" r="2.5" fill="#42D9FF" />
        <Circle cx="35" cy="27" r="2.5" fill="#42D9FF" />

        {/* Cheerful mouth */}
        <Path d="M 26 36 Q 30 39 34 36" stroke="#6C4DFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Ears */}
        <Rect x="12" y="24" width="3" height="10" rx="1.5" fill="#C7D2FE" />
        <Rect x="45" y="24" width="3" height="10" rx="1.5" fill="#C7D2FE" />
      </Svg>
    </View>
  );
};

export default AIAvatarSvg;
