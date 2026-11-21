import '../global.css';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { tokenCache } from '../src/services/tokenCache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file. Please set your publishable key from the Clerk Dashboard.'
  );
}

export const unstable_settings = {
  initialRouteName: 'index',
};

// Keep route guards from waiting forever when Clerk cannot load.
const CLERK_LOAD_TIMEOUT_MS = 8000;

function InitialLayout() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const [clerkTimedOut, setClerkTimedOut] = useState(false);
  const isLoaded = clerkLoaded || clerkTimedOut;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (clerkLoaded) return;
    const timer = setTimeout(() => setClerkTimedOut(true), CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [clerkLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const currentSegment = segments[0] || '';
    const protectedRoutes = [
      '(tabs)',
      'scanner',
      'unity',
      'detection',
      'motor-viewer',
      'diagram-detail',
      'exploded-view',
      'animation',
      'library',
      'electricity',
      'practical',
      'ai-tutor',
      'quiz',
      'profile',
      'progress',
    ];

    const isProtectedRoute = protectedRoutes.includes(currentSegment);
    const isAuthRoute = ['', 'index', 'splash', 'login', 'register', 'forgot-password', 'onboarding'].includes(currentSegment);

    if (!isSignedIn && isProtectedRoute) {
      router.replace('/login');
    } else if (isSignedIn && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="unity" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="detection" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="motor-viewer" options={{ headerShown: false }} />
      <Stack.Screen name="diagram-detail" options={{ headerShown: false }} />
      <Stack.Screen name="exploded-view" options={{ headerShown: false }} />
      <Stack.Screen name="animation" options={{ headerShown: false }} />
      <Stack.Screen name="library" options={{ headerShown: false }} />
      <Stack.Screen name="practical" options={{ headerShown: false }} />
      <Stack.Screen name="electricity" options={{ headerShown: false }} />
      <Stack.Screen name="ai-tutor" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="progress" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useFonts({
    'AuthPoppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'AuthPoppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'AuthInter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'AuthInter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey || ''} tokenCache={tokenCache}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
