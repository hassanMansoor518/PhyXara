using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;

// Copy into Assets/Editor, then run -executeMethod LabelToggleValidation.Run.
public static class LabelToggleValidation
{
    const BindingFlags Private = BindingFlags.Instance | BindingFlags.NonPublic;

    public static void Run()
    {
        var setup = EditorSceneManager.GetSceneManagerSetup();
        Check(Enumerable.Range(0, SceneManager.sceneCount).All(i => !SceneManager.GetSceneAt(i).isDirty), "Save open scenes before validating");
        int count = 0;
        int modelsPerScene = 0;
        try
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            foreach (string path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
            {
                var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
                SceneManager.SetActiveScene(scene);
                try
                {
                    var camera = new GameObject("Label validation camera").AddComponent<Camera>();
                    camera.transform.rotation = Quaternion.Euler(15, 20, 0);
                    var taps = Components<ExperimentTapAnimation>(scene);
                    var class10Targets = Components<Vuforia.ImageTargetBehaviour>(scene).Where(t => Class10Book.IsTarget(t.TargetName)).ToArray();
                    Check(class10Targets.Length == 0 || class10Targets.Length == Class10Book.Entries.Length, "Incomplete Class 10 targets in " + path);
                    Check(class10Targets.Select(t => t.TargetName).Distinct().Count() == class10Targets.Length, "Duplicate Class 10 target in " + path);
                    int expected = 13 + class10Targets.Length;
                    if (modelsPerScene == 0) modelsPerScene = expected;
                    Check(expected == modelsPerScene, "Book coverage differs between scenes");
                    var references = Enumerable.Range(1, 13).Concat(class10Targets.Length == 0 ? Enumerable.Empty<int>() : Class10Book.Entries.Select(e => 100 + e.Number));
                    Check(taps.Length == expected && taps.Select(t => t.referenceNumber).OrderBy(n => n).SequenceEqual(references.OrderBy(n => n)), "Missing, duplicate or unexpected labelled models in " + path);
                    foreach (var tap in taps)
                    {
                        tap.transform.parent.gameObject.SetActive(true);
                        tap.gameObject.SetActive(true);
                        var homes = tap.labels.Skip(2).Select(l => l.transform.localPosition).ToArray();
                        var position = tap.transform.localPosition;
                        var rotation = tap.transform.localRotation;
                        var scale = tap.transform.localScale;
                        Call(tap, "Awake");
                        Hidden(tap);
                        Check(!tap.CanToggleLabels, "Labels became available before the model reveal");
                        tap.SetLabelsVisible(true);
                        Check(!tap.LabelsVisible, "Unrevealed model accepted a label request");
                        Call(tap, "SetRevealTracking", true);
                        Call(tap, "AdvanceReveal", 1.1f);
                        Check(tap.CanToggleLabels, "Revealed model cannot show labels");

                        tap.ToggleLabels();
                        Tick(tap, camera, .25f);
                        Check(tap.LabelsVisible && tap.labels.Skip(2).All(l => l.gameObject.activeSelf && l.alpha > 0 && l.alpha < 1), "Labels did not animate outward and fade in");
                        float halfLength = LineLength(tap);
                        Check(halfLength > .00001f, "Leader lines did not grow out of the model");
                        Tick(tap, camera, .25f);
                        Check(tap.labels.Skip(2).All(l => l.alpha > .99f && l.renderer.enabled), "Fully shown labels are invisible");
                        Check(tap.leaderLines.All(l => l.enabled && l.gameObject.activeSelf), "Fully shown leader lines are disabled");
                        Check(LineLength(tap) > halfLength, "Leader lines did not finish extending");
                        Homes(tap, homes);
                        tap.transform.localScale = scale * 1.2f;
                        tap.UpdateLabels(camera);
                        Homes(tap, homes);
                        tap.transform.localScale = scale;

                        tap.SetLabelsVisible(false);
                        Tick(tap, camera, .2f);
                        float alpha = tap.labels[2].alpha;
                        var point = tap.labels[2].transform.position;
                        Check(alpha > 0 && alpha < 1, "Labels disappeared without retracting");
                        tap.ToggleLabels();
                        Check(tap.labels[2].alpha == alpha && tap.labels[2].transform.position == point, "Rapid toggle snapped the label animation");
                        Tick(tap, camera, .1f);
                        Check(tap.labels[2].alpha > alpha, "Rapid toggle did not reverse the retract animation");
                        tap.SetLabelsVisible(false);
                        Tick(tap, camera, .5f);
                        Hidden(tap);
                        tap.ToggleLabels();
                        Tick(tap, camera, .25f);
                        Call(tap, "SetRevealTracking", false);
                        Hidden(tap);
                        Check(!tap.CanToggleLabels, "Tracking loss left labels available");
                        Check(tap.labels.Take(2).All(l => l.gameObject.activeSelf && l.alpha > .99f), "Title or procedure caption was hidden");
                        Check(!tap.IsPlaying && tap.Elapsed == 0, "Label toggle started the experiment procedure");
                        Check(tap.transform.localPosition == position && tap.transform.localRotation == rotation && tap.transform.localScale == scale, "Label animation changed model calibration");
                        if (tap.animationPlayer && tap.animationPlayer.clip)
                            Check(AnimationUtility.GetCurveBindings(tap.animationPlayer.clip).All(b => b.path.Length == 0 || tap.transform.Find(b.path)), "Label toggle broke an animation binding");
                        count++;
                    }
                    Hud(scene, taps);
                }
                finally { EditorSceneManager.CloseScene(scene, true); }
            }
            Check(count == modelsPerScene * 2, "Expected " + modelsPerScene * 2 + " labelled models");
            string result = "PASS: " + count + " models; hidden callouts, outward/fade animation, extending lines, retraction, rapid reversal, zoom, tracking reset, preserved captions/calibration, and shared Label button wiring. Physical-device touch/layout remain untested.";
            File.WriteAllText(Path.Combine(Application.dataPath, "../../docs/model-validation/label-toggle-results.txt"), result);
            Debug.Log("LABEL_TOGGLE_OK: " + result);
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
    }

    static void Hud(Scene scene, ExperimentTapAnimation[] taps)
    {
        var manager = Components<ReferenceImageExperiments>(scene).Single();
        Call(manager, "Start");
        Call(manager, "Start");
        var hud = Components<ExperimentLabelButton>(scene).Single();
        if (!Get<UnityEngine.UI.Button>(hud, "button")) Call(hud, "Awake");
        var button = Get<UnityEngine.UI.Button>(hud, "button");
        Check(Get<List<ExperimentTapAnimation>>(hud, "models").Count == taps.Length, "Label button did not discover all models");
        Check(Components<Canvas>(scene).Length == 1 && Components<EventSystem>(scene).Length == 1, "Duplicate Canvas or EventSystem");
        Check(Components<UnityEngine.UI.GraphicRaycaster>(scene).Length == 1 && !Get<TMPro.TextMeshProUGUI>(hud, "caption").raycastTarget, "Label button raycast setup is incorrect");
        var module = Components<EventSystem>(scene)[0].GetComponent<UnityEngine.InputSystem.UI.InputSystemUIInputModule>();
        Check(module, "Label button has no input module");
        bool enableModule = !module.point || module.point.action == null || !module.point.action.enabled;
        if (enableModule) Call(module, "OnEnable");
        try { Check(module.actionsAsset && module.point && module.leftClick && module.point.action.enabled && module.leftClick.action.enabled, "UI pointer/click actions are not assigned and enabled"); }
        finally { if (enableModule) Call(module, "OnDisable"); }
        Call(hud, "RefreshState");
        Check(!button.interactable, "Label button remained enabled without a tracked model");
        var selected = taps[0];
        Call(selected, "SetRevealTracking", true);
        Call(selected, "AdvanceReveal", 1.1f);
        Call(hud, "RefreshState");
        Check(button.interactable && Get<ExperimentTapAnimation>(hud, "activeModel") == selected, "Label button selected the wrong model");
        button.onClick.Invoke();
        Check(selected.LabelsVisible && taps.Skip(1).All(t => !t.LabelsVisible), "Label button did not toggle only the tracked model");
        Check(!selected.IsPlaying, "Label button started the procedure");
        button.onClick.Invoke();
        Check(!selected.LabelsVisible, "Second button press did not hide labels");
        Call(selected, "SetRevealTracking", false);
        Call(hud, "RefreshState");
        Check(!button.interactable, "Tracking loss did not disable the Label button");
        var safe = Get<RectTransform>(hud, "safeAreaRoot");
        Call(hud, "ApplySafeArea");
        Check(safe.offsetMin == Vector2.zero && safe.offsetMax == Vector2.zero, "Safe-area offsets are incorrect");
        if (Screen.safeArea.width > 0 && Screen.safeArea.height > 0)
            Check(safe.anchorMax.x > safe.anchorMin.x && safe.anchorMax.y > safe.anchorMin.y, "Safe area has no usable size");
    }

    static void Hidden(ExperimentTapAnimation tap)
    {
        Check(!tap.LabelsVisible, "Callouts still marked visible");
        for (int i = 0; i < tap.labelledParts.Length; i++)
        {
            var label = tap.labels[i + 2];
            var line = tap.leaderLines[i];
            var origin = tap.labelledParts[i].position;
            Check(!label.gameObject.activeSelf && label.alpha < .01f && !line.gameObject.activeSelf, "Hidden callout or line is still visible");
            Check(Vector3.Distance(label.transform.position, origin) < .00001f && Vector3.Distance(line.GetPosition(0), origin) < .00001f && Vector3.Distance(line.GetPosition(1), origin) < .00001f, "Retracted callout or line is outside the model");
        }
    }

    static void Homes(ExperimentTapAnimation tap, Vector3[] homes)
    {
        for (int i = 0; i < homes.Length; i++)
            Check(Vector3.Distance(tap.labels[i + 2].transform.localPosition, homes[i]) < .001f, "Shown callout left its authored location");
    }

    static void Tick(ExperimentTapAnimation tap, Camera camera, float delta)
    {
        Call(tap, "AdvanceLabels", delta);
        tap.UpdateLabels(camera);
    }

    static float LineLength(ExperimentTapAnimation tap) => tap.leaderLines.Sum(l => Vector3.Distance(l.GetPosition(0), l.GetPosition(1)));
    static T[] Components<T>(Scene scene) where T : Component => scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<T>(true)).ToArray();
    static T Get<T>(object subject, string field) => (T)subject.GetType().GetField(field, Private).GetValue(subject);
    static void Call(object subject, string method, params object[] args) => subject.GetType().GetMethod(method, Private).Invoke(subject, args);
    static void Check(bool condition, string message) { if (!condition) throw new Exception(message); }
}
