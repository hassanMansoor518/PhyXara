import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Box, Calculator, CheckCircle2, ChevronDown, FileText, FlaskConical, GraduationCap, Lightbulb, Settings2, Sparkles, Star, Target } from 'lucide-react-native';
import { PracticalAssessment } from '../src/components/PracticalAssessment';
import { emptyPracticalState, type PracticalEvent, type PracticalState } from '../src/data/practicalProgress';
import { useLearningAccount, useLearningData } from '../src/services/learningService';
import { UnityBridge } from '../src/unity/UnityBridge';
import { AppHeader } from '../src/components/AppHeader';
import { PracticalHeroCard } from '../src/components/PracticalHeroCard';
import { LabApparatus } from '../src/components/LabApparatus';
import { class9Labs, practicalUnityModels } from '../src/data/class9Labs';

const manualUrl = process.env.EXPO_PUBLIC_PRACTICAL_MANUAL_URL;

const graphAxes: Record<number, { x: string; y: string; point: (v: number[]) => [number, number] }> = {
  4: { x: 'Time squared (s²)', y: 'Distance (m)', point: ([s, t]) => [t ** 2, s] },
  6: { x: 'Normal reaction (N)', y: 'Limiting friction (N)', point: ([f, n]) => [n, f] },
  11: { x: 'Length (m)', y: 'Period squared (s²)', point: ([l, t, n]) => [l, (t / n) ** 2] },
  12: { x: 'Extension (m)', y: 'Load (N)', point: ([a, b, f]) => [b - a, f] },
  16: { x: 'Time (min)', y: 'Temperature (°C)', point: ([, t, , temp]) => [t, temp] },
};

function LabGraph({ points, x, y }: { points: [number, number][]; x: string; y: string }) {
  const minX = Math.min(0, ...points.map(p => p[0]));
  const maxX = Math.max(minX + .001, ...points.map(p => p[0]));
  const minY = Math.min(0, ...points.map(p => p[1]));
  const maxY = Math.max(minY + .001, ...points.map(p => p[1]));
  const coordinates = [...points].sort((a, b) => a[0] - b[0])
    .map(([a, b]) => [30 + 230 * (a - minX) / (maxX - minX), 120 - 100 * (b - minY) / (maxY - minY)]);
  return (
    <View className="mt-3 rounded-xl bg-[#EFF6FF] p-3">
      <Text className="text-xs text-[#334155]">{y} • {minY.toPrecision(3)} to {maxY.toPrecision(3)}</Text>
      <Svg width="100%" height={140} viewBox="0 0 280 140">
        <Line x1={30} x2={270} y1={120} y2={120} stroke="#64748B" />
        <Line x1={30} x2={30} y1={10} y2={120} stroke="#64748B" />
        <Polyline points={coordinates.map(p => p.join(',')).join(' ')} fill="none" stroke="#2563EB" strokeWidth={2} />
        {coordinates.map(([cx, cy], index) => <Circle key={index} cx={cx} cy={cy} r={3} fill="#2563EB" />)}
      </Svg>
      <Text className="text-xs text-[#334155]">{x} • {minX.toPrecision(3)} to {maxX.toPrecision(3)}</Text>
    </View>
  );
}

const practicalTabs = [
  { id: 'learn', label: 'Learn', Icon: BookOpen },
  { id: 'ar', label: 'Explore in AR', Icon: Box },
  { id: 'practice', label: 'Practice', Icon: CheckCircle2 },
] as const;

