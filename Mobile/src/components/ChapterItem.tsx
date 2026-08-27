import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react-native';
import { ChapterItemData } from '../types';

interface ChapterItemProps {
  chapter: ChapterItemData;
  onPress: () => void;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={chapter.locked}
      className={`flex-row items-center justify-between p-4 rounded-2xl bg-white border border-border mb-3 shadow-sm ${
        chapter.locked ? 'opacity-70 bg-gray-50' : 'active:bg-gray-50'
      }`}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <Text className="text-xs font-bold text-primary">{chapter.number}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-navy">{chapter.title}</Text>
          <Text className="text-xs text-muted mt-0.5">Diagrams: {chapter.diagramsCount}</Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {chapter.completed ? (
          <View className="w-7 h-7 rounded-full bg-green-50 items-center justify-center mr-2">
            <CheckCircle2 size={20} color="#32C978" />
          </View>
        ) : chapter.locked ? (
          <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center mr-2">
            <Lock size={16} color="#737A96" />
          </View>
        ) : (
          <ChevronRight size={18} color="#737A96" />
        )}
      </View>
    </Pressable>
  );
};

export default ChapterItem;
