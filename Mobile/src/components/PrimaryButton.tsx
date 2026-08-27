import React from 'react';
import { Text, Pressable, ActivityIndicator, View } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  size = 'lg',
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-primary-subtle border border-primary/20';
      case 'outline':
        return 'bg-white border border-border';
      case 'danger':
        return 'bg-red-50 border border-red-200';
      case 'primary':
      default:
        return 'bg-primary';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-primary font-semibold';
      case 'outline':
        return 'text-navy font-semibold';
      case 'danger':
        return 'text-danger font-semibold';
      case 'primary':
      default:
        return 'text-white font-bold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-4 rounded-xl';
      case 'md':
        return 'h-12 px-5 rounded-2xl';
      case 'lg':
      default:
        return 'h-14 px-6 rounded-2xl';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`flex-row items-center justify-center shadow-sm active:opacity-85 ${getButtonStyles()} ${getSizeStyles()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#6C4DFF'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`text-base ${getTextStyles()}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default PrimaryButton;
