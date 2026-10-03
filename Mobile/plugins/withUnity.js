// Local Expo config plugin: Android wiring for the exported Unity library that
// @azesmway/react-native-unity does not cover (it handles settings.gradle, flatDir, strings, gradle.properties).
const { withAndroidManifest, withAppBuildGradle, withGradleProperties, withDangerousMod, withProjectBuildGradle, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

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
    // Unity 6000.0 requires NDK r27c; use the same NDK for the app so only one is needed.
    src = src.replace(/ndkVersion\s+rootProject\.ext\.ndkVersion/, 'ndkVersion "27.2.12479018"');
    mod.modResults.contents = src;
    return mod;
  });

// @azesmway/react-native-unity 1.1.1 still calls jcenter(), which Gradle 9 removed. Drop it on every prebuild.
const withLibraryGradle9Fix = (config) =>
  withDangerousMod(config, [
    'android',
    (mod) => {
      const file = path.join(mod.modRequest.projectRoot, 'node_modules', '@azesmway', 'react-native-unity', 'android', 'build.gradle');
      if (fs.existsSync(file)) {
        const src = fs.readFileSync(file, 'utf8');
        const fixed = src.replace(/^\s*jcenter\(\)\s*$/gm, '');
        if (fixed !== src) fs.writeFileSync(file, fixed);
      }
      return mod;
    },
  ]);

// Expo's root plugin only sets ext.ndkVersion when it is absent, so every module (worklets, expo-modules, ...) uses r27c too.
const withRootNdk = (config) =>
  withProjectBuildGradle(config, (mod) => {
    const src = mod.modResults.contents;
    if (!src.includes('// unity: ndk')) {
      mod.modResults.contents = src.replace(
        'apply plugin: "expo-root-project"',
        '// unity: ndk\next.ndkVersion = "27.2.12479018"\napply plugin: "expo-root-project"'
      );
    }
    return mod;
  });

// unityLibrary's build.gradle reads unity.* properties (NDK/SDK paths, abi, versions) that Unity writes into the
// export's gradle.properties. Copy them at prebuild so they always match the latest export on this machine.
// Also keep Gradle light: the IL2CPP + CMake steps are memory hungry and parallel runs exhaust the Windows paging file.
const withUnityGradleProperties = (config) =>
  withGradleProperties(config, (mod) => {
    const exported = path.join(mod.modRequest.projectRoot, '..', 'AR_MODE', 'Builds', 'android', 'gradle.properties');
    const wanted = new Map();
    if (fs.existsSync(exported)) {
      for (const line of fs.readFileSync(exported, 'utf8').split('\n')) {
        const m = line.trim().match(/^(unity[A-Za-z.]*)=(.*)$/);
        if (m && m[1] !== 'unityStreamingAssets') wanted.set(m[1], m[2]);
      }
    } else {
      console.warn('[withUnity] AR_MODE/Builds/android/gradle.properties not found: export from Unity first');
    }
    wanted.set('org.gradle.parallel', 'false');
    wanted.set('org.gradle.workers.max', '2');
    wanted.set('org.gradle.jvmargs', '-Xmx3g -XX:MaxMetaspaceSize=512m');
    mod.modResults = mod.modResults.filter((p) => !(p.type === 'property' && wanted.has(p.key)));
    for (const [key, value] of wanted) mod.modResults.push({ type: 'property', key, value });
    return mod;
  });

module.exports = (config) => withUnityGradleProperties(withRootNdk(withLibraryGradle9Fix(withAbiAndPackaging(withMinSdk(withArManifest(config))))));
