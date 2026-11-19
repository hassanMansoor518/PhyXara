using System;
using System.IO;
using System.Linq;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

public static class Class10Review
{
    const string SourceScene = "Assets/Scenes/SampleScene.unity";

    [MenuItem("PhyXara/Validate Class 10 Experiments")]
    public static void Validate()
    {
        RequireSavedScenes();
        var setup = EditorSceneManager.GetSceneManagerSetup();
        int verified = 0;
        try
        {
            foreach (var path in new[] { SourceScene, MobileARSetup.ScenePath })
            {
                var scene = EditorSceneManager.OpenScene(path);
                var targets = Components<ImageTargetBehaviour>(scene);
                var taps = Components<ExperimentTapAnimation>(scene);
                Check(targets.Length == 25 && targets.Select(t => t.TargetName).Distinct().Count() == 25,
                    "Both books must have 25 unique image targets in " + path);
                Check(taps.Length == 25 && taps.Select(t => t.referenceNumber).Distinct().Count() == 25,
                    "Both books must have 25 unique models in " + path);
                var manager = Components<ReferenceImageExperiments>(scene).Single();
                var entries = new SerializedObject(manager).FindProperty("experiments");
                foreach (var book in Class10Book.Entries)
                {
                    var target = targets.Single(t => t.TargetName == book.TargetName);
                    var data = new SerializedObject(target);
                    Check(data.FindProperty("mDataSetPath").stringValue == Class10Book.Database,
                        "Class 10 target uses the wrong database");
                    Check(Mathf.Abs(data.FindProperty("mWidth").floatValue - book.WidthMeters) < .00001f && book.WidthMeters < 1,
                        "Class 10 physical target width was not converted to metres");
                    Check(Mathf.Abs(target.GetSize().x - book.WidthMeters) < .00001f,
                        "Vuforia's authoring size differs from the configured metre width");
                    var tap = target.GetComponentInChildren<ExperimentTapAnimation>(true);
                    Check(tap && tap.referenceNumber == 100 + book.Number && !tap.IsPlaying,
                        "Missing idle Class 10 model: " + book.Title);
                    Check(tap.procedureSteps.SequenceEqual(book.Steps) && tap.procedureSteps.Length == 4,
                        "The procedure does not match the book: " + book.Title);
                    Check(tap.labels.Length == tap.labelledParts.Length + 2 && tap.labelledParts.Length >= 5 &&
                        tap.labels.All(l => l) && tap.labelledParts.All(p => p) && tap.leaderLines.All(l => l),
                        "Incomplete Class 10 part labels");
                    Check(tap.GetComponentsInChildren<Collider>(true).Length == 1 && tap.GetComponent<BoxCollider>(),
                        "Class 10 model should use one apparatus hit area");
                    foreach (var filter in tap.GetComponentsInChildren<MeshFilter>(true).Where(f => !f.GetComponent<TMP_Text>()))
                        Check(filter.sharedMesh && !string.IsNullOrEmpty(AssetDatabase.GetAssetPath(filter.sharedMesh)) &&
                            filter.GetComponent<Renderer>().sharedMaterials.All(m => m && m.shader),
                            "Unsaved geometry or missing material: " + filter.name);
                    var player = tap.animationPlayer;
                    Check(player && player.clip && !player.playAutomatically && Mathf.Abs(player.clip.length - 12) < .05f,
                        "Missing single-run Class 10 procedure animation");
                    var bindings = AnimationUtility.GetCurveBindings(player.clip);
                    Check(bindings.Length > 0 && bindings.All(b => b.path.Length == 0 || tap.transform.Find(b.path)),
                        "Broken Class 10 animation bindings");
                    bool registered = Enumerable.Range(0, entries.arraySize).Any(i =>
                    {
                        var entry = entries.GetArrayElementAtIndex(i);
                        return entry.FindPropertyRelative("Number").intValue == 100 + book.Number &&
                            entry.FindPropertyRelative("Target").objectReferenceValue == target &&
                            entry.FindPropertyRelative("Model").objectReferenceValue == player;
                    });
                    Check(registered, "The Class 10 model is not registered for tracking visibility");
                    foreach (float time in new[] { 0f, .5f, 1.5f, 3f, 4.5f, 6f, 7.5f, 9f, 10.5f, 12f })
                    {
                        player.clip.SampleAnimation(tap.gameObject, time);
                        foreach (var part in tap.GetComponentsInChildren<Transform>(true))
                        {
                            var p = part.localPosition; var s = part.localScale; var r = part.localRotation;
                            Check(!float.IsNaN(p.sqrMagnitude) && !float.IsInfinity(p.sqrMagnitude) &&
                                !float.IsNaN(s.sqrMagnitude) && !float.IsInfinity(s.sqrMagnitude) &&
                                !float.IsNaN(r.x + r.y + r.z + r.w) && s.x > 0 && s.y > 0 && s.z > 0,
                                "Invalid Class 10 pose at " + time + ": " + part.name);
                        }
                    }
                    ValidatePhysics(tap, book.Number);
                    player.clip.SampleAnimation(tap.gameObject, 0);
                    verified++;
                }
                if (path == MobileARSetup.ScenePath)
                {
                    var session = new SerializedObject(Components<PhyXara.Bridge.VuforiaMobileSession>(scene).Single());
                    var observers = session.FindProperty("targets");
                    var registered = Enumerable.Range(0, observers.arraySize)
                        .Select(i => observers.GetArrayElementAtIndex(i).objectReferenceValue as ImageTargetBehaviour).ToArray();
                    Check(registered.Length == 25 && registered.All(t => t) && registered.Distinct().Count() == 25 && targets.All(registered.Contains),
                        "The mobile scanner must track both complete books");
                }
            }
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
        Check(verified == 24, "Expected twelve Class 10 models in both scenes");
        Directory.CreateDirectory("../docs/class-10");
        string result = "PASS: 12 Class 10 book targets and animated, labelled apparatus in both scenes; all 13 Class 9 targets preserved; 25 mobile observers; metre scene widths, saved meshes/materials, valid 12-second timelines, Snell/reflection laws, parallel telescope rays, galvanometer half deflection, one collider per new apparatus. Printed-width calibration and physical-device tracking remain unverified.";
        File.WriteAllText("../docs/class-10/validation-results.txt", result);
        Debug.Log("CLASS10_VALIDATION_OK: " + result);
    }

    [MenuItem("PhyXara/Render Class 10 Model Previews")]
    public static void Render()
    {
        RequireSavedScenes();
        var setup = EditorSceneManager.GetSceneManagerSetup();
        Directory.CreateDirectory("../docs/class-10/models");
        try
        {
            foreach (var book in Class10Book.Entries)
            {
                var source = EditorSceneManager.OpenScene(SourceScene);
                var model = Components<ExperimentTapAnimation>(source).Single(t => t.referenceNumber == 100 + book.Number);
                var clone = UnityEngine.Object.Instantiate(model.gameObject);
                clone.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
                var preview = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Additive);
                SceneManager.MoveGameObjectToScene(clone, preview);
                EditorSceneManager.CloseScene(source, true);
                SceneManager.SetActiveScene(preview);
                clone.SetActive(true);
                var tap = clone.GetComponent<ExperimentTapAnimation>();
                tap.animationPlayer.clip.SampleAnimation(clone, 9);
                foreach (var label in tap.labels) label.gameObject.SetActive(false);
                foreach (var line in tap.leaderLines) line.gameObject.SetActive(false);
                var key = new GameObject("Preview lighting").AddComponent<Light>();
                key.type = LightType.Directional; key.intensity = 1.4f;
                key.transform.rotation = Quaternion.Euler(45, -35, 0);
                RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
                RenderSettings.ambientLight = new Color(.6f, .62f, .66f);
                var camera = new GameObject("Preview camera").AddComponent<Camera>();
                camera.orthographic = true;
                camera.nearClipPlane = .001f; camera.farClipPlane = 10;
                camera.clearFlags = CameraClearFlags.SolidColor;
                camera.backgroundColor = new Color(.94f, .95f, .96f);
                var renderers = clone.GetComponentsInChildren<MeshRenderer>();
                var bounds = renderers[0].bounds;
                foreach (var renderer in renderers) bounds.Encapsulate(renderer.bounds);
                float size = Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z);
                camera.transform.position = bounds.center + new Vector3(size * .6f, size * .8f, -size * 1.7f);
                camera.transform.LookAt(bounds.center);
                camera.orthographicSize = size * .65f;
                var target = new RenderTexture(1200, 900, 24);
                var image = new Texture2D(1200, 900, TextureFormat.RGB24, false);
                var previous = RenderTexture.active;
                try
                {
                    camera.targetTexture = target;
                    // Warm the pipeline after loading a new preview scene before capturing its material colours.
                    camera.Render();
                    camera.Render();
                    RenderTexture.active = target;
                    image.ReadPixels(new Rect(0, 0, 1200, 900), 0, 0);
                    image.Apply();
                    File.WriteAllBytes("../docs/class-10/models/experiment-" + book.Number.ToString("00") + ".png", image.EncodeToPNG());
                }
                finally
                {
                    RenderTexture.active = previous;
                    camera.targetTexture = null;
                    UnityEngine.Object.DestroyImmediate(image);
                    UnityEngine.Object.DestroyImmediate(target);
                }
                EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            }
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
        Debug.Log("CLASS10_PREVIEWS_OK: rendered twelve Class 10 apparatus previews.");
    }

