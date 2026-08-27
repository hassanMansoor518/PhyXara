import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { authService } from '../services/authService';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('example@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await authService.loginWithGoogle();
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    await authService.loginWithApple();
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-between">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-extrabold text-navy">Welcome Back! 👋</Text>
          <Text className="text-sm text-muted mt-1.5">Login to continue</Text>
        </View>

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
              onPress={() => Alert.alert('Reset Password', 'A reset link has been sent to your email.')}
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
            className="w-full shadow-md"
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="text-xs text-muted px-4 font-medium">or continue with</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Social Logins */}
          <View className="flex-row space-x-3 mb-6">
            {/* Google */}
            <Pressable
              onPress={handleGoogleLogin}
              className="flex-1 flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-border shadow-sm active:bg-gray-50 mr-2"
            >
              <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">G</Text>
              </View>
              <Text className="text-xs font-bold text-navy">Google</Text>
            </Pressable>

            {/* Apple */}
            <Pressable
              onPress={handleAppleLogin}
              className="flex-1 flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-border shadow-sm active:bg-gray-50 ml-2"
            >
              <View className="w-5 h-5 rounded-full bg-black items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold"></Text>
              </View>
              <Text className="text-xs font-bold text-navy">Apple</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sign Up Footer */}
      <View className="flex-row items-center justify-center py-5 border-t border-border/40 bg-background">
        <Text className="text-xs text-muted">Don't have an account? </Text>
        <Pressable onPress={handleLogin} hitSlop={10}>
          <Text className="text-xs font-bold text-primary">Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
