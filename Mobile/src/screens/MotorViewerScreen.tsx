import { router } from 'expo-router';
import { Maximize2, Play, Sparkles, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, Share, Text, View } from 'react-native';
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
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Gesture state for interactive 3D rotation & scale
  const rotationAngle = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pan gesture for 3D rotation
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out the Electric Motor 3D Model on Physics AR 3D Viewer!',
      });
    } catch {
      // ignore
    }
  };

  const handleToggleRotate = () => {
    setIsAutoRotating((prev) => !prev);
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

  const handleExplode = () => {
    router.push('/exploded-view');
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="3D View - Electric Motor"
        rightIcon="star"
        isStarred={isStarred}
        onRightPress={() => setIsStarred(!isStarred)}
        onBack={() => router.replace('/(tabs)')}
      />

      {/* Main Interactive 3D Canvas */}
      <View className="flex-1 px-5 justify-center items-center relative">
        {/* Viewport Card */}
        <View className="w-full h-80 bg-white rounded-3xl border border-border items-center justify-center relative overflow-hidden shadow-sm">
          {/* Quick Floating Actions on Top Right */}
          <View className="absolute top-4 right-4 z-20 flex-row space-x-2">
            <Pressable
              onPress={() => router.push('/animation')}
              className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex-row items-center active:bg-primary/20 mr-2"
            >
              <Play size={12} color="#6C4DFF" fill="#6C4DFF" />
              <Text className="text-[11px] font-bold text-primary ml-1">Animation</Text>
            </Pressable>

            <Pressable
              onPress={handleToggleZoom}
              className="w-8 h-8 rounded-full bg-background border border-border items-center justify-center active:bg-gray-100"
            >
              <Maximize2 size={14} color="#737A96" />
            </Pressable>
          </View>

          {/* Interactive 3D Model with Gestures */}
          <GestureDetector gesture={composedGestures}>
            <Animated.View
              style={[modelAnimatedStyle, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}
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
          onExplode={handleExplode}
          onToggleLabels={() => setShowLabels(!showLabels)}
          labelsActive={showLabels}
          isExploded={false}
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

      {/* Part Info Bottom Modal */}
      <Modal
        visible={!!selectedPartKey}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPartKey(null)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 border-t border-border shadow-2xl">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-primary-subtle items-center justify-center mr-2.5">
                  <Sparkles size={18} color="#6C4DFF" />
                </View>
                <Text className="text-base font-extrabold text-navy">
                  {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.title : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedPartKey(null)}
                className="w-8 h-8 rounded-full bg-background items-center justify-center"
              >
                <X size={16} color="#737A96" />
              </Pressable>
            </View>

            <Text className="text-xs font-semibold text-primary mb-1">
              Role: {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.role : ''}
            </Text>
            <Text className="text-xs text-muted leading-5 mb-4">
              {selectedPartKey ? MOTOR_PARTS[selectedPartKey]?.description : ''}
            </Text>

            <Pressable
              onPress={() => {
                setSelectedPartKey(null);
                router.push('/ai-tutor');
              }}
              className="h-12 rounded-2xl bg-primary items-center justify-center active:bg-primary-dark"
            >
              <Text className="text-xs font-bold text-white">Ask AI Tutor about this part</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MotorViewerScreen;
