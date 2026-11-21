import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

export function PhyXaraLogo({ size = 36, white = false }: { size?: number; white?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const atom = 'atomLogo' + id;
  const core = 'coreLogo' + id;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id={atom} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop stopColor={white ? '#FFFFFF' : '#287BFF'} />
          <Stop offset="1" stopColor={white ? '#CFC5FF' : '#702EFF'} />
        </LinearGradient>
        <RadialGradient id={core} cx="50%" cy="50%" r="50%">
          <Stop stopColor={white ? '#FFFFFF' : '#CEBDFF'} />
          <Stop offset="0.6" stopColor={white ? '#E0D7FF' : '#702EFF'} />
          <Stop offset="1" stopColor={white ? '#FFFFFF' : '#5700DC'} />
        </RadialGradient>
      </Defs>
      <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(30 32 32)" stroke={'url(#' + atom + ')'} strokeWidth={2.5} />
      <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(-30 32 32)" stroke={'url(#' + atom + ')'} strokeWidth={2.5} />
      <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(90 32 32)" stroke={white ? '#FFFFFF' : '#702EFF'} strokeWidth={2} />
      <Circle cx="32" cy="32" r="7" fill={'url(#' + core + ')'} />
    </Svg>
  );
}
