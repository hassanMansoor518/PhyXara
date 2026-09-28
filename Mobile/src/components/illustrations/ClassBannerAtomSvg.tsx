import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, RadialGradient, Stop } from 'react-native-svg';

interface ClassBannerAtomSvgProps {
  width?: number;
  height?: number;
}

export const ClassBannerAtomSvg: React.FC<ClassBannerAtomSvgProps> = ({
  width = 80,
  height = 80,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
      <Defs>
        <RadialGradient id="bannerAtomGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
          <Stop offset="60%" stopColor="#0284C7" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Central glow */}
      <Circle cx="50" cy="50" r="30" fill="url(#bannerAtomGlow)" />

      {/* Orbital Ring 1 */}
      <Ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="13"
        transform="rotate(-30 50 50)"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Orbital Ring 2 */}
      <Ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="13"
        transform="rotate(30 50 50)"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Orbital Ring 3 */}
      <Ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="13"
        transform="rotate(90 50 50)"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Orbiting Electrons */}
      <Circle cx="76" cy="35" r="2.5" fill="#38BDF8" />
      <Circle cx="24" cy="65" r="2.5" fill="#60A5FA" />
      <Circle cx="50" cy="12" r="2.5" fill="#BAE6FD" />

      {/* Nucleus */}
      <Circle cx="50" cy="50" r="6" fill="#FFFFFF" />
      <Circle cx="50" cy="50" r="3.5" fill="#38BDF8" />
    </Svg>
  );
};

export default ClassBannerAtomSvg;
