import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { G, Path, Polygon, Text as SvgText } from 'react-native-svg';

/**
 * Solid 3D vernier caliper drawn with react-native-svg only (no GL, no model file).
 *
 * The caliper is built from real solids (boxes, extruded jaws, cylinders), rotated in 3D,
 * perspective-projected, depth-sorted and shaded every render. It therefore has thickness
 * and never collapses into a flat sheet when turned.
 *
 * IMPORTANT: remove any rotateX / rotateY / perspective transform your viewer puts on the
 * wrapper around this component. Rotate through the props below instead.
 *
 * Props
 *  width, height     size on screen
 *  yaw, pitch        extra rotation in degrees (yaw = left/right, pitch = up/down)
 *  rotationAngle     legacy prop, treated as extra yaw
 *  slide             jaw opening in model px, -18 (closed) .. 520 (open)
 *  baseYaw/basePitch resting angle. Reset View returns here.
 *  interactive       true = this component handles one-finger drag + double-tap reset itself
 *  showLabels        part labels, shown only while the caliper faces the camera
 */

// ---------------------------------------------------------------- types
type V3 = [number, number, number];
type RGB = [number, number, number];

interface Face {
  p: V3[];
  n: V3;
  c: RGB;
  metal: number;
}
interface Decal {
  s: number[]; // flat X1,Y1,X2,Y2 ... in model space
  z: number;
  cen: V3;
}
interface Solids {
  faces: Face[];
  decals: Decal[];
}
interface Chunk {
  xa: number; // image-space x range of this chunk on the front face
  xb: number;
  cen: V3;
}

// ---------------------------------------------------------------- constants
const OX = 805; // image-space centre of the drawing
const OY = 318;
const FOCAL = 3200;
const INK = '#14161a';

const STEEL: RGB = [206, 209, 214];
const DARK: RGB = [128, 132, 138];
const BLACK: RGB = [38, 40, 43];
const BLACK2: RGB = [24, 25, 27];

// ---------------------------------------------------------------- stroke font for engraved numbers
const GLYPHS: Record<string, number[][][]> = {
  '0': [[[.1, 0], [.5, 0], [.6, .1], [.6, .9], [.5, 1], [.1, 1], [0, .9], [0, .1], [.1, 0]]],
  '1': [[[.1, .8], [.3, 1], [.3, 0]]],
  '2': [[[0, .85], [.1, 1], [.5, 1], [.6, .85], [.6, .65], [0, 0], [.6, 0]]],
  '3': [[[0, .9], [.1, 1], [.5, 1], [.6, .9], [.6, .6], [.5, .5], [.2, .5]], [[.5, .5], [.6, .4], [.6, .1], [.5, 0], [.1, 0], [0, .1]]],
  '4': [[[.45, 0], [.45, 1], [0, .3], [.6, .3]]],
  '5': [[[.55, 1], [.05, 1], [0, .55], [.4, .6], [.55, .5], [.6, .35], [.6, .15], [.5, 0], [.1, 0], [0, .1]]],
  '6': [[[.55, .95], [.4, 1], [.15, 1], [0, .8], [0, .15], [.1, 0], [.5, 0], [.6, .15], [.6, .4], [.5, .55], [.1, .55], [0, .4]]],
  '7': [[[0, 1], [.6, 1], [.2, 0]]],
  '8': [[[.1, .5], [0, .65], [0, .9], [.1, 1], [.5, 1], [.6, .9], [.6, .65], [.5, .5], [.1, .5], [0, .35], [0, .1], [.1, 0], [.5, 0], [.6, .1], [.6, .35], [.5, .5]]],
  '9': [[[.05, .05], [.2, 0], [.45, 0], [.6, .2], [.6, .85], [.5, 1], [.1, 1], [0, .85], [0, .6], [.1, .45], [.5, .45], [.6, .6]]],
  i: [[[.05, 0], [.05, .55]], [[.05, .75], [.05, .8]]],
  n: [[[0, 0], [0, .55]], [[0, .45], [.1, .55], [.4, .55], [.5, .45], [.5, 0]]],
  c: [[[.5, .45], [.4, .55], [.1, .55], [0, .45], [0, .1], [.1, 0], [.4, 0], [.5, .1]]],
  m: [[[0, 0], [0, .55]], [[0, .45], [.1, .55], [.3, .55], [.4, .45], [.4, 0]], [[.4, .45], [.5, .55], [.7, .55], [.8, .45], [.8, 0]]],
};
const GW: Record<string, number> = { i: 0.1, n: 0.5, c: 0.5, m: 0.8 };
const gw = (ch: string) => GW[ch] ?? 0.6;

