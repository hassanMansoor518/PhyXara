using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Vuforia;
using UnityEngine.SceneManagement;
using TMPro;
public static class PulleyBoardReview {
[MenuItem("PhyXara/Validate and Preview Pulley Board")] public static void Run() { Debug.Log(Verify()); Debug.Log(Render()); }
static string Verify() {

if (EditorApplication.isPlayingOrWillChangePlaymode || Enumerable.Range(0, UnityEngine.SceneManagement.SceneManager.sceneCount)
    .Any(i => UnityEngine.SceneManagement.SceneManager.GetSceneAt(i).isDirty))
    throw new InvalidOperationException("Save scenes and exit Play Mode before verifying the pulley board.");
var original = EditorSceneManager.GetSceneManagerSetup();
int verified = 0;
void Check(bool value, string message) { if (!value) throw new Exception(message); }
void Near(Vector3 actual, Vector3 expected, string message, float tolerance = .02f)
{
    Check(Vector3.Distance(actual, expected) <= tolerance, message + ": " + actual + " expected " + expected);
}
try
{
    foreach (var path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
    {
        var scene = EditorSceneManager.OpenScene(path);
        var tap = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true))
            .Single(t => t.referenceNumber == 4);
        var model = tap.transform;
        var player = tap.animationPlayer;
        Check(player && player.clip && !player.playAutomatically && !tap.IsPlaying, "Missing or autoplaying pulley animation in " + path);
        Check(tap.GetComponentInParent<ImageTargetBehaviour>(true), "Missing pulley tracking target");
        Check(tap.GetComponentsInChildren<Collider>(true).Length > 0, "Missing tap hit areas");
        Check(tap.procedureSteps.Length == 4 && tap.procedureSteps.All(s => !string.IsNullOrWhiteSpace(s)), "Missing pulley procedure");
        Check(tap.labelledParts.Length == 11 && tap.labelledParts.All(p => p) && tap.labels.Length == 13 && tap.labels.All(l => l), "Missing pulley labels");
        Check(tap.leaderLines.Length == 11 && tap.leaderLines.All(l => l), "Missing pulley label leaders");
        foreach (var name in new[] { "P1", "P2", "Thread", "Pendulum bob", "B", "W", "N", "M", "h", "P" })
            Check(tap.labels.Any(l => l.text == name), "Missing diagram label " + name);
        var manager = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ReferenceImageExperiments>(true)).Single();
        var entries = new SerializedObject(manager).FindProperty("experiments");
        var entry = Enumerable.Range(0, entries.arraySize).Select(i => entries.GetArrayElementAtIndex(i))
            .Single(e => e.FindPropertyRelative("Number").intValue == 4);
        Check(entry.FindPropertyRelative("Model").objectReferenceValue == player && entry.FindPropertyRelative("Target").objectReferenceValue,
            "Tracking manager does not reference the rebuilt pulley model");
        Check(model.Cast<Transform>().Count(t => t.name == "Pulley P1" || t.name == "Pulley P2") == 2,
            "Expected two pulley groups");
        foreach (var name in new[] { "Pulley P1", "Pulley P2" })
            Check(model.Find(name + "/Wheel"), "Missing wheel geometry: " + name);
        Check(!model.Find("Hanging weight") && !model.Find("Hanging thread"), "Obsolete right-hand hanging mass remains");
        var wood = model.Find("Vertical board").GetComponent<Renderer>().sharedMaterial;
        Check(wood && wood.GetTexture("_BaseMap"), "Missing board wood grain");
        Check(model.Find("Foot").GetComponent<Renderer>().sharedMaterial == wood &&
            model.Find("Pivoted bar/Bar").GetComponent<Renderer>().sharedMaterial == wood, "Base or bar is not wooden");
        Check(model.Cast<Transform>().Count(t => t.name.StartsWith("Rubber foot")) == 2, "Expected two base feet");
        Near(model.Find("Procedure Labels/@fallN").localPosition, new Vector3(-49, 84, -4), "N anchor moved");
        Near(model.Find("Procedure Labels/@fallM").localPosition, new Vector3(-49, 23, -4), "M anchor moved");
        Near(model.Find("Procedure Labels/@fallh").localPosition, new Vector3(-53, 53.5f, -4), "h anchor moved");
        var clip = player.clip;
        Check(Mathf.Abs(clip.length - 12) < .05f && Mathf.Abs(tap.duration - 12) < .05f, "Pulley timeline is not 12 seconds");
        var bindings = AnimationUtility.GetCurveBindings(clip);
        Check(bindings.Length > 0 && bindings.All(b => b.path.Length == 0 || model.Find(b.path)), "Broken pulley animation bindings");
        var pivot = model.Find("Pivoted bar");
        var bob = model.Find("Falling bob");
        var end = model.Find("Pivoted bar/Bar end B");
        var tension = model.Find("Tension thread");
        try
        {
            clip.SampleAnimation(tap.gameObject, 0);
            Near(pivot.localPosition, new Vector3(-30, 98, 4), "Incorrect bar pivot");
            Near(bob.localPosition, new Vector3(-42.75f, 84, -4), "Incorrect initial bob position");
            Check(Quaternion.Angle(pivot.localRotation, Quaternion.Euler(0, 0, 31)) < .05f, "Incorrect initial bar angle");
            foreach (float time in new[] { 0f, 3f, 4f, 6f, 6.75f, 7.5f, 12f })
            {
                clip.SampleAnimation(tap.gameObject, time);
                foreach (var part in tap.GetComponentsInChildren<Transform>(true))
                {
                    var p = part.localPosition; var s = part.localScale; var q = part.localRotation;
                    Check(!float.IsNaN(p.sqrMagnitude) && !float.IsInfinity(p.sqrMagnitude) &&
                        !float.IsNaN(s.sqrMagnitude) && !float.IsInfinity(s.sqrMagnitude) &&
                        !float.IsNaN(q.x + q.y + q.z + q.w) && !float.IsInfinity(q.x + q.y + q.z + q.w) &&
                        s.x > 0 && s.y > 0 && s.z > 0, "Invalid pulley transform at " + time + ": " + part.name);
                }
                Near(model.InverseTransformPoint(tension.TransformPoint(Vector3.up)), model.InverseTransformPoint(end.position),
                    "Tension thread detached from B at " + time, .15f);
                if (time <= 6) Check(Mathf.Abs(bob.localPosition.y - 84) < .02f, "Bob fell before release");
                if (time == 4) Check(Quaternion.Angle(pivot.localRotation, Quaternion.Euler(0, 0, 31)) > 1, "Bar does not oscillate before release");
                if (time == 6.75f) Check(bob.localPosition.y < 84 && bob.localPosition.y > 23, "Bob is not falling during release");
                if (time >= 7.5f)
                {
                    Check(Mathf.Abs(bob.localPosition.y - 23) < .02f, "Bob did not reach M");
                    Check(Quaternion.Angle(pivot.localRotation, Quaternion.identity) < .05f, "Bar did not settle vertically");
                }
            }
        }
        finally { clip.SampleAnimation(tap.gameObject, 0); }
        verified++;
    }
    Check(verified == 2, "Expected two saved pulley board models");
    string result = "PASS: two saved pulley boards have wooden bases and bars, two pulleys, diagram labels and height anchors, tap colliders, valid clip bindings, attached B threads, and a verified 12-second release timeline.";
    File.WriteAllText("../docs/model-validation/pulley-validation.txt", result);
    return result;
}
finally { EditorSceneManager.RestoreSceneManagerSetup(original); }

}
static string Render() {

if (EditorApplication.isPlayingOrWillChangePlaymode || Enumerable.Range(0, SceneManager.sceneCount).Any(i => SceneManager.GetSceneAt(i).isDirty))
    throw new InvalidOperationException("Save scenes and exit Play Mode before rendering the pulley board.");
var original = EditorSceneManager.GetSceneManagerSetup();
try
{
    var source = EditorSceneManager.OpenScene("Assets/Scenes/SampleScene.unity");
    var tap = source.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true)).Single(t => t.referenceNumber == 4);
    var clone = UnityEngine.Object.Instantiate(tap.gameObject);
    clone.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
    var preview = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Additive);
    SceneManager.MoveGameObjectToScene(clone, preview);
    EditorSceneManager.CloseScene(source, true);
    SceneManager.SetActiveScene(preview);
    clone.SetActive(true);
    tap = clone.GetComponent<ExperimentTapAnimation>();
    tap.animationPlayer.clip.SampleAnimation(clone, 0);
    tap.procedureLabel.text = "Tap the model to start";
    var key = new GameObject("Preview lighting").AddComponent<Light>();
    key.type = LightType.Directional;
    key.intensity = 1.3f;
    key.transform.rotation = Quaternion.Euler(45, -35, 0);
    RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
    RenderSettings.ambientLight = new Color(.65f, .65f, .65f);
    var camera = new GameObject("Pulley preview").AddComponent<Camera>();
    camera.tag = "MainCamera";
    camera.orthographic = true;
    camera.nearClipPlane = .001f;
    camera.farClipPlane = 10;
    camera.orthographicSize = .094f;
    camera.clearFlags = CameraClearFlags.SolidColor;
    camera.backgroundColor = new Color(.96f, .96f, .94f);
    var target = new RenderTexture(1100, 1400, 24);
    var image = new Texture2D(target.width, target.height, TextureFormat.RGB24, false);
    var previous = RenderTexture.active;
    try
    {
        camera.targetTexture = target;
        foreach (string view in new[] { "front", "angle" })
        {
            var center = new Vector3(-.008f, .068f, 0);
            camera.transform.position = center + (view == "front" ? new Vector3(0, .015f, -.8f) : new Vector3(.17f, .09f, -.8f));
            camera.transform.LookAt(center);
            tap.UpdateLabels(camera);
            foreach (var label in clone.GetComponentsInChildren<TMP_Text>(true)) label.ForceMeshUpdate(true);
            camera.Render();
            RenderTexture.active = target;
            image.ReadPixels(new Rect(0, 0, target.width, target.height), 0, 0);
            image.Apply();
            File.WriteAllBytes($"../docs/model-validation/reference-4-{view}.png", image.EncodeToPNG());
        }
    }
    finally
    {
        RenderTexture.active = previous;
        camera.targetTexture = null;
        UnityEngine.Object.DestroyImmediate(target);
        UnityEngine.Object.DestroyImmediate(image);
    }
    return "Rendered front and angled previews of the saved pulley board.";
}
finally { EditorSceneManager.RestoreSceneManagerSetup(original); }

}
}
