import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { authColors, authStyles } from './AuthLayout';

export function AuthInput({ icon: Icon, password = false, ...props }: TextInputProps & { icon: LucideIcon; password?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.field, focused && styles.focused]}>
      <Icon size={18} color={authColors.muted} />
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel || props.placeholder}
        placeholderTextColor={authColors.muted}
        secureTextEntry={password && !visible}
        selectionColor={authColors.purple}
        style={[styles.input, props.style]}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
      />
      {password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible(!visible)} style={styles.eye}>
        {visible ? <Eye size={18} color={authColors.muted} /> : <EyeOff size={18} color={authColors.muted} />}
      </Pressable>}
    </View>
  );
}

export function AuthButton({ title, onPress, loading, disabled }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    <LinearGradient colors={['#702EFF', '#5700DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonFill}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.buttonText}>{title}</Text><ArrowRight size={18} color="#FFFFFF" /></>}
    </LinearGradient>
  </Pressable>;
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={authStyles.error}><Text style={authStyles.errorText}>{message}</Text></View>;
}

export function SocialAuthButtons({ signUp = false, disabled, onGoogle, onFacebook }: { signUp?: boolean; disabled: boolean; onGoogle: () => void; onFacebook: () => void }) {
  return <>
    <View style={styles.divider}><Text style={authStyles.text}>{signUp ? 'or sign up with' : 'or continue with'}</Text></View>
    <View style={styles.socialRow}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${signUp ? 'Sign up' : 'Continue'} with Google`} disabled={disabled} onPress={onGoogle} style={({ pressed }) => [styles.social, disabled && styles.disabled, pressed && styles.pressed]}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </Svg>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${signUp ? 'Sign up' : 'Continue'} with Facebook`} disabled={disabled} onPress={onFacebook} style={({ pressed }) => [styles.social, disabled && styles.disabled, pressed && styles.pressed]}>
        <Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="12" fill="#1877F2" /><Path fill="#FFFFFF" d="M16.67 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.67V12H7.08v3.47h3.05v8.39a12.1 12.1 0 003.74 0v-8.39h2.8z" /></Svg>
      </Pressable>
    </View>
  </>;
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, minHeight: 50, borderRadius: 999, backgroundColor: authColors.field, borderWidth: 1, borderColor: authColors.border },
  focused: { borderColor: authColors.purple },
  input: { flex: 1, minWidth: 0, paddingVertical: 14, paddingHorizontal: 0, fontFamily: 'AuthInter-Regular', fontSize: 14, lineHeight: 21, color: authColors.navy },
  eye: { minWidth: 36, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  button: { marginTop: 4, borderRadius: 999, boxShadow: '0 6px 12px rgba(112, 46, 255, 0.30)', elevation: 5 },
  buttonFill: { minHeight: 50, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: 'AuthPoppins-SemiBold', fontSize: 15, lineHeight: 20, letterSpacing: 0.1, color: '#FFFFFF' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  socialRow: { flexDirection: 'row', gap: 16 },
  social: { flex: 1, minHeight: 46, borderRadius: 999, borderWidth: 1, borderColor: authColors.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
