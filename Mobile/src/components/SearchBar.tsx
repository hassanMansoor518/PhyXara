import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, ScanLine } from 'lucide-react-native';
import { router } from 'expo-router';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onScanPress?: () => void;
  showScannerButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search topics, diagrams...',
  onScanPress,
  showScannerButton = true,
}) => {
  const handleScanner = () => {
    if (onScanPress) {
      onScanPress();
    } else {
      router.push('/scanner');
    }
  };

  return (
    <View className="flex-row items-center bg-white rounded-2xl px-4 py-1.5 border border-border shadow-sm">
      <Search size={18} color="#737A96" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#737A96"
        className="flex-1 ml-3 text-sm text-navy py-2"
      />
      {showScannerButton && (
        <Pressable
          onPress={handleScanner}
          className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center ml-2 active:bg-primary/20"
          hitSlop={8}
        >
          <ScanLine size={16} color="#6C4DFF" />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