const theory = [
  'The Vernier scale resolves fractions of a main-scale division. A circular cross-section has area πr².',
  'A cylinder has a constant circular cross-section, so its volume is area times length.',
  'The screw converts rotation into a small linear displacement. The least count is pitch divided by the thimble divisions.',
  'With constant acceleration from rest, distance increases in proportion to elapsed time squared.',
  'Near Earth, a falling object accelerates downward at approximately 9.8 m/s² when air resistance is negligible.',
  'Static friction increases to a limiting value. On the same contact surfaces that limit is approximately proportional to normal reaction.',
  'The hanging mass provides a pull through the thread. At the onset of rolling, the pull estimates the limiting force.',
  'A moment measures how strongly a force tends to turn an object about a pivot. Opposite moments balance at equilibrium.',
  'Forces have direction as well as magnitude. At equilibrium, their vector sum is zero.',
  'At rotational equilibrium, the products of weight and perpendicular distance balance on both sides of the pivot.',
  'For small swings, the pendulum period depends on length and gravitational acceleration.',
  'Within the elastic range, spring extension is proportional to applied load.',
  'Buoyancy equals the weight of displaced water. A fully immersed object displaces its own volume.',
  'Density is mass per unit volume. Subtract the syringe tare to isolate the liquid mass.',
  'At equilibrium, the heat lost by the hotter sample approximately equals the heat gained by the cooler water.',
  'During a phase change, added energy supplies latent heat while temperature stays nearly constant.',
] as const;

function LearnCard({ title, Icon, children, tone }: { title: string; Icon: typeof BookOpen; children: React.ReactNode; tone?: 'tip' }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View className={'border border-[#DBE6FA] rounded-[20px] p-4 gap-2.5 shadow-sm ' + (tone === 'tip' ? 'bg-[#E8F0FF]' : 'bg-white')}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} className="flex-row items-center gap-3" onPress={() => setExpanded(value => !value)}>
        <Icon size={24} color={tone === 'tip' ? '#EFA92C' : '#2563EB'} />
        <Text className="flex-1 text-base font-extrabold text-[#14213D]">{title}</Text>
        <ChevronDown size={16} color="#64748B" />
      </Pressable>
      {expanded && <View className="gap-2">{children}</View>}
    </View>
  );
}

