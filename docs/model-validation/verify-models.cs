using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
var original = EditorSceneManager.GetActiveScene().path;
int verified = 0;
foreach (var path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
{
    var scene = EditorSceneManager.OpenScene(path);
    var manager = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ReferenceImageExperiments>(true)).Single();
    var entries = new SerializedObject(manager).FindProperty("experiments");
    for (int i = 0; i < entries.arraySize; i++)
    {
        var entry = entries.GetArrayElementAtIndex(i);
        int number = entry.FindPropertyRelative("Number").intValue;
        if (number < 10 || number > 13) continue;
        var model = (Animation)entry.FindPropertyRelative("Model").objectReferenceValue;
        if (!model || !model.clip || !entry.FindPropertyRelative("Target").objectReferenceValue)
            throw new Exception("Missing model, clip or target: " + number);
        if (number == 11)
        {
            var barrel = model.GetComponentsInChildren<MeshFilter>(true).Single(f => f.name == "Syringe barrel");
            if (!AssetDatabase.Contains(barrel.sharedMesh) || barrel.sharedMesh.bounds.min.z > -8.9f || barrel.sharedMesh.bounds.max.z < 8.9f)
                throw new Exception("Syringe barrel is incomplete or its mesh was not saved");
            var glass = barrel.GetComponent<MeshRenderer>().sharedMaterial;
            if (glass.GetFloat("_Surface") != 1 || glass.renderQueue != 3000)
                throw new Exception("Syringe barrel is not transparent");
            if (model.GetComponentsInChildren<Light>(true).Length != 1)
                throw new Exception("Syringe lighting is missing");
        }
        var bindings = AnimationUtility.GetCurveBindings(model.clip);
        if (bindings.Length == 0) throw new Exception("Missing animation: " + number);
        foreach (var binding in bindings)
            if (binding.path.Length > 0 && !model.transform.Find(binding.path))
                throw new Exception("Broken animation path: " + binding.path);
        foreach (var renderer in model.GetComponentsInChildren<MeshRenderer>(true))
            if (renderer.sharedMaterials.Any(m => !m)) throw new Exception("Missing material: " + renderer.name);
        verified++;
    }
}
EditorSceneManager.OpenScene(original);
if (verified != 8) throw new Exception("Expected eight scene models, got " + verified);
return "PASS: eight scene models have targets, materials, clips and valid animation bindings.";
