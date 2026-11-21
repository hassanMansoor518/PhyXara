using System;
using System.IO;
using System.Linq;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

// Copy into Assets/Editor, then run -executeMethod ModelRevealValidation.Run.
public static class ModelRevealValidation
{
    const BindingFlags Private = BindingFlags.Instance | BindingFlags.NonPublic;

    public static void Run()
    {
        var setup = EditorSceneManager.GetSceneManagerSetup();
        int originalFrameRate = Application.targetFrameRate;
        Check(Enumerable.Range(0, SceneManager.sceneCount).All(i => !SceneManager.GetSceneAt(i).isDirty), "Save open scenes before validating");
        try
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            Validate();
        }
        finally
        {
            Application.targetFrameRate = originalFrameRate;
            if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup);
        }
    }

    static void Validate()
    {
        var original = SceneManager.GetActiveScene();
        int checkedModels = 0;
        int modelsPerScene = 0;
        foreach (var path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
        {
            Check(!SceneManager.GetSceneByPath(path).isLoaded, "Close the scene before validating: " + path);
            var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
            ReferenceImageExperiments manager = null;
            try
            {
                manager = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ReferenceImageExperiments>(true)).Single();
                typeof(ReferenceImageExperiments).GetMethod("OnEnable", Private).Invoke(manager, null);
                Check(Application.targetFrameRate == 60, "The common scene manager did not request smooth 60 fps rendering");
                var camera = new GameObject("Reveal validation camera").AddComponent<Camera>();
                SceneManager.MoveGameObjectToScene(camera.gameObject, scene);
                var taps = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true)).ToArray();
                var class10Targets = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ImageTargetBehaviour>(true))
                    .Where(t => Class10Book.IsTarget(t.TargetName)).ToArray();
                Check(class10Targets.Length == 0 || class10Targets.Length == Class10Book.Entries.Length, "Incomplete Class 10 targets in " + path);
                Check(class10Targets.Select(t => t.TargetName).Distinct().Count() == class10Targets.Length, "Duplicate Class 10 target in " + path);
                int expected = 13 + class10Targets.Length;
                if (modelsPerScene == 0) modelsPerScene = expected;
                Check(expected == modelsPerScene, "Book coverage differs between scenes");
                var references = Enumerable.Range(1, 13).Concat(class10Targets.Length == 0 ? Enumerable.Empty<int>() : Class10Book.Entries.Select(e => 100 + e.Number));
                Check(taps.Length == expected && taps.Select(t => t.referenceNumber).OrderBy(n => n).SequenceEqual(references.OrderBy(n => n)), "Missing, duplicate or unexpected models in " + path);
                foreach (var tap in taps)
                {
                    var model = tap.transform;
                    var target = model.parent;
                    Check(target && target.GetComponent<ImageTargetBehaviour>(), "Model is not directly on its image: " + tap.name);
                    var position = model.localPosition;
                    var rotation = model.localRotation;
                    var scale = model.localScale;
                    var world = model.localToWorldMatrix;

                    Call(tap, "Awake");
                    var reveal = model.parent;
                    Check(reveal != target && reveal.parent == target, "Missing page-space reveal parent");
                    Check(reveal.localPosition == Vector3.zero && reveal.localRotation == Quaternion.identity, "Reveal moved away from the image");
                    Check(model.localPosition == position && model.localRotation == rotation && model.localScale == scale, "Authored model transform changed");
                    Check(MatrixClose(model.localToWorldMatrix, world), "Awake squashed the model before controller calibration");
                    Check(!tap.IsPlaying, "Reveal started the experiment procedure");
                    if (tap.animationPlayer && tap.animationPlayer.clip)
                        Check(AnimationUtility.GetCurveBindings(tap.animationPlayer.clip).All(b => b.path.Length == 0 || model.Find(b.path)), "Reveal broke an animation binding");

                    Call(tap, "SetRevealTracking", true);
                    Check(Mathf.Abs(reveal.localScale.y - .001f) < .00001f, "Reveal did not start on the page");
                    Check(reveal.localPosition == Vector3.zero, "Reveal started above the page");
                    Call(tap, "AdvanceReveal", .55f);
                    float halfway = reveal.localScale.y;
                    var halfPosition = reveal.localPosition;
                    Check(Mathf.Abs(halfway - .5005f) < .02f, "Reveal did not reach half height at half duration");
                    Check(Mathf.Abs(HoverHeight(reveal, target) - .004f) < .00001f, "Reveal did not rise halfway to its hover height");
                    Check(reveal.localScale.x == 1 && reveal.localScale.z == 1, "Reveal changed the image footprint");
                    Call(tap, "SetRevealTracking", true);
                    Check(reveal.localScale.y == halfway && reveal.localPosition == halfPosition, "Repeated tracking restarted the reveal");
                    Call(tap, "AdvanceReveal", -.5f);
                    Check(reveal.localScale.y == halfway && reveal.localPosition == halfPosition, "Negative delta reversed the reveal");
                    Call(tap, "AdvanceReveal", .55f);
                    Check(reveal.localScale == Vector3.one, "Reveal did not finish at authored height");
                    Check(Mathf.Abs(HoverHeight(reveal, target) - .008f) < .00001f, "Reveal did not hover 8 mm above its image");
                    var translated = Matrix4x4.Translate(target.up * .008f) * world;
                    Check(MatrixClose(model.localToWorldMatrix, translated), "Completed reveal changed more than the hover position");
                    Call(tap, "AdvanceReveal", 10f);
                    Check(MatrixClose(model.localToWorldMatrix, translated), "Completed hover continued moving after settling");

                    Call(tap, "SetRevealTracking", false);
                    float hidden = reveal.localScale.y;
                    var frozenPosition = reveal.localPosition;
                    Call(tap, "AdvanceReveal", 10f);
                    Check(reveal.localScale.y == hidden && reveal.localPosition == frozenPosition, "Lost tracking continued the reveal or hover");
                    var label = tap.labels.First(l => l);
                    label.transform.rotation = ExperimentTapAnimation.ActiveCamera().transform.rotation * Quaternion.Euler(20, 30, 40);
                    var labelRotation = label.transform.rotation;
                    Call(tap, "LateUpdate");
                    Check(label.transform.rotation == labelRotation, "Untracked model still updated its labels");
                    model.localScale = scale * 1.25f;
                    typeof(ExperimentTapAnimation).GetField("trackingLostAt", Private).SetValue(tap, Time.unscaledTime - .5f);
                    Call(tap, "SetRevealTracking", true);
                    Check(Mathf.Abs(reveal.localScale.y - .001f) < .00001f, "Reacquisition did not restart from the page");
                    Check(reveal.localPosition == Vector3.zero, "Reacquisition retained the old hover position");
                    Call(tap, "AdvanceReveal", 10f);
                    Check(reveal.localScale == Vector3.one && model.localScale == scale * 1.25f, "Reveal overwrote pinch zoom or overshot");
                    Check(Mathf.Abs(HoverHeight(reveal, target) - .008f) < .00001f, "Long frames overshot the stationary hover height");
                    Check(model.localPosition == position && model.localRotation == rotation, "Hover changed the authored position or rotation");
                    Check(!tap.IsPlaying, "Reveal auto-played the procedure");
                    checkedModels++;
                }
            }
            finally
            {
                if (manager) typeof(ReferenceImageExperiments).GetMethod("OnDisable", Private).Invoke(manager, null);
                EditorSceneManager.CloseScene(scene, true);
                if (original.IsValid() && original.isLoaded) SceneManager.SetActiveScene(original);
            }
        }

        var preview = new GameObject("Reveal preview check");
        try
        {
            var tap = preview.AddComponent<ExperimentTapAnimation>();
            Call(tap, "Awake");
            Check(!preview.transform.parent, "Preview model received an image reveal parent");
        }
        finally { UnityEngine.Object.DestroyImmediate(preview); }

        Check(checkedModels == modelsPerScene * 2, "Expected " + modelsPerScene * 2 + " scene models");
        string result = "PASS: " + checkedModels + " models; page-axis reveal timing, stationary 8 mm hover, 60 fps request, repeated tracking, frozen reveal on loss and fresh reveal after a long loss, authored transforms, animation paths, pinch scale, preview isolation and skipped untracked label updates. Physical-device appearance remains untested.";
        File.WriteAllText(Path.Combine(Application.dataPath, "../../docs/model-validation/model-reveal-results.txt"), result);
        Debug.Log("MODEL_REVEAL_OK: " + result);
    }

    static void Call(ExperimentTapAnimation tap, string method, params object[] args) =>
        typeof(ExperimentTapAnimation).GetMethod(method, Private).Invoke(tap, args);

    static bool MatrixClose(Matrix4x4 a, Matrix4x4 b) =>
        Enumerable.Range(0, 16).All(i => Mathf.Abs(a[i] - b[i]) < .00001f);

    static float HoverHeight(Transform reveal, Transform target) =>
        Vector3.Dot(reveal.position - target.position, target.up);

    static void Check(bool condition, string message)
    {
        if (!condition) throw new Exception(message);
    }
}
