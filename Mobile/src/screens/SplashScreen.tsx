import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AtomSplashVisual } from '../components/illustrations/AtomSplashVisual';

export const SplashScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // Visual size — nicely centered
  const visualSize = Math.min(width * 0.75, height * 0.38, 280);

  // --- Animation shared values ---
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);

  const atomScale = useSharedValue(0.7);
  const atomOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(24);

  const barOpacity = useSharedValue(0);
  const shimmerX = useSharedValue(-width);

  useEffect(() => {
    // 1. Logo badge fades + scales in first
    logoOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.4)) });

    // 2. Atom visual
    atomOpacity.value = withDelay(200, withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }));
    atomScale.value = withDelay(200, withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.2)) }));

    // 3. Text block
    textOpacity.value = withDelay(450, withTiming(1, { duration: 550, easing: Easing.out(Easing.ease) }));
    textTranslateY.value = withDelay(450, withTiming(0, { duration: 550, easing: Easing.out(Easing.ease) }));

    // 4. Shimmer bar
    barOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    shimmerX.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(width + 120, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-width, { duration: 0 })
        ),
        -1,
        false
      )
    );

    // Auto-navigate after 2.2 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // --- Animated styles ---
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const atomStyle = useAnimatedStyle(() => ({
    opacity: atomOpacity.value,
    transform: [{ scale: atomScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Background Soft Glows */}
      <View style={styles.glowCenter} />
      <View style={styles.glowBottomLeft} />
      <View style={styles.glowTopRight} />

      {/* Main centered layout */}
      <View style={styles.content}>
        {/* Logo Badge */}
        <Animated.View style={[styles.logoBadge, logoStyle]}>
          <View style={styles.logoBadgeInner}>
            <Text style={styles.logoLetter}>Phy</Text>
            <Text style={styles.logoAccent}>X</Text>
            <Text style={styles.logoLetter}>ara</Text>
          </View>
        </Animated.View>

        {/* Atom Visual */}
        <Animated.View style={[styles.atomWrapper, atomStyle]}>
          <AtomSplashVisual size={visualSize} />
        </Animated.View>

        {/* App Name + Tagline */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.appName}>Physics AR</Text>
          <Text style={styles.appSubName}>3D Learning Lab</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            SCAN → EXPLORE → UNDERSTAND{'\n'}Sindh Textbook Board Physics
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Bar */}
      <Animated.View style={[styles.loaderContainer, barStyle]}>
        <View style={styles.loaderTrack}>
          {/* Shimmer highlight */}
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <Svg width={120} height={4}>
              <Defs>
                <LinearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
                  <Stop offset="50%" stopColor="#2563EB" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="120" height="4" rx="2" fill="url(#shimmerGrad)" />
            </Svg>
          </Animated.View>
        </View>
        <Text style={styles.loaderLabel}>Loading Physics Engine...</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  glowCenter: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
    top: '20%',
    alignSelf: 'center',
  },
  glowBottomLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F9FF',
    opacity: 0.8,
    bottom: '10%',
    left: -60,
  },
  glowTopRight: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F5F3FF',
    opacity: 0.8,
    top: '5%',
    right: -30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoBadge: {
    marginBottom: 4,
  },
  logoBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  logoAccent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  atomWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSubName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: -6,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 8,
  },
  loaderTrack: {
    width: 180,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
