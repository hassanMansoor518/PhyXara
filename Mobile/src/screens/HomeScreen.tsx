import { useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Activity,
  Bell,
  Box,
  ChevronRight,
  FileText,
  Flame,
  Play,
  Ruler,
  Scan,
  Sparkles,
} from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { HeroLabIllustration } from '../components/illustrations/HeroLabIllustration';
import { VernierHeroIllustration } from '../components/illustrations/VernierHeroIllustration';
import { emptyPracticalState, type PracticalState } from '../data/practicalProgress';
import { PhyXaraLogo } from '../components/PhyXaraLogo';
import { emptyStats, Home, useLearningData } from '../services/learningService';

export const HomeScreen: React.FC = () => {
  const { user } = useUser();

  const { data } = useLearningData<Home>('/home');
  const { data: practicalState } = useLearningData<PracticalState>('/practicals/1/state');
  const stats = data?.stats ?? emptyStats;
  const practicalProgress = practicalState ?? emptyPracticalState;
  const practicalCompletion = Math.round(25 * (
    Number(Boolean(practicalProgress.learned)) +
    Number(Boolean(practicalProgress.viewed)) +
    Number(Boolean(practicalProgress.calculated)) +
    Number(practicalProgress.attempts.length > 0)
  ));

  const userName = user?.firstName || user?.fullName || 'Student';
  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
      ? user.firstName.slice(0, 2).toUpperCase()
      : 'SA';
  const userImage = user?.imageUrl;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-[#F8FAFC]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <PhyXaraLogo size={36} />
            <View className="ml-2">
              <View className="flex-row">
                <Text style={styles.poppinsBold} className="text-[17px] text-[#0F172A]">Phy</Text>
                <Text style={styles.poppinsBold} className="text-[17px] text-[#702EFF]">Xara</Text>
              </View>
              <Text style={styles.interMedium} className="text-[9px] text-[#64748B]">AI-Powered AR Learning</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/profile')}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] items-center justify-center"
            >
              <Bell size={18} color="#0F172A" />
              <View className="absolute right-[9px] top-[8px] w-2 h-2 rounded-full bg-[#702EFF]" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/profile')}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              className="w-10 h-10 rounded-full border-2 border-[#702EFF] overflow-hidden items-center justify-center bg-[#702EFF]"
            >
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.poppinsSemiBold} className="text-white text-xs">{userInitials}</Text>
              )}
            </Pressable>
          </View>
        </View>

      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <View className="flex-row items-center">
            <Text style={styles.poppinsBold} className="text-[22px] text-[#0F172A]">Hello, {userName}!</Text>
            <Text className="text-[20px] ml-1">👋</Text>
          </View>
          <Text style={styles.interRegular} className="text-[13px] text-[#64748B] mt-0.5">
            Ready to explore Physics today?
          </Text>
        </View>
        {/* Hero Banner: AR Physics Lab */}
        <View className="mb-6 rounded-[28px] overflow-hidden shadow-lg shadow-blue-500/20">
          <LinearGradient
            colors={['#1751F0', '#2563EB', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Top Badge */}
            <View className="bg-white/20 px-3 py-1 rounded-full self-start mb-2.5">
              <Text className="text-[10px] font-black text-white tracking-widest uppercase">
                AR PHYSICS LAB
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.poppinsBold} className="text-[23px] text-white leading-[29px] mb-1.5">
              Ready to Explore{'\n'}Physics?
            </Text>

            {/* Subtitle */}
            <Text style={styles.interRegular} className="text-xs text-white/90 leading-relaxed max-w-[62%]">
              Scan a diagram and turn your textbook into an interactive 3D experience.
            </Text>

            {/* Action Button */}
            <Pressable
              onPress={() => router.push('/scanner')}
              className="bg-white px-4 py-2.5 rounded-xl self-start flex-row items-center mt-4 shadow-sm active:scale-95"
            >
              <Scan size={16} color="#2563EB" />
              <Text style={styles.interMedium} className="text-xs text-[#2563EB] ml-2">Scan a Diagram</Text>
            </Pressable>

            {/* Right Side Illustration */}
            <View style={[styles.heroIllustrationContainer, { pointerEvents: 'none' }]}>
              <HeroLabIllustration width={155} height={145} />
            </View>
          </LinearGradient>
        </View>

        {/* Continue Learning Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A]">Continue Learning</Text>
            <Pressable onPress={() => router.push('/library')}>
              <Text style={styles.interMedium} className="text-xs text-[#2563EB]">View all</Text>
            </Pressable>
          </View>

          {/* Continue Learning Card */}
          <Pressable
            onPress={() => router.push({ pathname: '/practical', params: { experiment: '1' } })}
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm flex-row items-center active:bg-gray-50/80"
          >
            {/* Chapter Number Badge */}
            <View className="w-14 h-14 rounded-2xl bg-[#3B5AF6] items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-xl font-black text-white">01</Text>
            </View>

            {/* Chapter Info & Progress */}
            <View className="flex-1 justify-center">
              <Text className="text-[10px] font-black tracking-wider text-[#2563EB] uppercase mb-0.5">
                Class 9 • Practical 01
              </Text>
              <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A] mb-1">
                Cross-sectional area
              </Text>

              <View className="flex-row items-center justify-between mb-1">
                <Text style={styles.interRegular} className="text-[11px] text-[#64748B]">
                  {practicalCompletion === 100 ? 'Completed' : practicalCompletion ? 'In progress' : 'Start practical'}
                </Text>
                <Text style={styles.interMedium} className="text-[11px] text-[#2563EB]">{practicalCompletion}%</Text>
              </View>

              {/* Progress Bar */}
              <View className="h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden w-full border border-[#E2E8F0]/40">
                <LinearGradient
                  colors={['#06B6D4', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${practicalCompletion}%`, height: '100%', borderRadius: 999 }}
                />
              </View>
            </View>

            {/* Play Button */}
            <View className="w-11 h-11 rounded-full bg-[#2563EB] items-center justify-center ml-3 shadow-md shadow-blue-500/25">
              <Play size={17} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
            </View>
          </Pressable>
        </View>

        {/* Quick Actions Section */}
        <View className="mb-6">
          <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A] mb-3">Quick Actions</Text>

          {/* 2x2 Grid */}
          <View className="gap-2.5">
            {/* Row 1 */}
            <View className="flex-row gap-2.5">
              {/* Scan Diagram */}
              <Pressable
                onPress={() => router.push('/scanner')}
                className="flex-1 bg-[#E6F8F8] border border-[#CDF0F0] rounded-2xl p-3.5 flex-row items-center justify-between active:opacity-85 shadow-sm"
              >
                <View className="flex-row items-center">
                  <Scan size={18} color="#0EA5E9" />
                  <Text className="text-xs font-bold text-[#0369A1] ml-2.5">Scan Diagram</Text>
                </View>
                <ChevronRight size={16} color="#0EA5E9" />
              </Pressable>

              {/* Ask AI */}
              <Pressable
                onPress={() => router.push('/ai-tutor')}
                className="flex-1 bg-[#F3EAFD] border border-[#E8DAFD] rounded-2xl p-3.5 flex-row items-center justify-between active:opacity-85 shadow-sm"
              >
                <View className="flex-row items-center">
                  <Sparkles size={18} color="#8B5CF6" />
                  <Text className="text-xs font-bold text-[#6D28D9] ml-2.5">Ask AI</Text>
                </View>
                <ChevronRight size={16} color="#8B5CF6" />
              </Pressable>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-2.5">
              {/* Practice Quiz */}
              <Pressable
                onPress={() => router.push('/quiz')}
                className="flex-1 bg-[#FEF6E6] border border-[#FDE5BE] rounded-2xl p-3.5 flex-row items-center justify-between active:opacity-85 shadow-sm"
              >
                <View className="flex-row items-center">
                  <FileText size={18} color="#D97706" />
                  <Text className="text-xs font-bold text-[#B45309] ml-2.5">Practice Quiz</Text>
                </View>
                <ChevronRight size={16} color="#D97706" />
              </Pressable>

              {/* Explore 3D */}
              <Pressable
                onPress={() => router.push('/library')}
                className="flex-1 bg-[#EDF5FF] border border-[#D5E6FE] rounded-2xl p-3.5 flex-row items-center justify-between active:opacity-85 shadow-sm"
              >
                <View className="flex-row items-center">
                  <Box size={18} color="#2563EB" />
                  <Text className="text-xs font-bold text-[#1D4ED8] ml-2.5">Explore 3D</Text>
                </View>
                <ChevronRight size={16} color="#2563EB" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Learning Progress Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A]">Learning Progress</Text>
            {/* Streak Pill */}
            <View className="bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-1 rounded-full flex-row items-center">
              <Flame size={12} color="#D97706" fill="#F59E0B" />
              <Text className="text-[10px] font-extrabold text-[#B45309] ml-1">
                {stats.streak} day streak
              </Text>
            </View>
          </View>

          {/* Light Theme Stats Banner */}
          <Pressable
            onPress={() => router.push('/progress')}
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50"
          >
            {/* Stat 1: XP */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-black text-[#0F172A]">{stats.xp}</Text>
              <Text className="text-[11px] text-[#64748B] font-medium mt-0.5">XP earned</Text>
            </View>

            {/* Divider */}
            <View className="w-[1px] h-8 bg-[#E2E8F0]" />

            {/* Stat 2: Questions */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-black text-[#0F172A]">{stats.questionsAnswered}</Text>
              <Text className="text-[11px] text-[#64748B] font-medium mt-0.5">Questions</Text>
            </View>

            {/* Divider */}
            <View className="w-[1px] h-8 bg-[#E2E8F0]" />

            {/* Stat 3: Chapters */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-black text-[#0F172A]">{stats.chaptersCompleted}</Text>
              <Text className="text-[11px] text-[#64748B] font-medium mt-0.5">Chapters</Text>
            </View>
          </Pressable>
        </View>

        {/* Popular Practicals */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A]">Popular Practicals</Text>
            <Pressable onPress={() => router.push('/library')}>
              <Text style={styles.interMedium} className="text-xs text-[#2563EB]">View all</Text>
            </Pressable>
          </View>

          <View className="gap-2.5">
            {[
              { number: 1, title: 'Vernier Calipers', description: 'Measure diameter and depth of a solid cylinder.', difficulty: 'Beginner', kind: 'vernier' },
              { number: 3, title: 'Micrometer Screw Gauge', description: 'Measure the thickness of a strip or wire accurately.', difficulty: 'Beginner', kind: 'micrometer' },
              { number: 11, title: 'Simple Pendulum', description: 'Determine gravitational acceleration using oscillations.', difficulty: 'Intermediate', kind: 'pendulum' },
            ].map((practical) => (
              <Pressable
                key={practical.number}
                onPress={() => router.push({ pathname: '/practical', params: { experiment: String(practical.number) } })}
                className="bg-white rounded-2xl p-3 border border-[#E2E8F0] shadow-sm flex-row items-center active:bg-gray-50"
              >
                <View className="w-20 h-20 rounded-2xl border border-[#DBEAFE] overflow-hidden bg-[#EFF6FF] items-center justify-center shrink-0">
                  {practical.kind === 'vernier' ? (
                    <VernierHeroIllustration width={80} height={80} />
                  ) : practical.kind === 'micrometer' ? (
                    <Ruler size={34} color="#2563EB" />
                  ) : (
                    <Activity size={34} color="#702EFF" />
                  )}
                </View>

                <View className="flex-1 ml-3 min-w-0">
                  <View className="flex-row items-center justify-between">
                    <Text style={styles.poppinsSemiBold} className="text-[14px] text-[#0F172A] flex-1" numberOfLines={1}>
                      {practical.title}
                    </Text>
                    <View className="bg-[#F1F5F9] px-2 py-0.5 rounded-full ml-2">
                      <Text style={styles.interMedium} className="text-[9px] text-[#64748B]">{practical.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.interRegular} className="text-[11px] leading-[16px] text-[#64748B] mt-1" numberOfLines={2}>
                    {practical.description}
                  </Text>
                  <View className="items-end mt-1">
                    <View className="px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#E0E7FF]">
                      <Text style={styles.interMedium} className="text-[10px] text-[#2563EB]">Explore</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  poppinsBold: { fontFamily: 'AuthPoppins-Bold' },
  poppinsSemiBold: { fontFamily: 'AuthPoppins-SemiBold' },
  interRegular: { fontFamily: 'AuthInter-Regular' },
  interMedium: { fontFamily: 'AuthInter-Medium' },
  avatarImage: { width: 36, height: 36 },
  heroBanner: {
    padding: 20,
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  heroIllustrationContainer: {
    position: 'absolute',
    right: -8,
    bottom: 0,
  },
});

export default HomeScreen;
