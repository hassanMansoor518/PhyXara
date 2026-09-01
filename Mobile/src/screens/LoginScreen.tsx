import { useOAuth } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!isLoaded) return;
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setErrorMsg('Authentication requires further steps.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid email or password. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startGoogleOAuth();
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Google sign in was cancelled or failed.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleOAuth]);

  return (
    <SafeAreaView className="flex-1 bg-background justify-between">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-extrabold text-navy">Welcome Back! 👋</Text>
          <Text className="text-sm text-muted mt-1.5">Login to continue learning</Text>
        </View>

        {/* Error Banner */}
        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5">
            <Text className="text-xs text-danger font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View className="space-y-4">
          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-navy mb-2">Email</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-1.5 border border-border shadow-sm">
              <Mail size={18} color="#737A96" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                placeholderTextColor="#737A96"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-sm text-navy py-2"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-2">
            <Text className="text-xs font-bold text-navy mb-2">Password</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-1.5 border border-border shadow-sm">
              <Lock size={18} color="#737A96" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#737A96"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-sm text-navy py-2"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                {showPassword ? (
                  <EyeOff size={18} color="#737A96" />
                ) : (
                  <Eye size={18} color="#737A96" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <View className="items-end mb-6">
            <Pressable
              onPress={() => router.push('/forgot-password')}
              hitSlop={8}
            >
              <Text className="text-xs font-semibold text-primary">Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full shadow-md"
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="text-xs text-muted px-4 font-medium">or continue with</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Social Logins */}
          <View className="flex-row mb-6">
            {/* Google */}
            <Pressable
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className="flex-1 flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-border shadow-sm active:bg-gray-50"
            >
              <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">G</Text>
              </View>
              <Text className="text-xs font-bold text-navy">Google</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sign Up Footer */}
      <View className="flex-row items-center justify-center py-5 border-t border-border/40 bg-background">
        <Text className="text-xs text-muted">Don't have an account? </Text>
        <Pressable onPress={() => router.push('/register')} hitSlop={10}>
          <Text className="text-xs font-bold text-primary">Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
