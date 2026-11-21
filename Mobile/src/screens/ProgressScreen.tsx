import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { AchievementSection } from '../components/progress/AchievementSection';
import { PracticalProgressSection } from '../components/progress/ChapterProgressCard';
import { useProgressMotion } from '../components/progress/motion';
import { LearningStatistics, OverallProgressCard } from '../components/progress/ProgressOverview';
import { palette, progressStyles as common } from '../components/progress/theme';
import { emptyStats, Progress, useLearningData, usePracticalOverview } from '../services/learningService';

export const ProgressScreen: React.FC = () => {
  const { data, failed } = useLearningData<Progress>('/progress');
  const practicalOverview = usePracticalOverview();
  const stats = { ...emptyStats, ...practicalOverview.statistics };
  const achievements = practicalOverview.achievements;
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [fontsLoaded] = useFonts({ 'ProgressCaveat-Bold': require('../../assets/fonts/Caveat-Bold.ttf') });
  const motion = useProgressMotion();
  const [entrance] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!motion) { entrance.setValue(1); return; }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: 280, useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [entrance, motion]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <AppHeader title="Your Progress" rightIcon="bell" onRightPress={() => setNotifications(true)} />
      <LinearGradient colors={['#F5F8FF', '#F5F8FF', '#FFFFFF']} style={styles.main}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            {!practicalOverview.loaded && !data && !failed && <View accessibilityRole="progressbar" accessibilityLabel="Loading learning progress" style={styles.message}><ActivityIndicator color={palette.primary} /><Text style={common.body}>Loading your progress…</Text></View>}
            <OverallProgressCard percentage={practicalOverview.percentage} completed={practicalOverview.completed} total={practicalOverview.total} questionsAnswered={practicalOverview.questionsAnswered} motion={motion && fontsLoaded} />
            <LearningStatistics stats={stats} motion={motion} />
            <PracticalProgressSection motion={motion} />
            <AchievementSection loaded={practicalOverview.loaded} achievements={achievements} motion={motion} expanded={expanded} onExpand={() => setExpanded(value => !value)} />
            {practicalOverview.loaded && practicalOverview.completedSections === 0 && <Text style={[common.body, styles.empty]}>Your learning journey starts here. Open a practical and complete its learning sections to build your progress.</Text>}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
      <BottomTabBar activeTab="progress" />
      <Modal visible={notifications} transparent animationType={motion ? 'fade' : 'none'} onRequestClose={() => setNotifications(false)}>
        <View style={styles.scrim}><View accessibilityViewIsModal style={[common.card, styles.modal]}>
          <Text accessibilityRole="header" style={common.title}>Learning updates</Text>
          <Text style={common.body}>{practicalOverview.loaded ? `You have unlocked ${achievements.filter(achievement => achievement.unlocked).length} of ${achievements.length} badges. Explore your achievements to see your next milestones.` : 'Your achievements will appear here once your progress is loaded.'}</Text>
          <Pressable accessibilityRole="button" onPress={() => { setNotifications(false); setExpanded(true); }} style={common.action}><Text style={common.link}>View achievements</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => setNotifications(false)} style={common.action}><Text style={common.link}>Close</Text></Pressable>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  main: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32, flexGrow: 1 },
  content: { width: '100%', maxWidth: 540, alignSelf: 'center', gap: 8 },
  message: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  empty: { textAlign: 'center', padding: 16 },
  scrim: { flex: 1, backgroundColor: '#080F3866', justifyContent: 'center', padding: 24 },
  modal: { padding: 24, gap: 12, width: '100%', maxWidth: 440, alignSelf: 'center' },
});

export default ProgressScreen;
