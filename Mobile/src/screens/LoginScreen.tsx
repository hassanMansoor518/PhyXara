import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignIn } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import { Check, Lock, Mail } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthButton, AuthError, AuthInput, SocialAuthButtons } from '../components/auth/AuthControls';
import { AuthLayout, authColors, authStyles } from '../components/auth/AuthLayout';
import { useSocialAuth } from '../hooks/useSocialAuth';

const REMEMBERED_EMAIL_KEY = 'phyxara.remembered-email';

export const LoginScreen: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const edited = useRef(false);
  const socialAuth = useSocialAuth(setIsLoading, setErrorMsg);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(REMEMBERED_EMAIL_KEY).then((savedEmail) => {
      if (active && !edited.current && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const rememberEmail = async () => {
    try {
      if (rememberMe) await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      else await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch {
      // A storage failure must not prevent login.
    }
  };
  const handleLogin = async () => {
    if (!isLoaded || isLoading) return;
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
        await rememberEmail();
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

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to continue your learning journey" footer={
      <View style={authStyles.footerRow}>
        <Text style={authStyles.text}>Don&apos;t have an account?</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/register')} hitSlop={10}>
          <Text style={authStyles.link}>Sign Up</Text>
        </Pressable>
      </View>
    }>
      <View style={authStyles.form}>
        <AuthError message={errorMsg} />
        <AuthInput icon={Mail} value={email} onChangeText={(value) => { edited.current = true; setEmail(value); }} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" editable={!isLoading} />
        <AuthInput icon={Lock} password value={password} onChangeText={setPassword} placeholder="Password" autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={handleLogin} editable={!isLoading} />
        <View style={styles.options}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel="Remember me" accessibilityHint="Save your email address on this device for your next login" accessibilityState={{ checked: rememberMe }} aria-checked={rememberMe} disabled={isLoading} onPress={() => {
            edited.current = true;
            setRememberMe(!rememberMe);
            if (rememberMe) void AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY).catch(() => {});
          }} style={styles.remember}>
            <View style={[styles.checkbox, rememberMe && styles.checked]}>{rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}</View>
            <Text style={authStyles.text}>Remember me</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/forgot-password')} hitSlop={8}>
            <Text style={authStyles.link}>Forgot Password?</Text>
          </Pressable>
        </View>
        <AuthButton title="Login" onPress={handleLogin} loading={isLoading} disabled={!isLoaded} />
        <SocialAuthButtons disabled={isLoading || !isLoaded} onGoogle={() => socialAuth('Google')} onFacebook={() => socialAuth('Facebook')} />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  options: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, paddingHorizontal: 4 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: authColors.border, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: authColors.purple, borderColor: authColors.purple },
});

export default LoginScreen;
