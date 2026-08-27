import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { RotateCw, ZoomIn, Box, Tag, RotateCcw } from 'lucide-react-native';

interface MotorControlsProps {
  onRotate: () => void;
  onZoom: () => void;
  onExplode: () => void;
  onToggleLabels: () => void;
  labelsActive?: boolean;
  isExploded?: boolean;
  onReset?: () => void;
}

export const MotorControls: React.FC<MotorControlsProps> = ({
  onRotate,
  onZoom,
  onExplode,
  onToggleLabels,
  labelsActive = true,
  isExploded = false,
  onReset,
}) => {
  return (
    <View className="flex-row items-center justify-around bg-white rounded-3xl p-3 border border-border shadow-md mx-5 mb-4">
      {/* Rotate */}
      <Pressable
        onPress={onRotate}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View className="w-10 h-10 rounded-2xl bg-background items-center justify-center mb-1">
          <RotateCw size={18} color="#6C4DFF" />
        </View>
        <Text className="text-[11px] font-semibold text-navy">Rotate</Text>
      </Pressable>

      {/* Zoom */}
      <Pressable
        onPress={onZoom}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View className="w-10 h-10 rounded-2xl bg-background items-center justify-center mb-1">
          <ZoomIn size={18} color="#6C4DFF" />
        </View>
        <Text className="text-[11px] font-semibold text-navy">Zoom</Text>
      </Pressable>

      {/* Explode / Reset */}
      <Pressable
        onPress={isExploded && onReset ? onReset : onExplode}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center mb-1 ${
            isExploded ? 'bg-primary' : 'bg-background'
          }`}
        >
          {isExploded ? (
            <RotateCcw size={18} color="#FFFFFF" />
          ) : (
            <Box size={18} color="#6C4DFF" />
          )}
        </View>
        <Text className="text-[11px] font-semibold text-navy">
          {isExploded ? 'Reset' : 'Explode'}
        </Text>
      </Pressable>

      {/* Labels */}
      <Pressable
        onPress={onToggleLabels}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center mb-1 ${
            labelsActive ? 'bg-primary' : 'bg-background'
          }`}
        >
          <Tag size={18} color={labelsActive ? '#FFFFFF' : '#6C4DFF'} />
        </View>
        <Text className="text-[11px] font-semibold text-navy">Labels</Text>
      </Pressable>
    </View>
  );
};

export default MotorControls;