/** engraved text as image-space segments [x1,y1,x2,y2,...] (y down) */
function textSegs(str: string, cx: number, base: number, size: number): number[] {
  const gap = 0.28;
  const total = [...str].reduce((a, ch) => a + gw(ch) + gap, -gap) * size;
  let x0 = cx - total / 2;
  const out: number[] = [];
  for (const ch of str) {
    for (const stroke of GLYPHS[ch]) {
      for (let i = 0; i < stroke.length - 1; i++) {
        out.push(
          x0 + stroke[i][0] * size, base - stroke[i][1] * size,
          x0 + stroke[i + 1][0] * size, base - stroke[i + 1][1] * size,
        );
      }
    }
    x0 += (gw(ch) + gap) * size;
  }
  return out;
}

// ---------------------------------------------------------------- solid builders (image coords in, model coords out)
const mx = (x: number, dx: number) => x - OX + dx;
const my = (y: number) => OY - y;

function addBox(
  S: Solids, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number,
  c: RGB, metal: number, dx = 0, maxChunk = 150,
): Chunk[] {
  const X0 = mx(x0, dx), X1 = mx(x1, dx), Ya = my(y1), Yb = my(y0);
  const n = Math.max(1, Math.ceil((X1 - X0) / maxChunk));
  const chunks: Chunk[] = [];
  for (let i = 0; i < n; i++) {
    const xa = X0 + ((X1 - X0) * i) / n, xb = X0 + ((X1 - X0) * (i + 1)) / n;
    S.faces.push({ p: [[xa, Ya, z1], [xb, Ya, z1], [xb, Yb, z1], [xa, Yb, z1]], n: [0, 0, 1], c, metal });
    S.faces.push({ p: [[xa, Ya, z0], [xb, Ya, z0], [xb, Yb, z0], [xa, Yb, z0]], n: [0, 0, -1], c, metal });
    S.faces.push({ p: [[xa, Yb, z0], [xb, Yb, z0], [xb, Yb, z1], [xa, Yb, z1]], n: [0, 1, 0], c, metal });
    S.faces.push({ p: [[xa, Ya, z0], [xb, Ya, z0], [xb, Ya, z1], [xa, Ya, z1]], n: [0, -1, 0], c, metal });
    chunks.push({ xa: x0 + ((x1 - x0) * i) / n, xb: x0 + ((x1 - x0) * (i + 1)) / n, cen: [(xa + xb) / 2, (Ya + Yb) / 2, z1] });
  }
  S.faces.push({ p: [[X0, Ya, z0], [X0, Ya, z1], [X0, Yb, z1], [X0, Yb, z0]], n: [-1, 0, 0], c, metal });
  S.faces.push({ p: [[X1, Ya, z0], [X1, Ya, z1], [X1, Yb, z1], [X1, Yb, z0]], n: [1, 0, 0], c, metal });
  return chunks;
}

