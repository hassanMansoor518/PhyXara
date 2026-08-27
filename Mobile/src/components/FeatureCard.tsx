import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScanLine, Box, HelpCircle, Bot } from 'lucide-react-native';

interface FeatureCardProps {
  title: string;
  icon: 'scanner' | '3d' | 'quiz' | 'tutor';
  onPress: () => void;
  color?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  onPress,
}) => {
  const getIconData = () => {
    switch (icon) {
      case 'scanner':
        return {
          icon: <ScanLine size={22} color="#0284C7" />,
          bg: '#E0F2FE',
        };
      case '3d':
        return {
          icon: <Box size={22} color="#EA580C" />,
          bg: '#FFEDD5',
        };
      case 'quiz':
        return {
          icon: <HelpCircle size={22} color="#D97706" />,
          bg: '#FEF3C7',
        };
      case 'tutor':
      default:
        return {
          icon: <Bot size={22} color="#059669" />,
          bg: '#D1FAE5',
        };
    }
  };

  const { icon: iconElement, bg } = getIconData();

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center flex-1 py-1"
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-1.5 shadow-sm active:opacity-80"
        style={{ backgroundColor: bg }}
      >
        {iconElement}
      </View>
      <Text className="text-xs font-semibold text-navy text-center">{title}</Text>
    </Pressable>
  );
};

export default FeatureCard;
