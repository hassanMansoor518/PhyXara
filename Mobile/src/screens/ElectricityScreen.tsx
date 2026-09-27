import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Play,
  Share2,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { SINDH_PHYSICS_CHAPTERS } from '../data/physicsTopics';

export const ElectricityScreen: React.FC = () => {
  const params = useLocalSearchParams<{ chapterId?: string }>();
  const chapterId = params.chapterId || 'electricity';

  const chapter =
    SINDH_PHYSICS_CHAPTERS.find((c) => c.id === chapterId) ||
    SINDH_PHYSICS_CHAPTERS.find((c) => c.id === 'electricity') ||
    SINDH_PHYSICS_CHAPTERS[1]; // Kinematics default

  const [activeTab, setActiveTab] = useState<'learn' | 'ar' | 'practice'>('learn');
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title={chapter.title}
        rightIcon="bookmark"
        isStarred={isBookmarked}
        onRightPress={() => {
          setIsBookmarked(!isBookmarked);
          Alert.alert(isBookmarked ? 'Removed from Bookmarks' : 'Saved to Bookmarks');
        }}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Hero Summary Card */}
        <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full">
              <Text className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider">
                {chapter.classLevel} • Chapter {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={13} color="#64748B" />
              <Text className="text-xs text-[#64748B] font-semibold ml-1">{chapter.estimatedTime}</Text>
            </View>
          </View>

          <Text className="text-xl font-extrabold text-[#0F172A] mb-1.5">{chapter.title}</Text>
          <Text className="text-xs text-[#475569] leading-relaxed mb-4">{chapter.description}</Text>

          {/* Progress Row */}
          <View className="pt-3 border-t border-[#F1F5F9]">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs font-bold text-[#64748B]">Chapter Completion</Text>
              <Text className="text-xs font-black text-[#2563EB]">{chapter.progress}%</Text>
            </View>
            <View className="h-2 bg-[#EFF6FF] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: `${chapter.progress}%` }}
              />
            </View>
          </View>
        </View>

        {/* Segmented Navigation Tabs: LEARN | EXPLORE IN AR | PRACTICE */}
        <View className="flex-row bg-[#EFF6FF] p-1 rounded-2xl border border-[#E2E8F0] mb-5">
          <Pressable
            onPress={() => setActiveTab('learn')}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'learn' ? 'bg-[#2563EB] shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === 'learn' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Learn
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('ar')}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'ar' ? 'bg-[#2563EB] shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === 'ar' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Explore in AR
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('practice')}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'practice' ? 'bg-[#2563EB] shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === 'practice' ? 'text-white' : 'text-[#475569]'
              }`}
            >
              Practice
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: LEARN SECTION (Concepts, Definitions, Formulas) */}
        {activeTab === 'learn' && (
          <View className="gap-4">
            {/* Key Concepts */}
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-xl bg-[#EFF6FF] items-center justify-center mr-2.5">
                  <BookOpen size={16} color="#2563EB" />
                </View>
                <Text className="text-base font-extrabold text-[#0F172A]">Key Concepts</Text>
              </View>

              <View className="gap-3">
                {chapter.concepts.map((concept, index) => (
                  <View key={index} className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E2E8F0]">
                    <Text className="text-xs font-bold text-[#0F172A] mb-1">{concept.title}</Text>
                    <Text className="text-xs text-[#475569] leading-5">{concept.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Definitions */}
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-xl bg-[#F0FDF4] items-center justify-center mr-2.5">
                  <CheckCircle2 size={16} color="#16A34A" />
                </View>
                <Text className="text-base font-extrabold text-[#0F172A]">Core Definitions</Text>
              </View>

              <View className="gap-2.5">
                {chapter.definitions.map((def, index) => (
                  <View key={index} className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    <Text className="text-xs font-bold text-[#2563EB] mb-0.5">{def.term}</Text>
                    <Text className="text-xs text-[#475569] leading-5">{def.definition}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Important Formulas */}
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-xl bg-[#FEF3C7] items-center justify-center mr-2.5">
                  <Zap size={16} color="#F59E0B" />
                </View>
                <Text className="text-base font-extrabold text-[#0F172A]">Physics Formulas</Text>
              </View>

              <View className="gap-2.5">
                {chapter.formulas.map((item, index) => (
                  <View key={index} className="bg-[#EFF6FF] rounded-2xl p-3.5 border border-[#DBEAFE] flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-[11px] font-bold text-[#64748B]">{item.name}</Text>
                      <Text className="text-sm font-black text-[#2563EB] mt-0.5">{item.formula}</Text>
                    </View>
                    <View className="w-8 h-8 rounded-xl bg-white items-center justify-center border border-[#DBEAFE]">
                      <Text className="text-xs font-black text-[#2563EB]">{item.symbol}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: EXPLORE IN AR */}
        {activeTab === 'ar' && (
          <View className="gap-4">
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm items-center text-center">
              <View className="w-16 h-16 rounded-3xl bg-[#EFF6FF] items-center justify-center mb-3 border border-[#DBEAFE]">
                <Box size={32} color="#2563EB" />
              </View>

              <Text className="text-lg font-black text-[#0F172A] text-center mb-1">
                Interactive 3D & AR Simulation
              </Text>
              <Text className="text-xs text-[#64748B] text-center mb-5 max-w-[85%] leading-5">
                Experience physics in real-time 3D. Rotate, explode components, and inspect vectors in Augmented Reality.
              </Text>

              {/* Primary Explore Button */}
              <Pressable
                onPress={() => router.push('/motor-viewer')}
                className="w-full bg-[#2563EB] py-3.5 rounded-2xl flex-row items-center justify-center shadow-md active:bg-[#1D4ED8] mb-3"
              >
                <Box size={18} color="#FFFFFF" className="mr-2" />
                <Text className="text-sm font-extrabold text-white ml-2">Explore in AR</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/animation')}
                className="w-full bg-[#EFF6FF] py-3.5 rounded-2xl flex-row items-center justify-center border border-[#DBEAFE] active:bg-[#DBEAFE]"
              >
                <Play size={16} color="#2563EB" fill="#2563EB" className="mr-2" />
                <Text className="text-xs font-bold text-[#2563EB] ml-2">Watch Working Animation</Text>
              </Pressable>
            </View>

            {/* AR Features List */}
            <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
              <Text className="text-sm font-extrabold text-[#0F172A] mb-3">Available 3D Modules</Text>
              <View className="gap-2.5">
                {chapter.arFeatures.map((feat, index) => (
                  <Pressable
                    key={index}
                    onPress={() => router.push('/motor-viewer')}
                    className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex-row items-center justify-between active:bg-gray-100"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-9 h-9 rounded-xl bg-[#EFF6FF] items-center justify-center mr-2.5">
                        <Box size={18} color="#2563EB" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-[#0F172A]">{feat.title}</Text>
                        <Text className="text-[11px] text-[#64748B]">{feat.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: PRACTICE SECTION (MCQs, Quiz, Challenge) */}
        {activeTab === 'practice' && (
          <View className="gap-3">
            <Pressable
              onPress={() => router.push('/quiz')}
              className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-12 h-12 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#DBEAFE]">
                  <Trophy size={22} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#0F172A]">Chapter MCQ Quiz</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">10 Questions • 100 XP</Text>
                </View>
              </View>
              <View className="bg-[#2563EB] px-3.5 py-1.5 rounded-xl">
                <Text className="text-xs font-bold text-white">Start</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/quiz')}
              className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex-row items-center justify-between active:bg-gray-50"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-12 h-12 rounded-2xl bg-[#FEF3C7] items-center justify-center mr-3 border border-[#FDE68A]">
                  <Zap size={22} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#0F172A]">Speed Challenge</Text>
                  <Text className="text-xs text-[#64748B] mt-0.5">Quick 5 Questions • 50 XP</Text>
                </View>
              </View>
              <View className="bg-[#F59E0B] px-3.5 py-1.5 rounded-xl">
                <Text className="text-xs font-bold text-white">Start</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Section 4: AI TUTOR HELPER CARD */}
        <View className="mt-5 bg-white rounded-3xl p-5 border border-[#DBEAFE] shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start flex-1 mr-3">
              <View className="w-10 h-10 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#BFDBFE]">
                <Sparkles size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#0F172A]">
                  Have a question about {chapter.title}?
                </Text>
                <Text className="text-xs text-[#64748B] mt-0.5 leading-4">
                  Get instant step-by-step explanations and formula derivations from your AI Tutor.
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/ai-tutor')}
            className="mt-3 bg-[#EFF6FF] border border-[#BFDBFE] py-2.5 rounded-xl flex-row items-center justify-center active:bg-[#DBEAFE]"
          >
            <Text className="text-xs font-bold text-[#2563EB] mr-1.5">Ask AI Tutor</Text>
            <ArrowRight size={14} color="#2563EB" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default ElectricityScreen;
