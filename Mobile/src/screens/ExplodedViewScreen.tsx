import { router } from 'expo-router';
import { Sparkles, X } from 'lucide-react-native';
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
import { MOTOR_EXPLODED_LABELS, MOTOR_PARTS } from '../data/motorModel';
import { MotorViewType } from '../types';

export const ExplodedViewScreen: React.FC = () => {
  const [showLabels, setShowLabels] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [selectedPartKey, setSelectedPartKey] = useState<string | null>(null);
  const [separation, setSeparation] = useState(1); // 1 = exploded, 0 = assembled

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.75), 1.8);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleReset = () => {
    setSeparation(1);
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  const handleToggleZoom = () => {
    if (scale.value > 1.1) {
      scale.value = withSpring(1);
      savedScale.value = 1;
    } else {
      scale.value = withSpring(1.3);
      savedScale.value = 1.3;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="3D View - Exploded"
        rightIcon="star"
        isStarred={isStarred}
        onRightPress={() => setIsStarred(!isStarred)}
        onBack={() => router.back()}
      />

      {/* Subtitle badge */}
      <View className="items-center -mt-2 mb-1">
        <View className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
          <Text className="text-xs font-bold text-primary">Electric Motor (Exploded)</Text>
        </View>
      </View>

      {/* Main Exploded Viewport */}
      <View className="flex-1 px-5 justify-center items-center relative">
        <View className="w-full h-80 bg-white rounded-3xl border border-border items-center justify-center relative overflow-hidden shadow-sm">
          <GestureDetector gesture={pinchGesture}>
            <Animated.View
              style={[animatedStyle, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}
            >
              <ElectricMotorExplodedSvg width={320} height={240} separation={separation} />
            </Animated.View>
          </GestureDetector>

          {/* Exploded Labels */}
          {MOTOR_EXPLODED_LABELS.map((label) => (
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
          onRotate={() => setSeparation((prev) => (prev > 0.5 ? 0.3 : 1))}
          onZoom={handleToggleZoom}
          onExplode={() => setSeparation((prev) => (prev === 1 ? 0 : 1))}
          onReset={handleReset}
          onToggleLabels={() => setShowLabels(!showLabels)}
          labelsActive={showLabels}
          isExploded={true}
        />

        {/* Thumbnail Selector */}
        <ThumbnailSelector
          selectedView="exploded"
          onSelectView={(view: MotorViewType) => {
            if (view !== 'exploded') {
              router.replace('/motor-viewer');
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

export default ExplodedViewScreen;
