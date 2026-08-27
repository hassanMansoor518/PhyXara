import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MotorViewType } from '../types';
import { ElectricMotorFrontSvg } from './illustrations/ElectricMotorFrontSvg';
import { ElectricMotorSideSvg } from './illustrations/ElectricMotorSideSvg';
import { ElectricMotorExplodedSvg } from './illustrations/ElectricMotorExplodedSvg';

interface ThumbnailSelectorProps {
  selectedView: MotorViewType;
  onSelectView: (view: MotorViewType) => void;
}

export const ThumbnailSelector: React.FC<ThumbnailSelectorProps> = ({
  selectedView,
  onSelectView,
}) => {
  const views: { type: MotorViewType; label: string }[] = [
    { type: 'front', label: 'Front View' },
    { type: 'side', label: 'Side View' },
    { type: 'exploded', label: 'Exploded View' },
  ];

  return (
    <View className="px-5 mb-6">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {views.map((item) => {
          const isSelected = selectedView === item.type;
          return (
            <Pressable
              key={item.type}
              onPress={() => onSelectView(item.type)}
              className={`mr-3 p-1.5 rounded-2xl bg-white border-2 items-center justify-center shadow-sm ${
                isSelected ? 'border-primary bg-primary-subtle/30' : 'border-border'
              }`}
              style={{ width: 95, height: 75 }}
            >
              <View className="flex-1 items-center justify-center overflow-hidden">
                {item.type === 'front' && <ElectricMotorFrontSvg width={70} height={50} />}
                {item.type === 'side' && <ElectricMotorSideSvg width={70} height={50} />}
                {item.type === 'exploded' && <ElectricMotorExplodedSvg width={70} height={50} separation={0.6} />}
              </View>
              <Text
                className={`text-[10px] font-bold mt-1 ${
                  isSelected ? 'text-primary' : 'text-muted'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ThumbnailSelector;
