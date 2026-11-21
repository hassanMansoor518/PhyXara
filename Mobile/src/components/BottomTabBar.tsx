import { router, usePathname } from 'expo-router';
import { Award, BookOpen, ChartNoAxesColumnIncreasing, Home, ScanLine, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhyXaraLogo } from './PhyXaraLogo';

export interface BottomTabBarProps {
  activeTab?: 'home' | 'explore' | 'scan' | 'progress' | 'profile';
  variant?: 'default' | 'progress';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, variant = 'default' }) => {
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

  // Opt-in styling for Progress only; the existing routes remain shared.
  if (variant === 'progress') {
    const tabs = [
      { label: 'Home', path: '/(tabs)', Icon: Home, selected: isHome },
      { label: 'Explore', path: '/library', Icon: BookOpen, selected: isExplore },
      { label: 'AR Scanner', path: '/scanner', Icon: ScanLine, selected: false },
      { label: 'Progress', path: '/progress', Icon: ChartNoAxesColumnIncreasing, selected: isProgress },
      { label: 'Profile', path: '/profile', Icon: User, selected: isProfile },
    ];
    return <View style={[styles.progressBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map(({ label, path, Icon, selected }, index) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => { if (!selected) navigateTo(path); }} style={({ pressed }) => [styles.progressTab, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}>
        {index === 2 ? <LinearGradient colors={['#8354FF', '#702EFF']} style={styles.progressScan}><Icon size={24} color="#FFFFFF" /></LinearGradient> : <><Icon size={20} color={selected ? '#5700DC' : '#494456'} /><Text style={[styles.progressLabel, { color: selected ? '#5700DC' : '#494456' }]}>{label}</Text></>}
      </Pressable>)}
    </View>;
  }

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
  progressBar: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#D5D1E499', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, boxShadow: '0 -3px 16px rgba(8,15,56,0.04)' },
  progressTab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 },
  progressScan: { width: 56, height: 56, marginTop: -24, borderRadius: 28, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(112,46,255,0.35)' },
  progressLabel: { fontFamily: 'AuthInter-Medium', fontSize: 11, lineHeight: 16 },
  scanButtonShadow: {
    boxShadow: '0 6px 8px rgba(37, 99, 235, 0.35)',
    elevation: 8,
  },
});

export default BottomTabBar;
