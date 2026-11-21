import { router, usePathname } from 'expo-router';
import { Award, BookOpen, Home, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhyXaraLogo } from './PhyXaraLogo';

export interface BottomTabBarProps {
  activeTab?: 'home' | 'explore' | 'scan' | 'progress' | 'profile';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab }) => {
  const insets = useSafeAreaInsets();

  const pathname = usePathname();

  const isHome =
    activeTab === 'home' ||
    (!activeTab &&
      (pathname === '/' ||
        pathname === '/home' ||
        pathname === '/(tabs)' ||
        pathname === '/(tabs)/index'));

  const isExplore =
    activeTab === 'explore' ||
    (!activeTab &&
      (pathname.includes('library') ||
        pathname.includes('explore') ||
        pathname.includes('chapter') ||
        pathname.includes('electricity')));

  const isProgress =
    activeTab === 'progress' || (!activeTab && pathname.includes('progress'));

  const isProfile =
    activeTab === 'profile' || (!activeTab && pathname.includes('profile'));

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View
      className="bg-white border-t border-[#E2E8F0] flex-row items-center justify-around px-2 shadow-lg"
      style={{ paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8 }}
    >
      {/* Home Tab */}
      <Pressable
        onPress={() => navigateTo('/(tabs)')}
        className="items-center justify-center flex-1 py-1"
      >
        <Home size={22} color={isHome ? '#2563EB' : '#64748B'} strokeWidth={isHome ? 2.5 : 2} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isHome ? 'text-[#2563EB] font-extrabold' : 'text-[#64748B]'}`}
        >
          Home
        </Text>
      </Pressable>

      {/* Explore Tab */}
      <Pressable
        onPress={() => navigateTo('/library')}
        className="items-center justify-center flex-1 py-1"
      >
        <BookOpen size={22} color={isExplore ? '#2563EB' : '#64748B'} strokeWidth={isExplore ? 2.5 : 2} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isExplore ? 'text-[#2563EB] font-extrabold' : 'text-[#64748B]'}`}
        >
          Explore
        </Text>
      </Pressable>

      {/* Elevated Scan Button (Visually Emphasized) */}
      <View className="items-center justify-center -mt-6 flex-1">
        <Pressable
          onPress={() => navigateTo('/scanner')}
          className="w-14 h-14 rounded-full bg-[#2563EB] items-center justify-center shadow-lg active:scale-95 border-4 border-white"
          style={styles.scanButtonShadow}
        >
          <PhyXaraLogo size={32} white />
        </Pressable>
      </View>

      {/* Progress Tab */}
      <Pressable
        onPress={() => navigateTo('/progress')}
        className="items-center justify-center flex-1 py-1"
      >
        <Award size={22} color={isProgress ? '#2563EB' : '#64748B'} strokeWidth={isProgress ? 2.5 : 2} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isProgress ? 'text-[#2563EB] font-extrabold' : 'text-[#64748B]'}`}
        >
          Progress
        </Text>
      </Pressable>

      {/* Profile Tab */}
      <Pressable
        onPress={() => navigateTo('/profile')}
        className="items-center justify-center flex-1 py-1"
      >
        <User size={22} color={isProfile ? '#2563EB' : '#64748B'} strokeWidth={isProfile ? 2.5 : 2} />
        <Text
          className={`text-[11px] mt-1 font-medium ${isProfile ? 'text-[#2563EB] font-extrabold' : 'text-[#64748B]'}`}
        >
          Profile
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  scanButtonShadow: {
    boxShadow: '0 6px 8px rgba(37, 99, 235, 0.35)',
    elevation: 8,
  },
});

export default BottomTabBar;
