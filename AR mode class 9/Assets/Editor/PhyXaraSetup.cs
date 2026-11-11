using System.IO;
using PhyXara.Bridge;
using Unity.XR.CoreUtils;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.XR.ARSubsystems;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.XR;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

/// <summary>
/// One-click creation of the prefab, registry, reference image library and the PhyXaraMain scene.
/// Safe to re-run: existing assets are kept (the scene is rebuilt).
/// Adding an experiment later = add an entry to Assets/Experiments/ExperimentRegistry.asset
/// (prefab + image) and run PhyXara > Sync Reference Image Library. No code changes.
/// </summary>
public static class PhyXaraSetup
{
    const string ModelPath = "Assets/Model/micrometer_screw_gauge_v2.glb";
    const string PrefabPath = "Assets/Model/micrometer_screw_gauge_v2.prefab";
    const string Dir = "Assets/Experiments";
    const string RegistryPath = Dir + "/ExperimentRegistry.asset";
    const string LibraryPath = Dir + "/PhyXaraReferenceImages.asset";
    const string ScenePath = "Assets/Scenes/PhyXaraMain.unity";

    [MenuItem("PhyXara/Setup Scene And Assets")]
    public static void Setup()
    {
        if (!AssetDatabase.IsValidFolder(Dir)) AssetDatabase.CreateFolder("Assets", "Experiments");

        var prefab = EnsurePrefab();
        var registry = EnsureRegistry(prefab);
        var library = EnsureLibrary();
        SyncLibrary();
        BuildScene(registry, library);
        AssetDatabase.SaveAssets();
        Debug.Log("[PhyXaraSetup] done. Scene: " + ScenePath);
    }

    static GameObject EnsurePrefab()
    {
        var existing = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
        if (existing != null) return existing;

        var model = AssetDatabase.LoadAssetAtPath<GameObject>(ModelPath);
        var instance = (GameObject)PrefabUtility.InstantiatePrefab(model);
        instance.name = "micrometer_screw_gauge_v2";
        instance.AddComponent<MicrometerController>();
        var saved = PrefabUtility.SaveAsPrefabAsset(instance, PrefabPath);
        Object.DestroyImmediate(instance);
        return saved;
    }

    static ExperimentRegistry EnsureRegistry(GameObject prefab)
    {
        var reg = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>(RegistryPath);
        if (reg != null) return reg;
        reg = ScriptableObject.CreateInstance<ExperimentRegistry>();
        reg.entries.Add(new ExperimentEntry
        {
            experimentId = "exp3_micrometer",
            modelPrefab = prefab,
            referenceImageName = "exp3_micrometer",
            physicalWidthMeters = 0.15f,
            modelSizeMeters = 0.12f
        });
        AssetDatabase.CreateAsset(reg, RegistryPath);
        return reg;
    }

    static XRReferenceImageLibrary EnsureLibrary()
    {
        var lib = AssetDatabase.LoadAssetAtPath<XRReferenceImageLibrary>(LibraryPath);
        if (lib != null) return lib;
        lib = ScriptableObject.CreateInstance<XRReferenceImageLibrary>();
        AssetDatabase.CreateAsset(lib, LibraryPath);
        return lib;
    }

    /// <summary>Copies every registry entry that has a texture into the reference image library.</summary>
    [MenuItem("PhyXara/Sync Reference Image Library")]
    public static void SyncLibrary()
    {
        var reg = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>(RegistryPath);
        var lib = AssetDatabase.LoadAssetAtPath<XRReferenceImageLibrary>(LibraryPath);
        if (reg == null || lib == null) { Debug.LogWarning("[PhyXaraSetup] run Setup Scene And Assets first"); return; }

        foreach (var e in reg.entries)
        {
            if (e == null || e.referenceTexture == null) continue;

            for (var i = lib.count - 1; i >= 0; i--)
                if (lib[i].name == e.referenceImageName) lib.RemoveAt(i);

            lib.Add();
            var idx = lib.count - 1;
            var aspect = (float)e.referenceTexture.height / e.referenceTexture.width;
            lib.SetName(idx, e.referenceImageName);
            lib.SetTexture(idx, e.referenceTexture, true);
            lib.SetSpecifySize(idx, true);
            lib.SetSize(idx, new Vector2(e.physicalWidthMeters, e.physicalWidthMeters * aspect));
        }
        EditorUtility.SetDirty(lib);
        AssetDatabase.SaveAssets();
        Debug.Log("[PhyXaraSetup] reference image library has " + lib.count + " image(s)");
    }

    static void BuildScene(ExperimentRegistry registry, XRReferenceImageLibrary library)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // ---- AR rig (disabled by RNBridge outside AR mode, which releases the camera)
        var rig = new GameObject("AR Rig");

        var sessionGo = new GameObject("AR Session");
        sessionGo.transform.SetParent(rig.transform);
        var session = sessionGo.AddComponent<ARSession>();
        sessionGo.AddComponent<ARInputManager>();

        var originGo = new GameObject("XR Origin");
        originGo.transform.SetParent(rig.transform);
        var origin = originGo.AddComponent<XROrigin>();

        var camGo = new GameObject("AR Camera");
        camGo.tag = "MainCamera";
        camGo.transform.SetParent(originGo.transform);
        var cam = camGo.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        cam.nearClipPlane = 0.01f;
        cam.farClipPlane = 20f;
        camGo.AddComponent<ARCameraManager>();
        camGo.AddComponent<ARCameraBackground>();
        var driver = camGo.AddComponent<TrackedPoseDriver>();
        driver.positionInput = new InputActionProperty(new InputAction("Position", InputActionType.Value, "<HandheldARInputDevice>/devicePosition", expectedControlType: "Vector3"));
        driver.rotationInput = new InputActionProperty(new InputAction("Rotation", InputActionType.Value, "<HandheldARInputDevice>/deviceRotation", expectedControlType: "Quaternion"));
        driver.trackingStateInput = new InputActionProperty(new InputAction("Tracking State", InputActionType.Value, "<HandheldARInputDevice>/trackingState", expectedControlType: "Integer"));

        origin.Origin = originGo;
        origin.CameraFloorOffsetObject = originGo;
        origin.Camera = cam;

        var tracker = originGo.AddComponent<ARTrackedImageManager>();
        tracker.referenceLibrary = library;
        tracker.requestedMaxNumberOfMovingImages = 1;

        // ---- Preview rig (plain camera on a neutral background)
        var prevGo = new GameObject("Preview Camera");
        var prevCam = prevGo.AddComponent<Camera>();
        prevCam.clearFlags = CameraClearFlags.SolidColor;
        prevCam.backgroundColor = new Color(0.86f, 0.88f, 0.92f);
        prevCam.nearClipPlane = 0.01f;
        prevCam.farClipPlane = 20f;
        var orbit = prevGo.AddComponent<PreviewOrbit>();
        orbit.cam = prevCam;

        var lightGo = new GameObject("Directional Light");
        var light = lightGo.AddComponent<Light>();
        light.type = LightType.Directional;
        lightGo.transform.rotation = Quaternion.Euler(45f, -30f, 0f);

        // ---- Bridge
        var bridgeGo = new GameObject("RNBridge");
        var bridge = bridgeGo.AddComponent<RNBridge>();
        bridge.registry = registry;
        bridge.arRig = rig;
        bridge.arSession = session;
        bridge.trackedImageManager = tracker;
        bridge.previewCamera = prevCam;
        bridge.previewOrbit = orbit;
        var sim = bridgeGo.AddComponent<RNBridgeSimulator>();
        sim.bridge = bridge;

        Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
    }
}