function Experiment({ number }: { number: number }) {
  const lab = class9Labs[number - 1];
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const headerScale = frameWidth / 390;
  const heroInset = Math.round(6 * headerScale);
  const headerButton = Math.round(49 * headerScale);
  const [activeTab, setActiveTab] = useState<(typeof practicalTabs)[number]['id']>('learn');
  const graph = graphAxes[number];
  const { userId, record } = useLearningAccount();
  const { data, failed, retry } = useLearningData<PracticalState>('/practicals/' + number + '/state');
  const progress = data ?? emptyPracticalState;
  const [fullScreen, setFullScreen] = useState(false);
  const [arBusy, setArBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const arId = practicalUnityModels[number];
  const save = async (event: PracticalEvent, eventId?: string) => {
    await record({ kind: 'practical', number, event }, eventId);
    retry();
  };
  const update = (event: PracticalEvent) => {
    void save(event).catch(() => setNotice('Could not save progress. Please try again.'));
  };
  const openAR = async () => {
    if (!arId || arBusy) return;
    setArBusy(true);
    setNotice('');
    try {
      const result = await UnityBridge.open('ar', arId);
      if (!result.ok) setNotice(result.reason === 'camera_denied' ? 'Camera access is required for AR. You can still use the 3D viewer.'
        : result.reason === 'busy' ? 'AR is already opening.' : 'AR is unavailable on this device. Use the 3D viewer below.');
    } catch {
      setNotice('AR could not open. You can still use the 3D viewer.');
    } finally {
      setArBusy(false);
    }
  };
  const steps = lab.method.split(/(?<=\.)\s+(?=[A-Z])/);
  const example = lab.calculate(lab.readings.map(([, , value]) => value));
  const [inputs, setInputs] = useState(() => lab.readings.map(([, , example]) => String(example)));
  const [points, setPoints] = useState<[number, number][]>([]);
  const [results, setResults] = useState<ReturnType<typeof lab.calculate>>([]);
  const [error, setError] = useState('');
  const calculate = () => {
    try {
      const values = inputs.map(value => value.trim() === '' ? NaN : Number(value));
      if (values.some(value => !Number.isFinite(value))) throw new Error('Enter a number for every reading.');
      const next = lab.calculate(values);
      if (next.some(([, value]) => !Number.isFinite(value))) throw new Error('The result is outside the supported range.');
      setResults(next);
      setError('');
      if (graph) {
        const point = graph.point(values);
        setPoints(previous => {
          const nextPoints = number === 16 && previous.length === 0
            ? [[values[0], values[2]] as [number, number], point] : [...previous, point];
          return nextPoints.slice(-30);
        });
      }
    } catch (failure) {
      setResults([]);
      setError(failure instanceof Error ? failure.message : 'Check your readings.');
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#EEF3FD]" edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View className="self-center flex-row items-center justify-between" style={{ width: frameWidth, paddingHorizontal: heroInset + 5 * headerScale, height: 70 * headerScale }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" className="rounded-full bg-[#F9FBFF] border border-[#D5E1F8] items-center justify-center" style={{ width: headerButton, height: headerButton }}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/library')}><ArrowLeft size={Math.round(23 * headerScale)} color="#101B48" /></Pressable>
        <Text accessibilityRole="header" className="font-black text-[#101B48]" style={{ fontSize: Math.round(22 * headerScale) }}>Practical {number}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={progress.bookmarked ? 'Remove bookmark' : 'Bookmark practical'} accessibilityState={{ selected: progress.bookmarked }}
          onPress={() => update({ kind: 'bookmark', bookmarked: !progress.bookmarked })} className="items-center justify-center" style={{ width: headerButton, height: headerButton }}>
          {progress.bookmarked ? <Bookmark size={24} color="#1754E9" fill="#BAD2FF" /> : <GraduationCap size={Math.round(32 * headerScale)} color="#1754E9" fill="#2B6DFA" />}
        </Pressable>
      </View>
      <Svg width="100%" height={76} viewBox="0 0 390 76" preserveAspectRatio="none" pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, alignSelf: 'center', maxWidth: 430 }}>
        <Path d="M0 68 Q75 28 146 58 T290 46 Q340 15 390 33 V76 H0Z" fill="#DDE8FD" />
        <Path d="M192 76 Q263 74 300 39 T390 17 V76Z" fill="#BDD6FB" />
        <Path d="M287 76 Q337 56 390 22 V76Z" fill="#72ABFB" />
      </Svg>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36, gap: 14, maxWidth: 430, width: '100%', alignSelf: 'center' }}>
        <PracticalHeroCard number={number} title={lab.title} model={lab.model} pages={lab.pages} frameWidth={frameWidth}
          onOpenManual={manualUrl ? () => {
            void Linking.openURL(manualUrl.split('#')[0] + '#page=' + parseInt(lab.pages, 10))
              .catch(() => setNotice('The practical manual could not be opened.'));
          } : undefined} />
        <View accessibilityRole="tablist" className="flex-row bg-[#EFF6FF] p-1 rounded-2xl border border-[#E2E8F0]">
          {practicalTabs.map(tab => {
            const selected = activeTab === tab.id;
            return (
              <Pressable key={tab.id} accessibilityRole="tab" accessibilityState={{ selected }}
                className={'min-h-11 flex-row items-center justify-center gap-1 rounded-2xl ' + (selected ? 'bg-[#1958ED] shadow-sm' : '')}
                style={{ flex: tab.id === 'ar' ? 1.37 : 1 }}
                onPress={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'ar' && userId && !progress.viewed) update({ kind: 'view' });
                }}>
                <tab.Icon size={width <= 340 ? 14 : 18} color={selected ? '#FFFFFF' : '#14213D'} />
                <Text numberOfLines={1} className={'text-[11px] font-bold ' + (selected ? 'text-white' : 'text-[#475569]')}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {failed && <Text onPress={retry} className="text-xs text-[#64748B]">Cloud sync unavailable. Progress is saved on this device. Tap to retry.</Text>}
        {!!notice && <Text accessibilityLiveRegion="polite" className="text-[#475569]">{notice}</Text>}
        {activeTab === 'ar' && <>
          <View className="rounded-2xl overflow-hidden bg-[#102448]">
            <LabApparatus model={lab.model} scene />
            <View pointerEvents="none" className="absolute inset-3">
              {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([bottom, right]) => (
                <View key={bottom + ':' + right} style={{ position: 'absolute', width: 21, height: 21, borderColor: '#48CDFF', borderRadius: 5,
                  ...(bottom ? { bottom: 0, borderBottomWidth: 2 } : { top: 0, borderTopWidth: 2 }),
                  ...(right ? { right: 0, borderRightWidth: 2 } : { left: 0, borderLeftWidth: 2 }) }} />
              ))}
            </View>
            <View className="absolute right-3 top-3 flex-row items-center gap-1.5 bg-[#132243] rounded-full px-3 py-1.5 border border-[#53A9FF]" pointerEvents="none">
              <Box size={17} color="#FFFFFF" /><Text className="font-bold text-white">{arId ? 'AR' : '3D'}</Text>
            </View>
            <Pressable accessibilityRole="button" disabled={arBusy} onPress={arId ? () => void openAR() : () => setFullScreen(true)}
              className="absolute bottom-7 self-center rounded-full bg-[#152448] px-5 py-2.5 border border-[#6183B2]">
              <Text className="font-bold text-white">{arBusy ? 'Opening…' : arId ? 'Tap to Start AR' : 'Open full-screen 3D'}</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open full-screen 3D viewer" onPress={() => setFullScreen(true)}
            className="bg-[#E8F0FF] rounded-2xl p-4 border border-[#C9DAFA] flex-row items-center gap-3">
            <Sparkles size={25} color="#1859EB" />
            <View className="flex-1 gap-1"><Text className="font-extrabold text-[#1754E9]">Experience 3D</Text>
              <Text className="text-xs leading-5 text-[#101B48]">{arId ? 'Scan the matching diagram in Unity AR, or explore the equipment in full-screen 3D.' : 'Rotate and zoom the apparatus in the full-screen 3D viewer.'}</Text>
            </View>
            <View className="w-9 h-9 rounded-full bg-[#1754E9] items-center justify-center"><ArrowRight size={19} color="white" /></View>
          </Pressable>
          <LearnCard title="Features" Icon={Star}>
            {['3D Model View', 'Equipment Guide', 'Interactive Learning'].map(feature => <View key={feature} className="flex-row gap-2 items-center">
              <CheckCircle2 size={17} color="#16A34A" /><Text className="text-[#101B48]">{feature}</Text>
            </View>)}
            <Text className="text-xs text-[#475569]">{lab.apparatus}</Text>
          </LearnCard>
        </>}
        {activeTab === 'learn' && <>
          <LearnCard title="Apparatus" Icon={FlaskConical}><Text className="text-[#101B48] ml-9">{lab.apparatus}</Text></LearnCard>
          <LearnCard title="Method" Icon={Settings2}>
            {steps.map((step, i) => <View key={step} className="flex-row gap-2 items-start">
              <Text className="rounded-full bg-[#2563EB] w-6 h-6 text-center leading-6 font-bold text-white">{i + 1}</Text>
              <Text className="flex-1 text-[#475569]">{step}</Text>
            </View>)}
          </LearnCard>
          <LearnCard title="Formula" Icon={Calculator}>
            <Text selectable className="bg-[#E5EFFF] rounded-xl border border-dashed border-[#B6CEF8] p-3 text-[#142A65] font-semibold">{lab.formula}</Text>
            <Text className="text-xs text-[#475569]">Use the units shown in the observation table when substituting readings.</Text>
          </LearnCard>
          <LearnCard title="Quick Tip" Icon={Lightbulb} tone="tip">
            <Text className="text-[#475569]">{number <= 3 ? 'Take readings at different positions for better accuracy.' : number >= 15 ? 'Use heat-resistant tools and work under teacher supervision.' : steps.at(-1)}</Text>
          </LearnCard>
          <LearnCard title="Objective" Icon={Target}><Text className="text-[#475569]">{lab.title}.</Text></LearnCard>
          <LearnCard title="Theory" Icon={BookOpen}><Text className="text-[#475569]">{theory[number - 1]}</Text></LearnCard>
          <LearnCard title="Observation table" Icon={FileText}>
            <View className="flex-row justify-between bg-[#EFF6FF] p-2"><Text className="font-bold text-[#14213D]">Reading</Text><Text className="font-bold text-[#14213D]">Example</Text></View>
            {lab.readings.map(([label, unit, value]) => <View key={label} className="flex-row gap-3 justify-between border-b border-[#E2E8F0] pb-2">
              <Text className="flex-1 text-[#475569]">{label}</Text><Text className="text-[#14213D]">{value} {unit}</Text>
            </View>)}
          </LearnCard>
          <LearnCard title="Worked result" Icon={CheckCircle2}>
            <Text className="text-[#475569]">Substitute the example readings into the formula in order. The calculated quantities are:</Text>
            {example.map(([label, value, unit]) => <Text key={label} className="font-semibold text-[#14213D]">{label} = {Number(value.toPrecision(6))} {unit}</Text>)}
          </LearnCard>
          <Pressable accessibilityRole="button" disabled={progress.learned} onPress={() => update({ kind: 'learn' })} className="rounded-xl bg-[#2563EB] p-3">
            <Text className="text-center font-bold text-white">{progress.learned ? 'Learn completed' : 'Mark Learn complete'}</Text>
          </Pressable>
          <Text className="text-xs text-[#475569] text-center">{Number(progress.learned) + Number(progress.viewed) + Number(progress.attempts.length > 0)} of 3 sections completed</Text>
        </>}
        <View style={activeTab === 'practice' ? undefined : { display: 'none' }}>
          <PracticalAssessment number={number} history={progress.attempts} save={save} onReview={() => setActiveTab('learn')} />
        </View>
        {activeTab === 'practice' && <View className="rounded-2xl bg-white p-4 gap-3 border border-[#DCE7FA]">
          <Text className="text-lg font-bold text-[#0F172A]">Calculation</Text>
          <Text selectable className="text-[#2563EB]">{lab.formula}</Text>
          <Text className="text-xs text-[#475569]">Example values are filled in. Replace them with your measurements.</Text>
          {lab.readings.map(([label, unit], i) => (
            <View key={label} className="gap-1">
              <Text className="text-sm font-semibold text-[#334155]">{label}{unit ? ' (' + unit + ')' : ''}</Text>
              <TextInput accessibilityLabel={label} keyboardType="numbers-and-punctuation"
                value={inputs[i]} className="rounded-xl border border-[#CBD5E1] px-3 py-2 text-[#0F172A]"
                onChangeText={value => {
                  setInputs(previous => previous.map((input, index) => index === i ? value : input));
                  setResults([]);
                  setError('');
                }} />
            </View>
          ))}
          <Pressable accessibilityRole="button" onPress={calculate} className="bg-[#2563EB] rounded-xl p-3">
            <Text className="text-center font-bold text-white">{graph ? 'Calculate & plot reading' : 'Calculate'}</Text>
          </Pressable>
          {error ? <Text accessibilityLiveRegion="polite" className="text-[#B91C1C]">{error}</Text> : null}
          {results.map(([label, value, unit]) => (
            <Text key={label} selectable className="font-bold text-[#0F172A]">
              {label}{' = '}{Number(value.toPrecision(6))}{' '}{unit}
            </Text>
          ))}
          {graph && points.length > 0 && <>
            <LabGraph points={points} x={graph.x} y={graph.y} />
            <Pressable accessibilityRole="button" onPress={() => setPoints([])}>
              <Text className="font-bold text-[#2563EB]">Clear graph readings</Text>
            </Pressable>
          </>}
        </View>}
      </ScrollView>
      <Modal visible={fullScreen} onRequestClose={() => setFullScreen(false)} animationType="fade">
        <SafeAreaView className="flex-1 bg-[#0D2444] justify-center p-4 gap-4">
          <LabApparatus model={lab.model} expanded />
          <Pressable accessibilityRole="button" onPress={() => setFullScreen(false)} className="rounded-xl bg-white p-3">
            <Text className="text-center font-bold text-[#2563EB]">Close full screen</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function PracticalRoute() {
  const { experiment } = useLocalSearchParams<{ experiment?: string }>();
  const number = Number(experiment);
  if (!Number.isInteger(number) || !class9Labs[number - 1]) {
    return <SafeAreaView><AppHeader title="Practical" /><Text>Experiment not found.</Text></SafeAreaView>;
  }
  return <Experiment key={number} number={number} />;
}
