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
import { router } from 'expo-router';
import { ArrowRight, Box, Eye, GraduationCap, ScanLine, Zap } from 'lucide-react-native';
import { authService } from '../services/authService';
import { ARIllustration } from '../components/illustrations/ARIllustration';
import { PhysicsModelIllustration } from '../components/illustrations/PhysicsModelIllustration';
import { ScanIllustration } from '../components/illustrations/ScanIllustration';

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
    highlight: 'Instantly',
    description:
      'Use your camera to scan any physics diagram from your book. We’ll recognize it in a snap.',
    featureTitle: 'Fast Recognition',
    featureDesc: 'Advanced AI instantly detects and prepares your diagram.',
    featureIconKey: 'zap',
    topBadgeKey: 'scan',
  },
  {
    id: '1',
    title: 'Experience in',
    highlight: '3D AR',
    description:
      'View diagrams in immersive 3D with real-time Augmented Reality. Rotate, zoom, and explore freely.',
    featureTitle: 'Immersive 3D',
    featureDesc: 'Interact with models naturally just like the real thing.',
    featureIconKey: 'eye',
    topBadgeKey: 'box',
  },
  {
    id: '2',
    title: 'Learn Better',
    highlight: 'Understand Deeper',
    description:
      'Clear visuals. Better understanding. Perfect for students, by students.',
    featureTitle: 'Study Smarter',
    featureDesc: 'Visualize, analyze and remember concepts more effectively.',
    featureIconKey: 'grad',
    topBadgeKey: 'grad',
  },
];

// ── Top Left 3D Icon Badge ────────────────────────────────────────────
const TopBadgeIcon: React.FC<{ badgeKey: SlideData['topBadgeKey'] }> = ({ badgeKey }) => {
  if (badgeKey === 'scan') return <ScanLine size={20} color="#6C4DFF" />;
  if (badgeKey === 'box') return <Box size={20} color="#6C4DFF" />;
  return <GraduationCap size={20} color="#6C4DFF" />;
};

// ── Bottom Feature Card Icon ───────────────────────────────────────────
const FeatureIcon: React.FC<{ iconKey: SlideData['featureIconKey'] }> = ({ iconKey }) => {
  if (iconKey === 'zap') return <Zap size={18} color="#6C4DFF" />;
  if (iconKey === 'eye') return <Eye size={18} color="#6C4DFF" />;
  return <GraduationCap size={18} color="#6C4DFF" />;
};

// ── Illustration resolver ─────────────────────────────────────────────
const IllustrationForSlide: React.FC<{ index: number; size: number; illustrationH: number }> = ({
  index,
  size,
  illustrationH,
}) => {
  if (index === 0) return <ScanIllustration width={size} height={illustrationH} />;
  if (index === 1) return <ARIllustration width={size} height={illustrationH} />;
  return <PhysicsModelIllustration width={size} height={illustrationH} />;
};

// ── Slide Item ────────────────────────────────────────────────────────
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
      {/* ── Top Section: 3D Badge + Clean Typography ── */}
      <Animated.View style={[styles.topSection, { opacity: contentOpacity }]}>
        {/* Top 3D Icon Badge */}
        <View style={styles.topBadgeCard}>
          <TopBadgeIcon badgeKey={item.topBadgeKey} />
        </View>

        {/* Headlines */}
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideHighlight}>{item.highlight}</Text>
        <Text style={styles.slideDesc}>{item.description}</Text>
      </Animated.View>

      {/* ── Middle Section: Animated 3D Visual Illustration ── */}
      <Animated.View
        style={[
          styles.illustrationArea,
          { height: illustrationH },
          { transform: [{ scale: illustrationScale }] },
        ]}
      >
        <IllustrationForSlide index={index} size={slideWidth - 32} illustrationH={illustrationH} />
      </Animated.View>

      {/* ── Bottom Section: 3D Soft Feature Card ── */}
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
      {/* ── Top Bar ── */}
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

      {/* ── FlatList Horizontal Pager ── */}
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

      {/* ── Bottom Navigation Button ── */}
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
    backgroundColor: '#F8F8FF',
  },

  // Top Bar
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
    backgroundColor: '#6C4DFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#DCD6FF',
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C4DFF',
  },

  // Slide Layout
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEFFF',
    shadowColor: '#6C4DFF',
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
    color: '#6546F5',
    letterSpacing: -0.6,
    lineHeight: 38,
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 15,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 23,
    maxWidth: '96%',
  },

  // Illustration Area
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Section
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
    borderColor: '#EAEBFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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

  // Bottom Navigation
  bottomNav: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  arrowBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 7,
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
    backgroundColor: '#6C4DFF',
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 7,
  },
  getStartedBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
