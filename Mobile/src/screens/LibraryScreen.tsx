import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppHeader } from '../components/AppHeader';
import { TopicCard } from '../components/TopicCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { LIBRARY_TOPICS } from '../data/physicsTopics';

export const LibraryScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Physics' | 'Chemistry' | 'Math'>('Physics');

  const categories: ('All' | 'Physics' | 'Chemistry' | 'Math')[] = [
    'All',
    'Physics',
    'Chemistry',
    'Math',
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Library"
        rightIcon="none"
        onBack={() => router.replace('/(tabs)')}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
        {/* Category Filter Pills */}
        <View className="flex-row items-center justify-between mb-5 bg-white p-1 rounded-2xl border border-border shadow-sm">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`flex-1 py-2 rounded-xl items-center justify-center ${
                  isSelected ? 'bg-primary shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-muted'
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 2-Column Grid of Topics */}
        <View className="flex-row flex-wrap justify-between -mx-1.5">
          {LIBRARY_TOPICS.map((topic) => (
            <View key={topic.id} className="w-1/2 p-1.5">
              <TopicCard
                topic={topic}
                variant="grid"
                onPress={() => {
                  if (topic.id === 'electricity') {
                    router.push('/electricity');
                  } else {
                    router.push('/electricity'); // For MVP, opens interactive topic
                  }
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default LibraryScreen;
