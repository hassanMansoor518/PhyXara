import { Check, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface DetectionLoaderProps {
  onComplete: () => void;
  detectedName?: string;
}

export const DetectionLoader: React.FC<DetectionLoaderProps> = ({
  onComplete,
  detectedName = 'Electric Motor (DC)',
}) => {
  const [percentage, setPercentage] = useState(0);
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance spring animation for the checkmark badge
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 400 });

    // Progress counter animation from 0% to 100%
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center px-8 w-full max-w-sm">
      {/* Large Green / Emerald Check Circle */}
      <Animated.View
        style={[badgeAnimatedStyle, styles.glowShadow]}
        className="w-22 h-22 rounded-full bg-[#16A34A] items-center justify-center mb-5 border-4 border-white shadow-xl"
      >
        <Check size={44} color="#FFFFFF" strokeWidth={3.5} />
      </Animated.View>

      {/* Title */}
      <Text className="text-2xl font-black text-[#0F172A] text-center mb-1">
        Diagram Detected!
      </Text>

      {/* Detected Object Name */}
      <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-1.5 rounded-full mb-6 flex-row items-center">
        <Sparkles size={14} color="#2563EB" />
        <Text className="text-sm font-extrabold text-[#2563EB] ml-1.5">{detectedName}</Text>
      </View>

      {/* Progress Card Container */}
      <View className="w-full bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-md">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-bold text-[#64748B]">Preparing 3D AR Experience...</Text>
          <Text className="text-xs font-black text-[#2563EB]">{percentage}%</Text>
        </View>

        {/* Animated Progress Track */}
        <View className="h-2.5 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#E2E8F0]">
          <View
            className="h-full bg-[#2563EB] rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glowShadow: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default DetectionLoader;
