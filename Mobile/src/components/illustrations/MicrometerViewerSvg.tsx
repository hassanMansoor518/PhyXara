import React, { useRef, useState, useMemo } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  ClipPath,
  Text as SvgText,
} from 'react-native-svg';

const MAX_ANGLE = 720;   // 2 poore chakkar = full spindle travel
const MAX_MOVE = 45;     // spindle ki max movement (SVG units)
// Drag sensitivity ab width se nikalta hai: component ki 70% width drag = poora open/close
const DRAG_FRACTION = 0.7;

export const MicrometerViewerSvg = ({
  width = 290,
  height = 112,
  initialAngle = 0,
  onAngleChange,
}) => {
  const [angle, setAngle] = useState(initialAngle);
  const startAngle = useRef(initialAngle);
  const angleRef = useRef(initialAngle);
  const onChangeRef = useRef(onAngleChange);
  onChangeRef.current = onAngleChange;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startAngle.current = angleRef.current;
        },
        onPanResponderMove: (_, g) => {
          const next = startAngle.current + g.dx * (MAX_ANGLE / (width * DRAG_FRACTION));
          const clamped = Math.max(0, Math.min(MAX_ANGLE, next));
          angleRef.current = clamped;
          setAngle(clamped);
          if (onChangeRef.current) onChangeRef.current(clamped);
        },
      }),
    [width]
  );

  // Spindle + thimble linear movement
  const move = (angle / MAX_ANGLE) * MAX_MOVE;

  // Thimble reading (0-49)
  const reading = Math.floor(angle / 7.2) % 50;
  const wrap = (n) => ((n % 50) + 50) % 50;
  const base = 20 + reading;
  const nums = [wrap(base + 5), wrap(base), wrap(base - 5), wrap(base - 10)];

  // Knurl lines scroll as you drag (period = 5 units, so it loops seamlessly)
  const knurlShift = (angle * 0.35) % 5;

  const knurlX0 = 355;
  const knurlX1 = 435;
  const knurlTop = 12;
  const knurlBot = 62;

  const hatchA = [];
  const hatchB = [];
  for (let i = -60; i < 140; i += 5) {
    hatchA.push(
      <Line
        key={`a${i}`}
        x1={knurlX0 + i}
        y1={knurlTop}
        x2={knurlX0 + i + 50}
        y2={knurlBot}
        stroke="#7C8186"
        strokeWidth="0.7"
      />
    );
    hatchB.push(
      <Line
        key={`b${i}`}
        x1={knurlX0 + i + 50}
        y1={knurlTop}
        x2={knurlX0 + i}
        y2={knurlBot}
        stroke="#7C8186"
        strokeWidth="0.7"
      />
    );
  }

  // Ratchet knob ridges
  const ridges = [];
  for (let x = 441; x < 494; x += 4) {
    ridges.push(
      <Line key={`r${x}`} x1={x} y1={20} x2={x} y2={54} stroke="#8A8F94" strokeWidth="0.9" />
    );
  }

  // Thimble ticks
  const ticks = [];
  for (let y = 12; y <= 62; y += 4) {
    ticks.push(
      <Line
        key={`t${y}`}
        x1={267}
        y1={y}
        x2={y % 8 === 0 ? 277 : 272}
        y2={y}
        stroke="#3B3F44"
        strokeWidth="0.8"
      />
    );
  }

  // Fixed sleeve ticks along datum line
  const sleeveTicks = [];
  for (let x = 252, i = 0; x <= 328; x += 8, i++) {
    sleeveTicks.push(
      <Line key={`s${x}`} x1={x} y1={36} x2={x} y2={i % 2 === 0 ? 28 : 31} stroke="#2F3338" strokeWidth="0.9" />
    );
  }

  return (
    <View
      collapsable={false}
      style={{ width, height, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg
        width={width}
        height={height}
        viewBox="0 0 545 210"
        fill="none"
        pointerEvents="none"
      >
        <Defs>
          {/* Frame: matte silver */}
          <LinearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E3E5E7" />
            <Stop offset="45%" stopColor="#C9CCCF" />
            <Stop offset="100%" stopColor="#A9ADB1" />
          </LinearGradient>

          {/* Cylinders (anvil, spindle, end block) */}
          <LinearGradient id="cylGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#6F7378" />
            <Stop offset="18%" stopColor="#E9EBED" />
            <Stop offset="40%" stopColor="#F8F9FA" />
            <Stop offset="75%" stopColor="#BFC3C7" />
            <Stop offset="100%" stopColor="#7E8388" />
          </LinearGradient>

          {/* Sleeve / barrel */}
          <LinearGradient id="sleeveGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#8D9196" />
            <Stop offset="20%" stopColor="#E4E6E8" />
            <Stop offset="50%" stopColor="#F3F4F5" />
            <Stop offset="85%" stopColor="#B4B8BC" />
            <Stop offset="100%" stopColor="#7A7E83" />
          </LinearGradient>

          {/* Knurled grip */}
          <LinearGradient id="knurlGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#8E9297" />
            <Stop offset="30%" stopColor="#D5D8DA" />
            <Stop offset="60%" stopColor="#C3C6C9" />
            <Stop offset="100%" stopColor="#7C8085" />
          </LinearGradient>

          <RadialGradient id="shadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0" />
          </RadialGradient>

          <ClipPath id="knurlClip">
            <Rect
              x={knurlX0}
              y={knurlTop}
              width={knurlX1 - knurlX0}
              height={knurlBot - knurlTop}
            />
          </ClipPath>
        </Defs>

        {/* Ground shadow */}
        <Path
          d="M 20 200 C 60 190, 330 190, 380 200 C 330 212, 60 212, 20 200 Z"
          fill="url(#shadow)"
        />

        {/* C-Frame */}
        <Path
          d="M 5 85 A 120 120 0 0 0 245 85 L 245 65 L 202 65 A 77 77 0 0 1 48 65 L 5 65 Z"
          fill="url(#frameGrad)"
          stroke="#8C9094"
          strokeWidth="1.2"
        />
        <SvgText x="125" y="165" fill="#2F3338" fontSize="17" fontWeight="bold" textAnchor="middle">
          0-25mm
        </SvgText>
        <SvgText x="125" y="186" fill="#2F3338" fontSize="15" fontWeight="bold" textAnchor="middle">
          0·01
        </SvgText>

        {/* Anvil (fixed) */}
        <Rect x="5" y="22" width="64" height="46" rx="7" fill="url(#cylGrad)" stroke="#6B6F74" strokeWidth="1.2" />
        <Line x1="69" y1="24" x2="69" y2="66" stroke="#5A5E63" strokeWidth="1.2" />

        {/* Spindle (fixed length, moves with thimble, hides inside end block) */}
        <Rect
          x={70 + move}
          y="27"
          width="130"
          height="21"
          fill="url(#cylGrad)"
          stroke="#6B6F74"
          strokeWidth="1"
        />

        {/* Frame end block (fixed) */}
        <Rect x="195" y="8" width="52" height="58" rx="4" fill="url(#cylGrad)" stroke="#6B6F74" strokeWidth="1.2" />

        {/* Sleeve / barrel (fixed) with datum line + linear ticks */}
        <Rect x="247" y="12" width="85" height="48" rx="2" fill="url(#sleeveGrad)" stroke="#6B6F74" strokeWidth="1.2" />
        <Line x1="247" y1="36" x2="332" y2="36" stroke="#2F3338" strokeWidth="1" />
        {sleeveTicks}

        {/* Thimble + knurl + ratchet (all move together with spindle) */}
        <G transform={`translate(${move}, 0)`}>
          <Rect x="262" y="8" width="93" height="56" rx="3" fill="url(#sleeveGrad)" stroke="#6B6F74" strokeWidth="1.2" />
          <Path d="M 270 8 L 265 36 L 270 64" stroke="#6B6F74" strokeWidth="1" fill="none" />

          {ticks}

          {/* Scale numbers (change while dragging) */}
          <SvgText x="308" y="19" fill="#2F3338" fontSize="10" fontWeight="bold" textAnchor="middle">{nums[0]}</SvgText>
          <SvgText x="308" y="35" fill="#2F3338" fontSize="10" fontWeight="bold" textAnchor="middle">{nums[1]}</SvgText>
          <SvgText x="308" y="51" fill="#2F3338" fontSize="10" fontWeight="bold" textAnchor="middle">{nums[2]}</SvgText>
          <SvgText x="308" y="64" fill="#2F3338" fontSize="10" fontWeight="bold" textAnchor="middle">{nums[3]}</SvgText>

          {/* Knurled grip */}
          <Rect
            x={knurlX0}
            y={knurlTop - 4}
            width={knurlX1 - knurlX0}
            height={knurlBot - knurlTop + 8}
            rx="2"
            fill="url(#knurlGrad)"
            stroke="#6B6F74"
            strokeWidth="1.2"
          />
          <G clipPath="url(#knurlClip)">
            <G transform={`translate(${knurlShift}, 0)`}>
              {hatchA}
              {hatchB}
            </G>
          </G>

          {/* Ratchet knob */}
          <Rect x="435" y="18" width="60" height="38" rx="4" fill="url(#knurlGrad)" stroke="#6B6F74" strokeWidth="1.2" />
          {ridges}
        </G>
      </Svg>

      {/* Transparent drag layer on top of the Svg */}
      <View
        collapsable={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          backgroundColor: 'transparent',
          userSelect: 'none',  // web only, native par ignore hota hai
          touchAction: 'none', // web only
        }}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

export default MicrometerViewerSvg;