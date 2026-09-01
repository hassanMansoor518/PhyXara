import { router } from 'expo-router';
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
import { StatusBar } from 'expo-status-bar';
import { AtomSplashVisual } from '../components/illustrations/AtomSplashVisual';

export const SplashScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // Visual size — nicely centered
  const visualSize = Math.min(width * 0.75, height * 0.38, 300);

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

    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2000);

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
      <StatusBar style="light" />
      {/* === Background Glows === */}
      <View style={styles.glowCenter} />
      <View style={styles.glowBottomLeft} />
      <View style={styles.glowTopRight} />

      {/* === Main centered layout === */}
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
          <Text style={styles.appSubName}>3D Viewer</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Bring physics to life{'\n'}in Augmented Reality
          </Text>
        </Animated.View>
      </View>

      {/* === Bottom Loading Bar === */}
      <Animated.View style={[styles.loaderContainer, barStyle]}>
        <View style={styles.loaderTrack}>
          {/* Shimmer highlight */}
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <Svg width={120} height={4}>
              <Defs>
                <LinearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#6C4DFF" stopOpacity="0" />
                  <Stop offset="40%" stopColor="#A78BFA" stopOpacity="1" />
                  <Stop offset="60%" stopColor="#38BDF8" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="120" height="4" rx="2" fill="url(#shimmerGrad)" />
            </Svg>
          </Animated.View>
        </View>
        <Text style={styles.loaderLabel}>Loading experience...</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B20',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  // Background glows
  glowCenter: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#4B35C8',
    opacity: 0.18,
    top: '20%',
    alignSelf: 'center',
  },
  glowBottomLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0EA5E9',
    opacity: 0.1,
    bottom: '10%',
    left: -60,
  },
  glowTopRight: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#A855F7',
    opacity: 0.12,
    top: '5%',
    right: -30,
  },
  // Main content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  // Logo badge
  logoBadge: {
    marginBottom: 4,
  },
  logoBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 77, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 77, 255, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  logoLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  logoAccent: {
    fontSize: 26,
    fontWeight: '900',
    color: '#A78BFA',
    letterSpacing: 1,
  },
  // Atom
  atomWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text
  textBlock: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSubName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#A78BFA',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: -6,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(108, 77, 255, 0.5)',
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(148, 163, 184, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Loading bar
  loaderContainer: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 10,
  },
  loaderTrack: {
    width: 180,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loaderLabel: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.5)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
