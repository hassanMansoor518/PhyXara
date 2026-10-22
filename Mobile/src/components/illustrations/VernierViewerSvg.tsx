import React from 'react';
import { View } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Circle,
  Polygon,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';

/**
 * Vernier caliper illustration (matches the reference diagram).
 * All drawing is done in the reference image's pixel space (1600 x 630)
 * and scaled by 0.5 into a 800 x 315 viewBox.
 *
 * NOTE: labels are small on narrow widths. Use width >= 340 (or showLabels={false}).
 */

const STROKE = '#3A3A3A';

// ---- Tick builders (single Path strings = fast to render) ----
const buildImperialTicks = () => {
  const groups: Record<number, string> = { 4: '', 6: '', 8: '', 11: '', 14: '' };
  const step = 89.5 / 16;
  for (let i = 0; i <= 215; i++) {
    const x = (193 + i * step).toFixed(2);
    let len = 4;
    if (i % 16 === 0) len = 14;
    else if (i % 8 === 0) len = 11;
    else if (i % 4 === 0) len = 8;
    else if (i % 2 === 0) len = 6;
    groups[len] += `M${x} 235 L${x} ${235 + len} `;
  }
  return groups;
};

const buildMetricTicks = () => {
  const groups: Record<number, string> = { 8: '', 12: '', 18: '' };
  for (let k = -11; k <= 143; k++) {
    const x = 239 + 3.84 * k;
    if (x > 790) break;
    let len = 8;
    if (k % 10 === 0) len = 18;
    else if (k % 5 === 0) len = 12;
    groups[len] += `M${x.toFixed(2)} 303 L${x.toFixed(2)} ${303 - len} `;
  }
  return groups;
};

const IMPERIAL = buildImperialTicks();
const METRIC = buildMetricTicks();

const VERNIER_NUM_X = [276, 308, 336, 364, 399, 433, 467, 500, 527, 558, 582];

const Arrow: React.FC<{ d: string; head: string }> = ({ d, head }) => (
  <>
    <Path d={d} stroke="#1F1F1F" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Polygon points={head} fill="#1F1F1F" />
  </>
);

const Label: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
  <SvgText x={x} y={y} fontSize={27} fontWeight="bold" fill="#1F1F1F" textAnchor="middle">
    {children}
  </SvgText>
);

