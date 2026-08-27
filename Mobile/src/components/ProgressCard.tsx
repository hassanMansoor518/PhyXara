import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ElectricMotorFrontSvg } from './illustrations/ElectricMotorFrontSvg';
import { ChevronRight } from 'lucide-react-native';

interface ProgressCardProps {
  title?: string;
  lastViewed?: string;
  progress?: number; // e.g. 75
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title = 'Electric Motor',
  lastViewed = 'Last viewed • 2d ago',
  progress = 75,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-4 border border-border flex-row items-center justify-between shadow-sm active:bg-gray-50 my-2"
    >
      {/* Motor thumbnail */}
      <View className="w-20 h-20 rounded-2xl bg-background items-center justify-center overflow-hidden border border-border mr-3">
        <ElectricMotorFrontSvg width={90} height={70} />
      </View>

      {/* Info & Progress */}
      <View className="flex-1 justify-center mr-2">
        <Text className="text-base font-bold text-navy">{title}</Text>
        <Text className="text-xs text-muted mt-0.5">{lastViewed}</Text>

        {/* Progress bar */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[11px] font-semibold text-muted">Progress</Text>
            <Text className="text-[11px] font-bold text-primary">{progress}%</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#737A96" />
    </Pressable>
  );
};

export default ProgressCard;
