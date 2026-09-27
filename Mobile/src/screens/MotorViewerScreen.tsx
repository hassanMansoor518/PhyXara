import { router } from 'expo-router';
import {
  BookOpen,
  Box,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { MotorControls } from '../components/MotorControls';
import { MotorLabel } from '../components/MotorLabel';
import { ThumbnailSelector } from '../components/ThumbnailSelector';
import { ElectricMotorExplodedSvg } from '../components/illustrations/ElectricMotorExplodedSvg';
import { ElectricMotorFrontSvg } from '../components/illustrations/ElectricMotorFrontSvg';
import { ElectricMotorSideSvg } from '../components/illustrations/ElectricMotorSideSvg';
import { MOTOR_FRONT_LABELS, MOTOR_PARTS } from '../data/motorModel';
import { MotorViewType } from '../types';

export const MotorViewerScreen: React.FC = () => {
  const [selectedView, setSelectedView] = useState<MotorViewType>('front');
  const [showLabels, setShowLabels] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [selectedPartKey, setSelectedPartKey] = useState<string | null>(null);

  // Gesture state for interactive 3D rotation & scale
  const rotationAngle = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pan gesture for 3D rotation
  const panGesture = Gesture.Pan().onUpdate((e) => {
    rotationAngle.value = (rotationAngle.value + e.velocityX / 300) % 360;
  });

  // Pinch gesture for 3D zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.75), 1.8);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  const modelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleRotate = () => {
    rotationAngle.value = withSpring((rotationAngle.value + 45) % 360);
  };

  const handleToggleZoom = () => {
    if (scale.value > 1.1) {
      scale.value = withSpring(1);
      savedScale.value = 1;
    } else {
      scale.value = withSpring(1.35);
      savedScale.value = 1.35;
    }
  };

  const handleReset = () => {
    rotationAngle.value = withSpring(0);
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="3D Model - DC Electric Motor"
        rightIcon="star"
        isStarred={isStarred}
        onRightPress={() => setIsStarred(!isStarred)}
        onBack={() => router.replace('/(tabs)')}
      />

      {/* Floating Light Theme Quick Navigation Strip */}
      <View className="flex-row items-center justify-between px-5 -mt-1 mb-2">
        <Pressable
          onPress={() => router.push('/animation')}
          className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full flex-row items-center shadow-sm active:bg-gray-50"
        >
          <Play size={13} color="#2563EB" fill="#2563EB" />
          <Text className="text-[11px] font-bold text-[#2563EB] ml-1">Animation</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/ai-tutor')}
          className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full flex-row items-center shadow-sm active:bg-gray-50"
        >
          <Sparkles size={13} color="#7C3AED" />
          <Text className="text-[11px] font-bold text-[#7C3AED] ml-1">AI Tutor</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/quiz')}
          className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full flex-row items-center shadow-sm active:bg-gray-50"
        >
          <Trophy size={13} color="#F59E0B" />
          <Text className="text-[11px] font-bold text-[#F59E0B] ml-1">Quiz</Text>
        </Pressable>

        <Pressable
          onPress={handleReset}
          className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] items-center justify-center shadow-sm active:bg-gray-50"
        >
          <RotateCcw size={13} color="#64748B" />
        </Pressable>
      </View>

      {/* Main Interactive 3D Canvas */}
      <View className="flex-1 px-5 justify-center items-center relative">
        {/* Viewport Card */}
        <View className="w-full h-80 bg-white rounded-3xl border border-[#E2E8F0] items-center justify-center relative overflow-hidden shadow-sm">
          {/* Zoom toggle on top-right */}
          <Pressable
            onPress={handleToggleZoom}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center active:bg-gray-100 shadow-sm"
          >
            <Maximize2 size={14} color="#64748B" />
          </Pressable>

          {/* Interactive 3D Model with Gestures */}
          <GestureDetector gesture={composedGestures}>
            <Animated.View
              style={[
                modelAnimatedStyle,
                { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              {selectedView === 'front' && (
                <ElectricMotorFrontSvg width={290} height={230} rotationAngle={rotationAngle.value} />
              )}
              {selectedView === 'side' && (
                <ElectricMotorSideSvg width={280} height={220} rotationAngle={rotationAngle.value} />
              )}
              {selectedView === 'exploded' && (
                <ElectricMotorExplodedSvg width={300} height={230} separation={0.85} />
              )}
            </Animated.View>
          </GestureDetector>

          {/* Callout Labels (Pins) */}
          {selectedView === 'front' &&
            MOTOR_FRONT_LABELS.map((label) => (
              <MotorLabel
                key={label.id}
                label={label}
                isVisible={showLabels}
                onPress={() => setSelectedPartKey(label.id)}
              />
            ))}
        </View>
      </View>

      {/* Bottom Controls Bar */}
      <View>
        <MotorControls
          onRotate={handleToggleRotate}
          onZoom={handleToggleZoom}
          onExplode={() => router.push('/exploded-view')}
          onToggleLabels={() => setShowLabels(!showLabels)}
          labelsActive={showLabels}
          isExploded={false}
          onReset={handleReset}
        />

        {/* Thumbnail Selector */}
        <ThumbnailSelector
          selectedView={selectedView}
          onSelectView={(view) => {
            if (view === 'exploded') {
              router.push('/exploded-view');
            } else {
              setSelectedView(view);
            }
          }}
        />
      </View>

      {/* Part Info Bottom Modal in Light Theme */}
      <Modal
        visible={!!selectedPartKey}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPartKey(null)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 border-t border-[#E2E8F0] shadow-2xl">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#DBEAFE]">
                  <Sparkles size={18} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-[#0F172A]">
                    {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.title : ''}
                  </Text>
                  <Text className="text-xs font-bold text-[#2563EB]">
                    {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.role : ''}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedPartKey(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] items-center justify-center border border-[#E2E8F0]"
              >
                <X size={16} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-xs text-[#475569] leading-5 mb-5">
              {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.description : ''}
            </Text>

            <Pressable
              onPress={() => {
                setSelectedPartKey(null);
                router.push('/ai-tutor');
              }}
              className="h-12 rounded-2xl bg-[#2563EB] items-center justify-center active:bg-[#1D4ED8] shadow-md"
            >
              <Text className="text-xs font-bold text-white">Ask AI Tutor about this component</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MotorViewerScreen;
