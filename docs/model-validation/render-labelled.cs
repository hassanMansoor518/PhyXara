using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
var original = EditorSceneManager.GetActiveScene().path;
foreach (int number in new[] { 1, 4, 5, 12 })
{
    var source = EditorSceneManager.OpenScene("Assets/Scenes/SampleScene.unity");
    var tap = source.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true)).Single(t => t.referenceNumber == number);
    var clone = UnityEngine.Object.Instantiate(tap.gameObject);
    clone.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
    var preview = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Additive);
    SceneManager.MoveGameObjectToScene(clone, preview);
    EditorSceneManager.CloseScene(source, true);
    SceneManager.SetActiveScene(preview);
    clone.SetActive(true);
    var behaviour = clone.GetComponent<ExperimentTapAnimation>();
    float sampleTime = number == 13 ? 11 : 7;
    if (behaviour.animationPlayer)
    {
        behaviour.animationPlayer.clip.SampleAnimation(clone, sampleTime);
        int step = Mathf.Min(3, Mathf.FloorToInt(sampleTime / behaviour.duration * 4));
        behaviour.procedureLabel.text = $"{step + 1}/4  {behaviour.procedureSteps[step]}";
    }
    else behaviour.procedureLabel.text = "Tap the model to start";
    foreach (var text in clone.GetComponentsInChildren<TMP_Text>(true)) text.ForceMeshUpdate(true);
    var key = new GameObject("Preview lighting").AddComponent<Light>();
    key.type = LightType.Directional; key.intensity = 1.3f;
    key.transform.rotation = Quaternion.Euler(45, -35, 0);
    RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
    RenderSettings.ambientLight = new Color(.45f, .48f, .52f);
    var camera = new GameObject("Label preview").AddComponent<Camera>();
    camera.tag = "MainCamera"; camera.orthographic = true;
    camera.nearClipPlane = .001f; camera.farClipPlane = 50;
    camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = new Color(.91f, .94f, .96f);
    var renderers = clone.GetComponentsInChildren<MeshRenderer>();
    var bounds = renderers[0].bounds;
    foreach (var r in renderers) bounds.Encapsulate(r.bounds);
    float size = Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z);
    camera.transform.position = bounds.center + new Vector3(0, size * .12f, -size * 2.5f);
    camera.transform.LookAt(bounds.center);
    camera.orthographicSize = Mathf.Max(bounds.size.y * .65f, bounds.size.x / (1400f / 1100) * .65f);
    behaviour.UpdateLabels(camera);
    var target = new RenderTexture(1400, 1100, 24); camera.targetTexture = target;
    camera.Render(); var previous = RenderTexture.active; RenderTexture.active = target;
    var image = new Texture2D(1400, 1100, TextureFormat.RGB24, false);
    image.ReadPixels(new Rect(0, 0, 1400, 1100), 0, 0); image.Apply();
    File.WriteAllBytes($"../docs/model-validation/reference-{number}-labelled.png", image.EncodeToPNG());
    RenderTexture.active = previous; camera.targetTexture = null;
    UnityEngine.Object.DestroyImmediate(target); UnityEngine.Object.DestroyImmediate(image);
}
EditorSceneManager.OpenScene(original);
return "Rendered labelled syringe and heating models";
