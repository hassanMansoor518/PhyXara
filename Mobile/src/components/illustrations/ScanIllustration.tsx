import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle, Defs, Ellipse, Line, LinearGradient,
  Path, RadialGradient, Rect, Stop, Text as SvgText,
} from 'react-native-svg';

const AnimatedView = Animated.View;

// Design space. Everything below is authored in these units and scaled by `s`,
// so SVG art and animated overlays always stay perfectly aligned.
const W = 300;
const H = 270;

// AR scan frame (design units)
const FRAME = { x: 116, y: 56, w: 68, h: 100, r: 6 };
// Target sits on the apex of the scanned parabola
const TARGET = { cx: 150, cy: 112, size: 50 };

interface Props { width: number; height: number; }

/* ------------------------------------------------------------------ */
/* Small twinkling sparkle                                             */
/* ------------------------------------------------------------------ */
const Sparkle: React.FC<{
  x: number; y: number; size: number; delay: number; s: number; reduced: boolean;
}> = ({ x, y, size, delay, s, reduced }) => {
  const t = useSharedValue(reduced ? 0.7 : 0);

  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 900, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 700 })
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(t);
  }, [t, delay, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.5 + t.value * 0.6 }, { rotate: `${t.value * 45}deg` }],
  }));

  const px = size * s;
  return (
    <AnimatedView
      style={[{ position: 'absolute', left: (x - size / 2) * s, top: (y - size / 2) * s, width: px, height: px }, style]}
    >
      <Svg width={px} height={px} viewBox="0 0 10 10">
        <Path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#8F78FF" />
      </Svg>
    </AnimatedView>
  );
};

