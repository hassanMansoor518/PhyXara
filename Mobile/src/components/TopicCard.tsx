import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Zap, Magnet, Sun, Settings, Atom, Activity, Triangle } from 'lucide-react-native';
import { PhysicsTopic } from '../types';

interface TopicCardProps {
  topic: PhysicsTopic;
  onPress: () => void;
  variant?: 'grid' | 'horizontal';
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onPress,
  variant = 'horizontal',
}) => {
  const getIcon = (iconName: string, color: string) => {
    const props = { size: 24, color };
    switch (iconName) {
      case 'Zap':
        return <Zap {...props} />;
      case 'Magnet':
        return <Magnet {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'Triangle':
        return <Triangle {...props} />;
      case 'Settings':
        return <Settings {...props} />;
      case 'Atom':
        return <Atom {...props} />;
      case 'Activity':
        return <Activity {...props} />;
      default:
        return <Zap {...props} />;
    }
  };

  if (variant === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        className="bg-white rounded-3xl p-4 border border-border items-center justify-center active:bg-gray-50 shadow-sm flex-1 m-1.5 min-h-[140px]"
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: `${topic.color}15` }}
        >
          {getIcon(topic.iconName, topic.color)}
        </View>
        <Text className="text-sm font-bold text-navy text-center mb-1">{topic.title}</Text>
        <Text className="text-xs text-muted text-center">{topic.chaptersCount} Chapters</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-4 border border-border active:bg-gray-50 shadow-sm mr-3 w-36 items-center"
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: `${topic.color}15` }}
      >
        {getIcon(topic.iconName, topic.color)}
      </View>
      <Text className="text-sm font-bold text-navy text-center mb-0.5" numberOfLines={1}>
        {topic.title}
      </Text>
      <Text className="text-xs text-muted text-center">{topic.chaptersCount} Chapters</Text>
    </Pressable>
  );
};

export default TopicCard;
