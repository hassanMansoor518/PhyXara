import { memo, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
import { VernierViewerSvg } from './illustrations/VernierViewerSvg';
import { BoxGeometry, CylinderGeometry, Vector3 } from 'three';

type Point = [number, number, number];
type Face = { vertices: Vector3[]; color: number[] };

function apparatus(model: string): Face[] {
  const faces: Face[] = [];
  const metal = [169, 192, 206], blue = [55, 164, 217], dark = [69, 87, 111];
  const wood = [179, 116, 67], gold = [242, 181, 60], red = [232, 88, 75];

  function add(geometry: BoxGeometry | CylinderGeometry, position: Point, color: number[], angle = 0) {
    geometry.rotateZ(angle).translate(...position);
    const vertices = geometry.getAttribute('position');
    const index = geometry.getIndex()!;
    for (let i = 0; i < index.count; i += 3) {
      faces.push({ color, vertices: [0, 1, 2].map(offset =>
        new Vector3().fromBufferAttribute(vertices, index.getX(i + offset))) });
    }
    geometry.dispose();
  }
  const box = (size: Point, position: Point, color = metal, angle = 0) =>
    add(new BoxGeometry(...size), position, color, angle);
  const rod = (radius: number, length: number, position: Point, color = metal, angle = 0) =>
    add(new CylinderGeometry(radius, radius, length, 14), position, color, angle);
  const bench = () => box([2.7, .16, .92], [0, -.6, 0], wood);
  const stand = () => {
    box([1.4, .14, .9], [-.4, -.9, 0], dark);
    rod(.05, 1.8, [-.85, .05, 0]);
    rod(.05, 1.2, [-.3, .87, 0], metal, Math.PI / 2);
  };

  switch (model) {
    case 'caliper':
      box([3, .22, .16], [0, .2, 0]);
      box([.52, .37, .26], [-.28, .2, 0], blue);
      for (const x of [-1.33, -.45]) {
        box([.13, .68, .22], [x, -.23, 0]);
        box([.09, .28, .16], [x, .43, 0]);
      }
      for (let i = 0; i < 23; i++) box([.014, i % 5 ? .07 : .13, .015], [-1.29 + i * .12, .24, .087], dark);
      rod(.23, .31, [-.89, -.41, 0], gold, Math.PI / 2);
      break;
    case 'micrometer':
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI * (i + .5) / 10;
        box([.26, .22, .21], [-.45 + .65 * Math.cos(angle), .37 - .65 * Math.sin(angle), 0], blue, -angle - Math.PI / 2);
      }
      rod(.08, .21, [-1, .35, 0], metal, Math.PI / 2);
      rod(.09, .6, [-.12, .35, 0], metal, Math.PI / 2);
      rod(.17, .75, [.55, .35, 0], dark, Math.PI / 2);
      rod(.115, .28, [1.03, .35, 0], metal, Math.PI / 2);
      box([.07, .52, .3], [-.74, .2, 0], gold);
      break;
    case 'ramp':
      bench();
      box([.36, .58, .62], [-1.05, -.23, 0], wood);
      box([2.7, .09, .6], [0, -.06, 0], dark, -.23);
      box([2.7, .12, .06], [0, 0, -.3], metal, -.23);
      rod(.16, .23, [-.56, .24, 0], gold, Math.PI / 2);
      break;
    case 'drop':
      stand();
      box([.74, 1.8, .08], [.16, .02, -.18], wood);
      for (let i = 0; i < 7; i++) rod(.035, .06, [.23, .66 - i * .19, -.1], red, Math.PI / 2);
      rod(.13, .2, [0, .62, .03], gold);
      break;
    case 'block':
    case 'roller':
      bench();
      if (model === 'block') box([.65, .43, .55], [-.45, -.3, 0], wood);
      else rod(.25, .55, [-.45, -.27, 0], blue, Math.PI / 2);
      rod(.017, 1.45, [.57, -.19, 0], dark, Math.PI / 2);
      rod(.18, .15, [1.32, -.34, 0], metal);
      rod(.017, .57, [1.46, -.59, 0], dark);
      rod(.19, .12, [1.46, -.92, 0], gold);
      break;
    case 'lever':
      box([2.9, .12, .31], [0, .23, 0], wood);
      box([.53, .53, .4], [0, -.14, 0], dark, Math.PI / 4);
      for (const [x, length] of [[-.93, .34], [.62, .5]]) {
        rod(.018, length, [x, .16 - length / 2, 0], dark);
        box([.23, .25, .22], [x, .05 - length, 0], gold);
      }
      break;
    case 'force-table':
      rod(1.1, .13, [0, .15, 0], wood);
      rod(.13, .85, [0, -.34, 0], dark);
      for (const x of [-.75, .75]) {
        rod(.023, .87, [x / 2, .27, 0], red, Math.PI / 2);
        rod(.16, .12, [x, .28, 0], metal);
        rod(.1, .34, [x, -.15, 0], gold);
      }
      box([.19, .07, .85], [0, .25, .42], blue);
      break;
    case 'pendulum':
      stand();
      rod(.02, 1.2, [.2, .26, 0], dark, .24);
      rod(.19, .24, [.34, -.45, 0], gold);
      break;
    case 'spring':
      stand();
      for (let i = 0; i < 72; i++) {
        const angle = i * Math.PI / 6;
        box([.09, .046, .07], [.16 + .15 * Math.cos(angle), .78 - i * .013, .15 * Math.sin(angle)], blue);
      }
      rod(.16, .23, [.16, -.31, 0], gold);
      box([.18, 1.48, .075], [.52, .04, -.15], wood);
      break;
    case 'buoyancy':
      stand();
      rod(.45, .66, [.17, -.52, 0], blue);
      rod(.017, 1.08, [.17, .27, 0], dark);
      box([.27, .25, .25], [.17, -.29, 0], gold);
      break;
    case 'syringe':
      rod(.29, 1.48, [0, .03, 0], blue, Math.PI / 2);
      rod(.12, .94, [-.84, .03, 0], metal, Math.PI / 2);
      rod(.35, .09, [-1.32, .03, 0], dark, Math.PI / 2);
      rod(.07, .26, [.85, .03, 0], metal, Math.PI / 2);
      for (let i = 0; i < 9; i++) box([.018, .09, .03], [-.52 + i * .13, .14, .27], dark);
      break;
    case 'calorimeter':
    case 'heating':
      rod(.54, .77, [0, -.17, 0], model === 'calorimeter' ? metal : blue);
      rod(.5, .065, [0, .24, 0], blue);
      rod(.045, 1.17, [.24, .55, 0], red, .15);
      if (model === 'heating') {
        for (const x of [-.3, 0, .3]) box([.2, .21, .23], [x, .29, .05], metal);
        box([1.4, .18, 1.1], [0, -.74, 0], dark);
        rod(.15, .16, [0, -.58, 0], gold);
      } else {
        box([.25, .18, .25], [-.2, .29, .09], gold);
      }
      break;
  }
  return faces;
}

