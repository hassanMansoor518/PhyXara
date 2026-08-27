import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { SearchBar } from '../components/SearchBar';
import { ProgressCard } from '../components/ProgressCard';
import { TopicCard } from '../components/TopicCard';
import { FeatureCard } from '../components/FeatureCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { POPULAR_TOPICS } from '../data/physicsTopics';

export const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = POPULAR_TOPICS.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 pt-3 pb-2">
        <Pressable
          onPress={() => router.push('/profile')}
          className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center shadow-sm active:bg-gray-100"
          hitSlop={10}
        >
          <Menu size={20} color="#101A43" />
        </Pressable>

        <View className="flex-1 ml-4">
          <Text className="text-base font-extrabold text-navy">Hi, Student 👋</Text>
          <Text className="text-xs text-muted">What do you want to learn today?</Text>
        </View>

        <Pressable
          onPress={() => router.push('/profile')}
          className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center shadow-sm active:bg-gray-100"
          hitSlop={10}
        >
          <Bell size={18} color="#101A43" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="mb-5">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onScanPress={() => router.push('/scanner')}
          />
        </View>

        {/* Continue Learning */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-extrabold text-navy">Continue Learning</Text>
            <Pressable onPress={() => router.push('/electricity')}>
              <Text className="text-xs font-bold text-primary">View All</Text>
            </Pressable>
          </View>

          <ProgressCard
            title="Electric Motor"
            lastViewed="Last viewed • 2d ago"
            progress={75}
            onPress={() => router.push('/motor-viewer')}
          />
        </View>

        {/* Popular Topics */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-navy">Popular Topics</Text>
            <Pressable onPress={() => router.push('/library')}>
              <Text className="text-xs font-bold text-primary">View All</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {filteredTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onPress={() => {
                  if (topic.id === 'electricity') {
                    router.push('/electricity');
                  } else {
                    router.push('/library');
                  }
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Study Tools */}
        <View className="mb-2">
          <Text className="text-base font-extrabold text-navy mb-3">Study Tools</Text>
          <View className="bg-white rounded-3xl p-4 border border-border flex-row items-center justify-between shadow-sm">
            <FeatureCard
              title="AR Scanner"
              icon="scanner"
              onPress={() => router.push('/scanner')}
            />
            <FeatureCard
              title="3D Models"
              icon="3d"
              onPress={() => router.push('/motor-viewer')}
            />
            <FeatureCard
              title="Quiz"
              icon="quiz"
              onPress={() => router.push('/quiz')}
            />
            <FeatureCard
              title="AI Tutor"
              icon="tutor"
              onPress={() => router.push('/ai-tutor')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default HomeScreen;
