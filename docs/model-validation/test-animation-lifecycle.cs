using System;
using UnityEngine;
var original = UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene();
if (original.isDirty)
{
    System.IO.Directory.CreateDirectory("Library/BeforeFinalChecks");
    string backup = "Library/BeforeFinalChecks/" + System.IO.Path.GetFileName(original.path);
    if (!System.IO.File.Exists(backup)) System.IO.File.Copy(original.path, backup);
    if (!UnityEditor.SceneManagement.EditorSceneManager.SaveScene(original)) throw new Exception("Could not preserve current edits");
}
var subject = GameObject.CreatePrimitive(PrimitiveType.Cube);
var player = subject.AddComponent<Animation>();
var clip = new AnimationClip { name = "Procedure check", legacy = true, wrapMode = WrapMode.ClampForever };
clip.SetCurve("", typeof(Transform), "localPosition.x", AnimationCurve.Linear(0, 0, 12, .01f));
player.AddClip(clip, clip.name); player.clip = clip; player.playAutomatically = false;
var tap = subject.AddComponent<ExperimentTapAnimation>();
tap.animationPlayer = player; tap.duration = 12;
tap.procedureSteps = new[] { "Prepare", "Move", "Read", "Calculate" };
void Check(bool value, string message) { if (!value) throw new Exception(message); }
try
{
    Check(!tap.IsPlaying, "Model started automatically");
    tap.PlayAnimation(); Check(tap.IsPlaying && tap.Elapsed == 0, "Start failed");
    tap.Advance(6); Check(tap.IsPlaying && tap.Elapsed == 6, "Procedure progress failed");
    tap.Advance(7); Check(!tap.IsPlaying && tap.Elapsed == 12, "Single completion failed");
    tap.PlayAnimation(); Check(tap.IsPlaying && tap.Elapsed == 0, "Replay failed");
    tap.StopAnimation(); Check(!tap.IsPlaying && tap.Elapsed == 0, "Disable reset failed");
    System.IO.File.WriteAllText("../docs/model-validation/animation-lifecycle-results.txt", "PASS: idle until activated, start, progression, single completion, replay, and stop/reset. Live device touch remains untested.");
    return "PASS: idle, start, progress, completion, replay and stop/reset";
}
finally
{
    UnityEngine.Object.DestroyImmediate(subject); UnityEngine.Object.DestroyImmediate(clip);
    UnityEditor.SceneManagement.EditorSceneManager.OpenScene(original.path);
}