export const VernierViewerSvg: React.FC<{
  width?: number;
  height?: number;
  rotationAngle?: number;
  showLabels?: boolean;
}> = ({ width = 340, height = 134, rotationAngle = 0, showLabels = true }) => {
  // Slider travel (reference-image pixels)
  const slidingOffset = Math.sin((rotationAngle * Math.PI) / 180) * 40;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 800 315" fill="none">
        <Defs>
          {/* Light brushed steel (beam face) */}
          <LinearGradient id="vcFace" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#E9EAEB" />
            <Stop offset="50%" stopColor="#CFD0D2" />
            <Stop offset="100%" stopColor="#B4B6B8" />
          </LinearGradient>
          {/* Dark steel (rails, housing) */}
          <LinearGradient id="vcDark" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#A5A7A9" />
            <Stop offset="50%" stopColor="#7A7C7F" />
            <Stop offset="100%" stopColor="#5A5C5F" />
          </LinearGradient>
          {/* Jaws */}
          <LinearGradient id="vcJaw" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#B2B4B6" />
            <Stop offset="55%" stopColor="#8A8C8F" />
            <Stop offset="100%" stopColor="#6E7073" />
          </LinearGradient>
          {/* Slider body */}
          <LinearGradient id="vcSlider" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D8D9DB" />
            <Stop offset="60%" stopColor="#B9BBBD" />
            <Stop offset="100%" stopColor="#8E9093" />
          </LinearGradient>
          {/* Locking screw knob */}
          <LinearGradient id="vcKnob" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#2A2A2A" />
            <Stop offset="45%" stopColor="#5A5A5A" />
            <Stop offset="100%" stopColor="#1A1A1A" />
          </LinearGradient>
          {/* Thumb wheel */}
          <RadialGradient id="vcWheel" cx="50%" cy="30%" r="80%">
            <Stop offset="0%" stopColor="#F2F2F2" />
            <Stop offset="60%" stopColor="#A9ABAD" />
            <Stop offset="100%" stopColor="#6A6C6F" />
          </RadialGradient>
        </Defs>

        <G transform="scale(0.5)">
          {/* ================= DEPTH MEASURING BLADE ================= */}
          <G transform={`translate(${slidingOffset * 0.5}, 0)`}>
            <Path
              d="M1440 255 L1530 255 L1530 263 L1556 263 L1556 286 L1440 286 Z"
              fill="url(#vcFace)"
              stroke={STROKE}
              strokeWidth={1.5}
            />
          </G>

          {/* ================= FIXED HEAD ================= */}
          {/* Fixed inside (top) jaw */}
          <Path
            d="M108 104 L126 100 Q155 130 160 190 L160 230 L120 230 L120 182 Q116 150 108 104 Z"
            fill="url(#vcJaw)"
            stroke={STROKE}
            strokeWidth={1.5}
          />
          {/* Fixed top block */}
          <Path
            d="M55 235 L55 202 Q55 197 60 197 L160 197 L160 235 Z"
            fill="url(#vcDark)"
            stroke={STROKE}
            strokeWidth={1.5}
          />
          {/* Fixed outside (bottom) jaw */}
          <Path
            d="M55 305 L168 305 L168 535 L128 535 L60 440 Z"
            fill="url(#vcJaw)"
            stroke={STROKE}
            strokeWidth={1.5}
          />

          {/* ================= MAIN BEAM ================= */}
          {/* Back rail (dark) */}
          <Rect x={630} y={218} width={840} height={98} fill="url(#vcDark)" stroke={STROKE} strokeWidth={1.5} />
          {/* Beam face */}
          <Rect x={55} y={235} width={1380} height={70} fill="url(#vcFace)" stroke={STROKE} strokeWidth={1.5} />
          {/* End cap */}
          <Rect x={1432} y={218} width={38} height={98} fill="url(#vcDark)" stroke={STROKE} strokeWidth={1.5} />
          <Circle cx={1453} cy={241} r={6} fill="#1B1B1B" />
          <Circle cx={1453} cy={295} r={6} fill="#1B1B1B" />

          {/* Imperial scale ticks (top edge) */}
          {Object.entries(IMPERIAL).map(([len, d]) => (
            <Path key={`imp-${len}`} d={d} stroke="#222" strokeWidth={Number(len) >= 11 ? 1.6 : 1} />
          ))}
          {/* Imperial numbers 0..12 */}
          {[...Array(13)].map((_, n) => (
            <SvgText
              key={`in-${n}`}
              x={193 + n * 89.5}
              y={266}
              fontSize={21}
              fill="#222"
              textAnchor="middle"
            >
              {String(n)}
            </SvgText>
          ))}
          <SvgText x={1325} y={270} fontSize={15} fill="#222" textAnchor="middle">
            in
          </SvgText>

          {/* Metric scale ticks (bottom edge) */}
          {Object.entries(METRIC).map(([len, d]) => (
            <Path key={`met-${len}`} d={d} stroke="#222" strokeWidth={Number(len) >= 12 ? 1.4 : 0.9} />
          ))}
          {/* Metric numbers 1..10 + cm */}
          {[...Array(10)].map((_, i) => (
            <SvgText
              key={`cm-${i}`}
              x={239 + 38.4 * (i + 1)}
              y={281}
              fontSize={11}
              fill="#222"
              textAnchor="middle"
            >
              {String(i + 1)}
            </SvgText>
          ))}
          <SvgText x={705} y={282} fontSize={14} fill="#222" textAnchor="middle">
            cm
          </SvgText>

          {/* ================= SLIDING JAW ASSEMBLY ================= */}
          <G transform={`translate(${slidingOffset}, 0)`}>
            {/* Sliding inside (top) jaw */}
            <Path
              d="M178 220 Q180 140 210 100 L225 103 L222 172 L250 178 L265 190 L265 220 Z"
              fill="url(#vcJaw)"
              stroke={STROKE}
              strokeWidth={1.5}
            />

            {/* Upper housing */}
            <Rect x={268} y={180} width={364} height={52} fill="url(#vcDark)" stroke={STROKE} strokeWidth={1.5} />
            <Rect x={268} y={205} width={364} height={25} fill="url(#vcSlider)" stroke={STROKE} strokeWidth={1} />
            <Circle cx={305} cy={193} r={5.5} fill="#1B1B1B" />
            <Circle cx={594} cy={193} r={5.5} fill="#1B1B1B" />

            {/* Locking screw (knurled knob) */}
            <Rect x={440} y={163} width={24} height={20} fill="url(#vcDark)" stroke={STROKE} strokeWidth={1} />
            <Rect x={428} y={130} width={47} height={38} rx={6} fill="url(#vcKnob)" stroke="#111" strokeWidth={1.5} />
            {[...Array(11)].map((_, i) => (
              <Line
                key={`k-${i}`}
                x1={433 + i * 4}
                y1={133}
                x2={433 + i * 4}
                y2={165}
                stroke="#0D0D0D"
                strokeWidth={1}
                opacity={0.7}
              />
            ))}

            {/* Lower slider body + sliding outside jaw */}
            <Path
              d="M258 345 L258 532 L300 532 L318 480 L365 358 L362 345 Z"
              fill="url(#vcJaw)"
              stroke={STROKE}
              strokeWidth={1.5}
            />
            <Rect x={262} y={300} width={370} height={46} fill="url(#vcSlider)" stroke={STROKE} strokeWidth={1.5} />
            <Rect x={263} y={336} width={368} height={9} fill="url(#vcDark)" />

            {/* Thumb wheel */}
            <Path
              d="M527 345 A38 32 0 0 0 603 345 Z"
              fill="url(#vcWheel)"
              stroke={STROKE}
              strokeWidth={1.5}
            />

            {/* Vernier scale */}
            {VERNIER_NUM_X.map((x, i) => (
              <SvgText key={`vn-${i}`} x={x} y={317} fontSize={10.5} fill="#111" textAnchor="middle">
                {String(i)}
              </SvgText>
            ))}
            {VERNIER_NUM_X.map((x, i) => (
              <Line
                key={`vt-${i}`}
                x1={x}
                y1={322}
                x2={x}
                y2={336}
                stroke="#111"
                strokeWidth={i === 0 ? 1.8 : 1.1}
              />
            ))}
            {VERNIER_NUM_X.slice(0, -1).map((x, i) => {
              const mid = (x + VERNIER_NUM_X[i + 1]) / 2;
              return <Line key={`vm-${i}`} x1={mid} y1={322} x2={mid} y2={330} stroke="#111" strokeWidth={0.8} />;
            })}
            <Circle cx={298} cy={332} r={5} fill="#1B1B1B" />
            <Circle cx={600} cy={332} r={5} fill="#1B1B1B" />
          </G>

          {/* ================= LABELS ================= */}
          {showLabels && (
            <G>
              <Label x={165} y={40}>INTERNAL</Label>
              <Label x={165} y={72}>JAWS</Label>
              <Arrow d="M118 58 Q68 62 86 136" head="88,144 78,126 98,129" />
              <Arrow d="M212 58 Q268 62 240 128" head="236,138 244,120 258,132" />

              <Label x={648} y={82}>LOCKING</Label>
              <Label x={648} y={114}>SCREW</Label>
              <Arrow d="M588 118 Q535 140 486 140" head="480,141 497,126 503,141" />

              <Label x={985} y={160}>IMPERIAL SCALE</Label>
              <Arrow d="M860 152 Q835 205 792 218" head="788,220 792,200 806,210" />

              <Label x={910} y={388}>METRIC SCALE</Label>
              <Arrow d="M800 378 Q760 355 742 314" head="738,308 740,330 756,322" />

              <Label x={1453} y={425}>DEPTH MEASURING</Label>
              <Label x={1453} y={457}>BLADE</Label>
              <Arrow d="M1466 392 Q1486 342 1508 302" head="1508,294 1494,314 1514,312" />

              <Label x={220} y={586}>EXTERNAL</Label>
              <Label x={220} y={618}>JAWS</Label>
              <Arrow d="M208 552 Q200 505 176 470" head="172,464 176,486 192,478" />
              <Arrow d="M226 552 Q236 505 255 476" head="258,470 240,484 257,492" />
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
};

export default VernierViewerSvg;