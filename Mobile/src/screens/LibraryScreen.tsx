import { router } from 'expo-router';
import { Box, ChevronRight, Search, Sparkles, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { SINDH_PHYSICS_CHAPTERS } from '../data/physicsTopics';

export const LibraryScreen: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const classFilters: ('All' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12')[] = [
    'All',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  const filteredChapters = useMemo(() => {
    return SINDH_PHYSICS_CHAPTERS.filter((chapter) => {
      const matchesClass = selectedClass === 'All' || chapter.classLevel === selectedClass;
      const matchesSearch =
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [selectedClass, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Explore Physics"
        rightIcon="none"
        onBack={() => router.replace('/(tabs)')}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-[#E2E8F0] shadow-sm mb-4">
          <Search size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search chapters, topics, diagrams..."
            placeholderTextColor="#64748B"
            className="flex-1 ml-3 text-sm text-[#0F172A] py-1"
          />
        </View>

        {/* Class Filter Chips */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {classFilters.map((filter) => {
              const isSelected = selectedClass === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedClass(filter)}
                  className={`px-4 py-2 rounded-xl mr-2 border ${
                    isSelected
                      ? 'bg-[#2563EB] border-[#2563EB] shadow-sm'
                      : 'bg-white border-[#E2E8F0] active:bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-[#475569]'
                    }`}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Chapters Section Heading */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-extrabold text-[#0F172A]">
            Sindh Board Curriculum ({filteredChapters.length})
          </Text>
        </View>

        {/* Empty State */}
        {filteredChapters.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 border border-[#E2E8F0] items-center justify-center my-6">
            <View className="w-14 h-14 rounded-2xl bg-[#EFF6FF] items-center justify-center mb-3">
              <Search size={24} color="#2563EB" />
            </View>
            <Text className="text-base font-bold text-[#0F172A] mb-1">No chapters found</Text>
            <Text className="text-xs text-[#64748B] text-center">
              Try searching with a different keyword or select another class filter.
            </Text>
          </View>
        ) : (
          /* Chapter Cards List */
          <View className="gap-3">
            {filteredChapters.map((chapter) => (
              <Pressable
                key={chapter.id}
                onPress={() => {
                  router.push({
                    pathname: '/electricity',
                    params: { chapterId: chapter.id },
                  });
                }}
                className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm active:bg-gray-50/80"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    {/* Chapter Number Badge */}
                    <View className="w-12 h-12 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#DBEAFE]">
                      <Text className="text-base font-black text-[#2563EB]">
                        {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-[10px] font-black tracking-wider text-[#2563EB] uppercase mr-2">
                          {chapter.classLevel}
                        </Text>
                        <View className="bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                          <Text className="text-[10px] font-semibold text-[#475569]">
                            {chapter.difficulty}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-base font-bold text-[#0F172A] mt-0.5" numberOfLines={1}>
                        {chapter.title}
                      </Text>
                    </View>
                  </View>

                  {/* AR Available Badge */}
                  {chapter.hasAR && (
                    <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 rounded-full flex-row items-center">
                      <Box size={12} color="#2563EB" />
                      <Text className="text-[10px] font-extrabold text-[#2563EB] ml-1">AR</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                <Text className="text-xs text-[#64748B] leading-5 mb-3" numberOfLines={2}>
                  {chapter.description}
                </Text>

                {/* Bottom Stats & Progress */}
                <View className="pt-2 border-t border-[#F1F5F9] flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-[11px] font-semibold text-[#64748B] mr-3">
                      ⏱ {chapter.estimatedTime}
                    </Text>
                    <Text className="text-[11px] font-semibold text-[#64748B]">
                      📝 {chapter.practiceCount} Practice Items
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-xs font-bold text-[#2563EB] mr-1">{chapter.progress}%</Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default LibraryScreen;
