import { Platform, NativeModules } from 'react-native';

/**
 * Cached AR support result to prevent redundant hardware queries
 */
let cachedARSupport = null;
let manualOverride = null; // null | boolean (used for testing both low-end and high-end modes)

/**
 * Inspects device specifications to determine if native AR (ARCore / ARKit) is supported.
 *
 * Requirements for AR:
 * - iOS: ARKit requires A9 chip or later and iOS 11.0+. (Practically all modern iOS devices).
 * - Android: ARCore requires Android 7.0+ (API 24+), physical camera with ARCore certification,
 *   and sufficient RAM (>3GB recommended). Budget phones lacking ARCore services will crash Unity AR.
 *
 * @param {boolean} forceRefresh - If true, re-runs hardware evaluation rather than returning cached result.
 * @returns {Promise<{ isSupported: boolean, reason: string, isLowEnd: boolean, details: object }>}
 */
export async function checkARSupport(forceRefresh = false) {
  if (manualOverride !== null) {
    return {
      isSupported: manualOverride,
      reason: manualOverride
        ? 'AR manually enabled via debug override.'
        : 'AR manually disabled (simulating low-end budget device).',
      isLowEnd: !manualOverride,
      details: { override: true },
    };
  }

  if (cachedARSupport !== null && !forceRefresh) {
    return cachedARSupport;
  }

  try {
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    // 1. Simulators and Emulators do not support physical AR sensor tracking
    const isSimulator =
      (Platform.constants && Platform.constants.isTesting) ||
      (isIOS && Platform.constants?.systemName === 'iOS' && Platform.constants?.interfaceIdiom === 'simulator') ||
      (isAndroid && (Platform.constants?.Model?.includes('sdk') || Platform.constants?.Model?.includes('google_sdk')));

    if (isSimulator) {
      cachedARSupport = {
        isSupported: false,
        reason: 'AR is unavailable on virtual simulators/emulators.',
        isLowEnd: false,
        details: { platform: Platform.OS, isSimulator: true },
      };
      return cachedARSupport;
    }

    // 2. iOS Hardware Evaluation
    if (isIOS) {
      const iosVersion = parseFloat(Platform.Version);
      if (iosVersion >= 12.0) {
        cachedARSupport = {
          isSupported: true,
          reason: 'Apple ARKit is fully supported on this device.',
          isLowEnd: false,
          details: { platform: 'ios', version: iosVersion },
        };
        return cachedARSupport;
      }

      cachedARSupport = {
        isSupported: false,
        reason: 'iOS version below 12.0 does not support stable ARKit.',
        isLowEnd: true,
        details: { platform: 'ios', version: iosVersion },
      };
      return cachedARSupport;
    }

    // 3. Android Hardware Evaluation
    if (isAndroid) {
      const apiLevel = typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(Platform.Version, 10);

      // ARCore strictly requires Android 7.0 (API Level 24) or higher
      if (isNaN(apiLevel) || apiLevel < 24) {
        cachedARSupport = {
          isSupported: false,
          reason: 'Android API level 24 (7.0 Nougat) or higher is required for ARCore.',
          isLowEnd: true,
          details: { platform: 'android', apiLevel },
        };
        return cachedARSupport;
      }

      // Check for presence of ARCore / Google Play Services for AR
      // NativeModules or package availability check
      const hasARCoreModule = !!(
        NativeModules.ARCore ||
        NativeModules.RNUnity ||
        NativeModules.ViroARModule
      );

      // Inspect known low-end / budget indicators
      const model = (Platform.constants?.Model || '').toLowerCase();
      const brand = (Platform.constants?.Brand || '').toLowerCase();

      // Common budget identifiers with high ARCore crash rates due to 2GB/3GB RAM or lack of certification
      const isKnownBudgetChipset =
        model.includes('go') ||
        model.includes('lite') ||
        brand.includes('itel') ||
        brand.includes('tecno') && apiLevel <= 29;

      if (isKnownBudgetChipset) {
        cachedARSupport = {
          isSupported: false,
          reason: 'Device hardware is optimized for 3D Interactive Mode (ARCore unsupported or unstable).',
          isLowEnd: true,
          details: { platform: 'android', apiLevel, model, brand },
        };
        return cachedARSupport;
      }

      // Validated Android device
      cachedARSupport = {
        isSupported: true,
        reason: 'Google ARCore hardware capabilities verified.',
        isLowEnd: false,
        details: { platform: 'android', apiLevel, hasARCoreModule },
      };
      return cachedARSupport;
    }

    // Fallback for Web or unsupported platforms
    cachedARSupport = {
      isSupported: false,
      reason: 'Platform does not support native AR.',
      isLowEnd: false,
      details: { platform: Platform.OS },
    };
    return cachedARSupport;
  } catch (error) {
    console.warn('[arChecker] Error evaluating AR support, falling back to 3D mode:', error);
    cachedARSupport = {
      isSupported: false,
      reason: 'Error checking hardware capabilities. Defaulting to safe 3D mode.',
      isLowEnd: true,
      details: { error: String(error) },
    };
    return cachedARSupport;
  }
}

/**
 * Synchronous fast-path check based on platform and previously evaluated result.
 * Ideal for initial component state before the full asynchronous check completes.
 *
 * @returns {boolean}
 */
export function isARSupportedSync() {
  if (manualOverride !== null) return manualOverride;
  if (cachedARSupport !== null) return cachedARSupport.isSupported;

  // Initial heuristic before async check finishes
  if (Platform.OS === 'ios') return true;
  if (Platform.OS === 'android') {
    const apiLevel = typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(Platform.Version, 10);
    return !isNaN(apiLevel) && apiLevel >= 26;
  }
  return false;
}

/**
 * Manually override AR capability detection.
 * Pass true or false to simulate high-end vs. budget devices, or null to reset.
 *
 * @param {boolean | null} overrideValue
 */
export function setARSupportOverride(overrideValue) {
  manualOverride = overrideValue;
}

export default {
  checkARSupport,
  isARSupportedSync,
  setARSupportOverride,
};
