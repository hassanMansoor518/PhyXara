import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Box, Eye, GraduationCap, ScanLine, Zap } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
}> = ({ item, index, slideWidth, slideHeight, illustrationH }) => {
  return (
    <View style={[styles.slide, { width: slideWidth, height: slideHeight }]}>
      <View style={[styles.decorativeGlow, { pointerEvents: 'none' }]} />
      {/* Top Section */}
      <View style={styles.topSection}>
        <LinearGradient
          colors={['#EEF2FF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topBadgeCard}
        >
          <TopBadgeIcon badgeKey={item.topBadgeKey} />
        </LinearGradient>

        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideHighlight}>{item.highlight}</Text>
        <Text style={styles.slideDesc}>{item.description}</Text>
      </View>

      {/* Middle Section: Illustration */}
      <View style={[styles.illustrationArea, { height: illustrationH }]}>
        <IllustrationForSlide index={index} size={slideWidth - 32} illustrationH={illustrationH} />
      </View>

      {/* Bottom Feature Card */}
      <View style={styles.bottomSection}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <FeatureIcon iconKey={item.featureIconKey} />
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitle}>{item.featureTitle}</Text>
            <Text style={styles.featureDesc}>{item.featureDesc}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const TOPBAR_H = 64;
const BOTTOMNAV_H = 92;

export const OnboardingScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);

  const slideHeight = height - TOPBAR_H - BOTTOMNAV_H;
  const illustrationH = Math.round(Math.min(slideHeight * 0.43, width < 390 ? 260 : 300));

  const handleSkip = useCallback(() => {
    void authService.setOnboardingDone();
    router.replace('/login');
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      flatListRef.current?.scrollToOffset({ offset: next * width, animated: true });
    } else {
      void authService.setOnboardingDone();
      router.replace('/login');
    }
  }, [currentIndex, width]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(idx);
    },
    [width]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
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
        extraData={currentIndex}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        removeClippedSubviews
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={1}
        snapToInterval={width}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            slideWidth={width}
            slideHeight={slideHeight}
            illustrationH={illustrationH}
          />
        )}
      />

      {/* Bottom Navigation Button */}
      <View style={[styles.bottomNav, { height: BOTTOMNAV_H }]}>
        {currentIndex < SLIDES.length - 1 ? (
          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Next onboarding slide"
            hitSlop={8}
            style={({ pressed }) => [
              styles.arrowBtn,
              pressed && styles.arrowBtnPressed,
            ]}
          >
            <LinearGradient colors={['#702EFF', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.arrowBtnFill}>
              <ArrowRight size={22} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Finish onboarding and continue to login"
            hitSlop={8}
            style={({ pressed }) => [
              styles.getStartedBtn,
              pressed && styles.getStartedBtnPressed,
            ]}
          >
            <LinearGradient colors={['#702EFF', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.getStartedFill}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFF',
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
    minHeight: 36,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  skipText: {
    fontFamily: 'AuthInter-Medium',
    fontSize: 14,
    color: '#2563EB',
  },
  slide: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
  },
  decorativeGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E8E0FF',
    opacity: 0.38,
    top: 120,
    right: -150,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  topBadgeCard: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    boxShadow: '0 6px 14px rgba(37, 99, 235, 0.14)',
    elevation: 4,
  },
  slideTitle: {
    fontFamily: 'AuthPoppins-Bold',
    fontSize: 30,
    color: '#0F172A',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  slideHighlight: {
    fontFamily: 'AuthPoppins-Bold',
    fontSize: 30,
    color: '#702EFF',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 10,
  },
  slideDesc: {
    fontFamily: 'AuthInter-Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    maxWidth: 330,
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E6F5',
    paddingHorizontal: 16,
    paddingVertical: 13,
    boxShadow: '0 8px 18px rgba(97, 87, 165, 0.09)',
    elevation: 4,
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
    fontFamily: 'AuthPoppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 3,
  },
  featureDesc: {
    fontFamily: 'AuthInter-Regular',
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  bottomNav: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFF',
  },
  arrowBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(112, 46, 255, 0.28)',
    elevation: 7,
  },
  arrowBtnFill: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  getStartedBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    boxShadow: '0 8px 16px rgba(112, 46, 255, 0.28)',
    elevation: 7,
  },
  getStartedFill: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  getStartedBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  getStartedText: {
    fontFamily: 'AuthPoppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
