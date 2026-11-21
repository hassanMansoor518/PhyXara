import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { PropsWithChildren, useEffect, useId } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export const authColors = { navy: '#080F38', purple: '#702EFF', link: '#5700DC', muted: '#494456', border: '#D5D1E4', field: '#F7F5FF' };

export function AuthLayout({ title, subtitle, footer, children }: PropsWithChildren<{
  title: string;
  subtitle: string;
  footer: React.ReactNode;
}>) {
  const insets = useSafeAreaInsets();
  const svgId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glowId = 'glow' + svgId;
  const atomId = 'atom' + svgId;
  const coreId = 'core' + svgId;
  const waveBackId = 'waveBack' + svgId;
  const waveMiddleId = 'waveMiddle' + svgId;
  const waveBackX = useSharedValue(0);
  const waveMiddleX = useSharedValue(-390);
  const waveBackY = useSharedValue(0);
  const waveMiddleY = useSharedValue(0);

  useEffect(() => {
    waveBackX.value = withRepeat(
      withTiming(-390, { duration: 11000, easing: Easing.linear }),
      -1,
      false
    );
    waveMiddleX.value = withRepeat(
      withTiming(0, { duration: 8500, easing: Easing.linear }),
      -1,
      false
    );
    waveBackY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(2, { duration: 3200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    waveMiddleY.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(-2, { duration: 2800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [waveBackX, waveBackY, waveMiddleX, waveMiddleY]);

  const waveBackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveBackX.value }, { translateY: waveBackY.value }],
  }));
  const waveMiddleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveMiddleX.value }, { translateY: waveMiddleY.value }],
  }));
  const [loaded, fontError] = useFonts({
    'AuthPoppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
    'AuthPoppins-SemiBold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
    'AuthInter-Regular': require('../../../assets/fonts/Inter-Regular.ttf'),
    'AuthInter-Medium': require('../../../assets/fonts/Inter-Medium.ttf'),
  });

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      {!loaded && !fontError ? <ActivityIndicator style={styles.loading} color={authColors.purple} /> : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#050A25', '#080F38', '#080F38']} style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs><RadialGradient id={glowId} cx="50%" cy="0%" rx="55%" ry="100%"><Stop offset="0" stopColor="#702EFF" stopOpacity={0.22} /><Stop offset="1" stopColor="#702EFF" stopOpacity={0} /></RadialGradient></Defs>
                <Rect width="100%" height="100%" fill={'url(#' + glowId + ')'} />
              </Svg>
            </View>
            <View style={styles.brand} accessibilityLabel="PhyXara, AI-Powered AR Learning">
              <Svg width={44} height={44} viewBox="0 0 64 64" fill="none">
                <Defs>
                  <SvgGradient id={atomId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><Stop stopColor="#287BFF" /><Stop offset="1" stopColor="#702EFF" /></SvgGradient>
                  <RadialGradient id={coreId}><Stop stopColor="#CEBDFF" /><Stop offset="0.6" stopColor="#702EFF" /><Stop offset="1" stopColor="#380094" /></RadialGradient>
                </Defs>
                <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(30 32 32)" stroke={'url(#' + atomId + ')'} strokeWidth={2.5} />
                <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(-30 32 32)" stroke={'url(#' + atomId + ')'} strokeWidth={2.5} />
                <Ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(90 32 32)" stroke="#9B7AFF" strokeWidth={2} />
                <Circle cx="32" cy="32" r="7" fill={'url(#' + coreId + ')'} />
              </Svg>
              <View>
                <Text style={styles.wordmark}>Phy<Text style={styles.wordmarkAccent}>Xara</Text></Text>
                <Text style={styles.tagline}>AI-Powered AR Learning</Text>
              </View>
            </View>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={styles.wave} pointerEvents="none">
              <Animated.View style={[styles.waveLayer, waveBackStyle]}>
                <Svg width={780} height={48} viewBox="0 0 780 48" preserveAspectRatio="none">
                  <Defs>
                    <SvgGradient id={waveBackId} x1="0" y1="0" x2="780" y2="0" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#080F38" stopOpacity={0.38} />
                      <Stop offset="0.38" stopColor="#287BFF" stopOpacity={0.34} />
                      <Stop offset="0.72" stopColor="#702EFF" stopOpacity={0.30} />
                      <Stop offset="1" stopColor="#080F38" stopOpacity={0.38} />
                    </SvgGradient>
                  </Defs>
                  <Path d="M0,20 C110,48 280,0 390,28 C500,48 670,8 780,24 L780,48 L0,48 Z" fill={'url(#' + waveBackId + ')'} />
                </Svg>
              </Animated.View>
              <Animated.View style={[styles.waveLayer, waveMiddleStyle]}>
                <Svg width={780} height={48} viewBox="0 0 780 48" preserveAspectRatio="none">
                  <Defs>
                    <SvgGradient id={waveMiddleId} x1="0" y1="0" x2="780" y2="0" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#702EFF" stopOpacity={0.22} />
                      <Stop offset="0.48" stopColor="#287BFF" stopOpacity={0.26} />
                      <Stop offset="1" stopColor="#702EFF" stopOpacity={0.22} />
                    </SvgGradient>
                  </Defs>
                  <Path d="M0,34 C120,4 270,48 390,16 C510,2 660,46 780,16 L780,48 L0,48 Z" fill={'url(#' + waveMiddleId + ')'} />
                </Svg>
              </Animated.View>
            </View>
          </LinearGradient>
          <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F7F5FF']} style={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <View style={styles.content}>{children}</View>
            <View style={styles.footer}>{footer}</View>
          </LinearGradient>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

export const authStyles = StyleSheet.create({
  form: { gap: 16 },
  text: { fontFamily: 'AuthInter-Regular', fontSize: 12, lineHeight: 18, color: authColors.muted },
  link: { fontFamily: 'AuthInter-Medium', fontSize: 13, lineHeight: 18, color: authColors.link },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4 },
  error: { backgroundColor: '#FFF1F0', borderColor: '#FFCCC7', borderWidth: 1, borderRadius: 16, padding: 14 },
  errorText: { fontFamily: 'AuthInter-Regular', color: '#BA1A1A', fontSize: 12, lineHeight: 18 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080F38' },
  loading: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 64, alignItems: 'center', overflow: 'hidden' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { fontFamily: 'AuthPoppins-Bold', fontSize: 22, lineHeight: 28, letterSpacing: -0.15, color: '#FFFFFF' },
  wordmarkAccent: { color: '#8354FF' },
  tagline: { fontFamily: 'AuthInter-Medium', fontSize: 11, lineHeight: 16, letterSpacing: 0.2, color: '#CBC3D9' },
  heading: { marginTop: 24, alignItems: 'center', gap: 4 },
  title: { fontFamily: 'AuthPoppins-Bold', fontSize: 26, lineHeight: 34, letterSpacing: -0.2, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: 'AuthInter-Regular', fontSize: 14, lineHeight: 21, color: '#CBC3D9', textAlign: 'center' },
  wave: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 48 },
  waveLayer: { position: 'absolute', bottom: 0, left: 0, width: 780, height: 48 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 16, gap: 24, justifyContent: 'space-between' },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  footer: { paddingTop: 8 },
});


