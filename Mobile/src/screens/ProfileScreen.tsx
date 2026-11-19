import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import {
  Award,
  Bell,
  ChevronRight,
  Flame,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  Shield,
  User,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BottomTabBar } from '../components/BottomTabBar';
import { UserAvatarSvg } from '../components/illustrations/UserAvatarSvg';
import { defaultPreferences, emptyStats, Preferences, Progress, useLearningAccount, useLearningData } from '../services/learningService';

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();


  const { data: progress } = useLearningData<Progress>('/progress');
  const { data, failed, retry } = useLearningData<Preferences>('/me/preferences');
  const { request } = useLearningAccount();
  const [saving, setSaving] = useState(false);
  const stats = progress?.stats ?? emptyStats;
  const preferences = data ?? defaultPreferences;

  const save = async (patch: Partial<Preferences>) => {
    if (saving) return;
    setSaving(true);
    try {
      await request('/me/preferences', { method: 'PATCH', body: JSON.stringify(patch) });
      retry();
    } catch {
      Alert.alert('Settings unavailable', 'Try again when you are connected.');
    } finally {
      setSaving(false);
    }
  };

  const chooseClass = (classes: string[]) => Alert.alert('Select class', undefined,
    classes.map(classLevel => ({ text: classLevel, onPress: () => void save({ classLevel }) })));

  const userName = user?.fullName || user?.firstName || 'Student';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'student@phyxara.edu';
  const avatarUrl = user?.imageUrl;

  const menuOptions = [
    {
      id: 'edit_profile',
      title: 'Edit Profile & Class',
      subtitle: preferences.classLevel + ' • Sindh Textbook Board',
      icon: <User size={18} color="#2563EB" />,
      action: () => Alert.alert('Select class', undefined, [
        { text: 'Classes 9–10', onPress: () => chooseClass(['Class 9', 'Class 10']) },
        { text: 'Classes 11–12', onPress: () => chooseClass(['Class 11', 'Class 12']) },
        { text: 'Cancel', style: 'cancel' },
      ]),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: preferences.reminders ? 'Reminder preference on' : 'Reminder preference off',
      icon: <Bell size={18} color="#2563EB" />,
      action: () => void save({ reminders: !preferences.reminders }),
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English (Sindh Board Edition)',
      icon: <Globe size={18} color="#2563EB" />,
      action: () => Alert.alert('Language', 'Current language: English.'),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Streak time zone: ' + preferences.timeZone,
      icon: <Settings size={18} color="#2563EB" />,
      action: () => void save({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs and textbook scanning guide',
      icon: <HelpCircle size={18} color="#2563EB" />,
      action: () => Alert.alert('Help & Support', 'Need help? Contact support@phyxara.edu'),
    },
    {
      id: 'about',
      title: 'About PhyXara',
      subtitle: 'Sindh Textbook Board Physics AR',
      icon: <Info size={18} color="#2563EB" />,
      action: () => Alert.alert('About PhyXara', 'PhyXara is an AR + 3D + AI Physics learning tool for Class 9-12 students.'),
    },
  ];

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            // ignore
          }
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Student Profile"
        rightIcon="none"
        onBack={() => router.replace('/(tabs)')}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-4 items-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-20 h-20 rounded-3xl border-2 border-[#2563EB]"
            />
          ) : (
            <View className="w-20 h-20 rounded-3xl bg-[#3B5AF6] items-center justify-center shadow-md">
              <Text className="text-white text-2xl font-black">SA</Text>
            </View>
          )}

          <Text className="text-lg font-black text-[#0F172A] mt-3">{userName}</Text>
          <Text className="text-xs text-[#64748B] mt-0.5">{userEmail}</Text>

          {/* Badge */}
          <View className="mt-2 bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full">
            <Text className="text-[11px] font-extrabold text-[#2563EB]">
              Class 9 • Sindh Textbook Board
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-[#F1F5F9]">
            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <Zap size={14} color="#2563EB" />
                <Text className="text-base font-black text-[#0F172A] ml-1">{stats.xp}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-[#64748B] mt-0.5">XP Earned</Text>
            </View>

            <View className="w-[1px] h-7 bg-[#E2E8F0]" />

            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <Flame size={14} color="#F59E0B" />
                <Text className="text-base font-black text-[#0F172A] ml-1">{stats.streak}d</Text>
              </View>
              <Text className="text-[11px] font-semibold text-[#64748B] mt-0.5">Streak</Text>
            </View>

            <View className="w-[1px] h-7 bg-[#E2E8F0]" />

            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <Award size={14} color="#16A34A" />
                <Text className="text-base font-black text-[#0F172A] ml-1">{stats.overallProgress}%</Text>
              </View>
              <Text className="text-[11px] font-semibold text-[#64748B] mt-0.5">Mastery</Text>
            </View>
          </View>
        </View>

        {/* Menu Options Card */}
        <View className="bg-white rounded-3xl p-2 border border-[#E2E8F0] shadow-sm mb-4">
          {menuOptions.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={item.action}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl active:bg-[#F8FAFC] ${
                index < menuOptions.length - 1 ? 'border-b border-[#F1F5F9]' : ''
              }`}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-[#EFF6FF] items-center justify-center mr-3 border border-[#DBEAFE]">
                  {item.icon}
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0F172A]">{item.title}</Text>
                  {item.subtitle ? (
                    <Text className="text-[10px] text-[#64748B] mt-0.5">{item.subtitle}</Text>
                  ) : null}
                </View>
              </View>

              <ChevronRight size={16} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        {/* Log Out Button */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-50 rounded-2xl py-3.5 border border-red-200 shadow-sm active:bg-red-100"
        >
          <LogOut size={16} color="#DC2626" className="mr-2" />
          <Text className="text-xs font-extrabold text-[#DC2626] ml-1.5">Log Out</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation */}
      {failed && <Text onPress={retry}>Settings unavailable. Tap to retry.</Text>}
      <BottomTabBar activeTab="profile" />
    </SafeAreaView>
  );
};

export default ProfileScreen;
