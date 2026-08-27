import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Home, BookOpen, ScanLine, Bot, User } from 'lucide-react-native';
import { usePathname, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isHome = pathname === '/' || pathname === '/home' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isLibrary = pathname.includes('library') || pathname.includes('explore');
  const isAITutor = pathname.includes('ai-tutor') || pathname.includes('tutor');
  const isProfile = pathname.includes('profile');

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View
      className="bg-white border-t border-border flex-row items-center justify-around px-2 shadow-lg"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 8 }}
    >
      {/* Home Tab */}
      <Pressable
        onPress={() => navigateTo('/(tabs)')}
        className="items-center justify-center flex-1 py-1"
      >
        <Home size={22} color={isHome ? '#6C4DFF' : '#737A96'} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isHome ? 'text-primary font-bold' : 'text-muted'}`}
        >
          Home
        </Text>
      </Pressable>

      {/* Library Tab */}
      <Pressable
        onPress={() => navigateTo('/library')}
        className="items-center justify-center flex-1 py-1"
      >
        <BookOpen size={22} color={isLibrary ? '#6C4DFF' : '#737A96'} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isLibrary ? 'text-primary font-bold' : 'text-muted'}`}
        >
          Library
        </Text>
      </Pressable>

      {/* Elevated Scan Button */}
      <View className="items-center justify-center -mt-6 flex-1">
        <Pressable
          onPress={() => navigateTo('/scanner')}
          className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:scale-95 active:bg-primary-dark border-4 border-white"
          style={styles.scanButtonShadow}
        >
          <ScanLine size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* AI Tutor Tab */}
      <Pressable
        onPress={() => navigateTo('/ai-tutor')}
        className="items-center justify-center flex-1 py-1"
      >
        <Bot size={22} color={isAITutor ? '#6C4DFF' : '#737A96'} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isAITutor ? 'text-primary font-bold' : 'text-muted'}`}
        >
          AI Tutor
        </Text>
      </Pressable>

      {/* Profile Tab */}
      <Pressable
        onPress={() => navigateTo('/profile')}
        className="items-center justify-center flex-1 py-1"
      >
        <User size={22} color={isProfile ? '#6C4DFF' : '#737A96'} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isProfile ? 'text-primary font-bold' : 'text-muted'}`}
        >
          Profile
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  scanButtonShadow: {
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomTabBar;