    static T[] Components<T>(Scene scene) where T : Component =>
        scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<T>(true)).ToArray();

    static void ValidatePhysics(ExperimentTapAnimation tap, int number)
    {
        Vector3 Direction(string name) => tap.transform.InverseTransformDirection(tap.transform.Find(name).up).normalized;
        if (number == 1)
        {
            var incident = Direction("Incident ray");
            var emergent = Direction("Emergent ray");
            var refracted = Direction("Refracted ray");
            Check(Vector3.Dot(incident, emergent) > .9999f && Mathf.Abs(incident.x - 1.5f * refracted.x) < .001f,
                "The slab must satisfy Snell's law and leave the emergent ray parallel");
        }
        if (number == 3)
        {
            var normal = new Vector3(Mathf.Sqrt(3) / 2, 0, .5f);
            Check(Mathf.Abs(Vector3.Dot(Direction("Internal incident ray"), normal) +
                Vector3.Dot(Direction("Totally reflected ray"), normal)) < .001f &&
                tap.transform.Find("Refracted ray in air").localScale.x < .01f,
                "Above the critical angle, the ray must reflect inside the glass");
        }
        if (number == 6)
        {
            var rays = tap.GetComponentsInChildren<Transform>(true).Where(t => t.name.StartsWith("Eyepiece telescope ray")).ToArray();
            Check(rays.Length == 3 && rays.All(ray => Vector3.Dot(ray.up, rays[0].up) > .9999f),
                "The focused astronomical telescope must emit parallel rays");
        }
        if (number == 11)
        {
            var needle = tap.transform.Find("Galvanometer G/Needle pivot");
            Check(needle, "The galvanometer needle is missing");
            tap.animationPlayer.clip.SampleAnimation(tap.gameObject, 5);
            float initial = Quaternion.Angle(needle.localRotation, Quaternion.Euler(0, 0, 65));
            tap.animationPlayer.clip.SampleAnimation(tap.gameObject, 12);
            float final = Quaternion.Angle(needle.localRotation, Quaternion.Euler(0, 0, 65));
            Check(initial > 1 && Mathf.Abs(final / initial - .5f) < .001f,
                "The shunt procedure must reduce galvanometer deflection to one half");
        }
    }

    static void RequireSavedScenes()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode ||
            Enumerable.Range(0, SceneManager.sceneCount).Any(i => SceneManager.GetSceneAt(i).isDirty))
            throw new InvalidOperationException("Save scenes and exit Play Mode before reviewing Class 10.");
    }

    static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
}
