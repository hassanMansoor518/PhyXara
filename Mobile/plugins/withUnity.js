// Local Expo config plugin: Android wiring for the exported Unity library that
// @azesmway/react-native-unity does not cover (it handles settings.gradle, flatDir, strings, gradle.properties).
const { withAndroidManifest, withAppBuildGradle, withGradleProperties, AndroidConfig } = require('@expo/config-plugins');

const MIN_SDK = '26'; // highest of: RN 0.86 (24), ARCore (24), Unity 6 export (set in ExportAndroid.cs)

// @reactvision/react-viro (xRMode "AR") already adds CAMERA, camera.ar and the ARCore meta-data;
// duplicates of the same <meta-data> break the manifest merge, so only add them when Viro is absent.
const hasViro = (config) => (config.plugins || []).some((p) => (Array.isArray(p) ? p[0] : p) === '@reactvision/react-viro');

const withArManifest = (config) =>
  hasViro(config) ? config : withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    AndroidConfig.Permissions.ensurePermissions(manifest, ['android.permission.CAMERA']);

    const root = manifest.manifest;
    root['uses-feature'] = root['uses-feature'] || [];
    if (!root['uses-feature'].some((f) => f.$['android:name'] === 'android.hardware.camera.ar')) {
      root['uses-feature'].push({ $: { 'android:name': 'android.hardware.camera.ar', 'android:required': 'false' } });
    }

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app['meta-data'] = app['meta-data'] || [];
    if (!app['meta-data'].some((m) => m.$['android:name'] === 'com.google.ar.core')) {
      app['meta-data'].push({ $: { 'android:name': 'com.google.ar.core', 'android:value': 'optional' } });
    }
    return mod;
  });

const withMinSdk = (config) =>
  withGradleProperties(config, (mod) => {
    mod.modResults = mod.modResults.filter((p) => !(p.type === 'property' && p.key === 'android.minSdkVersion'));
    mod.modResults.push({ type: 'property', key: 'android.minSdkVersion', value: MIN_SDK });
    return mod;
  });

const withAbiAndPackaging = (config) =>
  withAppBuildGradle(config, (mod) => {
    let src = mod.modResults.contents;
    if (!src.includes('// unity: abiFilters')) {
      src = src.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        // unity: abiFilters (Unity export is ARM64 only)\n        ndk { abiFilters "arm64-v8a" }`
      );
    }
    if (!src.includes('// unity: packaging')) {
      src = src.replace(
        /android\s*\{/,
        `android {\n    // unity: packaging (Unity and Viro both ship ARCore/C++ runtime libs)\n    packagingOptions {\n        pickFirst '**/libc++_shared.so'\n        pickFirst '**/libarcore_sdk_c.so'\n        jniLibs { useLegacyPackaging = false }\n    }`
      );
    }
    mod.modResults.contents = src;
    return mod;
  });

module.exports = (config) => withAbiAndPackaging(withMinSdk(withArManifest(config)));
