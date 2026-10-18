import { Check, Sparkles, AlertCircle, RotateCcw, Scan, ArrowLeft } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export interface DetectionLoaderProps {
  status: 'scanning' | 'success' | 'error';
  detectedName?: string;
  confidence?: number;
  errorMessage?: string;
  progress?: number;
  onComplete?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const DetectionLoader: React.FC<DetectionLoaderProps> = ({
  status = 'scanning',
  detectedName,
  confidence,
  errorMessage,
  progress = 0,
  onComplete,
  onRetry,
  onCancel,
}) => {
  const badgeScale = useSharedValue(0.7);
  const badgeOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Entrance animation for badges
  useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 14 });
    badgeOpacity.value = withTiming(1, { duration: 300 });

    if (status === 'scanning') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [status]);

  // When status becomes success, trigger onComplete after brief visual confirmation
  useEffect(() => {
    if (status === 'success' && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value * pulseScale.value }],
    opacity: badgeOpacity.value,
  }));

  return (
    <View className="items-center justify-center px-8 w-full max-w-sm">
      {/* 1. SCANNING IN PROGRESS STATE */}
      {status === 'scanning' && (
        <>
          {/* Animated Scanning Radar Pulse Badge */}
          <Animated.View
            style={[badgeAnimatedStyle, styles.scanGlow]}
            className="w-24 h-24 rounded-full bg-[#EFF6FF] items-center justify-center mb-5 border-4 border-[#BFDBFE] shadow-xl"
          >
            <Scan size={44} color="#2563EB" strokeWidth={2.5} />
          </Animated.View>

          {/* Title */}
          <Text className="text-2xl font-black text-[#0F172A] text-center mb-1">
            Analyzing Diagram...
          </Text>
          <Text className="text-xs text-[#64748B] text-center mb-6">
            Identifying textbook diagram and physical components
          </Text>

          {/* Progress Card Container */}
          <View className="w-full bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-md">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                <Text className="text-xs font-bold text-[#64748B]">Processing visual vectors...</Text>
              </View>
              <Text className="text-xs font-black text-[#2563EB]">{Math.round(progress)}%</Text>
            </View>

            {/* Animated Progress Track */}
            <View className="h-2.5 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#E2E8F0]">
              <View
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: `${Math.max(progress, 15)}%` }}
              />
            </View>
          </View>
        </>
      )}

      {/* 2. SUCCESSFUL IDENTIFICATION STATE */}
      {status === 'success' && (
        <>
          {/* Large Green Check Circle */}
          <Animated.View
            style={[badgeAnimatedStyle, styles.successGlow]}
            className="w-22 h-22 rounded-full bg-[#16A34A] items-center justify-center mb-5 border-4 border-white shadow-xl"
          >
            <Check size={44} color="#FFFFFF" strokeWidth={3.5} />
          </Animated.View>

          <Text className="text-2xl font-black text-[#0F172A] text-center mb-1">
            Diagram Identified!
          </Text>

          {/* Actual Detected Diagram Name Badge */}
          <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-2 rounded-full mb-6 flex-row items-center">
            <Sparkles size={16} color="#2563EB" />
            <Text className="text-sm font-extrabold text-[#2563EB] ml-2">
              {detectedName || 'Physics Diagram'}
            </Text>
            {confidence ? (
              <Text className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full ml-2">
                {Math.round(confidence * 100)}% match
              </Text>
            ) : null}
          </View>

          {/* Progress Card Container */}
          <View className="w-full bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm">
            <Text className="text-xs font-semibold text-[#64748B] text-center">
              Loading 3D workspace...
            </Text>
          </View>
        </>
      )}

      {/* 3. ERROR / TIMEOUT STATE */}
      {status === 'error' && (
        <>
          {/* Amber/Red Alert Badge */}
          <Animated.View
            style={[badgeAnimatedStyle, styles.errorGlow]}
            className="w-22 h-22 rounded-full bg-[#FEE2E2] items-center justify-center mb-5 border-4 border-[#FECACA] shadow-xl"
          >
            <AlertCircle size={44} color="#DC2626" strokeWidth={2.5} />
          </Animated.View>

          <Text className="text-2xl font-black text-[#0F172A] text-center mb-2">
            Recognition Failed
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-6 w-full shadow-sm">
            <Text className="text-xs text-[#64748B] text-center leading-relaxed">
              {errorMessage || 'Could not recognize the diagram with sufficient confidence. Please ensure proper lighting and camera focus.'}
            </Text>
          </View>

          {/* Retry & Rescan Actions */}
          <View className="w-full gap-3">
            {onRetry && (
              <Pressable
                onPress={onRetry}
                className="w-full bg-[#2563EB] py-3.5 rounded-2xl flex-row items-center justify-center shadow-md active:bg-[#1D4ED8]"
              >
                <RotateCcw size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-sm font-bold text-white">Retry Scan</Text>
              </Pressable>
            )}

            {onCancel && (
              <Pressable
                onPress={onCancel}
                className="w-full bg-white border border-[#E2E8F0] py-3 rounded-2xl flex-row items-center justify-center active:bg-gray-50"
              >
                <ArrowLeft size={16} color="#64748B" style={{ marginRight: 8 }} />
                <Text className="text-xs font-bold text-[#64748B]">Scan Another Diagram</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scanGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successGlow: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  errorGlow: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default DetectionLoader;
