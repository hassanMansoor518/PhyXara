import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = '@phyxara_user';
const ONBOARDING_COMPLETED_KEY = '@phyxara_onboarding';

export const DEFAULT_USER: UserProfile = {
  name: 'Ali Hassan',
  email: 'ali.hassan@example.com',
  chaptersCompleted: 12,
  diagramsViewed: 45,
  quizzesCompleted: 6,
};

export const authService = {
  login: async (email: string, _password?: string): Promise<UserProfile> => {
    // Simulated auth delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: UserProfile = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
    };
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // fallback
    }
    return user;
  },

  loginWithGoogle: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user: UserProfile = {
      ...DEFAULT_USER,
      name: 'Ali Hassan',
      email: 'ali.google@example.com',
    };
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // fallback
    }
    return user;
  },

  loginWithApple: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user: UserProfile = {
      ...DEFAULT_USER,
      name: 'Ali Hassan',
      email: 'ali.apple@icloud.com',
    };
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // fallback
    }
    return user;
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  },

  setOnboardingDone: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch {
      // ignore
    }
  },

  isOnboardingDone: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },
};

export default authService;
