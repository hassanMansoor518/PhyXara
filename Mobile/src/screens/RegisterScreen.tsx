import { useSignUp } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';

export const RegisterScreen: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || undefined;

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Registration failed. Please check your credentials.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded) return;
    setErrorMsg('');

    if (!code.trim()) {
      setErrorMsg('Please enter the verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setErrorMsg('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] justify-between">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}>
        {/* Back Button */}
        <Pressable
          onPress={() => {
            if (pendingVerification) {
              setPendingVerification(false);
            } else {
              router.back();
            }
          }}
          className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center mb-6 shadow-sm active:bg-gray-100"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-2xl font-black text-[#0F172A]">
            {pendingVerification ? 'Verify Your Email ✉️' : 'Create Account 🚀'}
          </Text>
          <Text className="text-sm text-[#64748B] mt-1.5">
            {pendingVerification
              ? `We sent a verification code to ${email}`
              : 'Sign up to start learning with PhyXara'}
          </Text>
        </View>

        {/* Error Banners */}
        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5">
            <Text className="text-xs text-[#DC2626] font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {pendingVerification ? (
          /* Code Verification Form */
          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Verification Code</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <KeyRound size={18} color="#64748B" />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  className="flex-1 ml-3 text-sm text-[#0F172A] py-2.5"
                />
              </View>
            </View>

            <PrimaryButton
              title="Verify & Continue"
              onPress={handleVerifyCode}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full shadow-md mt-2"
            />
          </View>
        ) : (
          /* Registration Form */
          <View className="gap-4">
            {/* Full Name Field */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Full Name</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <User size={18} color="#64748B" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Hassan Ali"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  className="flex-1 ml-3 text-sm text-[#0F172A] py-2.5"
                />
              </View>
            </View>

            {/* Email Field */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Email Address</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <Mail size={18} color="#64748B" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@example.com"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-sm text-[#0F172A] py-2.5"
                />
              </View>
            </View>

            {/* Password Field */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Password</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <Lock size={18} color="#64748B" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-sm text-[#0F172A] py-2.5"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <Lock size={18} color="#64748B" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-sm text-[#0F172A] py-2.5"
                />
              </View>
            </View>

            {/* Register Button */}
            <PrimaryButton
              title="Create Account"
              onPress={handleSignUp}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full shadow-md mt-2"
            />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="flex-row items-center justify-center py-5 border-t border-[#E2E8F0] bg-white">
        <Text className="text-xs text-[#64748B]">Already have an account? </Text>
        <Pressable onPress={() => router.push('/login')} hitSlop={10}>
          <Text className="text-xs font-bold text-[#2563EB]">Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;
