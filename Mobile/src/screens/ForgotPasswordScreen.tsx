import { useSignIn } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';

export const ForgotPasswordScreen: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendResetEmail = async () => {
    if (!isLoaded) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setStep('reset');
      setSuccessMsg(`Reset code sent to ${email}`);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Failed to send reset email. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!code.trim()) {
      setErrorMsg('Please enter the reset code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setErrorMsg('Password reset incomplete. Please check your inputs.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Reset failed. Invalid code or password.';
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
            if (step === 'reset') {
              setStep('request');
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
            {step === 'request' ? 'Forgot Password 🔐' : 'Set New Password 🔑'}
          </Text>
          <Text className="text-sm text-[#64748B] mt-1.5">
            {step === 'request'
              ? 'Enter your email address and we will send you a reset code.'
              : `Enter the reset code sent to ${email} and your new password.`}
          </Text>
        </View>

        {/* Messages */}
        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5">
            <Text className="text-xs text-[#DC2626] font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-3.5 mb-5">
            <Text className="text-xs text-green-700 font-semibold">{successMsg}</Text>
          </View>
        ) : null}

        {step === 'request' ? (
          /* Request Reset Step */
          <View className="gap-4">
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

            <PrimaryButton
              title="Send Reset Code"
              onPress={handleSendResetEmail}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full shadow-md mt-2"
            />
          </View>
        ) : (
          /* Reset Password Step */
          <View className="gap-4">
            {/* Reset Code */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">Reset Code</Text>
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

            {/* New Password */}
            <View>
              <Text className="text-xs font-bold text-[#0F172A] mb-2">New Password</Text>
              <View className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 py-1.5 border border-[#E2E8F0]">
                <Lock size={18} color="#64748B" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
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

            <PrimaryButton
              title="Reset Password & Log In"
              onPress={handleResetPassword}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full shadow-md mt-2"
            />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="flex-row items-center justify-center py-5 border-t border-[#E2E8F0] bg-white">
        <Text className="text-xs text-[#64748B]">Remember your password? </Text>
        <Pressable onPress={() => router.push('/login')} hitSlop={10}>
          <Text className="text-xs font-bold text-[#2563EB]">Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
