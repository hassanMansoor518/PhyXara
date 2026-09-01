import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';

export const AtomSplashVisual: React.FC<{ size?: number }> = ({ size = 320 }) => {
  const rotation = useSharedValue(0);
  const corePulse = useSharedValue(1);
  const cubeFloat = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );
    corePulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    cubeFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedRingsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: corePulse.value }],
  }));

  const animatedCubeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cubeFloat.value }],
  }));

  return (
    <View className="items-center justify-center relative" style={{ width: size, height: size }}>
      {/* Main SVG Container */}
      <Svg width={size} height={size} viewBox="0 0 340 340" fill="none">
        <Defs>
          {/* Deep Cosmic Background Glow Gradients (Cross-Platform) */}
          <RadialGradient id="outerCosmicGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#3B2BB0" stopOpacity="0.5" />
            <Stop offset="50%" stopColor="#3B2BB0" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#3B2BB0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerCyanGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <Stop offset="60%" stopColor="#38BDF8" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </RadialGradient>

          {/* Intense Core Glow */}
          <RadialGradient id="brightCoreGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="25%" stopColor="#67E8F9" stopOpacity="0.95" />
            <Stop offset="55%" stopColor="#3B82F6" stopOpacity="0.8" />
            <Stop offset="85%" stopColor="#6C4DFF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
          </RadialGradient>

          {/* Core Halo */}
          <RadialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
            <Stop offset="60%" stopColor="#6366F1" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#0B112C" stopOpacity="0" />
          </RadialGradient>

          {/* 3D Isometric Cube Gradients */}
          <LinearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#9333EA" />
            <Stop offset="100%" stopColor="#6B21A8" />
          </LinearGradient>
          <LinearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#581C87" />
            <Stop offset="100%" stopColor="#3B0764" />
          </LinearGradient>
          <LinearGradient id="cubeRight" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#7E22CE" />
            <Stop offset="100%" stopColor="#4C1D95" />
          </LinearGradient>
          <LinearGradient id="cubeGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#6B21A8" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Deep Cosmic Background Glow Circles (Cross-Platform Native + Web) */}
        <Circle cx="170" cy="170" r="160" fill="url(#outerCosmicGlow)" />
        <Circle cx="170" cy="170" r="80" fill="url(#innerCyanGlow)" />

        {/* Outer Background Celestial Orbit Rings */}
        <G stroke="#334155" strokeWidth="1" strokeOpacity="0.45" fill="none">
          <Circle cx="170" cy="170" r="145" strokeDasharray="3,6" />
          <Circle cx="170" cy="170" r="120" stroke="#475569" strokeOpacity="0.35" />
          <Circle cx="170" cy="170" r="95" stroke="#6366F1" strokeOpacity="0.3" />
        </G>

        {/* Floating Particle Dots on outer orbits */}
        <G>
          {/* Top-left cyan node */}
          <Circle cx="85" cy="55" r="4.5" fill="#38BDF8" />
          <Circle cx="85" cy="55" r="9" fill="#38BDF8" fillOpacity="0.2" />

          {/* Top-right purple node */}
          <Circle cx="275" cy="55" r="5" fill="#A855F7" />
          <Circle cx="275" cy="55" r="10" fill="#A855F7" fillOpacity="0.25" />

          {/* Left mid cyan dot */}
          <Circle cx="65" cy="120" r="3.5" fill="#67E8F9" />

          {/* Far left blue dot */}
          <Circle cx="30" cy="160" r="4" fill="#60A5FA" />
          <Circle cx="30" cy="160" r="8" fill="#60A5FA" fillOpacity="0.2" />

          {/* Right mid glow dot */}
          <Circle cx="270" cy="115" r="4" fill="#38BDF8" />
          <Circle cx="270" cy="115" r="8" fill="#38BDF8" fillOpacity="0.2" />

          {/* Right lower blue node */}
          <Circle cx="275" cy="155" r="3.5" fill="#818CF8" />

          {/* Tiny cosmic dust stars */}
          <Circle cx="55" cy="85" r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
          <Circle cx="130" cy="40" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          <Circle cx="230" cy="45" r="1" fill="#67E8F9" fillOpacity="0.8" />
          <Circle cx="220" cy="210" r="1.5" fill="#A855F7" fillOpacity="0.8" />
          <Circle cx="105" cy="265" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
        </G>
      </Svg>

      {/* Rotating Atomic Orbital Rings Layer */}
      <Animated.View
        style={[
          animatedRingsStyle,
          { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 340 340" fill="none">
          {/* 3 Main Elliptical Atom Orbits */}
          <G fill="none" strokeWidth="2.5">
            {/* Horizontal-ish ring */}
            <Ellipse
              cx="170"
              cy="170"
              rx="75"
              ry="32"
              stroke="#60A5FA"
              strokeOpacity="0.9"
              transform="rotate(0 170 170)"
            />
            {/* Angled 60 deg ring */}
            <Ellipse
              cx="170"
              cy="170"
              rx="75"
              ry="32"
              stroke="#818CF8"
              strokeOpacity="0.95"
              transform="rotate(60 170 170)"
            />
            {/* Angled 120 deg ring */}
            <Ellipse
              cx="170"
              cy="170"
              rx="75"
              ry="32"
              stroke="#67E8F9"
              strokeOpacity="0.9"
              transform="rotate(120 170 170)"
            />
          </G>

          {/* Orbiting Electrons / Energy Beads on the Atom rings */}
          <Circle cx="245" cy="170" r="4" fill="#67E8F9" />
          <Circle cx="95" cy="170" r="3.5" fill="#FFFFFF" />
          <Circle cx="208" cy="235" r="4" fill="#A78BFA" />
          <Circle cx="132" cy="105" r="3.5" fill="#67E8F9" />
          <Circle cx="132" cy="235" r="4" fill="#38BDF8" />
          <Circle cx="208" cy="105" r="3.5" fill="#FFFFFF" />
        </Svg>
      </Animated.View>

      {/* Center Radiant Atomic Nucleus */}
      <Animated.View
        style={[
          animatedCoreStyle,
          { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <Svg width={130} height={130} viewBox="0 0 130 130" fill="none">
          <Defs>
            {/* Intense Core Glow */}
            <RadialGradient id="brightCoreGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="25%" stopColor="#67E8F9" stopOpacity="0.95" />
              <Stop offset="55%" stopColor="#3B82F6" stopOpacity="0.8" />
              <Stop offset="85%" stopColor="#6C4DFF" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
            </RadialGradient>

            {/* Core Halo */}
            <RadialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <Stop offset="60%" stopColor="#6366F1" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#0B112C" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Outer soft aura */}
          <Circle cx="65" cy="65" r="58" fill="url(#coreHalo)" />
          {/* Core sphere with glowing gradient */}
          <Circle cx="65" cy="65" r="32" fill="url(#brightCoreGlow)" />
          {/* Super bright center point */}
          <Circle cx="65" cy="65" r="14" fill="#FFFFFF" />
        </Svg>
      </Animated.View>

      {/* Floating 3D Isometric Purple Cube on Bottom Right */}
      <Animated.View
        style={[
          animatedCubeStyle,
          { position: 'absolute', right: 18, bottom: 26 },
        ]}
      >
        <Svg width={65} height={70} viewBox="0 0 65 70" fill="none">
          <Defs>
            {/* 3D Isometric Cube Gradients */}
            <LinearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#9333EA" />
              <Stop offset="100%" stopColor="#6B21A8" />
            </LinearGradient>
            <LinearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#581C87" />
              <Stop offset="100%" stopColor="#3B0764" />
            </LinearGradient>
            <LinearGradient id="cubeRight" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#7E22CE" />
              <Stop offset="100%" stopColor="#4C1D95" />
            </LinearGradient>
            <LinearGradient id="cubeGlow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#6B21A8" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Cube Soft Aura */}
          <Circle cx="32" cy="35" r="28" fill="url(#cubeGlow)" />

          {/* 3D Cube Faces */}
          {/* Top Face */}
          <Polygon
            points="32,8 56,22 32,36 8,22"
            fill="url(#cubeTop)"
            stroke="#C084FC"
            strokeWidth="1.2"
          />
          {/* Left Face */}
          <Polygon
            points="8,22 32,36 32,62 8,48"
            fill="url(#cubeLeft)"
            stroke="#A855F7"
            strokeWidth="1.2"
          />
          {/* Right Face */}
          <Polygon
            points="32,36 56,22 56,48 32,62"
            fill="url(#cubeRight)"
            stroke="#9333EA"
            strokeWidth="1.2"
          />

          {/* Bright Edge Highlights */}
          <Path d="M 32 8 L 56 22 M 32 8 L 8 22 M 32 8 L 32 36" stroke="#E9D5FF" strokeWidth="1" strokeOpacity="0.8" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default AtomSplashVisual;
