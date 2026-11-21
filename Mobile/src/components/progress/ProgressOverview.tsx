import { useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, BookOpen, CircleHelp, User } from 'lucide-react-native';
import React, { useId } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import type { UserStats } from '../../services/learningService';
import { PhyXaraLogo } from '../PhyXaraLogo';
import { Floating, useAnimatedProgress } from './motion';
import { ProgressArtwork, ProgressArtworkKind } from './ProgressArtwork';
import { palette, progressStyles as common } from './theme';

const bounded = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export function ProgressHeader({ onNotifications }: { onNotifications: () => void }) {
  const { user } = useUser();
  return <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="PhyXara home" onPress={() => router.replace('/(tabs)')} style={styles.brand}>
      <PhyXaraLogo size={36} />
      <View style={{ flexShrink: 1 }}><Text style={styles.wordmark}>Phy<Text style={{ color: palette.primary }}>Xara</Text></Text><Text style={common.label}>AI-Powered AR Learning</Text></View>
    </Pressable>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotifications} hitSlop={4} style={({ pressed }) => [styles.iconButton, pressed && common.pressed]}><Bell size={18} color={palette.navy} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Student profile" onPress={() => router.push('/profile')} hitSlop={4} style={({ pressed }) => [styles.iconButton, pressed && common.pressed]}>
        {user?.hasImage ? <Image source={{ uri: user.imageUrl }} style={styles.avatar} /> : <User size={20} color={palette.primary} />}
      </Pressable>
    </View>
  </View>;
}

export function CircularProgress({ percentage, motion }: { percentage: number; motion: boolean }) {
  const target = bounded(percentage);
  const { count } = useAnimatedProgress(target, motion);
  const gradient = 'progressRing' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const circumference = 2 * Math.PI * 54;
  return <View accessibilityRole="progressbar" accessibilityLabel="Overall progress" accessibilityValue={{ min: 0, max: 100, now: target }} style={styles.ring}>
    <Svg width={144} height={144} viewBox="0 0 120 120">
      <Defs><SvgGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%"><Stop stopColor="#93B9FF" /><Stop offset="0.55" stopColor="#3B82F6" /><Stop offset="1" stopColor="#1751F0" /></SvgGradient></Defs>
      <Circle cx={60} cy={60} r={54} stroke="#E5EDFF" strokeWidth={11} fill="none" />
      <Circle cx={60} cy={60} r={54} stroke={`url(#${gradient})`} strokeWidth={11} fill="none" strokeLinecap={target ? 'round' : 'butt'} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - count / 100)} transform="rotate(-90 60 60)" />
    </Svg>
    <View style={styles.ringText}><Text style={styles.percent}>{Math.round(count)}%</Text><Text style={[common.label, { textAlign: 'center' }]}>Overall{ '\n' }Progress</Text></View>
  </View>;
}

export function OverallProgressCard({ percentage, completed, total, questionsAnswered, motion }: { percentage: number; completed: number; total: number; questionsAnswered: number; motion: boolean }) {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale > 1.2;
  return <View style={styles.hero}>
    <View style={styles.ringArea}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height={176} viewBox="0 0 342 170"><Ellipse cx={164} cy={82} rx={126} ry={48} transform="rotate(-14 164 82)" stroke="#D6E5FF" strokeWidth={1.2} fill="none" /><Ellipse cx={164} cy={82} rx={114} ry={42} transform="rotate(16 164 82)" stroke="#D6E5FF" strokeWidth={1} fill="none" /></Svg>
        {[{ left: '10%' as const, top: 28, size: 12 }, { left: '7%' as const, top: 112, size: 10 }, { left: '82%' as const, top: 16, size: 10 }].map((orb, i) => <Floating key={i} enabled={motion} delay={i * 250} style={{ position: 'absolute', left: orb.left, top: orb.top }}><LinearGradient colors={['#DBEAFE', '#1751F0', '#123FAF']} style={{ width: orb.size, height: orb.size, borderRadius: orb.size }} /></Floating>)}
      </View>
      <CircularProgress percentage={percentage} motion={motion} />
      <Floating enabled={motion} style={[styles.notePosition, compact && styles.compactNote]}>
        <View style={styles.note} pointerEvents="none"><Text style={styles.keep}>Keep</Text><Text style={styles.learning}>Learning! <Text style={{ color: '#EAB308', fontSize: 16 }}>✦</Text></Text><Svg width={80} height={10} viewBox="0 0 80 10"><Path d="M4 5C26 1.5 54 1.5 76 4.5" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" /><Path d="M16 8.5C34 6.5 52 6.5 68 8" stroke="#60A5FA" strokeWidth={1.3} strokeLinecap="round" /></Svg></View>
      </Floating>
    </View>
    <View style={[styles.pill, compact && { marginTop: 32 }]}>
      <View style={styles.pillItem}><BookOpen size={16} color={palette.link} /><Text style={[common.label, { color: palette.navy }]}>{completed} / {total} Practicals</Text></View>
      <View style={styles.pillDivider} />
      <View style={styles.pillItem}><CircleHelp size={16} color={palette.link} /><Text style={[common.label, { color: palette.navy }]}>{questionsAnswered} Answers</Text></View>
    </View>
  </View>;
}

