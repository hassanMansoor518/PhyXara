// Integration config. Everything comes from env (EXPO_PUBLIC_*); nothing secret belongs here.
const env = process.env;

export const unityConfig = {
  /** Master switch. When false the existing scanner/upload behaviour is untouched. */
  enabled: env.EXPO_PUBLIC_UNITY_ENABLED !== 'false',

  /** Experiment opened by the scan action; Unity then matches the printed page to its reference image. */
  defaultExperimentId: env.EXPO_PUBLIC_UNITY_DEFAULT_EXPERIMENT ?? 'exp3_micrometer',

  /** 'mock' (dev builds only) or 'remote'. */
  matcher: (env.EXPO_PUBLIC_DIAGRAM_MATCHER ?? (__DEV__ ? 'mock' : 'remote')) as 'mock' | 'remote',

  /** Backend endpoint for RemoteMatcher. */
  matchUrl: env.EXPO_PUBLIC_DIAGRAM_MATCH_URL ?? '',

  /** Below this, an upload is treated as "not recognised". */
  minConfidence: Number(env.EXPO_PUBLIC_DIAGRAM_MIN_CONFIDENCE ?? '0.6'),
};
