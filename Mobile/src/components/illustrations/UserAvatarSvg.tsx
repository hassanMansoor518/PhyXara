import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export const UserAvatarSvg: React.FC<{ size?: number }> = ({ size = 80 }) => {
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#8F78FF" />
            <Stop offset="100%" stopColor="#4B35C8" />
          </LinearGradient>
          <LinearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFDFC4" />
            <Stop offset="100%" stopColor="#F0B088" />
          </LinearGradient>
          <LinearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx="50" cy="50" r="48" fill="url(#avatarBg)" />

        {/* Shirt */}
        <Path d="M 22 92 C 22 75, 40 70, 50 70 C 60 70, 78 75, 78 92 Z" fill="url(#shirtGrad)" />
        {/* Collar */}
        <Path d="M 42 70 L 50 80 L 58 70 Z" fill="#FFFFFF" />

        {/* Neck */}
        <Rect x="44" y="58" width="12" height="15" rx="3" fill="url(#skinGrad)" />

        {/* Head */}
        <Circle cx="50" cy="45" r="22" fill="url(#skinGrad)" />

        {/* Hair */}
        <Path
          d="M 28 42 C 28 26, 42 22, 50 22 C 60 22, 72 26, 72 40 C 72 36, 68 30, 50 30 C 36 30, 30 38, 28 42 Z"
          fill="#1E1B4B"
        />

        {/* Eyes */}
        <Circle cx="43" cy="45" r="2.5" fill="#0F172A" />
        <Circle cx="57" cy="45" r="2.5" fill="#0F172A" />
        {/* Eye highlights */}
        <Circle cx="44" cy="44" r="0.8" fill="#FFFFFF" />
        <Circle cx="58" cy="44" r="0.8" fill="#FFFFFF" />

        {/* Smile */}
        <Path d="M 45 54 Q 50 59 55 54" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Glasses (optional smart student look) */}
        <Circle cx="43" cy="45" r="7" stroke="#6C4DFF" strokeWidth="1.5" fill="none" />
        <Circle cx="57" cy="45" r="7" stroke="#6C4DFF" strokeWidth="1.5" fill="none" />
        <Path d="M 50 45 L 50 45" stroke="#6C4DFF" strokeWidth="1.5" />
      </Svg>
    </View>
  );
};

export default UserAvatarSvg;
