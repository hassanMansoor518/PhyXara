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
import Svg, {
  Circle, Defs, Ellipse, Line, LinearGradient,
  Path, Polygon, RadialGradient, Rect, Stop, Text as SvgText,
} from 'react-native-svg';

const AnimatedView = Animated.View;

interface Props { width: number; height: number; }

export const ARIllustration: React.FC<Props> = ({ width, height }) => {
  const pendulumAngle = useSharedValue(0);
  const pillFloat1 = useSharedValue(0);
  const pillFloat2 = useSharedValue(0);
  const pillFloat3 = useSharedValue(0);

  useEffect(() => {
    // Swinging pendulum back and forth smoothly
    pendulumAngle.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(-18, { duration: 1400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Staggered floating control pills
    pillFloat1.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pillFloat2.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pillFloat3.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPendulumStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: 0 },
      { rotate: `${pendulumAngle.value}deg` },
    ],
  }));

  const animatedPill1 = useAnimatedStyle(() => ({
    transform: [{ translateY: pillFloat1.value }],
  }));

  const animatedPill2 = useAnimatedStyle(() => ({
    transform: [{ translateY: pillFloat2.value }],
  }));

  const animatedPill3 = useAnimatedStyle(() => ({
    transform: [{ translateY: pillFloat3.value }],
  }));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background & 3D Phone Surface */}
      <Svg width={width} height={height} viewBox="0 0 300 270" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="ar_bg" cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="ar_phone" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#22223A" />
            <Stop offset="100%" stopColor="#141428" />
          </LinearGradient>
          <LinearGradient id="ar_screen" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#1C1235" />
            <Stop offset="100%" stopColor="#2A1A55" />
          </LinearGradient>
          <RadialGradient id="ar_glow" cx="50%" cy="100%" r="60%">
            <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Glow */}
        <Ellipse cx="150" cy="135" rx="145" ry="115" fill="url(#ar_bg)" />

        {/* 3D Phone Surface lying flat */}
        <Polygon points="50,208 250,208 268,228 32,228" fill="url(#ar_phone)" />
        <Polygon points="58,210 242,210 258,226 42,226" fill="url(#ar_screen)" />
        <Ellipse cx="150" cy="210" rx="90" ry="22" fill="url(#ar_glow)" />

        {/* Phone Bezels */}
        <Polygon points="32,228 50,208 50,214 32,234" fill="#1A1A30" />
        <Polygon points="268,228 250,208 250,214 268,234" fill="#111125" />
        <Polygon points="32,228 268,228 268,234 32,234" fill="#111125" />

        {/* Screen Grid Lines */}
        <Line x1="80" y1="212" x2="80" y2="224" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.7" />
        <Line x1="110" y1="211" x2="110" y2="225" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.7" />
        <Line x1="140" y1="211" x2="140" y2="225" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.7" />
        <Line x1="170" y1="211" x2="170" y2="225" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.7" />
        <Line x1="200" y1="212" x2="200" y2="224" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.7" />
        <Line x1="230" y1="212" x2="230" y2="224" stroke="#4C1D95" strokeWidth="0.8" strokeOpacity="0.6" />

        {/* Base Stand for Pendulum */}
        <Rect x="128" y="200" width="44" height="10" rx="4" fill="#4C1D95" />
        <Rect x="136" y="190" width="28" height="12" rx="3" fill="#5B21B6" />

        {/* Vertical Rod */}
        <Line x1="150" y1="192" x2="150" y2="90" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="150" cy="88" r="6" fill="#6D28D9" />
        <Circle cx="150" cy="88" r="3.5" fill="#A78BFA" />

        {/* Swing Arc Path */}
        <Path
          d="M 110 152 A 50 85 0 0 1 190 152"
          stroke="#8B5CF6" strokeWidth="1.5"
          fill="none" strokeDasharray="4,4"
          strokeLinecap="round"
        />
      </Svg>

      {/* Animated Pendulum String & Sphere */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            transformOrigin: '150px 88px',
          },
          animatedPendulumStyle,
        ]}
      >
        <Svg width={width} height={height} viewBox="0 0 300 270">
          <Defs>
            <LinearGradient id="ar_bob" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C084FC" />
              <Stop offset="50%" stopColor="#9333EA" />
              <Stop offset="100%" stopColor="#581C87" />
            </LinearGradient>
            <RadialGradient id="ar_bobShine" cx="35%" cy="35%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* String */}
          <Line x1="150" y1="92" x2="150" y2="152" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />

          {/* 3D Sphere Bob */}
          <Circle cx="150" cy="155" r="23" fill="url(#ar_bob)" />
          <Circle cx="150" cy="155" r="23" fill="url(#ar_bobShine)" />
          <Circle cx="142" cy="147" r="7" fill="#FFFFFF" fillOpacity="0.4" />
        </Svg>
      </AnimatedView>

      {/* Floating 3D Control Badges on Right */}
      <AnimatedView style={[{ position: 'absolute', right: 14, top: 110 }, animatedPill1]}>
        <Svg width={70} height={30} viewBox="0 0 70 30">
          <Rect x="2" y="2" width="66" height="26" rx="13" fill="#FFFFFF" stroke="#E8EAF4" strokeWidth="1" />
          <Circle cx="17" cy="15" r="8" fill="#EEE9FF" />
          <Path d="M 14 15 A 4 4 0 1 1 20 15" stroke="#6C4DFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <SvgText x="28" y="19" fontSize="9" fill="#101A43" fontWeight="700">Rotate</SvgText>
        </Svg>
      </AnimatedView>

      <AnimatedView style={[{ position: 'absolute', right: 14, top: 145 }, animatedPill2]}>
        <Svg width={70} height={30} viewBox="0 0 70 30">
          <Rect x="2" y="2" width="66" height="26" rx="13" fill="#FFFFFF" stroke="#E8EAF4" strokeWidth="1" />
          <Circle cx="17" cy="15" r="8" fill="#EEE9FF" />
          <Path d="M 14 12 L 20 18 M 20 12 L 14 18" stroke="#6C4DFF" strokeWidth="1.5" strokeLinecap="round" />
          <SvgText x="30" y="19" fontSize="9" fill="#101A43" fontWeight="700">Zoom</SvgText>
        </Svg>
      </AnimatedView>

      <AnimatedView style={[{ position: 'absolute', right: 14, top: 180 }, animatedPill3]}>
        <Svg width={70} height={30} viewBox="0 0 70 30">
          <Rect x="2" y="2" width="66" height="26" rx="13" fill="#6C4DFF" />
          <SvgText x="22" y="20" fontSize="11" fill="#FFFFFF" fontWeight="800">3D</SvgText>
        </Svg>
      </AnimatedView>
    </View>
  );
};

export default ARIllustration;
