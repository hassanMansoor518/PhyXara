import { router } from 'expo-router';
import { Pause, Play, RotateCcw, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { ElectricMotorAnimatedSvg } from '../components/illustrations/ElectricMotorAnimatedSvg';

export const AnimationScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgressSeconds((prev) => (prev >= 5 ? 0 : Number((prev + 0.1).toFixed(1))));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setProgressSeconds(0);
    setIsPlaying(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Working Animation"
        rightIcon="star"
        isStarred={isStarred}
        onRightPress={() => setIsStarred(!isStarred)}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}>
        {/* Title */}
        <View className="items-center mb-3">
          <Text className="text-xl font-black text-[#0F172A]">DC Motor in Motion</Text>
          <Text className="text-xs text-[#64748B] mt-0.5">Lorentz Force & Magnetic Induction Simulation</Text>
        </View>

        {/* Animation Visual Stage */}
        <View className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-4 items-center justify-center shadow-sm overflow-hidden mb-4">
          <ElectricMotorAnimatedSvg isPlaying={isPlaying} width={300} height={230} />

          {/* Indicators Legend */}
          <View className="flex-row items-center justify-around w-full mt-2 pt-3 border-t border-[#F1F5F9]">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-[#06B6D4] mr-1.5" />
              <Text className="text-[11px] font-bold text-[#0F172A]">Magnetic Field (B)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-[#F59E0B] mr-1.5" />
              <Text className="text-[11px] font-bold text-[#0F172A]">Current Flow (I)</Text>
            </View>
          </View>
        </View>

        {/* Playback Controls & Slider */}
        <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-4">
          {/* Progress track */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-black text-[#2563EB]">{progressSeconds.toFixed(1)}s</Text>
            <Text className="text-xs font-bold text-[#64748B]">5.0s</Text>
          </View>
          <View className="h-2 bg-[#EFF6FF] rounded-full overflow-hidden mb-4 border border-[#E2E8F0]">
            <View
              className="h-full bg-[#2563EB] rounded-full"
              style={{ width: `${(progressSeconds / 5) * 100}%` }}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-center space-x-4">
            {/* Reset */}
            <Pressable
              onPress={handleReset}
              className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center active:bg-gray-100 mr-3"
            >
              <RotateCcw size={18} color="#64748B" />
            </Pressable>

            {/* Play/Pause Button */}
            <Pressable
              onPress={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-2xl bg-[#2563EB] items-center justify-center shadow-md active:bg-[#1D4ED8]"
            >
              {isPlaying ? (
                <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={22} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </Pressable>
          </View>
        </View>

        {/* How It Works Explanation Card */}
        <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-xl bg-[#EFF6FF] items-center justify-center mr-2.5 border border-[#DBEAFE]">
              <Zap size={16} color="#2563EB" />
            </View>
            <Text className="text-sm font-extrabold text-[#0F172A]">How it works?</Text>
          </View>

          <Text className="text-xs text-[#475569] leading-5 mb-3">
            When current flows through the coil in the magnetic field, it experiences equal and opposite Lorentz forces on opposite arms according to Fleming’s Left Hand Rule.
          </Text>

          <View className="bg-[#EFF6FF] rounded-2xl p-3 border border-[#DBEAFE]">
            <Text className="text-[11px] font-semibold text-[#0F172A]">
              💡 Torque Formula: τ = N * I * A * B * sin(θ).
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnimationScreen;
