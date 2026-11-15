# Unity Vuforia integration

RN hosts the Unity player via `@azesmway/react-native-unity`. Android only.

The scan button opens the Vuforia scene `Assets/Scenes/PhyXaraMobile.unity` from the sibling `AR mode class 9` project. This scene contains 25 book targets and their models: 13 for Class 9 and 12 for Class 10. `RNBridge` starts tracking on an AR open request and pauses Vuforia when the app closes AR or enters the background. The printed page determines which experiment appears.

`PhyXara > Prepare Mobile AR Scene` regenerates this scene from the saved `SampleScene`. The Android exporter also runs this step. Preview mode keeps the existing prefab registry.

`PhyXara > Build Class 10 Book Experiments` adds or rebuilds the Class 10 apparatus in both scenes, preserving Class 9. Each new model has a tap-to-start procedure, the floating reveal, and the shared Label button. Book/page mappings and calibration notes are in `docs/class-10/README.md` at the workspace root.

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
The AR scanner recognizes all 25 configured book images locally with Vuforia. Gallery uploads use the separate matcher contract above; the new Class 10 apparatus are registered for live book scanning.

## Message contract (v1)

RN -> Unity: `open {mode: ar|preview, experimentId}`, `playAnimation`, `stopAnimation`, `startPractical`, `resetPractical`, `setLanguage {lang: en|ur}`, `stop`.
Unity -> RN: `ready`, `tracking {state: found|lost, experimentId}`, `state {name}`, `readout {msr, csr, totalMm}`, `error {code, message}`.
All carry `"v":1`. `UnityBridge.send()` adds `v`. Unity error codes: `bad_json`, `bad_message`, `unknown_type`, `unknown_experiment`, `no_registry`, `no_controller`, `no_tracker`, `no_reference_image`, `bad_mode`.

## Rebuild after a Unity change

1. Unity: `PhyXara > Export Android (release)` (Editor open) or batch mode, Editor closed:
   ```
   "<Unity Editor>\Unity.exe" -batchmode -quit -projectPath "<repo>\AR mode class 9" -executeMethod ExportAndroid.Export -logFile export.log
   ```
   (add `-dev` for a development build). Output: `AR mode class 9/Builds/android`.
2. `cd Mobile && npm run unity:sync`
3. `npx expo prebuild --platform android --clean` (regenerates `android/`, applies the Unity config plugins)
4. `cd android && gradlew assembleDebug` (or `npx expo run:android`)

Needs a dev build; Expo Go cannot host Unity.

For a connected Android phone, run `npm run android -- --device` after exporting and syncing. Configure your Vuforia App License Key locally in Unity before exporting.

## Unity requirements on this machine

Use Unity 6000.0.84f1 with Android Build Support, JDK 17, Android SDK platform 36 and NDK r27c (27.2.12479018). The export uses ARM64, OpenGL ES 3 and Android API 29 or newer. Vuforia requires ARCore XR Plugin 6.1 or newer. The Expo plugin reads the Unity export's Gradle properties from the copied library after `npm run unity:sync`.
