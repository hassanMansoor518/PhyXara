import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { class9Labs } from '../data/class9Labs';
import { ClassBannerAtomSvg } from '../components/illustrations/ClassBannerAtomSvg';
import { learningRequest, Progress, useLearningData } from '../services/learningService';
import { PhysicsChapter, SINDH_PHYSICS_CHAPTERS } from '../data/physicsTopics';

export const LibraryScreen: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<'Class 9' | 'Class 10' | 'Class 11' | 'Class 12'>('Class 9');
  const [searchQuery, setSearchQuery] = useState('');

  const classFilters: ('Class 9' | 'Class 10' | 'Class 11' | 'Class 12')[] = [
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  const { data } = useLearningData<Progress>('/progress');
  const [catalog, setCatalog] = useState<{ key: string; topics: PhysicsChapter[] }>();
  const queryKey = selectedClass + ':' + searchQuery;
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      learningRequest<{ topics: PhysicsChapter[] }>('/topics?classLevel=' + encodeURIComponent(selectedClass) +
        '&q=' + encodeURIComponent(searchQuery)).then(({ topics }) => {
        if (current) setCatalog({ key: queryKey, topics });
      }).catch(() => { if (current) setCatalog(undefined); });
    }, 250);
    return () => { current = false; clearTimeout(timer); };
  }, [selectedClass, searchQuery, queryKey]);

  const fallbackChapters = useMemo(() => {
    return SINDH_PHYSICS_CHAPTERS.filter((chapter) => {
      const matchesClass = chapter.classLevel === selectedClass;
      const matchesSearch =
        chapter.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        chapter.description.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [selectedClass, searchQuery]);

  const filteredChapters = catalog?.key === queryKey ? catalog.topics : fallbackChapters;

  const practicalQuery = searchQuery.trim().toLowerCase();
  const filteredPracticals = class9Labs.map((lab, index) => ({ lab, number: index + 1 }))
    .filter(({ lab, number }) => (lab.title + ' ' + lab.apparatus + ' experiment ' + number)
      .toLowerCase().includes(practicalQuery));

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return (
          <View className="bg-[#DCFCE7] px-2 py-0.5 rounded-md">
            <Text style={styles.interMedium} className="text-[10px] text-[#16A34A]">Easy</Text>
          </View>
        );
      case 'Medium':
        return (
          <View className="bg-[#FEF3C7] px-2 py-0.5 rounded-md">
            <Text style={styles.interMedium} className="text-[10px] text-[#D97706]">Medium</Text>
          </View>
        );
      case 'Hard':
        return (
          <View className="bg-[#F3E8FF] px-2 py-0.5 rounded-md">
            <Text style={styles.interMedium} className="text-[10px] text-[#7C3AED]">Hard</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      <AppHeader
        title="Explore Physics"
        rightIcon="bell"
        onRightPress={() => Alert.alert('Learning updates',
          data ? 'You have unlocked ' + data.achievements.filter(item => item.unlocked).length +
            ' of ' + data.achievements.length + ' badges. View your progress for details.'
            : 'Open your progress to see learning updates and achievements.',
          [
            { text: 'Close', style: 'cancel' },
            { text: 'View progress', onPress: () => router.push('/progress') },
          ])}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >


        {/* Class Filter Chips */}
        <View className="mb-5">
          <View className="flex-row flex-wrap gap-2">
            {classFilters.map((filter) => {
              const isSelected = selectedClass === filter;
              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedClass(filter)}
                  className={`px-3 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-[#0B1528] border-[#0B1528] shadow-sm'
                      : 'bg-white border-[#E2E8F0] active:bg-gray-50'
                  }`}
                >
                  <Text
                    style={styles.interMedium}
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-[#0F172A]'
                    }`}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sindh Textbook Board Banner */}
        <View className="bg-[#0D2444] rounded-[24px] p-5 mb-6 flex-row items-center justify-between shadow-md relative overflow-hidden">
          <View className="flex-1 mr-3">
            <Text style={styles.interMedium} className="text-[9px] tracking-wider text-[#38BDF8] uppercase mb-1">
              SINDH TEXTBOOK BOARD
            </Text>
            <Text style={styles.poppinsBold} className="text-xl text-white mb-1">{selectedClass} Physics</Text>
            <Text style={styles.interRegular} className="text-xs text-[#94A3B8]">
              {selectedClass === 'Class 9' ? '16 practical experiments • 3D apparatus' : 'Chapter theory and activities'}
            </Text>
          </View>

          {/* Right Atom Illustration */}
          <View pointerEvents="none" className="mr-1">
            <ClassBannerAtomSvg width={78} height={78} />
          </View>
        </View>

        {selectedClass === 'Class 9' && (
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-3.5">
              <Text style={styles.poppinsSemiBold} className="text-lg text-[#0F172A]">All Practicals</Text>
              <Text style={styles.interMedium} className="text-xs text-[#94A3B8]">{filteredPracticals.length} practicals</Text>
            </View>
            <View className="gap-3">
              {filteredPracticals.map(({ lab, number }) => (
                <Pressable key={number} accessibilityRole="button"
                  className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm flex-row items-center active:bg-gray-50/80"
                  onPress={() => router.push({ pathname: '/practical', params: { experiment: String(number) } })}>
                  <View className="w-14 h-16 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3.5 border border-[#DBEAFE]/40">
                    <Text style={styles.poppinsBold} className="text-lg text-[#2563EB]">{String(number).padStart(2, '0')}</Text>
                  </View>
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center mb-1">
                      <View className="bg-[#E0F2FE] px-2 py-0.5 rounded-md mr-1.5">
                        <Text style={styles.interMedium} className="text-[9px] text-[#0284C7] uppercase tracking-wide">3D Apparatus</Text>
                      </View>
                      <View className="bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                        <Text style={styles.interMedium} className="text-[10px] text-[#16A34A]">Calculations</Text>
                      </View>
                    </View>
                    <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A]" numberOfLines={2}>{lab.title}</Text>
                    <Text style={styles.interRegular} className="text-xs text-[#64748B] mt-0.5" numberOfLines={1}>PDF pp. {lab.pages} • {lab.apparatus}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </Pressable>
              ))}
              {filteredPracticals.length === 0 && <Text style={styles.interRegular} className="text-sm text-[#64748B]">No practicals match your search.</Text>}
            </View>
          </View>
        )}
        {selectedClass !== 'Class 9' && <>
        {/* All Chapters Section Header */}
        <View className="flex-row items-center justify-between mb-3.5">
          <Text style={styles.poppinsSemiBold} className="text-lg text-[#0F172A]">All Chapters</Text>
          <Text style={styles.interMedium} className="text-xs text-[#94A3B8]">
            {filteredChapters.length} chapters
          </Text>
        </View>

        {/* Chapter Cards List */}
        <View className="gap-3">
          {filteredChapters.map((chapter) => {
            const completion = data?.completedTopicIds.includes(chapter.id) ? 100 : 0;
            const numStr = chapter.number < 10 ? `0${chapter.number}` : `${chapter.number}`;

            return (
              <Pressable
                key={chapter.id}
                onPress={() => {
                  router.push({
                    pathname: '/electricity',
                    params: { chapterId: chapter.id },
                  });
                }}
                className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm flex-row items-center active:bg-gray-50/80"
              >
                {/* Left Chapter Number Badge */}
                <View className="w-14 h-16 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3.5 border border-[#DBEAFE]/40">
                  <Text style={styles.poppinsBold} className="text-lg text-[#2563EB]">{numStr}</Text>
                </View>

                {/* Middle Content */}
                <View className="flex-1 mr-2">
                  {/* Badges Row */}
                  <View className="flex-row items-center mb-1">
                    {chapter.hasAR && (
                      <View className="bg-[#E0F2FE] px-2 py-0.5 rounded-md mr-1.5">
                        <Text style={styles.interMedium} className="text-[9px] text-[#0284C7] uppercase tracking-wide">
                          AR AVAILABLE
                        </Text>
                      </View>
                    )}
                    {getDifficultyBadge(chapter.difficulty)}
                  </View>

                  {/* Chapter Title */}
                  <Text style={styles.poppinsSemiBold} className="text-base text-[#0F172A]" numberOfLines={1}>
                    {chapter.title}
                  </Text>

                  {/* Description */}
                  <Text style={styles.interRegular} className="text-xs text-[#64748B] mt-0.5 mb-2.5" numberOfLines={1}>
                    {chapter.description}
                  </Text>

                  {/* Progress Bar & Percentage */}
                  <View className="flex-row items-center">
                    <View className="h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden flex-1 border border-[#E2E8F0]/40">
                      <LinearGradient
                        colors={['#06B6D4', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: `${completion}%`, height: '100%', borderRadius: 999 }}
                      />
                    </View>
                    {completion > 0 && (
                      <Text style={styles.interMedium} className="text-xs text-[#2563EB] ml-2.5">
                        {completion}%
                      </Text>
                    )}
                  </View>
                </View>

                {/* Right Chevron */}
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            );
          })}
        </View>
        </>}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar activeTab="explore" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  poppinsBold: { fontFamily: 'AuthPoppins-Bold' },
  poppinsSemiBold: { fontFamily: 'AuthPoppins-SemiBold' },
  interRegular: { fontFamily: 'AuthInter-Regular' },
  interMedium: { fontFamily: 'AuthInter-Medium' },
});

export default LibraryScreen;
