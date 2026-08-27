import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotorPartLabel } from '../types';

interface MotorLabelProps {
  label: MotorPartLabel;
  onPress?: () => void;
  isVisible?: boolean;
}

export const MotorLabel: React.FC<MotorLabelProps> = ({
  label,
  onPress,
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        top: `${label.top}%`,
        left: `${label.left}%`,
        transform: [{ translateX: -40 }, { translateY: -15 }],
      }}
      className="flex-row items-center bg-white/95 px-3 py-1.5 rounded-full border border-border shadow-md active:bg-primary-subtle z-20"
    >
      <View className="w-2 h-2 rounded-full bg-primary mr-1.5" />
      <Text className="text-xs font-bold text-navy">{label.name}</Text>
    </Pressable>
  );
};

export default MotorLabel;
