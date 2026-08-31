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
  Path, RadialGradient, Rect, Stop, Text as SvgText,
} from 'react-native-svg';

const AnimatedView = Animated.View;

interface Props { width: number; height: number; }

export const ScanIllustration: React.FC<Props> = ({ width, height }) => {
  const phoneFloat = useSharedValue(0);
  const scanLineY = useSharedValue(0);
  const targetPulse = useSharedValue(1);

  useEffect(() => {
    // Phone float
    phoneFloat.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Laser scan movement
    scanLineY.value = withRepeat(
      withTiming(80, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Pulse target
    targetPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPhoneStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: phoneFloat.value }],
  }));

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const animatedTargetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetPulse.value }],
  }));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Static Elements */}
      <Svg width={width} height={height} viewBox="0 0 300 270" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="si_bg" cx="50%" cy="55%" r="52%">
            <Stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="si_pageL" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#EEF0FF" />
          </LinearGradient>
          <LinearGradient id="si_pageR" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FAFBFF" />
            <Stop offset="100%" stopColor="#EDF0FF" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow */}
        <Ellipse cx="150" cy="148" rx="138" ry="108" fill="url(#si_bg)" />

        {/* Textbook shadow */}
        <Ellipse cx="150" cy="258" rx="118" ry="9" fill="#6C4DFF" fillOpacity="0.15" />

        {/* Book Left Page */}
        <Path
          d="M 8 255 L 8 152 Q 78 136 148 134 L 148 228 Q 80 230 8 255 Z"
          fill="url(#si_pageL)" stroke="#DDE1FF" strokeWidth="1"
        />
        <Line x1="22" y1="168" x2="135" y2="161" stroke="#C8D0F5" strokeWidth="0.9" />
        <Line x1="22" y1="177" x2="135" y2="170" stroke="#C8D0F5" strokeWidth="0.9" />
        <Line x1="22" y1="186" x2="110" y2="180" stroke="#C8D0F5" strokeWidth="0.9" />

        {/* Parabola physics diagram */}
        <Path d="M 26 222 Q 82 158 138 222" stroke="#6C4DFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Path d="M 82 158 L 82 138" stroke="#6C4DFF" strokeWidth="1.2" strokeDasharray="3,2" strokeLinecap="round" />
        <Circle cx="26" cy="222" r="3" fill="#6C4DFF" />
        <Circle cx="82" cy="158" r="3" fill="#6C4DFF" />
        <Circle cx="138" cy="222" r="3" fill="#6C4DFF" />
        <SvgText x="22" y="156" fontSize="6.5" fill="#8B94B8" fontWeight="700">Projectile Motion</SvgText>

        {/* Book Right Page */}
        <Path
          d="M 148 228 L 148 134 Q 218 136 292 152 L 292 255 Q 220 230 148 228 Z"
          fill="url(#si_pageR)" stroke="#DDE1FF" strokeWidth="1"
        />
        <Line x1="157" y1="161" x2="278" y2="168" stroke="#C8D0F5" strokeWidth="0.9" />
        <Line x1="157" y1="170" x2="278" y2="177" stroke="#C8D0F5" strokeWidth="0.9" />
        <Line x1="157" y1="179" x2="278" y2="186" stroke="#C8D0F5" strokeWidth="0.9" />
        <Line x1="157" y1="188" x2="265" y2="195" stroke="#C8D0F5" strokeWidth="0.9" />

        {/* Spine */}
        <Path d="M 148 134 L 148 228" stroke="#BCC4EC" strokeWidth="3.5" />
      </Svg>

      {/* Floating 3D Phone & AR Scan Elements */}
      <AnimatedView style={[{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }, animatedPhoneStyle]}>
        <Svg width={width} height={height} viewBox="0 0 300 270">
          <Defs>
            <LinearGradient id="si_phone" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2B2B50" />
              <Stop offset="100%" stopColor="#141428" />
            </LinearGradient>
            <LinearGradient id="si_screen" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#181832" />
              <Stop offset="100%" stopColor="#0B0B1A" />
            </LinearGradient>
          </Defs>

          {/* Shadow under floating phone */}
          <Ellipse cx="150" cy="216" rx="55" ry="8" fill="#6C4DFF" fillOpacity="0.18" />

          {/* Phone body */}
          <Rect x="98" y="18" width="104" height="192" rx="18" fill="url(#si_phone)" />
          <Rect x="98" y="18" width="104" height="192" rx="18" fill="none" stroke="#484878" strokeWidth="1.5" />

          {/* Screen */}
          <Rect x="105" y="32" width="90" height="165" rx="12" fill="url(#si_screen)" />
          {/* Dynamic Notch */}
          <Rect x="132" y="37" width="36" height="9" rx="4.5" fill="#0B0B1A" />
          <Circle cx="152" cy="41.5" r="2.8" fill="#1F1F3D" />
          {/* Home indicator */}
          <Rect x="130" y="190" width="40" height="3.5" rx="1.75" fill="#30305E" />

          {/* AR Scan Frame (Dashed) */}
          <Rect
            x="116" y="56" width="68" height="100" rx="6"
            stroke="#6C4DFF" strokeWidth="1.8"
            fill="rgba(108,77,255,0.06)" strokeDasharray="6,4"
          />

          {/* Corner Brackets */}
          <Path d="M 116 72 L 116 56 L 132 56" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 168 56 L 184 56 L 184 72" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 116 140 L 116 156 L 132 156" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 168 156 L 184 156 L 184 140" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Scanned Diagram representation inside phone screen */}
          <Path d="M 124 135 Q 150 90 176 135" stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeDasharray="2,2" />
        </Svg>

        {/* Animated Scan Line overlay */}
        <AnimatedView style={[{ position: 'absolute', top: 58, left: 0, right: 0, alignItems: 'center' }, animatedScanLineStyle]}>
          <Svg width={width} height={30} viewBox="0 0 300 30">
            <Line x1="118" y1="15" x2="182" y2="15" stroke="#42D9FF" strokeWidth="2" strokeOpacity="0.9" />
            <Rect x="118" y="10" width="64" height="10" fill="#42D9FF" fillOpacity="0.15" rx="5" />
          </Svg>
        </AnimatedView>

        {/* Animated Target Circle */}
        <AnimatedView style={[{ position: 'absolute', top: 96, alignSelf: 'center' }, animatedTargetStyle]}>
          <Svg width={50} height={50} viewBox="0 0 50 50">
            <Circle cx="25" cy="25" r="18" stroke="#6C4DFF" strokeWidth="1.8" fill="rgba(108,77,255,0.12)" />
            <Circle cx="25" cy="25" r="7" fill="#6C4DFF" />
            <Circle cx="25" cy="25" r="3" fill="#FFFFFF" />
          </Svg>
        </AnimatedView>
      </AnimatedView>
    </View>
  );
};

export default ScanIllustration;
