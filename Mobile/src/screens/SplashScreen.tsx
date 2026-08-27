import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AtomSplashVisual } from '../components/illustrations/AtomSplashVisual';

export const SplashScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Compute responsive visual dimensions for any device size
  const visualSize = Math.min(width * 0.88, height * 0.44, 340);

  useEffect(() => {
    contentOpacity.value = withDelay(
      150,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    contentTranslateY.value = withDelay(
      150,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 justify-between px-7 pt-2 pb-6" style={styles.container}>
      {/* Background radial cosmic glow and subtle dark accents */}
      <View style={styles.glowTop} />
      <View style={styles.cornerShape} />

      {/* Top Visual Area: Orbital Atom, Concentric Rings & 3D Purple Cube */}
      <View className="items-center justify-center flex-1">
        <AtomSplashVisual size={visualSize} />
      </View>

      {/* Bottom Content Area: Left-aligned Typography, CTA Button & Pagination Dots */}
      <Animated.View style={[animatedContentStyle, { width: '100%' }]} className="pb-1">
        {/* Headlines */}
        <View className="mb-10 mx-7">
          <Text className="text-4xl font-bold text-white tracking-tight ">
            Physics{'\n'}AR 3D Viewer
          </Text>

          <Text className="text-base font-normal text-slate-300/80 mt-3 leading-6">
            Bring diagrams to life{'\n'}in 3D Augmented Reality
          </Text>
        </View>

        {/* Primary Purple Button */}
        <Pressable
          onPress={handleGetStarted}
          className="w-[90%] mx-auto h-14 rounded-2xl bg-primary items-center justify-center shadow-lg active:scale-[0.98] active:bg-primary-dark"
          style={styles.buttonShadow}
        >
          <Text className="text-base font-bold text-white tracking-wide">
            Get Started
          </Text>
        </Pressable>

        {/* Centered Pagination Indicator */}
        <View className="flex-row items-center justify-center my-7 space-x-2">
          {/* Active pill dot */}
          <View className="w-6 h-1.5 rounded-full bg-white mr-1.5" />
          {/* Inactive subtle dots */}
          <View className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1.5" />
          <View className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#080C24',
  },
  glowTop: {
    position: 'absolute',
    top: '12%',
    left: '10%',
    right: '10%',
    height: 300,
    backgroundColor: '#4B35C8',
    opacity: 0.2,
    borderRadius: 150,
    filter: 'blur(60px)',
  },
  cornerShape: {
    position: 'absolute',
    bottom: -35,
    left: -35,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(15, 23, 60, 0.45)',
  },
  buttonShadow: {
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default SplashScreen;
