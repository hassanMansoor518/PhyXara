using System;
using System.IO;
using System.Linq;
using PhyXara.Bridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

public static class Class9OpeningRepair
{
    const string PrefabPath = "Assets/Prefab/inclined_plane_rebuilt 1.prefab";
    static readonly string[] Scenes = { "Assets/Scenes/SampleScene.unity", MobileARSetup.ScenePath };

    [MenuItem("PhyXara/Repair Class 9 Inclined Plane Prefab Labels")]
    public static void Run()
    {
        RequireSavedScenes();
        string backup = "Library/BeforeClass9OpeningRepair/" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss-fff");
        Directory.CreateDirectory(backup);
        foreach (string path in Scenes.Concat(new[] { PrefabPath }))
        {
            File.Copy(path, Path.Combine(backup, Path.GetFileName(path)));
            if (File.Exists(path + ".meta")) File.Copy(path + ".meta", Path.Combine(backup, Path.GetFileName(path) + ".meta"));
        }

        var setup = EditorSceneManager.GetSceneManagerSetup();
        try
        {
            var scene = EditorSceneManager.OpenScene(Scenes[0]);
            var root = Incline(scene);
            RemoveNestedDuplicates(root);
            var labels = root.transform.Cast<Transform>().Single(t => t.name == "Procedure Labels").gameObject;
            if (PrefabUtility.IsAddedGameObjectOverride(labels))
                PrefabUtility.ApplyAddedGameObject(labels, PrefabPath, InteractionMode.AutomatedAction);
            foreach (var collider in root.GetComponentsInChildren<BoxCollider>(true))
                if (PrefabUtility.IsAddedComponentOverride(collider))
                    PrefabUtility.ApplyAddedComponent(collider, PrefabPath, InteractionMode.AutomatedAction);
            var tap = root.GetComponents<ExperimentTapAnimation>().Single(t => t.referenceNumber == 3);
            if (PrefabUtility.IsAddedComponentOverride(tap))
                PrefabUtility.ApplyAddedComponent(tap, PrefabPath, InteractionMode.AutomatedAction);
            CleanScene(scene);
            Check(EditorSceneManager.SaveScene(scene), "Could not save " + Scenes[0]);

            scene = EditorSceneManager.OpenScene(Scenes[1]);
            CleanScene(scene);
            Check(EditorSceneManager.SaveScene(scene), "Could not save " + Scenes[1]);
            AssetDatabase.SaveAssets();
            ValidatePrefab();
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
        Debug.Log("CLASS9_OPENING_REPAIR_OK: book experiment 4 uses its labelled original prefab in both scenes. Backups: " + backup);
    }

    [MenuItem("PhyXara/Validate Class 9 Inclined Plane Prefab Labels")]
    public static void Validate()
    {
        RequireSavedScenes();
        var setup = EditorSceneManager.GetSceneManagerSetup();
        try
        {
            ValidatePrefab();
            foreach (string path in Scenes)
            {
                var scene = EditorSceneManager.OpenScene(path);
                ValidateScene(scene);
            }
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
        Debug.Log("CLASS9_OPENING_PREFAB_VALIDATION_OK: internal prefab labels, one inclined-plane instance, one tap component and 25 models/targets in both scenes.");
    }

    static GameObject Incline(Scene scene)
    {
        var target = Components<ImageTargetBehaviour>(scene).Single(t => t.TargetName == "referencematerial_3");
        return target.transform.Cast<Transform>().Select(t => t.gameObject).Single(IsOwnPrefabRoot);
    }

    static bool IsOwnPrefabRoot(GameObject candidate) =>
        PrefabUtility.GetNearestPrefabInstanceRoot(candidate) == candidate &&
        PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(candidate) == PrefabPath;

    static void RemoveNestedDuplicates(GameObject root)
    {
        foreach (var nested in root.GetComponentsInChildren<Transform>(true)
            .Where(t => t.gameObject != root && IsOwnPrefabRoot(t.gameObject)).Select(t => t.gameObject).ToArray())
            if (nested) UnityEngine.Object.DestroyImmediate(nested);
    }

    static void CleanScene(Scene scene)
    {
        var root = Incline(scene);
        RemoveNestedDuplicates(root);
        foreach (var tap in root.GetComponents<ExperimentTapAnimation>())
            if (tap.referenceNumber == 3 && PrefabUtility.IsAddedComponentOverride(tap))
                UnityEngine.Object.DestroyImmediate(tap);
        foreach (var group in root.transform.Cast<Transform>().Where(t => t.name == "Procedure Labels").ToArray())
            if (PrefabUtility.IsAddedGameObjectOverride(group.gameObject) &&
                !PrefabUtility.GetCorrespondingObjectFromSource(group.gameObject))
                UnityEngine.Object.DestroyImmediate(group.gameObject);
        foreach (var added in root.GetComponentsInChildren<BoxCollider>(true).Where(PrefabUtility.IsAddedComponentOverride).ToArray())
            if (added.GetComponents<BoxCollider>().Any(inherited => inherited != added &&
                !PrefabUtility.IsAddedComponentOverride(inherited) && inherited.center == added.center &&
                inherited.size == added.size && inherited.isTrigger == added.isTrigger && inherited.enabled == added.enabled &&
                inherited.sharedMaterial == added.sharedMaterial && Mathf.Approximately(inherited.contactOffset, added.contactOffset)))
                UnityEngine.Object.DestroyImmediate(added);
        ValidateScene(scene);
    }

    static void ValidateScene(Scene scene)
    {
        Check(Components<ImageTargetBehaviour>(scene).Length == 25, "Repair changed the target count in " + scene.path);
        var taps = Components<ExperimentTapAnimation>(scene);
        Check(taps.Length == 25 && taps.Select(t => t.referenceNumber).Distinct().Count() == 25,
            "Repair changed the model count in " + scene.path);
        var root = Incline(scene);
        Check(root.GetComponentsInChildren<Transform>(true).Count(t => IsOwnPrefabRoot(t.gameObject)) == 1,
            "A duplicate inclined-plane prefab remains in " + scene.path);
        ValidateRoot(root);
        var tap = root.GetComponent<ExperimentTapAnimation>();
        var labels = root.transform.Find("Procedure Labels");
        Check(!PrefabUtility.IsAddedComponentOverride(tap) && PrefabUtility.GetCorrespondingObjectFromSource(tap),
            "The scene tap is still an override instead of part of the prefab");
        Check(!PrefabUtility.IsAddedGameObjectOverride(labels.gameObject) && PrefabUtility.GetCorrespondingObjectFromSource(labels.gameObject),
            "The scene labels are still an override instead of part of the prefab");
    }

    static void ValidatePrefab()
    {
        var root = PrefabUtility.LoadPrefabContents(PrefabPath);
        try { ValidateRoot(root); }
        finally { PrefabUtility.UnloadPrefabContents(root); }
    }

    static void ValidateRoot(GameObject root)
    {
        var taps = root.GetComponentsInChildren<ExperimentTapAnimation>(true);
        Check(taps.Length == 1 && taps[0].gameObject == root && taps[0].referenceNumber == 3,
            "The original inclined-plane prefab needs exactly one reference-3 tap component");
        var tap = taps[0];
        Check(root.transform.Cast<Transform>().Count(t => t.name == "Procedure Labels") == 1,
            "The inclined-plane prefab needs exactly one label group");
        Check(tap.labels != null && tap.labels.Length == 9 && tap.labels.All(l => l && Inside(l.transform)) &&
            tap.labelledParts != null && tap.labelledParts.Length == 7 && tap.labelledParts.All(p => p && Inside(p)) &&
            tap.leaderLines != null && tap.leaderLines.Length == 7 && tap.leaderLines.All(l => l && Inside(l.transform)),
            "Inclined-plane labels or part bindings are missing or point outside the prefab");
        var controller = root.GetComponent<InclinedPlaneController>();
        Check(controller && tap.driver == controller && controller.ramp && controller.ball && controller.marker &&
            controller.zeroAnchor && controller.endAnchor &&
            new[] { controller.ramp, controller.ball, controller.marker, controller.zeroAnchor, controller.endAnchor }.All(Inside),
            "The original inclined-plane controller or its internal part bindings changed");
        Check(tap.procedureLabel == tap.labels[1] && tap.procedureSteps != null && tap.procedureSteps.Length == 4 &&
            tap.procedureSteps.All(s => !string.IsNullOrWhiteSpace(s)), "The inclined-plane procedure captions are incomplete");
        Check(root.GetComponentsInChildren<Collider>(true).Any(c => c.enabled && !c.isTrigger),
            "The labelled inclined-plane prefab has no tappable collider");
        bool Inside(Transform part) => part == root.transform || part.IsChildOf(root.transform);
    }

    static T[] Components<T>(Scene scene) where T : Component =>
        scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<T>(true)).ToArray();

    static void RequireSavedScenes()
    {
        Check(!EditorApplication.isPlayingOrWillChangePlaymode &&
            Enumerable.Range(0, SceneManager.sceneCount).All(i => !SceneManager.GetSceneAt(i).isDirty),
            "Save scenes and exit Play Mode before repairing the inclined-plane prefab");
    }

    static void Check(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }
}