/* ------------------------------------------------------------------ */
/* Main illustration                                                   */
/* ------------------------------------------------------------------ */
export const ScanIllustration: React.FC<Props> = ({ width, height }) => {
  const reduced = useReducedMotion();

  const s = Math.min(width / W, height / H);
  const stageW = W * s;
  const stageH = H * s;

  const phoneFloat = useSharedValue(0); // design units, 0 → -7
  const scan = useSharedValue(reduced ? 1 : 0); // 0 → 1 sweep progress
  const pulse = useSharedValue(0); // 0 → 1 ripple progress

  useEffect(() => {
    if (reduced) {
      phoneFloat.value = 0;
      scan.value = 1;
      pulse.value = 0;
      return;
    }

    phoneFloat.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // One-way sweep, hold on the revealed diagram, then reset.
    scan.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );

    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );

    return () => {
      cancelAnimation(phoneFloat);
      cancelAnimation(scan);
      cancelAnimation(pulse);
    };
  }, [reduced, phoneFloat, scan, pulse]);

  /* ---------- animated styles ---------- */
  const phoneStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: phoneFloat.value * s }],
  }));

  // Shadow shrinks and fades as the phone rises
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(phoneFloat.value, [-7, 0], [0.55, 1]),
    transform: [{ scaleX: interpolate(phoneFloat.value, [-7, 0], [0.86, 1]) }],
  }));

  // Beam travels the full height of the frame
  const beamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scan.value, [0, 0.04, 0.96, 1], [0, 1, 1, 0]),
    transform: [{ translateY: (scan.value * (FRAME.h + 22) - 22) * s }],
  }));

  // Diagram is revealed behind the beam
  const revealStyle = useAnimatedStyle(() => ({
    height: scan.value * FRAME.h * s,
  }));

  const targetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scan.value, [0.35, 0.55], [0, 1], 'clamp'),
    transform: [{ scale: 1 + Math.sin(pulse.value * Math.PI * 2) * 0.06 }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.55, 0]) *
      interpolate(scan.value, [0.35, 0.55], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.7, 1.9]) }],
  }));

  const targetPx = TARGET.size * s;
  const targetBox = {
    position: 'absolute' as const,
    left: (TARGET.cx - TARGET.size / 2) * s,
    top: (TARGET.cy - TARGET.size / 2) * s,
    width: targetPx,
    height: targetPx,
  };

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="A phone scanning a physics textbook diagram of projectile motion"
      style={{ width, height, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ width: stageW, height: stageH }}>
        {/* ---------------- Layer 1: static background + book ---------------- */}
        <Svg width={stageW} height={stageH} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="si_bg" cx="50%" cy="55%" r="52%">
              <Stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
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
            <LinearGradient id="si_spine" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#6C4DFF" stopOpacity="0.0" />
              <Stop offset="50%" stopColor="#6C4DFF" stopOpacity="0.16" />
              <Stop offset="100%" stopColor="#6C4DFF" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          <Ellipse cx="150" cy="148" rx="138" ry="108" fill="url(#si_bg)" />
          <Ellipse cx="150" cy="258" rx="118" ry="9" fill="#6C4DFF" fillOpacity="0.15" />

          {/* Left page */}
          <Path
            d="M 8 255 L 8 152 Q 78 136 148 134 L 148 228 Q 80 230 8 255 Z"
            fill="url(#si_pageL)" stroke="#DDE1FF" strokeWidth="1"
          />
          <Line x1="22" y1="168" x2="135" y2="161" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />
          <Line x1="22" y1="177" x2="135" y2="170" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />
          <Line x1="22" y1="186" x2="110" y2="180" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />

          {/* Parabola physics diagram */}
          <Line x1="22" y1="222" x2="142" y2="222" stroke="#DDE1FF" strokeWidth="1" />
          <Path d="M 26 222 Q 82 158 138 222" stroke="#6C4DFF" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M 82 190 L 82 140" stroke="#6C4DFF" strokeWidth="1.2" strokeDasharray="3,2" strokeLinecap="round" />
          <Circle cx="26" cy="222" r="3" fill="#6C4DFF" />
          <Circle cx="82" cy="190" r="3" fill="#6C4DFF" />
          <Circle cx="138" cy="222" r="3" fill="#6C4DFF" />
          <SvgText x="22" y="153" fontSize="6.5" fill="#8B94B8" fontWeight="700">Projectile Motion</SvgText>

          {/* Right page */}
          <Path
            d="M 148 228 L 148 134 Q 218 136 292 152 L 292 255 Q 220 230 148 228 Z"
            fill="url(#si_pageR)" stroke="#DDE1FF" strokeWidth="1"
          />
          <Line x1="157" y1="161" x2="278" y2="168" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />
          <Line x1="157" y1="170" x2="278" y2="177" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />
          <Line x1="157" y1="179" x2="278" y2="186" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />
          <Line x1="157" y1="188" x2="265" y2="195" stroke="#C8D0F5" strokeWidth="0.9" strokeLinecap="round" />

          {/* Spine with soft gutter shadow */}
          <Rect x="136" y="134" width="24" height="94" fill="url(#si_spine)" />
          <Path d="M 148 134 L 148 228" stroke="#BCC4EC" strokeWidth="3.5" />
        </Svg>

        {/* ---------------- Layer 2: reactive phone shadow ---------------- */}
        <AnimatedView
          style={[{ position: 'absolute', left: 80 * s, top: 204 * s, width: 140 * s, height: 26 * s, pointerEvents: 'none' }, shadowStyle]}
        >
          <Svg width={140 * s} height={26 * s} viewBox="0 0 140 26">
            <Ellipse cx="72" cy="13" rx="68" ry="11" fill="#3F2A91" fillOpacity="0.14" />
            <Ellipse cx="70" cy="11" rx="50" ry="7" fill="#6C4DFF" fillOpacity="0.22" />
          </Svg>
        </AnimatedView>

        {/* ---------------- Layer 3: floating phone + AR overlays ---------------- */}
        <AnimatedView
          style={[{ position: 'absolute', left: 0, top: 0, width: stageW, height: stageH, pointerEvents: 'none' }, phoneStyle]}
        >
          <Svg width={stageW} height={stageH} viewBox={`0 0 ${W} ${H}`}>
            <Defs>
              <LinearGradient id="si_phone" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#35366A" />
                <Stop offset="35%" stopColor="#252544" />
                <Stop offset="100%" stopColor="#0B0B18" />
              </LinearGradient>
              <LinearGradient id="si_screen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#24244C" />
                <Stop offset="55%" stopColor="#16162E" />
                <Stop offset="100%" stopColor="#080812" />
              </LinearGradient>
              <LinearGradient id="si_metal" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#7778A2" />
                <Stop offset="12%" stopColor="#C4C5DC" />
                <Stop offset="28%" stopColor="#555676" />
                <Stop offset="72%" stopColor="#A8A9C4" />
                <Stop offset="100%" stopColor="#3E405F" />
              </LinearGradient>
              <LinearGradient id="si_glass" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <Stop offset="26%" stopColor="#A9B7FF" stopOpacity="0.08" />
                <Stop offset="58%" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="100%" stopColor="#7C70D6" stopOpacity="0.12" />
              </LinearGradient>
              <RadialGradient id="si_camera" cx="35%" cy="30%" r="70%">
                <Stop offset="0%" stopColor="#6D85B8" />
                <Stop offset="35%" stopColor="#17213A" />
                <Stop offset="72%" stopColor="#080A12" />
                <Stop offset="100%" stopColor="#02030A" />
              </RadialGradient>
              <RadialGradient id="si_screenGlow" cx="50%" cy="45%" r="55%">
                <Stop offset="0%" stopColor="#6C4DFF" stopOpacity="0.28" />
                <Stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Body */}
            <Rect x="94" y="14" width="112" height="198" rx="21" fill="#080A14" />
            <Rect x="96" y="16" width="108" height="194" rx="19" fill="url(#si_metal)" />
            <Rect x="99" y="19" width="102" height="188" rx="17" fill="url(#si_phone)" />
            <Rect x="102" y="22" width="96" height="182" rx="15" fill="none" stroke="#CFD0DE" strokeOpacity="0.42" strokeWidth="0.8" />

            {/* Screen */}
            <Rect x="105" y="29" width="90" height="168" rx="13" fill="url(#si_screen)" />
            <Rect x="105" y="29" width="90" height="168" rx="13" fill="url(#si_screenGlow)" />
            <Rect x="105" y="29" width="90" height="168" rx="13" fill="url(#si_glass)" />
            <Path d="M 111 32 L 189 32 L 189 85 C 160 58 135 45 111 42 Z" fill="#FFFFFF" fillOpacity="0.035" />

            {/* Dynamic island + camera */}
            <Rect x="128" y="34" width="44" height="11" rx="5.5" fill="#050611" />
            <Circle cx="163" cy="39.5" r="2.1" fill="url(#si_camera)" />
            <Circle cx="163" cy="39.5" r="0.8" fill="#7799CE" />

            {/* Status chip under the island */}
            <Rect x="127" y="168" width="46" height="14" rx="7" fill="#6C4DFF" fillOpacity="0.9" />
            <Circle cx="135" cy="175" r="2.2" fill="#42D9FF" />
            <Rect x="141" y="173.2" width="26" height="3.6" rx="1.8" fill="#FFFFFF" fillOpacity="0.85" />

            {/* Home indicator */}
            <Rect x="130" y="190" width="40" height="3.5" rx="1.75" fill="#30305E" />

            {/* Side buttons */}
            <Rect x="92" y="58" width="3" height="24" rx="1.5" fill="#777996" />
            <Rect x="92" y="88" width="3" height="38" rx="1.5" fill="#777996" />
            <Rect x="205" y="72" width="3" height="48" rx="1.5" fill="#777996" />

            {/* AR frame */}
            <Rect
              x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={FRAME.r}
              stroke="#6C4DFF" strokeWidth="1.6" strokeOpacity="0.75"
              fill="rgba(108,77,255,0.06)" strokeDasharray="6,4"
            />

            {/* Corner brackets */}
            <Path d="M 116 72 L 116 56 L 132 56" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M 168 56 L 184 56 L 184 72" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M 116 140 L 116 156 L 132 156" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M 168 156 L 184 156 L 184 140" stroke="#8F78FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>

          {/* Scan viewport: clips the revealed diagram and the beam to the frame */}
          <View
            style={{
              position: 'absolute',
              left: FRAME.x * s,
              top: FRAME.y * s,
              width: FRAME.w * s,
              height: FRAME.h * s,
              borderRadius: FRAME.r * s,
              overflow: 'hidden',
            }}
          >
            {/* Revealed diagram (grows downward with the beam) */}
            <AnimatedView style={[{ position: 'absolute', top: 0, left: 0, width: FRAME.w * s, overflow: 'hidden' }, revealStyle]}>
              <Svg width={FRAME.w * s} height={FRAME.h * s} viewBox={`0 0 ${FRAME.w} ${FRAME.h}`}>
                <Rect x="0" y="0" width={FRAME.w} height={FRAME.h} fill="#6C4DFF" fillOpacity="0.1" />
                {/* baseline */}
                <Line x1="6" y1="84" x2="62" y2="84" stroke="#A78BFA" strokeOpacity="0.5" strokeWidth="1" />
                {/* trajectory (frame coords = design − (116, 56)) */}
                <Path d="M 8 79 Q 34 34 60 79" stroke="#C4B5FD" strokeWidth="2" fill="none" strokeLinecap="round" />
                <Path d="M 34 79 L 34 58" stroke="#A78BFA" strokeWidth="1" strokeDasharray="2,2" strokeLinecap="round" />
                <Circle cx="8" cy="79" r="2.4" fill="#C4B5FD" />
                <Circle cx="60" cy="79" r="2.4" fill="#C4B5FD" />
                {/* caption lines */}
                <Rect x="8" y="8" width="34" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.55" />
                <Rect x="8" y="14" width="22" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.3" />
              </Svg>
            </AnimatedView>

            {/* Scan beam with fading trail */}
            <AnimatedView
              style={[{ position: 'absolute', top: 0, left: 0, width: FRAME.w * s, height: 22 * s }, beamStyle]}
            >
              <Svg width={FRAME.w * s} height={22 * s} viewBox={`0 0 ${FRAME.w} 22`}>
                <Defs>
                  <LinearGradient id="si_beam" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#42D9FF" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#42D9FF" stopOpacity="0.4" />
                  </LinearGradient>
                  <LinearGradient id="si_beamLine" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#42D9FF" stopOpacity="0" />
                    <Stop offset="20%" stopColor="#7FE8FF" stopOpacity="1" />
                    <Stop offset="80%" stopColor="#7FE8FF" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#42D9FF" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width={FRAME.w} height="21" fill="url(#si_beam)" />
                <Rect x="0" y="19.5" width={FRAME.w} height="2.5" fill="url(#si_beamLine)" />
              </Svg>
            </AnimatedView>
          </View>

          {/* Target: ripple + pulsing core (appears once the beam passes the apex) */}
          <AnimatedView style={[targetBox, rippleStyle, { pointerEvents: 'none' }]}>
            <Svg width={targetPx} height={targetPx} viewBox="0 0 50 50">
              <Circle cx="25" cy="25" r="18" stroke="#8F78FF" strokeWidth="1.4" fill="none" />
            </Svg>
          </AnimatedView>
          <AnimatedView style={[targetBox, targetStyle, { pointerEvents: 'none' }]}>
            <Svg width={targetPx} height={targetPx} viewBox="0 0 50 50">
              <Circle cx="25" cy="25" r="18" stroke="#8F78FF" strokeWidth="1.8" fill="rgba(108,77,255,0.14)" />
              <Circle cx="25" cy="25" r="7" fill="#6C4DFF" />
              <Circle cx="25" cy="25" r="3" fill="#FFFFFF" />
            </Svg>
          </AnimatedView>
        </AnimatedView>

        {/* ---------------- Layer 4: sparkles ---------------- */}
        <Sparkle x={70} y={60} size={12} delay={0} s={s} reduced={reduced} />
        <Sparkle x={236} y={92} size={9} delay={600} s={s} reduced={reduced} />
        <Sparkle x={228} y={36} size={7} delay={1200} s={s} reduced={reduced} />
        <Sparkle x={58} y={118} size={7} delay={1800} s={s} reduced={reduced} />
      </View>
    </View>
  );
};

export default ScanIllustration;