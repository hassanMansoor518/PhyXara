import { useSignUp } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import { ArrowLeft, KeyRound, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { AuthLayout, authStyles } from '../components/auth/AuthLayout';
import { AuthButton, AuthError, AuthInput, SocialAuthButtons } from '../components/auth/AuthControls';

import { useSocialAuth } from '../hooks/useSocialAuth';

export const RegisterScreen: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const socialAuth = useSocialAuth(setIsLoading, setErrorMsg);

  const handleSignUp = async () => {
    if (!isLoaded || isLoading) return;
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

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(/\s+/);
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
    if (!isLoaded || isLoading) return;
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

      if (completeSignUp.status === 'complete' && completeSignUp.createdSessionId) {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      } else {
        const missing = completeSignUp.missingFields.join(', ');
        setErrorMsg(missing ? 'Registration requires: ' + missing : 'Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setCode('');
      Alert.alert('Verification code sent');
    } catch {
      setErrorMsg('Could not resend the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={pendingVerification ? 'Verify Your Email' : 'Create Account'}
      subtitle={pendingVerification ? `We sent a verification code to ${email}` : 'Start your learning journey'}
      footer={
        <View style={authStyles.footerRow}>
          <Text style={authStyles.text}>Already have an account?</Text>
          <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} hitSlop={10}>
            <Text style={authStyles.link}>Login</Text>
          </Pressable>
        </View>
      }
    >
      <View style={authStyles.form}>
        <AuthError message={errorMsg} />
        {pendingVerification ? (
          <>
            <Pressable accessibilityRole="button" disabled={isLoading} onPress={() => { setPendingVerification(false); setCode(''); setErrorMsg(''); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36 }}>
              <ArrowLeft size={18} color="#5700DC" />
              <Text style={authStyles.link}>Edit account details</Text>
            </Pressable>
            <AuthInput icon={KeyRound} value={code} onChangeText={setCode} placeholder="Verification Code" keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" returnKeyType="go" onSubmitEditing={handleVerifyCode} editable={!isLoading} />
            <AuthButton title="Verify & Continue" onPress={handleVerifyCode} loading={isLoading} disabled={!isLoaded} />
            <Pressable accessibilityRole="button" disabled={isLoading || !isLoaded} onPress={resendCode} style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={authStyles.link}>Resend verification code</Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthInput icon={User} value={name} onChangeText={setName} placeholder="Full Name" autoCapitalize="words" autoComplete="name" textContentType="name" editable={!isLoading} />
            <AuthInput icon={Mail} value={email} onChangeText={setEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" editable={!isLoading} />
            <AuthInput icon={Lock} password value={password} onChangeText={setPassword} placeholder="Password" accessibilityHint="Use at least 8 characters" autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={handleSignUp} editable={!isLoading} />
            <AuthButton title="Sign Up" onPress={handleSignUp} loading={isLoading} disabled={!isLoaded} />
            <SocialAuthButtons signUp disabled={isLoading || !isLoaded} onGoogle={() => socialAuth('Google')} onFacebook={() => socialAuth('Facebook')} />
          </>
        )}
      </View>
    </AuthLayout>
  );
};

export default RegisterScreen;
