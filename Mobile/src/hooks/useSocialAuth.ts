import { useOAuth } from '@clerk/expo';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth(setLoading: (loading: boolean) => void, setError: (error: string) => void) {
  const { startOAuthFlow: google } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: github } = useOAuth({ strategy: 'oauth_github' });

  return async (provider: 'Google' | 'GitHub') => {
    setError('');
    setLoading(true);
    try {
      const result = await (provider === 'Google' ? google() : github());
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.signUp?.status === 'missing_requirements') {
        setError('Your account needs more information. Please sign up using the email form.');
      }
    } catch (error: any) {
      setError(error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || `${provider} sign in could not be completed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
}