function addPrism(S: Solids, pts: number[][], z0: number, z1: number, c: RGB, metal: number, dx = 0) {
  let P = pts.map(([x, y]) => [mx(x, dx), my(y)]);
  let area = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  if (area < 0) P = P.reverse(); // make CCW so (dy,-dx) points outward
  S.faces.push({ p: P.map(([x, y]) => [x, y, z1] as V3), n: [0, 0, 1], c, metal });
  S.faces.push({ p: P.map(([x, y]) => [x, y, z0] as V3), n: [0, 0, -1], c, metal });
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    const ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1;
    S.faces.push({
      p: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]],
      n: [ey / l, -ex / l, 0], c, metal,
    });
  }
}

/** cylinder with axis along Z */
function addCylZ(
  S: Solids, cx: number, cy: number, r: number, z0: number, z1: number,
  c: RGB, metal: number, dx = 0, seg = 20,
) {
  const X = mx(cx, dx), Y = my(cy);
  const ring: number[][] = [];
  for (let i = 0; i < seg; i++) ring.push([X + r * Math.cos((i / seg) * Math.PI * 2), Y + r * Math.sin((i / seg) * Math.PI * 2)]);
  S.faces.push({ p: ring.map(([x, y]) => [x, y, z1] as V3), n: [0, 0, 1], c, metal });
  S.faces.push({ p: ring.map(([x, y]) => [x, y, z0] as V3), n: [0, 0, -1], c, metal });
  for (let i = 0; i < seg; i++) {
    const a = ring[i], b = ring[(i + 1) % seg];
    const am = ((i + 0.5) / seg) * Math.PI * 2;
    S.faces.push({ p: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], n: [Math.cos(am), Math.sin(am), 0], c, metal });
  }
}

/** cylinder with axis along Y (image y from yTop to yBottom), optional alternating shade for knurling */
function addCylY(
  S: Solids, cx: number, yTop: number, yBottom: number, r: number,
  c: RGB, c2: RGB | null, metal: number, dx = 0, seg = 24, zk = 1,
) {
  // zk = thickness multiplier applied later to every z; dividing here keeps the cylinder round
  const X = mx(cx, dx), Yt = my(yTop), Yb = my(yBottom);
  const ring: number[][] = [];
  for (let i = 0; i < seg; i++) ring.push([X + r * Math.cos((i / seg) * Math.PI * 2), (r * Math.sin((i / seg) * Math.PI * 2)) / zk]);
  S.faces.push({ p: ring.map(([x, z]) => [x, Yt, z] as V3), n: [0, 1, 0], c, metal });
  S.faces.push({ p: ring.map(([x, z]) => [x, Yb, z] as V3), n: [0, -1, 0], c, metal });
  for (let i = 0; i < seg; i++) {
    const a = ring[i], b = ring[(i + 1) % seg];
    const am = ((i + 0.5) / seg) * Math.PI * 2;
    S.faces.push({
      p: [[a[0], Yb, a[1]], [b[0], Yb, b[1]], [b[0], Yt, b[1]], [a[0], Yt, a[1]]],
      n: [Math.cos(am), 0, Math.sin(am)], c: c2 && i % 2 ? c2 : c, metal,
    });
  }
}

/** quadratic-curve outline helper: M/L/Q path -> sampled points (image coords) */
function outline(d: string, steps = 6): number[][] {
  const t = d.match(/[MLQZ]|-?[\d.]+/g) as string[];
  const pts: number[][] = [];
  let i = 0, cx = 0, cy = 0;
  while (i < t.length) {
    const k = t[i++];
    if (k === 'M' || k === 'L') { cx = +t[i]; cy = +t[i + 1]; i += 2; pts.push([cx, cy]); }
    else if (k === 'Q') {
      const qx = +t[i], qy = +t[i + 1], ex = +t[i + 2], ey = +t[i + 3]; i += 4;
      for (let s = 1; s <= steps; s++) {
        const u = s / steps, v = 1 - u;
        pts.push([v * v * cx + 2 * v * u * qx + u * u * ex, v * v * cy + 2 * v * u * qy + u * u * ey]);
      }
      cx = ex; cy = ey;
    }
  }
  return pts;
}

