import { router } from 'expo-router';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  Lock,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { SINDH_PHYSICS_CHAPTERS } from '../data/physicsTopics';
import { Achievement, progressService, UserStats } from '../services/progressService';

export const ProgressScreen: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    xp: 120,
    streak: 7,
    questionsAnswered: 18,
    quizzesCompleted: 4,
    chaptersCompleted: 2,
    modelsExplored: 6,
    overallProgress: 72,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await progressService.getStats();
    const a = await progressService.getAchievements();
    setStats(s);
    setAchievements(a);
  };

  const getAchievementIcon = (iconName: string, unlocked: boolean) => {
    const color = unlocked ? '#2563EB' : '#94A3B8';
    switch (iconName) {
      case 'Flame':
        return <Flame size={20} color={unlocked ? '#F59E0B' : '#94A3B8'} />;
      case 'Trophy':
        return <Trophy size={20} color={unlocked ? '#F59E0B' : '#94A3B8'} />;
      case 'Award':
        return <Award size={20} color={color} />;
      case 'Sparkles':
        return <Sparkles size={20} color={unlocked ? '#7C3AED' : '#94A3B8'} />;
      case 'GraduationCap':
        return <GraduationCap size={20} color={color} />;
      default:
        return <Zap size={20} color={color} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Learning Progress"
        rightIcon="none"
        onBack={() => router.replace('/(tabs)')}
      />

      {/* Segmented Switcher */}
      <View className="px-5 pt-1 pb-3">
        <View className="flex-row bg-[#EFF6FF] p-1 rounded-2xl border border-[#E2E8F0]">
          <Pressable
            onPress={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'overview' ? 'bg-[#2563EB] shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === 'overview' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Overview & Chapters
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('achievements')}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'achievements' ? 'bg-[#2563EB] shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === 'achievements' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Achievements
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' ? (
          <>
            {/* Overall Progress Banner */}
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Physics Mastery (Sindh Board)
                  </Text>
                  <Text className="text-2xl font-black text-[#0F172A] mt-0.5">
                    Overall Progress
                  </Text>
                </View>
                <View className="w-14 h-14 rounded-2xl bg-[#EFF6FF] items-center justify-center border border-[#DBEAFE]">
                  <Text className="text-lg font-black text-[#2563EB]">{stats.overallProgress}%</Text>
                </View>
              </View>

              {/* Progress Track */}
              <View className="h-3 bg-[#EFF6FF] rounded-full overflow-hidden mb-3 border border-[#E2E8F0]">
                <View
                  className="h-full bg-[#2563EB] rounded-full"
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </View>

              <Text className="text-xs text-[#64748B] leading-relaxed">
                You've completed 2 chapters and 18 interactive questions. Keep going to reach Level 5!
              </Text>
            </View>

            {/* Statistics 2x2 Grid */}
            <View className="mb-5">
              <Text className="text-base font-extrabold text-[#0F172A] mb-3">Statistics</Text>
              <View className="gap-2.5">
                <View className="flex-row gap-2.5">
                  {/* Stat 1: Total XP */}
                  <View className="flex-1 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
                    <View className="w-9 h-9 rounded-xl bg-[#EFF6FF] items-center justify-center mb-2">
                      <Zap size={18} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-black text-[#0F172A]">{stats.xp}</Text>
                    <Text className="text-xs font-semibold text-[#64748B] mt-0.5">Total XP Earned</Text>
                  </View>

                  {/* Stat 2: Day Streak */}
                  <View className="flex-1 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
                    <View className="w-9 h-9 rounded-xl bg-[#FEF3C7] items-center justify-center mb-2">
                      <Flame size={18} color="#F59E0B" />
                    </View>
                    <Text className="text-2xl font-black text-[#0F172A]">{stats.streak} Days</Text>
                    <Text className="text-xs font-semibold text-[#64748B] mt-0.5">Current Streak</Text>
                  </View>
                </View>

                <View className="flex-row gap-2.5">
                  {/* Stat 3: Quizzes Completed */}
                  <View className="flex-1 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
                    <View className="w-9 h-9 rounded-xl bg-[#F3E8FF] items-center justify-center mb-2">
                      <Trophy size={18} color="#7C3AED" />
                    </View>
                    <Text className="text-2xl font-black text-[#0F172A]">{stats.quizzesCompleted}</Text>
                    <Text className="text-xs font-semibold text-[#64748B] mt-0.5">Quizzes Finished</Text>
                  </View>

                  {/* Stat 4: Models Explored */}
                  <View className="flex-1 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
                    <View className="w-9 h-9 rounded-xl bg-[#E0F2FE] items-center justify-center mb-2">
                      <TrendingUp size={18} color="#06B6D4" />
                    </View>
                    <Text className="text-2xl font-black text-[#0F172A]">{stats.modelsExplored}</Text>
                    <Text className="text-xs font-semibold text-[#64748B] mt-0.5">3D Models Viewed</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Chapter Breakdown */}
            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-extrabold text-[#0F172A]">Chapter Breakdown</Text>
                <Pressable onPress={() => router.push('/library')}>
                  <Text className="text-xs font-bold text-[#2563EB]">View all</Text>
                </Pressable>
              </View>

              <View className="gap-2.5">
                {SINDH_PHYSICS_CHAPTERS.slice(0, 5).map((chapter) => (
                  <Pressable
                    key={chapter.id}
                    onPress={() => router.push('/electricity')}
                    className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm active:bg-gray-50/80"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-8 h-8 rounded-xl bg-[#EFF6FF] items-center justify-center mr-2.5">
                          <Text className="text-xs font-extrabold text-[#2563EB]">
                            {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-[#0F172A] flex-1" numberOfLines={1}>
                          {chapter.title}
                        </Text>
                      </View>
                      <Text className="text-xs font-extrabold text-[#2563EB]">{chapter.progress}%</Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden w-full">
                      <View
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{ width: `${chapter.progress}%` }}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Achievements List */
          <View className="gap-3">
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-black text-[#0F172A]">Unlocked Badges</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">
                    {achievements.filter((a) => a.unlocked).length} of {achievements.length} achieved
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-[#FEF3C7] items-center justify-center border border-[#FDE68A]">
                  <Trophy size={22} color="#F59E0B" />
                </View>
              </View>
            </View>

            {achievements.map((item) => (
              <View
                key={item.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  item.unlocked ? 'border-[#E2E8F0]' : 'border-[#E2E8F0] opacity-80'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1 mr-2">
                    <View
                      className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${
                        item.unlocked ? 'bg-[#EFF6FF]' : 'bg-[#F1F5F9]'
                      }`}
                    >
                      {getAchievementIcon(item.icon, item.unlocked)}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-[#0F172A]">{item.title}</Text>
                        {item.unlocked ? (
                          <CheckCircle2 size={14} color="#16A34A" style={{ marginLeft: 6 }} />
                        ) : (
                          <Lock size={13} color="#94A3B8" style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      <Text className="text-xs text-[#64748B] mt-0.5">{item.description}</Text>

                      {/* Progress bar if in progress */}
                      {!item.unlocked && (
                        <View className="mt-2.5">
                          <View className="flex-row justify-between mb-1">
                            <Text className="text-[10px] font-semibold text-[#64748B]">Progress</Text>
                            <Text className="text-[10px] font-bold text-[#2563EB]">{item.progress}%</Text>
                          </View>
                          <View className="h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden w-full">
                            <View
                              className="h-full bg-[#2563EB] rounded-full"
                              style={{ width: `${item.progress}%` }}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-[#2563EB]">+{item.rewardXP} XP</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar activeTab="progress" />
    </SafeAreaView>
  );
};

export default ProgressScreen;
