import { router } from 'expo-router';
import { ArrowRight, Box, Eye, GraduationCap, ScanLine, Zap } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARIllustration } from '../components/illustrations/ARIllustration';
import { PhysicsModelIllustration } from '../components/illustrations/PhysicsModelIllustration';
import { ScanIllustration } from '../components/illustrations/ScanIllustration';
import { authService } from '../services/authService';

interface SlideData {
  id: string;
  title: string;
  highlight: string;
  description: string;
  featureTitle: string;
  featureDesc: string;
  featureIconKey: 'zap' | 'eye' | 'grad';
  topBadgeKey: 'scan' | 'box' | 'grad';
}

const SLIDES: SlideData[] = [
  {
    id: '0',
    title: 'Scan Diagrams',
    highlight: 'Instantly in AR',
    description:
      'Point your camera at any Sindh Board textbook physics diagram to bring it to life instantly.',
    featureTitle: 'Fast AR Recognition',
    featureDesc: 'Advanced AI detects and prepares interactive 3D simulations.',
    featureIconKey: 'zap',
    topBadgeKey: 'scan',
  },
  {
    id: '1',
    title: 'Experience in',
    highlight: 'Interactive 3D',
    description:
      'Explore physics with interactive 3D models. Rotate, zoom, explode components, and track force vectors.',
    featureTitle: '3D Simulation Lab',
    featureDesc: 'Understand complex physics mechanisms visually.',
    featureIconKey: 'eye',
    topBadgeKey: 'box',
  },
  {
    id: '2',
    title: 'Learn Better',
    highlight: 'With AI Tutor',
    description:
      'Get step-by-step guidance, practice MCQs, and master the Sindh Board physics curriculum.',
    featureTitle: 'Study Smarter',
    featureDesc: 'Track your XP, streak, and chapter mastery.',
    featureIconKey: 'grad',
    topBadgeKey: 'grad',
  },
];

// Top Left 3D Icon Badge
const TopBadgeIcon: React.FC<{ badgeKey: SlideData['topBadgeKey'] }> = ({ badgeKey }) => {
  if (badgeKey === 'scan') return <ScanLine size={20} color="#2563EB" />;
  if (badgeKey === 'box') return <Box size={20} color="#2563EB" />;
  return <GraduationCap size={20} color="#2563EB" />;
};

// Bottom Feature Card Icon
const FeatureIcon: React.FC<{ iconKey: SlideData['featureIconKey'] }> = ({ iconKey }) => {
  if (iconKey === 'zap') return <Zap size={18} color="#2563EB" />;
  if (iconKey === 'eye') return <Eye size={18} color="#2563EB" />;
  return <GraduationCap size={18} color="#2563EB" />;
};

// Illustration resolver
const IllustrationForSlide: React.FC<{ index: number; size: number; illustrationH: number }> = ({
  index,
  size,
  illustrationH,
}) => {
  if (index === 0) return <ScanIllustration width={size} height={illustrationH} />;
  if (index === 1) return <ARIllustration width={size} height={illustrationH} />;
  return <PhysicsModelIllustration width={size} height={illustrationH} />;
};

const SlideItem: React.FC<{
  item: SlideData;
  index: number;
  slideWidth: number;
  slideHeight: number;
  illustrationH: number;
  scrollX: Animated.Value;
}> = ({ item, index, slideWidth, slideHeight, illustrationH, scrollX }) => {
  const illustrationScale = scrollX.interpolate({
    inputRange: [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth],
    outputRange: [0.88, 1, 0.88],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollX.interpolate({
    inputRange: [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth],
    outputRange: [0.35, 1, 0.35],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.slide, { width: slideWidth, height: slideHeight }]}>
      {/* Top Section */}
      <Animated.View style={[styles.topSection, { opacity: contentOpacity }]}>
        <View style={styles.topBadgeCard}>
          <TopBadgeIcon badgeKey={item.topBadgeKey} />
        </View>

        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideHighlight}>{item.highlight}</Text>
        <Text style={styles.slideDesc}>{item.description}</Text>
      </Animated.View>

      {/* Middle Section: Illustration */}
      <Animated.View
        style={[
          styles.illustrationArea,
          { height: illustrationH },
          { transform: [{ scale: illustrationScale }] },
        ]}
      >
        <IllustrationForSlide index={index} size={slideWidth - 32} illustrationH={illustrationH} />
      </Animated.View>

      {/* Bottom Feature Card */}
      <Animated.View style={[styles.bottomSection, { opacity: contentOpacity }]}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <FeatureIcon iconKey={item.featureIconKey} />
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitle}>{item.featureTitle}</Text>
            <Text style={styles.featureDesc}>{item.featureDesc}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const TOPBAR_H = 48;
const BOTTOMNAV_H = 74;

export const OnboardingScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slideHeight = height - TOPBAR_H - BOTTOMNAV_H;
  const illustrationH = Math.round(slideHeight * 0.44);

  const handleSkip = useCallback(async () => {
    await authService.setOnboardingDone();
    router.push('/login');
  }, []);

  const handleNext = useCallback(async () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      await authService.setOnboardingDone();
      router.push('/login');
    }
  }, [currentIndex]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(idx);
    },
    [width]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, { height: TOPBAR_H }]}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Skip Button */}
        <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* FlatList Horizontal Pager */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            slideWidth={width}
            slideHeight={slideHeight}
            illustrationH={illustrationH}
            scrollX={scrollX}
          />
        )}
      />

      {/* Bottom Navigation Button */}
      <View style={[styles.bottomNav, { height: BOTTOMNAV_H }]}>
        {currentIndex < SLIDES.length - 1 ? (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.arrowBtn,
              pressed && styles.arrowBtnPressed,
            ]}
          >
            <ArrowRight size={22} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.getStartedBtn,
              pressed && styles.getStartedBtnPressed,
            ]}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={{ marginLeft: 8 }}>
              <ArrowRight size={18} color="#FFFFFF" />
            </View>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#DBEAFE',
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  slide: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  topBadgeCard: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  slideHighlight: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.6,
    lineHeight: 38,
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 14.5,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 22,
    maxWidth: '96%',
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 6,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 18,
  },
  bottomNav: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  arrowBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  arrowBtnPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
