using System;
using System.IO;
using System.Linq;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

// Copy this and the three test-*.cs validation classes into Assets/Editor.
public static class Class9OpeningCheck
{
    public static void Run()
    {
        Class9OpeningRepair.Run();
        string backup = "Library/BeforeCalorimeterWater/" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss-fff");
        Directory.CreateDirectory(backup);
        File.Copy("Assets/Experiments/Models/Reference 12 Loop.anim", backup + "/Reference 12 Loop.anim");
        BakeReferenceExperiments.RebuildCalorimeter();
        ValidateOnly();
    }

    public static void ValidateOnly()
    {
        Class9OpeningRepair.Validate();
        Class10Review.Validate();
        Empty();
        ModelRevealValidation.Run();
        Empty();
        LabelToggleValidation.Run();
        Empty();
        TrackingReacquisitionValidation.Run();
        Empty();
        ValidateWater();
        Render();
        Empty();
        Debug.Log("CLASS9_OPENING_CHECK_OK: repaired prefab, liquid geometry, 50 reveal/label/reacquisition instances, and Class 10 preservation.");
    }

    public static void RepairWater()
    {
        BakeReferenceExperiments.RebuildCalorimeter();
        Class9OpeningRepair.Validate();
        Empty();
        ValidateWater();
        Render();
        Empty();
        Debug.Log("CLASS9_OPENING_WATER_CHECK_OK");
    }

    static void ValidateWater()
    {
        foreach (string path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
        {
            var scene = EditorSceneManager.OpenScene(path);
            var taps = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true)).ToArray();
            var tap = taps.Single(t => t.referenceNumber == 12);
            Check(tap.labels.Length == 11 && tap.labelledParts.All(p => p) && tap.leaderLines.All(l => l), "Calorimeter labels were lost");
            foreach (string name in new[] { "Boiler water", "Calorimeter water" })
            {
                var water = tap.transform.Find(name);
                Check(water && water.GetComponent<MeshFilter>().sharedMesh && water.GetComponent<Renderer>(), "Missing filled water: " + name);
                var mat = water.GetComponent<Renderer>().sharedMaterial;
                Check(mat.color.a > .25f && mat.color.a < .6f && mat.GetFloat("_Surface") == 1 && mat.renderQueue >= 3000 &&
                    mat.GetFloat("_Cull") == 2 && mat.GetFloat("_Smoothness") < .5f,
                    "Water must be translucent so the thermometer/sample remain visible");
                Check(water.localScale.x > 20 && water.localScale.y > 3 && water.localScale.z == water.localScale.x, "Water has no filled volume");
            }
            var cupWater = tap.transform.Find("Calorimeter water");
            float bottom = cupWater.localPosition.y - cupWater.localScale.y;
            float surface = cupWater.localPosition.y + cupWater.localScale.y;
            Check(Mathf.Abs(bottom - 10.1f) < .001f && Mathf.Abs(surface - 23) < .001f, "Cold water must half-fill the cup above its solid base without coplanar surfaces");
            foreach (float time in new[] { 0f, 3f, 6f, 9f, 12f })
            {
                tap.animationPlayer.clip.SampleAnimation(tap.gameObject, time);
                Check(Mathf.Abs(cupWater.localPosition.y + cupWater.localScale.y - 23) < .001f, "Baked animation lost the water surface");
            }
            var sample = tap.transform.Find("Heated solid");
            Check(sample.localPosition.y - sample.localScale.y >= bottom && sample.localPosition.y + sample.localScale.y < surface,
                "Final heated solid is not submerged in the water");
            Check(taps.Length == 25, "Water rebuild changed book coverage");
        }
        File.WriteAllText("../docs/model-validation/calorimeter-water-results.txt",
            "PASS: both scenes retain 25 models and complete calorimeter label bindings; boiler and calorimeter have translucent filled cylinder water with back-face culling; cup water spans 10.1–23 mm without intersecting its base, preserves its level throughout the clip, and submerges the solid at the final pose.");
        Empty();
        Debug.Log("CALORIMETER_WATER_OK");
    }

    static void Render()
    {
        var source = EditorSceneManager.OpenScene("Assets/Scenes/SampleScene.unity");
        var tap = source.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true)).Single(t => t.referenceNumber == 12);
        var clone = UnityEngine.Object.Instantiate(tap.gameObject);
        var preview = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Additive);
        SceneManager.MoveGameObjectToScene(clone, preview);
        EditorSceneManager.CloseScene(source, true);
        SceneManager.SetActiveScene(preview);
        clone.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
        clone.SetActive(true);
        clone.GetComponent<Animation>().clip.SampleAnimation(clone, 12);
        foreach (var text in clone.GetComponentsInChildren<TMP_Text>(true)) text.gameObject.SetActive(false);
        foreach (var line in clone.GetComponentsInChildren<LineRenderer>(true)) line.gameObject.SetActive(false);
        var key = new GameObject("Water preview light").AddComponent<Light>();
        key.type = LightType.Directional;
        key.intensity = 1.5f;
        key.transform.rotation = Quaternion.Euler(40, -30, 0);
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(.55f, .58f, .62f);
        var camera = new GameObject("Water preview camera").AddComponent<Camera>();
        camera.orthographic = true;
        camera.orthographicSize = .084f;
        camera.nearClipPlane = .001f;
        camera.farClipPlane = 10;
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(.91f, .94f, .96f);
        var target = new RenderTexture(1000, 900, 24);
        camera.targetTexture = target;
        foreach (bool oblique in new[] { false, true })
        {
            Vector3 center = new Vector3(-.002f, .067f, 0);
            camera.transform.position = center + (oblique ? new Vector3(.10f, .24f, -.23f) : new Vector3(0, .025f, -.3f));
            camera.transform.LookAt(center);
            camera.Render();
            camera.Render();
            var previous = RenderTexture.active;
            RenderTexture.active = target;
            var image = new Texture2D(target.width, target.height, TextureFormat.RGB24, false);
            image.ReadPixels(new Rect(0, 0, target.width, target.height), 0, 0);
            image.Apply();
            File.WriteAllBytes("../docs/model-validation/calorimeter-water-" + (oblique ? "oblique" : "front") + ".png", image.EncodeToPNG());
            RenderTexture.active = previous;
            UnityEngine.Object.DestroyImmediate(image);
        }
        camera.targetTexture = null;
        UnityEngine.Object.DestroyImmediate(target);
    }

    static void Empty() => EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
    static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
}
