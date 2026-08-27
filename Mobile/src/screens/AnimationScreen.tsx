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
    <SafeAreaView className="flex-1 bg-background justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Animation"
        rightIcon="star"
        isStarred={isStarred}
        onRightPress={() => setIsStarred(!isStarred)}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {/* Title */}
        <View className="items-center mb-3">
          <Text className="text-xl font-extrabold text-navy">Working Animation</Text>
          <Text className="text-xs text-muted mt-0.5">Lorentz Force & Magnetic Induction</Text>
        </View>

        {/* Animation Visual Stage */}
        <View className="w-full bg-white rounded-3xl border border-border p-4 items-center justify-center shadow-sm overflow-hidden mb-4">
          <ElectricMotorAnimatedSvg isPlaying={isPlaying} width={300} height={230} />

          {/* Glowing Indicators Legend */}
          <View className="flex-row items-center justify-around w-full mt-2 pt-3 border-t border-border/40">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-cyan mr-1.5" />
              <Text className="text-[11px] font-semibold text-navy">Magnetic Field (B)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-warning mr-1.5" />
              <Text className="text-[11px] font-semibold text-navy">Current (I)</Text>
            </View>
          </View>
        </View>

        {/* Playback Controls & Slider */}
        <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-4">
          {/* Progress track */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-bold text-primary">{progressSeconds.toFixed(1)}s</Text>
            <Text className="text-xs font-bold text-muted">5.0s</Text>
          </View>
          <View className="h-2 bg-background rounded-full overflow-hidden mb-4">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(progressSeconds / 5) * 100}%` }}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-center space-x-4">
            {/* Reset */}
            <Pressable
              onPress={handleReset}
              className="w-12 h-12 rounded-2xl bg-background items-center justify-center active:bg-gray-100 mr-3"
            >
              <RotateCcw size={18} color="#737A96" />
            </Pressable>

            {/* Play/Pause Button */}
            <Pressable
              onPress={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-md active:bg-primary-dark"
            >
              {isPlaying ? (
                <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={22} color="#FFFFFF" fill="#FFFFFF" className="ml-0.5" />
              )}
            </Pressable>
          </View>
        </View>

        {/* How It Works Explanation Card */}
        <View className="bg-white rounded-3xl p-5 border border-border shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-xl bg-primary-subtle items-center justify-center mr-2">
              <Zap size={16} color="#6C4DFF" />
            </View>
            <Text className="text-sm font-bold text-navy">How it works?</Text>
          </View>

          <Text className="text-xs text-muted leading-5 mb-3">
            When current flows through the coil, it creates a magnetic field which interacts with the magnetic field of the magnets and produces motion.
          </Text>

          <View className="bg-background rounded-2xl p-3 border border-border/60">
            <Text className="text-[11px] font-semibold text-navy">
              💡 Fleming's Left Hand Rule dictates that opposite sides of the coil experience upward and downward forces simultaneously, creating rotational torque.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnimationScreen;
