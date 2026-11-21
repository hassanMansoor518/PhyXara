using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

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
