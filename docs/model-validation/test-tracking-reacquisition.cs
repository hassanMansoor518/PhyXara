using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using PhyXara.Bridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

// Copy into Assets/Editor, then run -executeMethod TrackingReacquisitionValidation.Run.
// Edit Mode dispatches real SDK status events; native camera recognition is not exercised.
public static class TrackingReacquisitionValidation
{
    const BindingFlags Private = BindingFlags.Instance | BindingFlags.NonPublic;

    public static void Run()
    {
        var setup = EditorSceneManager.GetSceneManagerSetup();
        int frameRate = Application.targetFrameRate, checkedModels = 0;
        Check(Enumerable.Range(0, SceneManager.sceneCount).All(i => !SceneManager.GetSceneAt(i).isDirty), "Save scenes before validating");
        try
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            foreach (string path in new[] { "Assets/Scenes/SampleScene.unity", "Assets/Scenes/PhyXaraMobile.unity" })
            {
                var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
                SceneManager.SetActiveScene(scene);
                ReferenceImageExperiments manager = null;
                try
                {
                    foreach (var engine in Components<VuforiaBehaviour>(scene)) engine.enabled = false;
                    manager = Components<ReferenceImageExperiments>(scene).Single();
                    var data = new SerializedObject(manager).FindProperty("experiments");
                    var managed = new HashSet<Animation>();
                    for (int i = 0; i < data.arraySize; i++)
                        managed.Add((Animation)data.GetArrayElementAtIndex(i).FindPropertyRelative("Model").objectReferenceValue);
                    Call(manager, "OnEnable");
                    var camera = new GameObject("Reacquisition validation camera").AddComponent<Camera>();
                    var taps = Components<ExperimentTapAnimation>(scene);
                    Check(taps.Length == 25, "Expected all 25 experiment models in " + path);
                    foreach (var tap in taps)
                    {
                        var target = tap.GetComponentInParent<ImageTargetBehaviour>(true);
                        Check(target, "Missing image target on " + tap.name);
                        target.gameObject.SetActive(true);
                        tap.gameObject.SetActive(true);
                        if (tap.driver is InclinedPlaneController || tap.driver is MomentsAnimation) Call(tap.driver, "Awake");
                        Call(tap, "Awake");
                        Call(tap, "OnEnable");
                        bool managerTogglesModel = tap.animationPlayer && managed.Contains(tap.animationPlayer);
                        var reveal = tap.transform.parent;
                        try
                        {
                            Lost(target, tap, managerTogglesModel);
                            for (int cycle = 0; cycle < 8; cycle++)
                            {
                                Found(target, tap, managerTogglesModel);
                                Check(tap.gameObject.activeSelf, "Tracking did not activate " + tap.name);
                                Call(tap, "AdvanceReveal", .15f);
                                if (cycle == 7) break;
                                var scale = reveal.localScale;
                                var position = reveal.localPosition;
                                Lost(target, tap, managerTogglesModel);
                                Check(reveal.localScale == scale && reveal.localPosition == position, "Brief loss flattened the model");
                                Call(tap, "AdvanceReveal", 10f);
                                Check(reveal.localScale == scale && reveal.localPosition == position, "Untracked reveal kept advancing");
                                float lostAt = Time.unscaledTime - .1f;
                                Set(tap, "trackingLostAt", lostAt);
                                Lost(target, tap, managerTogglesModel);
                                Check(Get<float>(tap, "trackingLostAt") == lostAt, "Repeated loss extended the grace clock");
                            }
                            Check(reveal.localScale == Vector3.one && Mathf.Abs(Get<float>(tap, "revealElapsed") - 1.1f) < .00001f, "Repeated brief tracking never completed the reveal");
                            Check(Mathf.Abs(Vector3.Dot(reveal.position - target.transform.position, target.transform.up) - .008f) < .00001f, "Completed reveal lost its hover height");
                            var completedPosition = reveal.localPosition;
                            Status(target, Vuforia.Status.TRACKED);
                            Call(tap, "AdvanceReveal", -10f);
                            Check(reveal.localScale == Vector3.one && reveal.localPosition == completedPosition, "Duplicate found or negative delta reset the reveal");

                            tap.SetLabelsVisible(true);
                            Call(tap, "AdvanceLabels", .25f);
                            tap.UpdateLabels(camera);
                            Check(tap.LabelsVisible, "Completed model could not show labels");
                            Lost(target, tap, managerTogglesModel);
                            Check(!tap.LabelsVisible && !tap.CanToggleLabels && tap.labels.Skip(2).All(l => !l.gameObject.activeSelf), "Tracking loss left callouts available");
                            float longLoss = Time.unscaledTime - .5f;
                            Set(tap, "trackingLostAt", longLoss);
                            Lost(target, tap, managerTogglesModel);
                            Check(Get<float>(tap, "trackingLostAt") == longLoss, "Repeated long loss restarted the grace clock");
                            Found(target, tap, managerTogglesModel);
                            Check(Get<float>(tap, "revealElapsed") == 0 && Mathf.Abs(reveal.localScale.y - .001f) < .00001f && reveal.localPosition == Vector3.zero, "Long loss did not start a fresh reveal");
                            Call(tap, "AdvanceReveal", 10f);
                            Check(reveal.localScale == Vector3.one && tap.CanToggleLabels && !tap.LabelsVisible, "Long-frame completion or label reset failed");
                            Check(!tap.IsPlaying, "Reacquisition auto-played the procedure");
                            checkedModels++;
                        }
                        finally { Call(tap, "OnDisable"); }
                    }
                }
                finally
                {
                    if (manager) Call(manager, "OnDisable");
                    EditorSceneManager.CloseScene(scene, true);
                }
            }
            Check(checkedModels == 50, "Expected 50 model instances across both scenes");
            string result = "PASS: 50 models; SDK status-event dispatch and manager activation, accumulated reveal across brief losses, frozen untracked pose, duplicate-loss grace clock, fresh reveal after long loss, label reset and no procedure autoplay. Edit Mode lifecycle callbacks were invoked explicitly; webcam/native recognition and real Play Mode timing remain untested.";
            File.WriteAllText(Path.Combine(Application.dataPath, "../../docs/model-validation/tracking-reacquisition-results.txt"), result);
            Debug.Log("TRACKING_REACQUISITION_OK: " + result);
        }
        finally
        {
            Application.targetFrameRate = frameRate;
            if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup);
        }
    }

    static void Found(ImageTargetBehaviour target, ExperimentTapAnimation tap, bool managed)
    {
        Status(target, Vuforia.Status.TRACKED);
        if (managed) Call(tap, "OnEnable");
    }

    static void Lost(ImageTargetBehaviour target, ExperimentTapAnimation tap, bool managed)
    {
        Status(target, Vuforia.Status.NO_POSE);
        if (managed) Call(tap, "OnDisable");
    }

    static void Status(ImageTargetBehaviour target, Vuforia.Status status) =>
        typeof(ObserverBehaviour).GetMethod("SetTargetStatus", Private).Invoke(target,
            new object[] { new TargetStatus(status, status == Vuforia.Status.TRACKED ? StatusInfo.NORMAL : StatusInfo.NOT_OBSERVED) });

    static T[] Components<T>(Scene scene) where T : Component => scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<T>(true)).ToArray();
    static T Get<T>(object subject, string field) => (T)subject.GetType().GetField(field, Private).GetValue(subject);
    static void Set(object subject, string field, object value) => subject.GetType().GetField(field, Private).SetValue(subject, value);
    static void Call(object subject, string method, params object[] args) => subject.GetType().GetMethod(method, Private).Invoke(subject, args);
    static void Check(bool condition, string message) { if (!condition) throw new Exception(message); }
}