/** attach image-space segments to the front-face chunk they sit on */
function addDecals(S: Solids, chunks: Chunk[], z: number, segs: number[], dx: number) {
  const buckets: number[][] = chunks.map(() => []);
  for (let i = 0; i < segs.length; i += 4) {
    const xm = (segs[i] + segs[i + 2]) / 2;
    let k = chunks.findIndex((ch) => xm >= ch.xa && xm < ch.xb);
    if (k < 0) k = xm < chunks[0].xa ? 0 : chunks.length - 1;
    buckets[k].push(mx(segs[i], dx), my(segs[i + 1]), mx(segs[i + 2], dx), my(segs[i + 3]));
  }
  buckets.forEach((s, k) => s.length && S.decals.push({ s, z, cen: chunks[k].cen }));
}

// ---------------------------------------------------------------- the caliper itself
function buildFixed(): Solids {
  const S: Solids = { faces: [], decals: [] };
  const FZ = 12;

  // beam face (chunked so depth sorting stays correct at steep angles)
  const face = addBox(S, 55, 1435, 235, 305, -FZ, FZ, STEEL, 0.55, 0, 120);
  // rear rail: two strips above and below the beam face (never overlaps the face on screen)
  addBox(S, 630, 1470, 218, 235, -8, 8, DARK, 0.5, 0, 120);
  addBox(S, 630, 1470, 305, 316, -8, 8, DARK, 0.5, 0, 120);
  addBox(S, 1432, 1470, 218, 316, -14, 14, DARK, 0.5, 0, 200); // end cap
  addCylZ(S, 1453, 241, 6, 13.8, 15.8, BLACK, 0.3, 0, 10);
  addCylZ(S, 1453, 295, 6, 13.8, 15.8, BLACK, 0.3, 0, 10);
  addBox(S, 55, 160, 197, 235, -FZ, FZ, DARK, 0.5, 0, 200); // fixed head block
  addPrism(S, outline('M108 104 L126 100 Q155 130 160 190 L160 230 L120 230 L120 182 Q116 150 108 104'), -11, 11, STEEL, 0.55); // fixed inside jaw
  addPrism(S, [[55, 305], [168, 305], [168, 535], [128, 535], [60, 440]], -FZ, FZ, STEEL, 0.55); // fixed outside jaw

  // imperial scale (top edge)
  const stepIn = 89.5 / 16;
  const imp: number[] = [];
  for (let i = 0; i <= 215; i++) {
    let len = 4;
    if (i % 16 === 0) len = 14; else if (i % 8 === 0) len = 11; else if (i % 4 === 0) len = 8; else if (i % 2 === 0) len = 6;
    const x = 193 + i * stepIn;
    imp.push(x, 235, x, 235 + len);
  }
  for (let n = 0; n <= 12; n++) imp.push(...textSegs(String(n), 193 + n * 89.5, 266, 15));
  imp.push(...textSegs('in', 1325, 270, 11));
  addDecals(S, face, FZ, imp, 0);

  // metric scale (bottom edge)
  const met: number[] = [];
  for (let k = -11; k <= 143; k++) {
    const x = 239 + 3.84 * k;
    if (x > 790) break;
    let len = 8;
    if (k % 10 === 0) len = 18; else if (k % 5 === 0) len = 12;
    met.push(x, 303, x, 303 - len);
  }
  for (let i = 1; i <= 10; i++) met.push(...textSegs(String(i), 239 + 38.4 * i, 281, 8));
  met.push(...textSegs('cm', 705, 282, 10));
  addDecals(S, face, FZ, met, 0);
  return S;
}

