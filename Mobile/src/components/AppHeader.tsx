import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Bell, Bookmark, Settings, Share2, Star } from 'lucide-react-native';
import { router } from 'expo-router';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: 'star' | 'share' | 'settings' | 'bookmark' | 'bell' | 'none';
  isStarred?: boolean;
  onRightPress?: () => void;
  textColor?: string;
  backgroundColor?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon = 'none',
  isStarred = false,
  onRightPress,
  textColor = '#101A43',
  backgroundColor = '#F8FAFC',
  leftAccessory,
  rightAccessory,
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

  const renderRightAction = () => {
    if (rightIcon === 'none') return null;

    const icon = {
      star: <Star size={20} color={isStarred ? '#FFB020' : '#737A96'} fill={isStarred ? '#FFB020' : 'none'} />,
      share: <Share2 size={18} color="#737A96" />,
      settings: <Settings size={20} color="#101A43" />,
      bookmark: <Bookmark size={20} color={isStarred ? '#2563EB' : '#737A96'} fill={isStarred ? '#DBEAFE' : 'none'} />,
      bell: <Bell size={18} color="#101A43" />,
    }[rightIcon];
    const accessibilityLabel = {
      star: isStarred ? 'Remove from favorites' : 'Add to favorites',
      share: 'Share',
      settings: 'Settings',
      bookmark: isStarred ? 'Remove bookmark' : 'Bookmark',
      bell: 'Notifications',
    }[rightIcon];

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={rightIcon === 'bookmark' ? { selected: isStarred } : undefined}
        onPress={onRightPress}
        style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
        hitSlop={8}
      >
        {icon}
      </Pressable>
    );
  };

  return (
    <View style={[styles.header, { backgroundColor, borderBottomColor: '#E2E8F0' }]}>
      <View style={styles.leading}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={textColor === '#FFFFFF' ? '#101A43' : textColor} />
          </Pressable>
        )}
        {leftAccessory}
        {title ? (
          <View style={styles.titleContainer}>
            <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, { color: textColor }]}>
              {title}
            </Text>
            {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
      {rightAccessory || renderRightAction()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leading: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  title: {
    fontFamily: 'AuthPoppins-SemiBold',
    fontSize: 17,
    lineHeight: 23,
  },
  subtitle: {
    fontFamily: 'AuthInter-Regular',
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});

export default AppHeader;
