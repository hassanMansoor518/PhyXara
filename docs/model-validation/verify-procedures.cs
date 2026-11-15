using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using TMPro;
using Vuforia;
var original = EditorSceneManager.GetActiveScene().path;
int count = 0;
foreach (var path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
{
    var scene = EditorSceneManager.OpenScene(path);
    var wood = AssetDatabase.LoadAssetAtPath<Material>("Assets/Experiments/Models/AC683E.mat");
    if (!wood || !wood.GetTexture("_BaseMap") || wood.shader.name != "Universal Render Pipeline/Lit") throw new Exception("Missing wood grain material");
    if (!scene.GetRootGameObjects().Any(g => g.name == "Apparatus Lighting")) throw new Exception("Missing apparatus lighting");
    var targets = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ImageTargetBehaviour>(true)).ToArray();
    if (targets.GroupBy(t => t.TargetName).Any(g => g.Count() > 1)) throw new Exception("Duplicate image tracking target");
    var taps = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ExperimentTapAnimation>(true))
        .Where(t => t.referenceNumber >= 1 && t.referenceNumber <= 13).ToArray();
    if (taps.Length != 13 || taps.Select(t => t.referenceNumber).Distinct().Count() != 13)
        throw new Exception("Expected 13 unique tap models in " + path);
    foreach (var tap in taps)
    {
        if (tap.IsPlaying || !tap.GetComponentInParent<ImageTargetBehaviour>(true)) throw new Exception("Invalid idle/tracking state");
        if (tap.labels.Length != tap.labelledParts.Length + 2 || tap.labels.Any(l => !l) || tap.labelledParts.Length < 5 || tap.labelledParts.Any(p => !p))
            throw new Exception("Missing labels on " + tap.name);
        if (tap.referenceNumber == 1 && new[] { "Internal jaws", "Locking screw", "Imperial scale", "Metric scale", "Depth measuring blade", "External jaws" }.Any(name => !tap.labels.Any(l => l.text == name)))
            throw new Exception("A caliper reference label is missing");
        if (tap.referenceNumber == 12 && tap.labelledParts.Length != 9) throw new Exception("A calorimeter diagram label is missing");
        if (tap.procedureSteps.Length != 4 || tap.procedureSteps.Any(string.IsNullOrWhiteSpace)) throw new Exception("Missing procedure");
        if (tap.GetComponentsInChildren<Collider>(true).Length == 0) throw new Exception("No tap hit area");
        if (tap.animationPlayer)
        {
            if (tap.animationPlayer.playAutomatically || !tap.animationPlayer.clip) throw new Exception("Autoplay/missing clip");
            var clip = tap.animationPlayer.clip;
            if (Mathf.Abs(clip.length - tap.duration) > .05f) throw new Exception("Procedure timing mismatch " + tap.referenceNumber);
            var bindings = AnimationUtility.GetCurveBindings(clip);
            if (bindings.Length == 0 || bindings.Any(b => b.path.Length > 0 && !tap.transform.Find(b.path))) throw new Exception("Broken animation bindings");
            clip.SampleAnimation(tap.gameObject, clip.length * .5f);
            foreach (var part in tap.GetComponentsInChildren<Transform>(true))
                if (float.IsNaN(part.localPosition.sqrMagnitude) || float.IsInfinity(part.localPosition.sqrMagnitude) || part.localScale.x <= 0 || part.localScale.y <= 0 || part.localScale.z <= 0) throw new Exception("Invalid animated transform");
            if (tap.referenceNumber == 13)
            {
                clip.SampleAnimation(tap.gameObject, 11);
                var column = tap.transform.Find("Thermometer column 5");
                if (!column || Mathf.Abs(column.localPosition.x - 57) > .01f || column.localScale.y < 58 || column.localScale.x < 1.9f)
                    throw new Exception("Exported heating column lost a position or scale axis");
            }
            clip.SampleAnimation(tap.gameObject, 0);
        }
        else if (!tap.driver) throw new Exception("Missing animation driver");
        count++;
    }
}
EditorSceneManager.OpenScene(original);
System.IO.File.WriteAllText("../docs/model-validation/procedure-validation.txt", "PASS: 26 Class 9 scene models, 13 unique experiments per scene, idle until tapped, all mapped diagram labels and 4 procedure captions each, tap colliders, drivers and animation bindings verified.");
return "PASS: " + count + " labelled Class 9 tap models across both scenes";
