# Unity (AR_MODE) integration

RN hosts the Unity player via `@azesmway/react-native-unity`. Android only.

```
Scanner "capture"  -> UnityBridge.open('ar', exp)      -> /unity (UnityHostScreen) -> Unity AR mode
Scanner "gallery"  -> ImagePicker -> DiagramMatcher     -> UnityBridge.open('preview', exp)
back / hardware back -> {"type":"stop"} -> router.back()
```

Files: `UnityBridge.ts` (singleton wrapper), `useUnityBridge.ts`, `UnityHostScreen.tsx`, `DiagramMatcher.ts`, `config.ts`, `types.ts`.
Route: `app/unity.tsx`. Hooked in `src/screens/ScannerScreen.tsx`.

## Config (env, no secrets in the app)

| Var | Default | |
|---|---|---|
| `EXPO_PUBLIC_UNITY_ENABLED` | `true` | `false` restores the old scanner behaviour |
| `EXPO_PUBLIC_UNITY_DEFAULT_EXPERIMENT` | `exp3_micrometer` | experiment opened by the scan action |
| `EXPO_PUBLIC_DIAGRAM_MATCHER` | `mock` in dev, `remote` otherwise | `mock` is ignored in release builds |
| `EXPO_PUBLIC_DIAGRAM_MATCH_URL` | – | endpoint for `RemoteMatcher` |
| `EXPO_PUBLIC_DIAGRAM_MIN_CONFIDENCE` | `0.6` | below this the upload is "not recognized" |

## Matching backend contract (you provide it)

```
POST $EXPO_PUBLIC_DIAGRAM_MATCH_URL
Content-Type: multipart/form-data
  image: <jpeg file>

200 application/json
{ "experimentId": "exp3_micrometer", "confidence": 0.93 }
```

Anything else (non-200, malformed body, confidence below the threshold) is treated as "not recognized".
Authentication, if any, must be handled by your backend/proxy (or a short-lived token you add to `RemoteMatcher`); the app ships no API key.
**On-device recognition of photographed book pages is not part of this work.**

## Message contract (v1)

RN -> Unity: `open {mode: ar|preview, experimentId}`, `playAnimation`, `stopAnimation`, `startPractical`, `resetPractical`, `setLanguage {lang: en|ur}`, `stop`.
Unity -> RN: `ready`, `tracking {state: found|lost, experimentId}`, `state {name}`, `readout {msr, csr, totalMm}`, `error {code, message}`.
All carry `"v":1`. `UnityBridge.send()` adds `v`. Unity error codes: `bad_json`, `bad_message`, `unknown_type`, `unknown_experiment`, `no_registry`, `no_controller`, `no_tracker`, `no_reference_image`, `bad_mode`.

## Rebuild after a Unity change

1. Unity: `PhyXara > Export Android (release)` (Editor open) or batch mode, Editor closed:
   ```
   "E:\hassan\Software\6000.0.84f1\Editor\Unity.exe" -batchmode -quit -projectPath "<repo>\AR_MODE" -executeMethod ExportAndroid.Export -logFile export.log
   ```
   (add `-dev` for a development build). Output: `AR_MODE/Builds/android`.
2. `cd Mobile && node scripts/sync-unity.js`
3. `npx expo prebuild --platform android --clean` (regenerates `android/`, applies the Unity config plugins)
4. `cd android && gradlew assembleDebug` (or `npx expo run:android`)

Needs a dev build; Expo Go cannot host Unity.

## Unity requirements on this machine

Unity 6000.0.84f1 wants JDK 17, Android SDK platform 36 and **NDK r27c (27.2.12479018)**. The Android module here was installed without the bundled JDK/SDK/NDK; JDK and SDK paths were pointed at the system ones, the NDK still has to be installed (Unity Hub > Installs > Add modules > Android SDK & NDK Tools, or `sdkmanager "ndk;27.2.12479018"`).