function buildSlider(dx: number, T: number): Solids {
  const S: Solids = { faces: [], decals: [] };
  addPrism(S, outline('M178 220 Q180 140 210 100 L225 103 L222 172 L250 178 L265 190 L265 220'), -11, 11, STEEL, 0.55, dx); // inside jaw
  addBox(S, 268, 632, 180, 232, -23, 23, DARK, 0.5, dx, 130); // upper housing
  addBox(S, 268, 632, 205, 230, -20, 24, STEEL, 0.55, dx, 130); // front strip
  addBox(S, 262, 272, 232, 300, -23, 23, DARK, 0.5, dx, 200); // window posts
  addBox(S, 622, 632, 232, 300, -23, 23, DARK, 0.5, dx, 200);
  const body = addBox(S, 262, 632, 300, 346, -23, 23, STEEL, 0.55, dx, 130); // vernier body
  addPrism(S, [[258, 345], [258, 532], [300, 532], [318, 480], [365, 358], [362, 345]], -12, 12, STEEL, 0.55, dx); // outside jaw
  addCylY(S, 452, 162, 184, 11, DARK, null, 0.5, dx, 14, T); // locking screw stem
  addCylY(S, 452, 130, 168, 23.5, BLACK, BLACK2, 0.3, dx, 24, T); // knurled knob
  addCylZ(S, 565, 340, 36, -9, 9, STEEL, 0.6, dx, 32); // thumb wheel
  for (const [sx, sy] of [[305, 193], [594, 193], [298, 336], [600, 336]]) addCylZ(S, sx, sy, 5.5, 22.8, 25, BLACK, 0.3, dx, 10);

  // vernier scale
  const VX = [276, 308, 336, 364, 399, 433, 467, 500, 527, 558, 582];
  const v: number[] = [];
  VX.forEach((x, i) => {
    v.push(x, 322, x, 336);
    v.push(...textSegs(String(i), x, 317, 7));
    if (i < VX.length - 1) { const m = (x + VX[i + 1]) / 2; v.push(m, 322, m, 330); }
  });
  addDecals(S, body, 23, v, dx);

  // depth blade: only the part that sticks out of the end cap is visible
  addBox(S, 1440, 1530 + dx, 255, 286, -3, 3, STEEL, 0.55, 0, 400);
  addBox(S, 1530 + dx, 1556 + dx, 263, 286, -3, 3, STEEL, 0.55, 0, 400);
  return S;
}

// ---------------------------------------------------------------- labels (2D overlay, fades out as the model turns)
const Arrow: React.FC<{ d: string; head: string }> = ({ d, head }) => (
  <>
    <Path d={d} stroke="#9FB4C8" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Polygon points={head} fill="#9FB4C8" />
  </>
);
const Label: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
  <SvgText x={x} y={y} fontSize={27} fontWeight="bold" fill="#D5E2EE" textAnchor="middle">{children}</SvgText>
);
const Labels: React.FC = () => (
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
);

// ---------------------------------------------------------------- rendering
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const LIGHT: V3 = (() => { const l = Math.hypot(-0.45, 0.65, 0.62); return [-0.45 / l, 0.65 / l, 0.62 / l]; })();
const FILL: V3 = (() => { const l = Math.hypot(0.7, -0.1, 0.45); return [0.7 / l, -0.1 / l, 0.45 / l]; })();
const HALF: V3 = (() => { const x = LIGHT[0], y = LIGHT[1], z = LIGHT[2] + 1; const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; })();

interface Item {
  depth: number;
  pts?: number[]; // projected polygon, x,y pairs, y up, unit scale
  fill?: string;
  seg?: number[]; // projected line segments, x1,y1,x2,y2 ..., y up, unit scale
  sw?: number;
}

export interface VernierViewerSvgProps {
  width?: number;
  height?: number;
  yaw?: number;
  pitch?: number;
  rotationAngle?: number;
  slide?: number;
  baseYaw?: number;
  basePitch?: number;
  interactive?: boolean;
  showLabels?: boolean;
  /** depth multiplier: 1 = drawing proportions, 2.4 (default) = chunky, reads as solid from every angle */
  thickness?: number;
  /** re-fit the model to the view at every angle so it never shrinks to a sliver (default true) */
  autoFit?: boolean;
}

