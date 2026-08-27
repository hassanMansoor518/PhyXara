import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, Star, Share2, Settings, Bookmark, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: 'star' | 'share' | 'settings' | 'bookmark' | 'bell' | 'none';
  isStarred?: boolean;
  onRightPress?: () => void;
  textColor?: string;
  backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightIcon = 'none',
  isStarred = false,
  onRightPress,
  textColor = '#101A43',
  backgroundColor = 'transparent',
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View
      className="flex-row items-center justify-between px-5 pt-3 pb-3"
      style={{ backgroundColor }}
    >
      <View className="w-10">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white/80 border border-border items-center justify-center active:bg-gray-100"
            hitSlop={10}
          >
            <ArrowLeft size={20} color={textColor === '#FFFFFF' ? '#101A43' : textColor} />
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <Text
          className="text-lg font-bold text-center flex-1 mx-2"
          style={{ color: textColor }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}

      <View className="w-10 items-end">
        {rightIcon === 'star' && (
          <Pressable
            onPress={onRightPress}
            className="w-10 h-10 rounded-full bg-white/80 border border-border items-center justify-center active:bg-gray-100"
            hitSlop={10}
          >
            <Star
              size={20}
              color={isStarred ? '#FFB020' : '#737A96'}
              fill={isStarred ? '#FFB020' : 'none'}
            />
          </Pressable>
        )}
        {rightIcon === 'share' && (
          <Pressable
            onPress={onRightPress}
            className="w-10 h-10 rounded-full bg-white/80 border border-border items-center justify-center active:bg-gray-100"
            hitSlop={10}
          >
            <Share2 size={18} color="#737A96" />
          </Pressable>
        )}
        {rightIcon === 'settings' && (
          <Pressable
            onPress={onRightPress}
            className="w-10 h-10 rounded-full bg-white/80 border border-border items-center justify-center active:bg-gray-100"
            hitSlop={10}
          >
            <Settings size={20} color="#101A43" />
          </Pressable>
        )}
        {rightIcon === 'bookmark' && (
          <Pressable
            onPress={onRightPress}
            className="w-10 h-10 rounded-full bg-white/80 border border-border items-center justify-center active:bg-gray-100"
            hitSlop={10}
          >
            <Bookmark size={20} color="#737A96" />
          </Pressable>
        )}
        {rightIcon === 'bell' && (
          <Pressable
            onPress={onRightPress}
            className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center active:bg-gray-100 shadow-sm"
            hitSlop={10}
          >
            <Bell size={18} color="#101A43" />
          </Pressable>
        )}
        {rightIcon === 'none' && <View className="w-10" />}
      </View>
    </View>
  );
};

export default AppHeader;
