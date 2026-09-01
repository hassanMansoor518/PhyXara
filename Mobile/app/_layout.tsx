import '../global.css';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/expo';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import SplashScreen from '../src/screens/SplashScreen';
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

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const currentSegment = segments[0] || '';
    const protectedRoutes = [
      '(tabs)',
      'scanner',
      'detection',
      'motor-viewer',
      'exploded-view',
      'animation',
      'library',
      'electricity',
      'ai-tutor',
      'quiz',
      'profile',
    ];

    const isProtectedRoute = protectedRoutes.includes(currentSegment);
    const isAuthRoute = ['login', 'register', 'forgot-password', 'onboarding'].includes(currentSegment);

    if (!isSignedIn && isProtectedRoute) {
      router.replace('/login');
    } else if (isSignedIn && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="detection" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="motor-viewer" options={{ headerShown: false }} />
      <Stack.Screen name="exploded-view" options={{ headerShown: false }} />
      <Stack.Screen name="animation" options={{ headerShown: false }} />
      <Stack.Screen name="library" options={{ headerShown: false }} />
      <Stack.Screen name="electricity" options={{ headerShown: false }} />
      <Stack.Screen name="ai-tutor" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey || ''} tokenCache={tokenCache}>
        <ClerkLoaded>
          <InitialLayout />
          <StatusBar style="auto" />
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
