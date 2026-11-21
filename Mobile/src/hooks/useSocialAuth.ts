import { useOAuth } from '@clerk/expo';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth(setLoading: (loading: boolean) => void, setError: (error: string) => void) {
  const { startOAuthFlow: google } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: facebook } = useOAuth({ strategy: 'oauth_facebook' });
  const inFlight = useRef(false);

  return async (provider: 'Google' | 'Facebook') => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);
    try {
      const result = await (provider === 'Google' ? google() : facebook());
      if (result.authSessionResult?.type === 'cancel' || result.authSessionResult?.type === 'dismiss') return;

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.signUp?.status === 'missing_requirements') {
        setError(`${provider} did not provide all the details needed for your account. Please sign up using the email form.`);
      } else {
        setError(`${provider} sign in was not completed. Please try again or use your email.`);
      }
    } catch (error: any) {
      setError(error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || `${provider} sign in could not be completed. Please try again.`);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };
}
