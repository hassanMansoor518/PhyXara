import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import {
  Bookmark,
  ChevronRight,
  Download,
  HelpCircle,
  History,
  Info,
  LogOut,
  Settings,
} from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { UserAvatarSvg } from '../components/illustrations/UserAvatarSvg';

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const userName = user?.fullName || user?.firstName || 'Learner';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'user@example.com';
  const avatarUrl = user?.imageUrl;

  const menuItems = [
    {
      id: 'downloads',
      title: 'Downloads',
      icon: <Download size={18} color="#101A43" />,
      badge: '3 files',
    },
    {
      id: 'bookmarks',
      title: 'Bookmarks',
      icon: <Bookmark size={18} color="#101A43" />,
      badge: '8 saved',
    },
    {
      id: 'history',
      title: 'History',
      icon: <History size={18} color="#101A43" />,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings size={18} color="#101A43" />,
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <HelpCircle size={18} color="#101A43" />,
    },
    {
      id: 'about',
      title: 'About Us',
      icon: <Info size={18} color="#101A43" />,
    },
  ];

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Profile"
        rightIcon="settings"
        onRightPress={() => Alert.alert('Settings', 'App version 1.0.0')}
        onBack={() => router.replace('/(tabs)')}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View className="bg-white rounded-3xl p-5 border border-border items-center shadow-sm mb-4">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
          ) : (
            <UserAvatarSvg size={76} />
          )}
          <Text className="text-lg font-extrabold text-navy mt-3">{userName}</Text>
          <Text className="text-xs text-muted mt-0.5">{userEmail}</Text>

          {/* Stats Row */}
          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-border">
            <View className="items-center flex-1">
              <Text className="text-base font-extrabold text-primary">12</Text>
              <Text className="text-[11px] font-medium text-muted mt-0.5">Chapters</Text>
            </View>

            <View className="w-[1px] h-7 bg-border" />

            <View className="items-center flex-1">
              <Text className="text-base font-extrabold text-primary">45</Text>
              <Text className="text-[11px] font-medium text-muted mt-0.5">Diagrams</Text>
            </View>

            <View className="w-[1px] h-7 bg-border" />

            <View className="items-center flex-1">
              <Text className="text-base font-extrabold text-primary">6</Text>
              <Text className="text-[11px] font-medium text-muted mt-0.5">Quizzes</Text>
            </View>
          </View>
        </View>

        {/* Menu Items Card */}
        <View className="bg-white rounded-3xl p-2 border border-border shadow-sm mb-4">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => Alert.alert(item.title, `${item.title} opened`)}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl active:bg-gray-50 ${
                index < menuItems.length - 1 ? 'border-b border-border/40' : ''
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-background items-center justify-center mr-3">
                  {item.icon}
                </View>
                <Text className="text-xs font-bold text-navy">{item.title}</Text>
              </View>

              <View className="flex-row items-center">
                {item.badge ? (
                  <Text className="text-[11px] font-semibold text-muted mr-2">{item.badge}</Text>
                ) : null}
                <ChevronRight size={16} color="#737A96" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Log Out Button */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-50 rounded-2xl py-3.5 border border-red-200 shadow-sm active:bg-red-100"
        >
          <LogOut size={16} color="#FF4D4F" className="mr-2" />
          <Text className="text-xs font-bold text-danger ml-1.5">Log Out</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default ProfileScreen;
