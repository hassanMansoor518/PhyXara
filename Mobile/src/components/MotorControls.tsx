import { Box, RotateCcw, RotateCw, Tag, ZoomIn } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

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
    <View className="flex-row items-center justify-around bg-white rounded-3xl p-3 border border-[#E2E8F0] shadow-md mx-5 mb-4">
      {/* Rotate */}
      <Pressable
        onPress={onRotate}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View className="w-10 h-10 rounded-2xl bg-[#EFF6FF] items-center justify-center mb-1 border border-[#DBEAFE]">
          <RotateCw size={18} color="#2563EB" />
        </View>
        <Text className="text-[11px] font-bold text-[#0F172A]">Rotate</Text>
      </Pressable>

      {/* Zoom */}
      <Pressable
        onPress={onZoom}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View className="w-10 h-10 rounded-2xl bg-[#EFF6FF] items-center justify-center mb-1 border border-[#DBEAFE]">
          <ZoomIn size={18} color="#2563EB" />
        </View>
        <Text className="text-[11px] font-bold text-[#0F172A]">Zoom</Text>
      </Pressable>

      {/* Explode / Reset */}
      <Pressable
        onPress={isExploded && onReset ? onReset : onExplode}
        className="items-center justify-center flex-1 py-1 active:opacity-70"
      >
        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center mb-1 ${
            isExploded ? 'bg-[#2563EB]' : 'bg-[#EFF6FF] border border-[#DBEAFE]'
          }`}
        >
          {isExploded ? (
            <RotateCcw size={18} color="#FFFFFF" />
          ) : (
            <Box size={18} color="#2563EB" />
          )}
        </View>
        <Text className="text-[11px] font-bold text-[#0F172A]">
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
            labelsActive ? 'bg-[#2563EB]' : 'bg-[#EFF6FF] border border-[#DBEAFE]'
          }`}
        >
          <Tag size={18} color={labelsActive ? '#FFFFFF' : '#2563EB'} />
        </View>
        <Text className="text-[11px] font-bold text-[#0F172A]">Labels</Text>
      </Pressable>
    </View>
  );
};

export default MotorControls;