export const LabApparatus = memo(function LabApparatus({ model, compact = false, expanded = false, scene = false, compactHeight = 112 }: { model: string; compact?: boolean; expanded?: boolean; scene?: boolean; compactHeight?: number }) {
  const { width } = useWindowDimensions();
  const faces = useMemo(() => apparatus(model), [model]);
  const [angle, setAngle] = useState({ yaw: -.4, pitch: .28 });
  const start = useRef(angle);
  const [zoom, setZoom] = useState(1);
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { start.current = angle; },
    onPanResponderMove: (_, { dx, dy }) => setAngle({
      yaw: start.current.yaw + dx / 80,
      pitch: Math.max(-1.4, Math.min(1.4, start.current.pitch + dy / 100)),
    }),
  });
  const axisY = new Vector3(0, 1, 0), axisX = new Vector3(1, 0, 0);
  const light = new Vector3(-.4, .6, 1).normalize();
  const projected = faces.map(({ vertices, color }) => {
    const points = vertices.map(vertex => vertex.clone().applyAxisAngle(axisY, angle.yaw).applyAxisAngle(axisX, angle.pitch));
    const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize();
    const shade = .52 + .48 * Math.max(0, normal.dot(light));
    return {
      points: points.map(({ x, y, z }) => {
        const scale = 300 * zoom / (4.6 - z);
        return [150 + x * scale, 110 - y * scale];
      }),
      depth: points.reduce((sum, point) => sum + point.z, 0),
      visible: normal.z > 0,
      color: 'rgb(' + color.map(value => Math.round(value * shade)).join(',') + ')',
    };
  }).filter(face => face.visible).sort((a, b) => a.depth - b.depth);
  let viewBox = '0 0 300 220';
  if (compact && projected.length) {
    const points = projected.flatMap(face => face.points);
    const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
    const left = Math.min(...xs), top = Math.min(...ys);
    const padding = 8;
    viewBox = [left - padding, top - padding, Math.max(...xs) - left + 2 * padding,
      Math.max(...ys) - top + 2 * padding].join(' ');
  }

  return (
    <View className={compact ? 'overflow-hidden' : 'rounded-2xl bg-[#0D2444] overflow-hidden'}>
      {scene && <Svg width="100%" height="100%" viewBox="0 0 360 282" preserveAspectRatio="none" pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        <Defs><LinearGradient id="scene" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#222632" /><Stop offset="45%" stopColor="#373F54" /><Stop offset="100%" stopColor="#101F40" />
        </LinearGradient></Defs>
        <Rect width={360} height={282} fill="url(#scene)" />
        <Rect x={35} y={8} width={70} height={110} fill="#537394" opacity={.18} />
        <Rect x={193} y={8} width={114} height={110} fill="#577A9D" opacity={.18} />
        {Array.from({ length: 11 }, (_, index) => <Line key={index} x1={180} y1={102} x2={index * 66 - 150} y2={282} stroke="#4079BE" opacity={.48} />)}
        {[145, 163, 186, 218, 254, 280].map(y => <Line key={y} x1={0} y1={y} x2={360} y2={y} stroke="#4079BE" opacity={.48} />)}
      </Svg>}
      {scene && model === 'caliper' ? <View style={{ height: 282, justifyContent: 'center', transform: [{ rotate: '15deg' }] }}>
        <VernierViewerSvg width={Math.min(width, 430) - 32} height={236} baseYaw={-10} basePitch={11} interactive showLabels={false} />
      </View> : <View {...(compact ? {} : pan.panHandlers)} style={compact ? undefined : { touchAction: 'none' }}>
        <Svg width="100%" height={scene ? 282 : compact ? compactHeight : expanded ? 350 : 240} viewBox={viewBox} pointerEvents="none">
          {projected.map((face, i) => <Polygon key={i} points={face.points.map(point => point.join(',')).join(' ')} fill={face.color} stroke={face.color} strokeWidth={.6} />)}
        </Svg>
      </View>}
      {!compact && !scene && <View className="gap-2 px-3 pb-3">
        <Text className="text-xs text-white">Drag to rotate the apparatus</Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-2">
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => setZoom(value => Math.max(.6, value - .2))}>
          <Text className="font-bold text-white">− Zoom</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => setZoom(value => Math.min(1.8, value + .2))}>
          <Text className="font-bold text-white">+ Zoom</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setAngle({ yaw: -.4, pitch: .28 }); setZoom(1); }}>
          <Text className="font-bold text-white">Reset</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setAngle(value => ({ ...value, yaw: value.yaw + Math.PI / 4 }))}>
          <Text className="text-sm font-bold text-white">Rotate 45°</Text>
        </Pressable>
        </View>
      </View>}
    </View>
  );
});