export const VernierViewerSvg: React.FC<VernierViewerSvgProps> = ({
  width = 340,
  height = 200,
  yaw,
  pitch = 0,
  rotationAngle = 0,
  slide = 0,
  baseYaw = -24,
  basePitch = 10,
  interactive = false,
  showLabels = false,
  thickness = 2.4,
  autoFit = true,
}) => {
  const T = clamp(thickness, 0.5, 6); // multiplies the depth of every part
  // ----- optional built-in drag (one finger), inertia, double-tap reset
  const [drag, setDrag] = useState({ yaw: 0, pitch: 0 });
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const start = useRef({ yaw: 0, pitch: 0 });
  const lastTap = useRef(0);
  const raf = useRef<number | null>(null);
  const stopInertia = () => { if (raf.current != null) cancelAnimationFrame(raf.current); raf.current = null; };
  useEffect(() => stopInertia, []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => interactive,
        onMoveShouldSetPanResponder: () => interactive,
        onPanResponderGrant: () => {
          stopInertia();
          start.current = { ...dragRef.current };
        },
        onPanResponderMove: (_e, g) => {
          setDrag({
            yaw: start.current.yaw + g.dx * 0.5,
            pitch: clamp(start.current.pitch - g.dy * 0.4, -85 - basePitch, 85 - basePitch),
          });
        },
        onPanResponderRelease: (_e, g) => {
          if (Math.abs(g.dx) < 4 && Math.abs(g.dy) < 4) {
            const now = Date.now();
            if (now - lastTap.current < 300) { setDrag({ yaw: 0, pitch: 0 }); lastTap.current = 0; return; }
            lastTap.current = now;
          }
          let vyaw = g.vx * 8, vpitch = -g.vy * 6; // deg per frame, roughly
          const tick = () => {
            vyaw *= 0.94; vpitch *= 0.94;
            if (Math.abs(vyaw) < 0.03 && Math.abs(vpitch) < 0.03) { raf.current = null; return; }
            setDrag((d) => ({ yaw: d.yaw + vyaw, pitch: clamp(d.pitch + vpitch, -85 - basePitch, 85 - basePitch) }));
            raf.current = requestAnimationFrame(tick);
          };
          raf.current = requestAnimationFrame(tick);
        },
      }),
    [interactive, basePitch],
  );

  // ----- geometry (fixed part built once, slider part rebuilt only when the jaw moves)
  const dx = clamp(slide, -18, 520);
  const fixed = useMemo(buildFixed, []);
  const moving = useMemo(() => buildSlider(dx, T), [dx, T]);

  // ----- rotate, project, cull, shade, sort
  const yawDeg = baseYaw + (yaw ?? rotationAngle) + drag.yaw;
  const pitchDeg = clamp(basePitch + pitch + drag.pitch, -89, 89);
  const ya = (yawDeg * Math.PI) / 180, pa = (pitchDeg * Math.PI) / 180;
  const cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa);
  const ox = width / 2, oy = height / 2;

  const rot = (x: number, y: number, z: number): V3 => {
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  };

  // The slider wraps the beam, so it is always painted after the fixed part.
  // Each part is depth-sorted on its own (sorting them together breaks where they overlap).
  const items: Item[] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const hex = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');

  for (const set of [fixed, moving]) {
    const first = items.length;
    for (const f of set.faces) {
      const n = rot(f.n[0], f.n[1], f.n[2]);
      let gx = 0, gy = 0, gz = 0;
      const rp: V3[] = f.p.map(([x, y, z]) => { const r = rot(x, y, z * T); gx += r[0]; gy += r[1]; gz += r[2]; return r; });
      const k = 1 / rp.length;
      gx *= k; gy *= k; gz *= k;
      if (n[0] * -gx + n[1] * -gy + n[2] * (FOCAL - gz) <= 0) continue; // back face
      const lam = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const spec = Math.pow(Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]), 36) * f.metal * 150;
      const fill2 = Math.max(0, n[0] * FILL[0] + n[1] * FILL[1] + n[2] * FILL[2]);
      const sh = 0.4 + 0.72 * lam + 0.22 * fill2;
      const fill = '#' + hex(f.c[0] * sh + spec) + hex(f.c[1] * sh + spec) + hex(f.c[2] * sh + spec);
      const pts: number[] = [];
      for (const r of rp) {
        const pk = FOCAL / (FOCAL - r[2]);
        const px = r[0] * pk, py = r[1] * pk;
        pts.push(px, py);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
      items.push({ depth: gz, pts, fill });
    }
    for (const dc of set.decals) {
      const n = rot(0, 0, 1);
      const c = rot(dc.cen[0], dc.cen[1], dc.cen[2] * T);
      if (n[0] * -c[0] + n[1] * -c[1] + n[2] * (FOCAL - c[2]) <= 0) continue;
      const seg: number[] = [];
      for (let i = 0; i < dc.s.length; i += 4) {
        const a = rot(dc.s[i], dc.s[i + 1], dc.z * T), b = rot(dc.s[i + 2], dc.s[i + 3], dc.z * T);
        const ka = FOCAL / (FOCAL - a[2]), kb = FOCAL / (FOCAL - b[2]);
        seg.push(a[0] * ka, a[1] * ka, b[0] * kb, b[1] * kb);
      }
      items.push({ depth: c[2] + 0.6, seg, sw: 0.7 });
    }
    const part = items.splice(first).sort((a, b) => a.depth - b.depth);
    for (const it of part) items.push(it);
  }

  // ----- fit the visible bounding box to the view (so end-on angles zoom in instead of shrinking away)
  const FIT = 0.92;
  const bw = Math.max(maxX - minX, 1), bh = Math.max(maxY - minY, 1);
  const f = autoFit && isFinite(bw) ? Math.min((width * FIT) / bw, (height * FIT) / bh) : Math.min((width * 0.96) / 1560, (height * 0.96) / 480);
  const bcx = autoFit && isFinite(minX) ? (minX + maxX) / 2 : 0;
  const bcy = autoFit && isFinite(minY) ? (minY + maxY) / 2 : 0;
  const X = (v: number) => (ox + (v - bcx) * f).toFixed(1);
  const Y = (v: number) => (oy - (v - bcy) * f).toFixed(1);

  const labelOpacity = clamp(1 - (Math.abs(yawDeg) + Math.abs(pitchDeg)) / 30, 0, 1);

  return (
    <View style={{ width, height }} {...(interactive ? responder.panHandlers : {})}>
      <Svg width={width} height={height}>
        {items.map((it, i) => {
          if (it.pts) {
            let pts = '';
            for (let k = 0; k < it.pts.length; k += 2) pts += X(it.pts[k]) + ',' + Y(it.pts[k + 1]) + ' ';
            return <Polygon key={i} points={pts} fill={it.fill} stroke={it.fill} strokeWidth={0.6} strokeLinejoin="round" />;
          }
          let d = '';
          const sg = it.seg as number[];
          for (let k = 0; k < sg.length; k += 4) d += 'M' + X(sg[k]) + ' ' + Y(sg[k + 1]) + 'L' + X(sg[k + 2]) + ' ' + Y(sg[k + 3]);
          return <Path key={i} d={d} stroke={INK} strokeWidth={it.sw} fill="none" />;
        })}
        {showLabels && labelOpacity > 0.02 && (
          <G opacity={labelOpacity} transform={`translate(${ox - (OX + bcx) * f},${oy - (OY - bcy) * f}) scale(${f})`}>
            <Labels />
          </G>
        )}
      </Svg>
    </View>
  );
};

export default VernierViewerSvg;