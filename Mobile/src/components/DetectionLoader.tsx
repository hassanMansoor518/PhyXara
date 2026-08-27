import { Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface DetectionLoaderProps {
  onComplete: () => void;
  detectedName?: string;
}

export const DetectionLoader: React.FC<DetectionLoaderProps> = ({
  onComplete,
  detectedName = 'Electric Motor',
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
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center px-8 w-full">
      {/* Large Green Check Circle */}
      <Animated.View
        style={[badgeAnimatedStyle, styles.glowShadow]}
        className="w-24 h-24 rounded-full bg-success items-center justify-center mb-6 border-4 border-white/80"
      >
        <Check size={48} color="#FFFFFF" strokeWidth={3.5} />
      </Animated.View>

      {/* Title */}
      <Text className="text-2xl font-extrabold text-white text-center mb-1">
        Diagram Detected!
      </Text>

      {/* Detected Object Name */}
      <Text className="text-lg font-bold text-cyan text-center mb-6">
        {detectedName}
      </Text>

      {/* Progress Card Container */}
      <View className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-semibold text-white/80">Loading 3D Model...</Text>
          <Text className="text-xs font-bold text-cyan">{percentage}%</Text>
        </View>

        {/* Animated Progress Track */}
        <View className="h-2.5 bg-black/40 rounded-full overflow-hidden">
          <View
            className="h-full bg-success rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glowShadow: {
    shadowColor: '#32C978',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
});

export default DetectionLoader;
