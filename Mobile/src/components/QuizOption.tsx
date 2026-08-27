import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, X } from 'lucide-react-native';

interface QuizOptionProps {
  optionKey: string;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
  onSelect: () => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  optionKey,
  text,
  isSelected,
  isCorrect,
  showFeedback = false,
  onSelect,
}) => {
  let containerBg = 'bg-white border-border';
  let badgeBg = 'bg-background text-navy';
  let textColor = 'text-navy';

  if (showFeedback) {
    if (isCorrect) {
      containerBg = 'bg-green-50 border-success/80';
      badgeBg = 'bg-success text-white';
      textColor = 'text-green-900';
    } else if (isSelected && !isCorrect) {
      containerBg = 'bg-red-50 border-danger/80';
      badgeBg = 'bg-danger text-white';
      textColor = 'text-red-900';
    }
  } else if (isSelected) {
    containerBg = 'bg-primary/10 border-primary';
    badgeBg = 'bg-primary text-white';
    textColor = 'text-primary font-bold';
  }

  return (
    <Pressable
      onPress={onSelect}
      disabled={showFeedback}
      className={`flex-row items-center justify-between p-4 rounded-2xl border mb-3 shadow-sm ${containerBg}`}
    >
      <View className="flex-row items-center flex-1 mr-2">
        <View
          className={`w-9 h-9 rounded-xl items-center justify-center mr-3 border border-border/40 ${badgeBg}`}
        >
          <Text className={`text-sm font-bold ${badgeBg.includes('text-white') ? 'text-white' : 'text-navy'}`}>
            {optionKey}
          </Text>
        </View>
        <Text className={`text-sm font-medium flex-1 ${textColor}`}>{text}</Text>
      </View>

      {showFeedback && isCorrect && (
        <View className="w-6 h-6 rounded-full bg-success items-center justify-center">
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}

      {showFeedback && isSelected && !isCorrect && (
        <View className="w-6 h-6 rounded-full bg-danger items-center justify-center">
          <X size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
};

export default QuizOption;
