import { useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Award,
  Bell,
  Box,
  ChevronRight,
  FileText,
  Flame,
  Play,
  Scan,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { HeroLabIllustration } from '../components/illustrations/HeroLabIllustration';
import { progressService, UserStats } from '../services/progressService';

export const HomeScreen: React.FC = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats>({
    xp: 120,
    streak: 7,
    questionsAnswered: 18,
    quizzesCompleted: 4,
    chaptersCompleted: 2,
    modelsExplored: 6,
    overallProgress: 72,
  });

  useEffect(() => {
    progressService.getStats().then(setStats);
  }, []);

  const userName = user?.firstName || user?.fullName || 'Student';
  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
      ? user.firstName.slice(0, 2).toUpperCase()
      : 'SA';

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
        {/* User Info */}
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => router.push('/profile')}
            className="w-11 h-11 rounded-2xl bg-[#3B5AF6] items-center justify-center shadow-sm active:opacity-90"
            hitSlop={8}
          >
            <Text className="text-white text-base font-black tracking-tight">{userInitials}</Text>
          </Pressable>

          <View className="ml-3 justify-center">
            <Text className="text-[13px] text-[#64748B] font-medium leading-tight">Good Morning,</Text>
            <Text className="text-xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
              {userName} 👋
            </Text>
          </View>
        </View>

        {/* Notification Bell */}
        <Pressable
          onPress={() => router.push('/profile')}
          className="w-11 h-11 rounded-full bg-white border border-[#E2E8F0] items-center justify-center shadow-sm active:bg-gray-50"
          hitSlop={8}
        >
          <Bell size={19} color="#0F172A" />
        </Pressable>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text className="text-[23px] font-black text-white leading-[29px] mb-1.5">
              Ready to Explore{'\n'}Physics?
            </Text>

            {/* Subtitle */}
            <Text className="text-xs text-white/90 leading-relaxed max-w-[62%]">
              Scan a diagram and turn your textbook into an interactive 3D experience.
            </Text>

            {/* Action Button */}
            <Pressable
              onPress={() => router.push('/scanner')}
              className="bg-white px-4 py-2.5 rounded-xl self-start flex-row items-center mt-4 shadow-sm active:scale-95"
            >
              <Scan size={16} color="#2563EB" />
              <Text className="text-xs font-extrabold text-[#2563EB] ml-2">Scan a Diagram</Text>
            </Pressable>

            {/* Right Side Illustration */}
            <View style={styles.heroIllustrationContainer} pointerEvents="none">
              <HeroLabIllustration width={155} height={145} />
            </View>
          </LinearGradient>
        </View>

        {/* Continue Learning Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-[#0F172A]">Continue Learning</Text>
            <Pressable onPress={() => router.push('/electricity')}>
              <Text className="text-xs font-bold text-[#2563EB]">View all</Text>
            </Pressable>
          </View>

          {/* Continue Learning Card */}
          <Pressable
            onPress={() => router.push('/motor-viewer')}
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm flex-row items-center active:bg-gray-50/80"
          >
            {/* Chapter Number Badge */}
            <View className="w-14 h-14 rounded-2xl bg-[#3B5AF6] items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-xl font-black text-white">02</Text>
            </View>

            {/* Chapter Info & Progress */}
            <View className="flex-1 justify-center">
              <Text className="text-[10px] font-black tracking-wider text-[#2563EB] uppercase mb-0.5">
                CLASS 9 • CHAPTER 02
              </Text>
              <Text className="text-base font-bold text-[#0F172A] mb-1">Kinematics</Text>

              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[11px] text-[#64748B] font-medium">8 of 12 lessons</Text>
                <Text className="text-[11px] font-bold text-[#2563EB]">64%</Text>
              </View>

              {/* Progress Bar */}
              <View className="h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden w-full border border-[#E2E8F0]/40">
                <LinearGradient
                  colors={['#06B6D4', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '64%', height: '100%', borderRadius: 999 }}
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
          <Text className="text-base font-extrabold text-[#0F172A] mb-3">Quick Actions</Text>

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
                onPress={() => router.push('/motor-viewer')}
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

        {/* Today's Progress Section (Clean Light Theme) */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-[#0F172A]">Today's Progress</Text>
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

        {/* Recommended for you Section */}
        <View className="mb-2">
          <Text className="text-base font-extrabold text-[#0F172A] mb-3">Recommended for you</Text>

          <View className="gap-2.5">
            {/* Recommended 1: Explore Newton's Laws */}
            <Pressable
              onPress={() => router.push('/animation')}
              className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50/80"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#DBEAFE]">
                  <Zap size={19} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#0F172A]">Explore Newton's Laws</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">3D lesson • 8 min</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </Pressable>

            {/* Recommended 2: Master Kinematics */}
            <Pressable
              onPress={() => router.push('/electricity')}
              className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50/80"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-2xl bg-[#F5F3FF] items-center justify-center mr-3 border border-[#DDD6FE]">
                  <Target size={19} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#0F172A]">Master Kinematics</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">Practice set • 12 min</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </Pressable>

            {/* Recommended 3: Practice Work & Energy */}
            <Pressable
              onPress={() => router.push('/quiz')}
              className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50/80"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-2xl bg-[#FFFBEB] items-center justify-center mr-3 border border-[#FDE68A]">
                  <Trophy size={19} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#0F172A]">Practice Work & Energy</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">Quiz • 10 questions</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
