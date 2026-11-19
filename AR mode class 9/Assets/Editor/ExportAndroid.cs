using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

/// <summary>
/// Exports the Android Studio project (unityLibrary + launcher) to AR_MODE/Builds/android.
///
/// CLI (close the Editor first, a project can only be open once):
///   "E:\hassan\Software\6000.0.84f1\Editor\Unity.exe" -batchmode -quit -projectPath "&lt;repo&gt;\AR_MODE"
///       -executeMethod ExportAndroid.Export -logFile export.log [-dev]
/// Menu: PhyXara > Export Android (release) / (development).
/// </summary>
public static class ExportAndroid
{
    const string Scene = MobileARSetup.ScenePath;
    const string OutputRelative = "Builds/android";

    [MenuItem("PhyXara/Export Android (release)")]
    public static void ExportReleaseMenu() { Run(false); }

    [MenuItem("PhyXara/Export Android (development)")]
    public static void ExportDevMenu() { Run(true); }

    // -executeMethod ExportAndroid.ExportWithVernier: sets the caliper tracking image, then exports
    public static void ExportWithVernier()
    {
        VernierCaliperBuilder.PrepareReferenceImage();
        Export();
    }

    // -executeMethod ExportAndroid.Export  (add -dev for a development build)
    public static void Export()
    {
        var dev = Array.IndexOf(Environment.GetCommandLineArgs(), "-dev") >= 0;
        var ok = Run(dev);
        if (Application.isBatchMode) EditorApplication.Exit(ok ? 0 : 1);
    }

    static bool Run(bool development)
    {
        MobileARSetup.Build();
        if (!File.Exists(Scene))
        {
            Debug.LogError("[ExportAndroid] Missing " + Scene + ". Run PhyXara > Prepare Mobile AR Scene first.");
            return false;
        }

        var projectRoot = Directory.GetParent(Application.dataPath).FullName;
        var outDir = Path.Combine(projectRoot, OutputRelative);
        if (Directory.Exists(outDir)) Directory.Delete(outDir, true);
        Directory.CreateDirectory(outDir);

        var android = NamedBuildTarget.Android;
        PlayerSettings.SetScriptingBackend(android, ScriptingImplementation.IL2CPP);
        PlayerSettings.stripEngineCode = true;
        PlayerSettings.SetManagedStrippingLevel(android, ManagedStrippingLevel.Low);
        PlayerSettings.SetStackTraceLogType(LogType.Log, development ? StackTraceLogType.ScriptOnly : StackTraceLogType.None);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.applicationEntry = AndroidApplicationEntry.Activity;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29;
        PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android, new[] { UnityEngine.Rendering.GraphicsDeviceType.OpenGLES3 });
        PlayerSettings.SetIl2CppCompilerConfiguration(android, development ? Il2CppCompilerConfiguration.Debug : Il2CppCompilerConfiguration.Release);
        EditorUserBuildSettings.exportAsGoogleAndroidProject = true;
        EditorUserBuildSettings.buildAppBundle = false;
        EditorUserBuildSettings.development = development;
        EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android);

        var options = new BuildPlayerOptions
        {
            scenes = new[] { Scene },
            locationPathName = outDir,
            target = BuildTarget.Android,
            options = development ? BuildOptions.Development : BuildOptions.None
        };

        // ARCore's build step fails on an image library with zero images. Until the real page image is added,
        // park the empty library outside the AssetDatabase for the build (RNBridge reports "no_reference_image" in AR mode).
        var xr = UnityEditor.XR.Management.XRGeneralSettingsPerBuildTarget.XRGeneralSettingsForBuildTarget(BuildTargetGroup.Android);
        bool autoStartXR = xr != null && xr.InitManagerOnStart;
        var parked = ParkEmptyLibrary();
        BuildReport report;
        try
        {
            if (xr != null) xr.InitManagerOnStart = false;
            report = BuildPipeline.BuildPlayer(options);
        }
        finally
        {
            if (xr != null) xr.InitManagerOnStart = autoStartXR;
            if (parked) UnparkLibrary();
        }
        var summary = report.summary;
        Debug.Log("[ExportAndroid] result=" + summary.result + " errors=" + summary.totalErrors + " warnings=" + summary.totalWarnings + " out=" + outDir);
        return summary.result == BuildResult.Succeeded;
    }

    const string LibraryAsset = "Assets/Experiments/PhyXaraReferenceImages.asset";
    const string ParkDir = "Assets/Experiments/Parked~";

    static bool ParkEmptyLibrary()
    {
        var lib = AssetDatabase.LoadAssetAtPath<UnityEngine.XR.ARSubsystems.XRReferenceImageLibrary>(LibraryAsset);
        if (lib == null || lib.count > 0) return false;
        Debug.LogWarning("[ExportAndroid] Reference image library is empty: AR tracking will report no_reference_image until you add the diagram image (PhyXara > Sync Reference Image Library).");
        Directory.CreateDirectory(ParkDir);
        File.Move(LibraryAsset, ParkDir + "/lib.asset");
        File.Move(LibraryAsset + ".meta", ParkDir + "/lib.asset.meta");
        AssetDatabase.Refresh();
        return true;
    }

    static void UnparkLibrary()
    {
        File.Move(ParkDir + "/lib.asset", LibraryAsset);
        File.Move(ParkDir + "/lib.asset.meta", LibraryAsset + ".meta");
        Directory.Delete(ParkDir, true);
        AssetDatabase.Refresh();
    }
}
