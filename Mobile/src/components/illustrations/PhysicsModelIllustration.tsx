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
  Path, Polygon, RadialGradient, Stop, Text as SvgText,
} from 'react-native-svg';

const AnimatedView = Animated.View;

interface Props { width: number; height: number; }

export const PhysicsModelIllustration: React.FC<Props> = ({ width, height }) => {
  const cubeFloat = useSharedValue(0);
  const shadowScale = useSharedValue(1);

  useEffect(() => {
    // 3D Cube floating loop
    cubeFloat.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Dynamic Shadow scaling
    shadowScale.value = withRepeat(
      withSequence(
        withTiming(0.82, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedCubeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cubeFloat.value }],
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
  }));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background & Floor Grid */}
      <Svg width={width} height={height} viewBox="0 0 300 270" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="pm_bg" cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Glow */}
        <Ellipse cx="150" cy="155" rx="140" ry="110" fill="url(#pm_bg)" />

        {/* Perspective Grid Floor */}
        <Line x1="50" y1="220" x2="250" y2="220" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.5" />
        <Line x1="40" y1="232" x2="260" y2="232" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.35" />
        <Line x1="30" y1="244" x2="270" y2="244" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.2" />
        <Line x1="150" y1="210" x2="70" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
        <Line x1="150" y1="210" x2="100" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
        <Line x1="150" y1="210" x2="130" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
        <Line x1="150" y1="210" x2="230" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
        <Line x1="150" y1="210" x2="200" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
        <Line x1="150" y1="210" x2="170" y2="250" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.4" />
      </Svg>

      {/* Animated Floor Shadow */}
      <AnimatedView style={[{ position: 'absolute', top: 206, alignSelf: 'center' }, animatedShadowStyle]}>
        <Svg width={140} height={30} viewBox="0 0 140 30">
          <Ellipse cx="70" cy="15" rx="55" ry="9" fill="#7C3AED" fillOpacity="0.22" />
        </Svg>
      </AnimatedView>

      {/* Floating 3D Cube & Force Vector Arrows */}
      <AnimatedView style={[{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }, animatedCubeStyle]}>
        <Svg width={width} height={height} viewBox="0 0 300 270">
          <Defs>
            <LinearGradient id="pm_top" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C084FC" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
            <LinearGradient id="pm_left" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#581C87" />
              <Stop offset="100%" stopColor="#3B0764" />
            </LinearGradient>
            <LinearGradient id="pm_right" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#7E22CE" />
              <Stop offset="100%" stopColor="#581C87" />
            </LinearGradient>
          </Defs>

          {/* 3D Cube Faces */}
          {/* Top Face */}
          <Polygon
            points="150,72 206,105 150,138 94,105"
            fill="url(#pm_top)"
            stroke="#E9D5FF" strokeWidth="1.2"
          />

          {/* Left Face */}
          <Polygon
            points="94,105 150,138 150,203 94,170"
            fill="url(#pm_left)"
            stroke="#A855F7" strokeWidth="1.2"
          />

          {/* Right Face */}
          <Polygon
            points="206,105 150,138 150,203 206,170"
            fill="url(#pm_right)"
            stroke="#9333EA" strokeWidth="1.2"
          />

          {/* Edge Highlights */}
          <Path d="M 150 72 L 206 105 M 150 72 L 94 105 M 150 72 L 150 138"
            stroke="#F3E8FF" strokeWidth="1.2" strokeOpacity="0.8" strokeLinecap="round" />

          {/* Force Vectors */}

          {/* Normal Force N (Green Arrow ↑) */}
          <Line x1="150" y1="72" x2="150" y2="24" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" />
          <Polygon points="150,14 144,28 156,28" fill="#22C55E" />
          <SvgText x="160" y="24" fontSize="16" fill="#22C55E" fontWeight="900">N</SvgText>

          {/* Force F (Red Arrow →) */}
          <Line x1="206" y1="138" x2="254" y2="138" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
          <Polygon points="264,138 250,132 250,144" fill="#EF4444" />
          <SvgText x="266" y="144" fontSize="16" fill="#EF4444" fontWeight="900">F</SvgText>

          {/* Weight mg (Blue Arrow ↓) */}
          <Line x1="150" y1="203" x2="150" y2="247" stroke="#3B82F6" strokeWidth="2.8" strokeLinecap="round" />
          <Polygon points="150,257 144,243 156,243" fill="#3B82F6" />
          <SvgText x="160" y="254" fontSize="14" fill="#3B82F6" fontWeight="800">mg</SvgText>

          {/* Ambient Cosmic Particles */}
          <Circle cx="58" cy="90" r="3.5" fill="#A78BFA" fillOpacity="0.5" />
          <Circle cx="250" cy="78" r="3" fill="#8B5CF6" fillOpacity="0.5" />
          <Circle cx="72" cy="185" r="2.5" fill="#C4B5FD" fillOpacity="0.6" />
          <Circle cx="240" cy="175" r="2" fill="#7C3AED" fillOpacity="0.4" />
        </Svg>
      </AnimatedView>
    </View>
  );
};

export default PhysicsModelIllustration;
