import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScanLine, Box, Lightbulb } from 'lucide-react-native';
import { LabApparatusIllustration } from '../components/illustrations/LabApparatusIllustration';
import { PrimaryButton } from '../components/PrimaryButton';
import { authService } from '../services/authService';

export const OnboardingScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    } else {
      await authService.setOnboardingDone();
      router.push('/login');
    }
  };

  const handleSkip = async () => {
    await authService.setOnboardingDone();
    router.push('/login');
  };

  const features = [
    {
      icon: <ScanLine size={20} color="#6C4DFF" />,
      title: 'Scan Diagram',
      desc: 'Point your camera at physics diagrams in books',
    },
    {
      icon: <Box size={20} color="#6C4DFF" />,
      title: 'View in 3D',
      desc: 'Interact with high-detail 3D apparatus and components',
    },
    {
      icon: <Lightbulb size={20} color="#6C4DFF" />,
      title: 'Understand Easily',
      desc: 'Master complex concepts with animations and AI tutor',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background justify-between">
      {/* Top Bar with Skip */}
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable onPress={handleSkip} hitSlop={10} className="py-2 px-3">
          <Text className="text-sm font-semibold text-primary">Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        {/* Title & Subtitle */}
        <View className="mt-1">
          <Text className="text-2xl font-extrabold text-navy">
            Learn Better{'\n'}with AR
          </Text>
          <Text className="text-sm text-muted mt-2 leading-5">
            Visualize, interact and understand complex physics concepts in 3D.
          </Text>
        </View>

        {/* Physics Laboratory & AR Apparatus Illustration */}
        <LabApparatusIllustration width={310} height={200} />

        {/* 3 Feature cards */}
        <View className="mt-2">
          {features.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center bg-white rounded-2xl p-3.5 border border-border mb-2.5 shadow-sm"
            >
              <View className="w-10 h-10 rounded-xl bg-primary-subtle items-center justify-center mr-3">
                {item.icon}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-navy">{item.title}</Text>
                <Text className="text-xs text-muted mt-0.5">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Next button & Pagination Dots */}
      <View className="px-6 pb-6 pt-2 bg-background">
        <PrimaryButton
          title={currentPage === 2 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          className="w-full shadow-md"
        />

        {/* Pagination indicator dots */}
        <View className="flex-row items-center justify-center mt-5">
          <View
            className={`h-2 rounded-full mr-1.5 transition-all ${
              currentPage === 0 ? 'w-6 bg-primary' : 'w-2 bg-primary/20'
            }`}
          />
          <View
            className={`h-2 rounded-full mr-1.5 transition-all ${
              currentPage === 1 ? 'w-6 bg-primary' : 'w-2 bg-primary/20'
            }`}
          />
          <View
            className={`h-2 rounded-full transition-all ${
              currentPage === 2 ? 'w-6 bg-primary' : 'w-2 bg-primary/20'
            }`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