export function LearningStatistics({ stats, motion }: { stats: UserStats; motion: boolean }) {
  const { width, fontScale } = useWindowDimensions();
  const wrap = width < 340 || fontScale > 1.2;
  const items: { label: string; value: number; icon: ProgressArtworkKind; color: string }[] = [
    { label: 'XP Earned', value: stats.xp, icon: 'star', color: palette.tint },
    { label: 'Day Streak', value: stats.streak, icon: 'fire', color: '#FFF0ED' },
    { label: 'Quizzes', value: stats.quizzesCompleted, icon: 'quiz', color: '#DDF6ED' },
    { label: '3D Models', value: stats.modelsExplored, icon: 'cube', color: '#E6EFFF' },
  ];
  return <View style={[common.card, styles.statistics]}>{items.map((item, index) => <View key={item.label} style={[styles.stat, { width: wrap ? '50%' : '25%' }, index % (wrap ? 2 : 4) !== (wrap ? 1 : 3) && styles.statBorder]}>
    <Floating enabled={motion} delay={index % 2 * 350}><View style={[styles.statIcon, { backgroundColor: item.color }]}><ProgressArtwork kind={item.icon} size={20} /></View></Floating>
    <Text style={[common.title, styles.statValue]}>{item.value.toLocaleString()}</Text><Text style={[common.label, { textAlign: 'center' }]}>{item.label}</Text>
  </View>)}</View>;
}

export function AnimatedProgressBar({ percentage, motion }: { percentage: number; motion: boolean }) {
  const { value } = useAnimatedProgress(bounded(percentage), motion);
  return <View style={styles.track}><Animated.View style={{ height: '100%', width: value.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }}><LinearGradient colors={['#1751F0', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} /></Animated.View></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  wordmark: { fontFamily: 'AuthPoppins-Bold', fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: palette.navy },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderColor: palette.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatar: { width: 36, height: 36 },
  hero: { alignItems: 'center', paddingVertical: 4 },
  ringArea: { width: '100%', alignItems: 'center', paddingVertical: 8, minHeight: 160 },
  ring: { width: 144, height: 144, borderRadius: 72, backgroundColor: '#FFFFFF', boxShadow: '0 8px 20px rgba(23,81,240,0.15)' },
  ringText: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', gap: 2 },
  percent: { fontFamily: 'AuthPoppins-Bold', fontSize: 28, lineHeight: 36, color: palette.navy, fontVariant: ['tabular-nums'] },
  notePosition: { position: 'absolute', right: -4, top: 46 },
  compactNote: { top: 137, right: 0 },
  note: { alignItems: 'center', transform: [{ rotate: '-10deg' }] },
  keep: { fontFamily: 'ProgressCaveat-Bold', fontSize: 20, lineHeight: 22, color: palette.primary },
  learning: { fontFamily: 'ProgressCaveat-Bold', fontSize: 26, lineHeight: 28, color: palette.navy },
  pill: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 12, rowGap: 4, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: palette.tint, borderRadius: 24, borderWidth: 1, borderColor: palette.border },
  pillItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillDivider: { width: 1, height: 14, backgroundColor: palette.border },
  statistics: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8, rowGap: 12 },
  stat: { alignItems: 'center', paddingHorizontal: 4, gap: 2 },
  statBorder: { borderRightWidth: 1, borderRightColor: palette.border },
  statIcon: { height: 36, width: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statValue: { textAlign: 'center', fontVariant: ['tabular-nums'] },
  track: { height: 8, borderRadius: 4, backgroundColor: palette.tint, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 4 },
});
