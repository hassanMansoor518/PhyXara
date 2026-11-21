import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Box, Calculator, CheckCircle2, ClipboardCheck, Lock, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { PracticalAchievement } from '../../data/practicalProgress';
import { Floating } from './motion';
import { ProgressArtwork } from './ProgressArtwork';
import { AnimatedProgressBar } from './ProgressOverview';
import { palette, progressStyles as common } from './theme';

const badgeIcons = {
  practical_first_learn: BookOpen,
  practical_first_view: Box,
  practical_first_calculation: Calculator,
  practical_first_quiz: ClipboardCheck,
};

export function AchievementBadge({ item, motion }: { item: PracticalAchievement; motion: boolean }) {
  const Icon = badgeIcons[item.id as keyof typeof badgeIcons] ?? CheckCircle2;
  const [shine] = useState(() => new Animated.Value(-44));
  useEffect(() => {
    if (!motion || !item.unlocked) {
      shine.setValue(-44);
      return;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(shine, { toValue: 44, duration: 1400, useNativeDriver: true, isInteraction: false }),
      Animated.delay(2000),
      Animated.timing(shine, { toValue: -44, duration: 0, useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [item.unlocked, motion, shine]);

  return (
    <Floating enabled={motion && item.unlocked} style={[styles.badge, { backgroundColor: item.unlocked ? '#EAF1FF' : '#E8EDF4' }]}>
      <Icon size={22} strokeWidth={2} color={item.unlocked ? '#1751F0' : '#8190A5'} />
      {!item.unlocked && <View style={styles.lock}><Lock size={9} color={palette.muted} /></View>}
      {item.unlocked && <Animated.View pointerEvents="none" style={[styles.shine, { transform: [{ translateX: shine }, { rotate: '25deg' }] }]} />}
    </Floating>
  );
}

export function AchievementSection({ achievements, loaded, motion, expanded, onExpand }: {
  achievements: PracticalAchievement[];
  loaded: boolean;
  motion: boolean;
  expanded: boolean;
  onExpand: () => void;
}) {
  const { fontScale } = useWindowDimensions();
  const compact = fontScale > 1.2;
  const [selectedId, setSelectedId] = useState<string>();
  const selected = achievements.find(item => item.id === selectedId);
  const unlocked = achievements.filter(item => item.unlocked).length;
  const visible = expanded ? achievements : [...achievements].sort((a, b) =>
    Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress).slice(0, 4);

  return (
    <View style={{ gap: 16 }}>
      <LinearGradient colors={['#1751F0', '#6093FA', '#EAF2FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.panel}>
        <View pointerEvents="none" style={styles.glow} />
        <View style={[common.row, styles.headingRow]}>
          <View style={styles.headingText}>
            <View style={styles.heading}>
              <ProgressArtwork kind="headerTrophy" size={24} />
              <Text accessibilityRole="header" style={[common.title, styles.white, { flexShrink: 1 }]}>Your Achievements</Text>
            </View>
            <Text style={[common.body, styles.white]}>{loaded ? unlocked + ' of ' + achievements.length + ' badges earned' : 'Loading saved achievements…'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Show fewer badges' : 'View all badges'}
            accessibilityState={{ expanded }} onPress={onExpand} style={({ pressed }) => [styles.viewAll, pressed && common.pressed]}>
            <Text style={[common.label, styles.white]}>{expanded ? 'Show Less' : 'View All'}</Text>
            <ArrowRight size={13} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {visible.map(item => (
            <Pressable key={item.id} accessibilityRole="button" disabled={!loaded}
              accessibilityLabel={item.title + ', ' + (item.unlocked ? 'earned' : 'locked') + ', ' + item.progress + '% completed. Show badge details.'}
              onPress={() => setSelectedId(item.id)}
              style={({ pressed }) => [styles.tile, !item.unlocked && styles.lockedTile, { width: compact ? '48%' : '23.5%' }, pressed && common.pressed]}>
              <AchievementBadge item={item} motion={motion && loaded} />
              <Text style={[common.label, styles.tileTitle]}>{item.title}</Text>
              <Text style={common.label}>{loaded ? item.unlocked ? 'Earned' : item.completedCount + ' / ' + item.targetCount : 'Loading…'}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {expanded && loaded && <View style={styles.list}>
        <Text accessibilityRole="header" style={common.title}>Badge requirements</Text>
        {achievements.map(item => (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'View ' + item.title + ' details'}
            onPress={() => setSelectedId(item.id)} style={({ pressed }) => [common.card, styles.detail, pressed && common.pressed]}>
            <AchievementBadge item={item} motion={false} />
            <View style={styles.detailText}>
              <View style={styles.heading}>
                <Text style={[styles.detailTitle, { flex: 1 }]}>{item.title}</Text>
                {item.unlocked && <CheckCircle2 size={16} color="#127A5A" />}
              </View>
              <Text style={common.body}>{item.description}</Text>
              <Text style={common.label}>{item.completedCount} / {item.targetCount} · {item.unlocked ? 'Earned' : item.progress + '% completed'}</Text>
              <AnimatedProgressBar percentage={item.progress} motion={motion} />
            </View>
          </Pressable>
        ))}
      </View>}

      <Modal visible={Boolean(selected) && loaded} transparent animationType={motion ? 'fade' : 'none'} onRequestClose={() => setSelectedId(undefined)}>
        <View style={styles.scrim}>
          <View accessibilityViewIsModal style={[common.card, styles.modal]}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {selected && <>
                <View style={common.row}>
                  <AchievementBadge item={selected} motion={false} />
                  <Pressable accessibilityRole="button" accessibilityLabel="Close badge details" onPress={() => setSelectedId(undefined)} style={styles.close}>
                    <X size={20} color={palette.navy} />
                  </Pressable>
                </View>
                <Text accessibilityRole="header" style={common.title}>{selected.title}</Text>
                <Text style={common.body}>{selected.description}</Text>
                <Text style={common.label}>{selected.completedCount} / {selected.targetCount} · {selected.unlocked ? 'Earned' : selected.progress + '% completed'}</Text>
                <AnimatedProgressBar percentage={selected.progress} motion={false} />
                <Pressable accessibilityRole="button" onPress={() => { setSelectedId(undefined); router.push('/library'); }} style={styles.continue}>
                  <Text style={[common.title, styles.white]}>{selected.unlocked ? 'Explore practicals' : 'Continue learning'}</Text>
                </Pressable>
              </>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16, borderRadius: 24, gap: 14, overflow: 'hidden', boxShadow: '0 8px 20px rgba(23,81,240,0.18)' },
  glow: { position: 'absolute', width: 144, height: 144, top: -32, right: -32, borderRadius: 72, backgroundColor: '#FFFFFF26', boxShadow: '0 0 24px 12px rgba(255,255,255,0.12)' },
  headingRow: { flexWrap: 'wrap', alignItems: 'flex-start' },
  headingText: { flex: 1, minWidth: 150, gap: 4 },
  heading: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  white: { color: '#FFFFFF' },
  viewAll: { minHeight: 44, paddingHorizontal: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1751F0', boxShadow: '0 3px 8px rgba(23,81,240,0.22)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  tile: { minHeight: 88, borderRadius: 16, paddingHorizontal: 4, paddingVertical: 5, alignItems: 'center', justifyContent: 'space-between', gap: 2, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFFFFFCC', boxShadow: '0 3px 6px rgba(23,48,102,0.12)' },
  lockedTile: { backgroundColor: '#EDF3FC', borderColor: '#CEDAF0', boxShadow: '0 2px 4px rgba(23,48,102,0.06)' },
  tileTitle: { color: palette.navy, textAlign: 'center', fontSize: 10, lineHeight: 14 },
  badge: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10 },
  lock: { position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  shine: { position: 'absolute', width: 10, height: 55, backgroundColor: '#FFFFFF66' },
  list: { gap: 10 },
  detail: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  detailText: { flex: 1, minWidth: 0, gap: 6 },
  detailTitle: { fontFamily: 'AuthPoppins-SemiBold', fontSize: 13, lineHeight: 20, color: palette.navy },
  scrim: { flex: 1, padding: 24, backgroundColor: '#080F3866', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '100%', maxWidth: 420, maxHeight: '85%' },
  modalContent: { padding: 20, gap: 14 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  continue: { borderRadius: 16, backgroundColor: '#1751F0', padding: 12, alignItems: 'center' },
});
