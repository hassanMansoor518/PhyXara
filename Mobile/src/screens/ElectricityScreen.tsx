import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppHeader } from '../components/AppHeader';
import { ChapterItem } from '../components/ChapterItem';
import { BottomTabBar } from '../components/BottomTabBar';
import { ElectricBannerSvg } from '../components/illustrations/ElectricBannerSvg';
import { ELECTRICITY_CHAPTERS, ELECTRICITY_DIAGRAMS } from '../data/electricity';
import { Box, ChevronRight } from 'lucide-react-native';

export const ElectricityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'diagrams'>('chapters');
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Electricity"
        rightIcon="bookmark"
        isStarred={isBookmarked}
        onRightPress={() => setIsBookmarked(!isBookmarked)}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 }}>
        {/* Glowing Lightning Hero Banner */}
        <View className="mb-4">
          <ElectricBannerSvg width={350} height={130} />
        </View>

        {/* Segmented Underline Tabs */}
        <View className="flex-row border-b border-border mb-4">
          <Pressable
            onPress={() => setActiveTab('chapters')}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'chapters' ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                activeTab === 'chapters' ? 'text-primary' : 'text-muted'
              }`}
            >
              Chapters
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('diagrams')}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'diagrams' ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                activeTab === 'diagrams' ? 'text-primary' : 'text-muted'
              }`}
            >
              Diagrams
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === 'chapters' ? (
          <View>
            {ELECTRICITY_CHAPTERS.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                onPress={() => router.push('/motor-viewer')}
              />
            ))}
          </View>
        ) : (
          <View>
            {ELECTRICITY_DIAGRAMS.map((diagram) => (
              <Pressable
                key={diagram.id}
                onPress={() => router.push('/motor-viewer')}
                className="bg-white rounded-2xl p-4 border border-border flex-row items-center justify-between mb-3 shadow-sm active:bg-gray-50"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                    <Box size={20} color="#6C4DFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-navy">{diagram.title}</Text>
                    <Text className="text-xs text-primary font-medium mt-0.5">{diagram.views}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#737A96" />
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

export default ElectricityScreen;
