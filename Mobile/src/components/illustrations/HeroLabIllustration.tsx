import React from 'react';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

interface HeroLabIllustrationProps {
  width?: number;
  height?: number;
}

export const HeroLabIllustration: React.FC<HeroLabIllustrationProps> = ({
  width = 150,
  height = 140,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 150" fill="none">
      <Defs>
        {/* Book Gradient */}
        <LinearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id="bookPages" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#CBD5E1" />
        </LinearGradient>
        {/* Glow */}
        <RadialGradient id="atomGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#60A5FA" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </RadialGradient>
        {/* Badge Gradients */}
        <LinearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* Background Soft Glow */}
      <Circle cx="80" cy="55" r="45" fill="url(#atomGlow)" />

      {/* Floating Badge "F" (Force) */}
      <G transform="translate(15, 20)">
        <Rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="7"
          fill="url(#badgeGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <SvgText
          x="12"
          y="16"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          F
        </SvgText>
      </G>

      {/* Floating Badge "v" (Velocity) */}
      <G transform="translate(130, 80)">
        <Rect
          x="0"
          y="0"
          width="22"
          height="22"
          rx="6"
          fill="url(#badgeGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <SvgText
          x="11"
          y="15"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          v
        </SvgText>
      </G>

      {/* Atom Orbitals */}
      <G transform="translate(82, 50)">
        {/* Orbit 1 */}
        <Ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          transform="rotate(-25)"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />
        {/* Orbit 2 */}
        <Ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          transform="rotate(35)"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />
        {/* Orbit 3 */}
        <Ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          transform="rotate(95)"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />

        {/* Orbiting electrons */}
        <Circle cx="26" cy="-12" r="3" fill="#FFFFFF" />
        <Circle cx="-28" cy="10" r="2.5" fill="#93C5FD" />
        <Circle cx="2" cy="-36" r="2.5" fill="#FFFFFF" />

        {/* Nucleus */}
        <Circle cx="0" cy="0" r="7.5" fill="#FFFFFF" />
        <Circle cx="0" cy="0" r="4.5" fill="#3B82F6" />
      </G>

      {/* Open 3D Textbook */}
      <G transform="translate(30, 92)">
        {/* Shadow under book */}
        <Path
          d="M 5 44 C 30 48, 70 48, 95 44 C 70 40, 30 40, 5 44 Z"
          fill="#1E3A8A"
          fillOpacity="0.3"
        />

        {/* Book Left Page Base */}
        <Path
          d="M 50 12 C 34 8, 12 11, 4 17 L 4 39 C 14 33, 34 31, 50 35 Z"
          fill="url(#bookCover)"
        />

        {/* Book Right Page Base */}
        <Path
          d="M 50 35 C 66 31, 86 33, 96 39 L 96 17 C 88 11, 66 8, 50 12 Z"
          fill="url(#bookPages)"
        />

        {/* Book Spine Center */}
        <Path
          d="M 50 12 L 50 35"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Subtle Page Lines on Left Page */}
        <Path
          d="M 14 21 C 24 17, 36 17, 44 20"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        <Path
          d="M 14 26 C 24 22, 36 22, 44 25"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Subtle Page Lines on Right Page */}
        <Path
          d="M 56 20 C 64 17, 76 17, 86 21"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        <Path
          d="M 56 25 C 64 22, 76 22, 86 26"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </G>

      {/* Sparkles */}
      <Circle cx="120" cy="30" r="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      <Circle cx="35" cy="70" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
      <Circle cx="140" cy="55" r="2" fill="#93C5FD" fillOpacity="0.9" />
    </Svg>
  );
};

export default HeroLabIllustration;
