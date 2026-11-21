import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { class9Labs } from '../../data/class9Labs';
import { emptyPracticalState, PracticalState } from '../../data/practicalProgress';
import { useLearningData } from '../../services/learningService';
import { AnimatedProgressBar } from './ProgressOverview';
import { palette, progressStyles as common } from './theme';

function PracticalProgressCard({ number, motion }: { number: number; motion: boolean }) {
  const practical = class9Labs[number - 1];
  const { data } = useLearningData<PracticalState>('/practicals/' + number + '/state');
  const progress = data ?? emptyPracticalState;
  const sections = [
    progress.learned && 'Learn',
    progress.viewed && '3D / AR',
    progress.calculated && 'Calculation',
    progress.attempts.length > 0 && 'Quiz',
  ].filter(Boolean);
  const percentage = sections.length * 25;
  const latestAttempt = progress.attempts[0];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={practical.title + ', ' + percentage + '% completed'}
      onPress={() => router.push({ pathname: '/practical', params: { experiment: String(number) } })}
      style={({ pressed }) => [common.card, styles.card, pressed && common.pressed]}>
      <View style={styles.number}><Text style={[common.title, { color: palette.link }]}>{String(number).padStart(2, '0')}</Text></View>
      <View style={styles.details}>
        <View style={common.row}>
          <Text style={styles.name}>{practical.title}</Text>
          <Text style={styles.percent}>{percentage}%</Text>
        </View>
        <AnimatedProgressBar percentage={percentage} motion={motion} />
        <Text style={common.body}>{sections.length} of 4 sections completed · Class 9</Text>
        {sections.length > 0 && <Text style={common.label}>{sections.join(' · ')}</Text>}
        {latestAttempt && <Text style={common.label}>Latest quiz · {latestAttempt.score}/{latestAttempt.total} ({latestAttempt.percentage}%)</Text>}
      </View>
    </Pressable>
  );
}

export function PracticalProgressSection({ motion }: { motion: boolean }) {
  const [index, setIndex] = useState(0);
  return (
    <View style={styles.section}>
      <View style={common.row}>
        <Text accessibilityRole="header" style={common.title}>Practical Progress</Text>
        <Pressable accessibilityRole="link" accessibilityLabel="See all practicals" onPress={() => router.push('/library')} style={common.action}>
          <Text style={common.link}>See All</Text><ArrowRight size={13} color={palette.link} />
        </Pressable>
      </View>
      <PracticalProgressCard key={index} number={index + 1} motion={motion} />
      <View style={styles.pagination}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous practical" disabled={index === 0}
          onPress={() => setIndex(value => value - 1)} style={[styles.pageButton, index === 0 && styles.disabled]}>
          <ArrowLeft size={18} color={palette.link} />
        </Pressable>
        <Text style={common.body}>Practical {index + 1} of {class9Labs.length}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next practical" disabled={index === class9Labs.length - 1}
          onPress={() => setIndex(value => value + 1)} style={[styles.pageButton, index === class9Labs.length - 1 && styles.disabled]}>
          <ArrowRight size={18} color={palette.link} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 4 },
  card: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  number: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.tint, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1, minWidth: 0, gap: 5 },
  name: { flex: 1, fontFamily: 'AuthInter-Medium', fontSize: 13, lineHeight: 18, color: palette.navy },
  percent: { fontFamily: 'AuthInter-Medium', fontSize: 11, lineHeight: 16, color: palette.link, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: palette.tint },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  pageButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.3 },
});
