using System;
using System.IO;
using System.Linq;
using PhyXara.Bridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

public static class MobileARSetup
{
    public const string ScenePath = "Assets/Scenes/PhyXaraMobile.unity";
    const string SourceScene = "Assets/Scenes/SampleScene.unity";

    [MenuItem("PhyXara/Prepare Mobile AR Scene")]
    public static void Build()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode)
            throw new InvalidOperationException("Exit Play Mode before preparing the mobile scene.");
        var previous = SceneManager.GetActiveScene();
        var existing = SceneManager.GetSceneByPath(ScenePath);
        if (existing.IsValid())
        {
            if (existing.isDirty)
                throw new InvalidOperationException("Save the mobile scene before regenerating it.");
            if (previous == existing)
                previous = EditorSceneManager.OpenScene(SourceScene, OpenSceneMode.Additive);
            EditorSceneManager.CloseScene(existing, true);
        }

        File.Copy(SourceScene, ScenePath, true);
        AssetDatabase.ImportAsset(ScenePath, ImportAssetOptions.ForceSynchronousImport);
        var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Additive);
        try
        {
            var roots = scene.GetRootGameObjects();
            var engine = roots.SelectMany(r => r.GetComponentsInChildren<VuforiaBehaviour>(true)).Single();
            var targets = roots.SelectMany(r => r.GetComponentsInChildren<ImageTargetBehaviour>(true)).ToArray();
            var class9Names = Enumerable.Range(1, 13).Select(n => "referencematerial_" + n).ToArray();
            var class9 = targets.Where(t => !Class10Book.IsTarget(t.TargetName)).ToArray();
            int class10Count = targets.Length - class9.Length;
            if (class9.Length != 13 || class9.Any(t => !class9Names.Contains(t.TargetName)) ||
                targets.Select(t => t.TargetName).Distinct().Count() != targets.Length ||
                (class10Count != 0 && class10Count != Class10Book.Entries.Length))
                throw new InvalidOperationException("The mobile scene requires 13 unique Class 9 targets and either zero or all Class 10 targets, with no unknown targets.");

            var host = new GameObject("RNBridge");
            SceneManager.MoveGameObjectToScene(host, scene);
            var session = host.AddComponent<VuforiaMobileSession>();
            var sessionData = new SerializedObject(session);
            sessionData.FindProperty("engine").objectReferenceValue = engine;
            sessionData.FindProperty("arCamera").objectReferenceValue = engine.GetComponent<Camera>();
            var array = sessionData.FindProperty("targets");
            array.arraySize = targets.Length;
            for (int i = 0; i < targets.Length; i++)
                array.GetArrayElementAtIndex(i).objectReferenceValue = targets[i];
            sessionData.ApplyModifiedPropertiesWithoutUndo();

            var preview = new GameObject("Mobile Preview Camera").AddComponent<Camera>();
            SceneManager.MoveGameObjectToScene(preview.gameObject, scene);
            preview.clearFlags = CameraClearFlags.SolidColor;
            preview.backgroundColor = new Color(.025f, .04f, .065f);
            preview.nearClipPlane = .01f;
            preview.gameObject.SetActive(false);
            var orbit = host.AddComponent<PreviewOrbit>();
            orbit.cam = preview;
            orbit.enabled = false;
            var bridge = host.AddComponent<RNBridge>();
            bridge.registry = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>("Assets/Experiments/ExperimentRegistry.asset");
            bridge.vuforiaSession = session;
            bridge.previewCamera = preview;
            bridge.previewOrbit = orbit;
            if (!bridge.registry)
                throw new InvalidOperationException("The experiment registry is missing.");

            session.SetRunning(false);
            if (!EditorSceneManager.SaveScene(scene))
                throw new IOException("Could not save " + ScenePath);
            Debug.Log("Prepared the mobile Unity bridge and " + targets.Length + " Vuforia targets in " + ScenePath);
        }
        finally
        {
            EditorSceneManager.CloseScene(scene, true);
            if (previous.IsValid() && previous.isLoaded)
                SceneManager.SetActiveScene(previous);
        }
    }
}
