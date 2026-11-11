using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Vuforia;

public static class BakeReferenceExperiments
{
    const string Folder = "Assets/Experiments/Models";
    const string ScenePath = "Assets/Scenes/SampleScene.unity";

    public static string Run()
    {
        var scene = EditorSceneManager.GetActiveScene();
        if (EditorApplication.isPlayingOrWillChangePlaymode || scene.path != ScenePath || scene.isDirty)
            throw new InvalidOperationException("Open the saved SampleScene in Edit Mode before baking.");
        if (AssetDatabase.IsValidFolder(Folder))
            throw new InvalidOperationException("The model asset folder already exists.");

        var manager = UnityEngine.Object.FindFirstObjectByType<ReferenceImageExperiments>();
        var serialized = new SerializedObject(manager);
        var entries = serialized.FindProperty("experiments");
        if (entries.arraySize != 8)
            throw new InvalidOperationException("Expected eight database targets before adding the roller target.");

        AssetDatabase.CreateFolder("Assets/Experiments", "Models");
        var shader = Shader.Find("Universal Render Pipeline/Unlit");
        var font = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(
            "Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset");
        if (!shader || !font)
            throw new InvalidOperationException("The model shader or label font is missing.");
        var palette = new Dictionary<Color32, Material>();

        var source = (ImageTargetBehaviour)entries.GetArrayElementAtIndex(0).FindPropertyRelative("Target").objectReferenceValue;
        var roller = CreateRollerTarget(source);
        entries.InsertArrayElementAtIndex(entries.arraySize);
        var rollerEntry = entries.GetArrayElementAtIndex(entries.arraySize - 1);
        rollerEntry.FindPropertyRelative("Number").intValue = 6;
        rollerEntry.FindPropertyRelative("Target").objectReferenceValue = roller;

        for (int i = 0; i < entries.arraySize; i++)
        {
            var entry = entries.GetArrayElementAtIndex(i);
            int number = entry.FindPropertyRelative("Number").intValue;
            var target = (ImageTargetBehaviour)entry.FindPropertyRelative("Target").objectReferenceValue;
            var title = target.name.Replace(" Image Target", "");
            var model = new GameObject(title + " Model");
            model.transform.SetParent(target.transform, false);
            model.transform.localScale = Vector3.one * .001f;
            var pose = new ReferenceExperimentModel(model.transform, ColorMaterial).Build(number);
            pose(0f);
            MakeNamesUnique(model.transform);
            AddLabel(model.transform, title, font);
            var duration = number == 8 ? 2 * Mathf.PI / 3.8f : number == 12 ? 6f : 4f;
            var clip = BakeClip(model.transform, pose, duration);
            clip.name = title + " Loop";
            AssetDatabase.CreateAsset(clip, $"{Folder}/Reference {number:00} Loop.anim");
            var animation = model.AddComponent<Animation>();
            animation.AddClip(clip, clip.name);
            animation.clip = clip;
            animation.playAutomatically = false;
            animation.cullingType = AnimationCullingType.AlwaysAnimate;
            if (AnimationUtility.GetCurveBindings(clip).Length == 0)
                throw new InvalidOperationException("No animation curves for " + title);
            entry.FindPropertyRelative("Model").objectReferenceValue = animation;
        }

        serialized.ApplyModifiedPropertiesWithoutUndo();
        AssetDatabase.SaveAssets();
        EditorSceneManager.MarkSceneDirty(scene);
        if (!EditorSceneManager.SaveScene(scene))
            throw new IOException("Could not save " + ScenePath);
        Selection.activeGameObject = roller.gameObject;
        SceneView.lastActiveSceneView?.FrameSelected();
        return $"Saved {entries.arraySize} target models, labels, and animation clips.";

        Material ColorMaterial(Color32 color)
        {
            if (palette.TryGetValue(color, out var existing))
                return existing;
            var name = ColorUtility.ToHtmlStringRGB(color);
            var material = new Material(shader) { name = name, color = color };
            AssetDatabase.CreateAsset(material, $"{Folder}/{name}.mat");
            palette.Add(color, material);
            return material;
        }
    }

    static ImageTargetBehaviour CreateRollerTarget(ImageTargetBehaviour source)
    {
        var photo = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Experiments/ReferenceImages/RollerPulleyTarget.jpg");
        if (!photo || !photo.isReadable)
            throw new InvalidOperationException("The roller target image must be readable.");
        var root = new GameObject("Roller and Pulley Image Target");
        root.transform.position = new Vector3(.525f, 0f, .23f);
        var target = root.AddComponent<ImageTargetBehaviour>();
        var data = new SerializedObject(target);
        var type = data.FindProperty("mImageTargetType");
        var instant = Array.FindIndex(type.enumNames, n => n == "USER_DEFINED" || n == "FROM_IMAGE" || n == "INSTANT");
        if (instant < 0)
            throw new InvalidOperationException("Unknown Vuforia image target types: " + string.Join(", ", type.enumNames));
        type.enumValueIndex = instant;
        data.FindProperty("mTrackableName").stringValue = "referencematerial_6";
        data.FindProperty("mRuntimeTexture").objectReferenceValue = photo;
        data.FindProperty("mInitializedInEditor").boolValue = true;
        data.FindProperty("mWidth").floatValue = .18f;
        data.FindProperty("mAspectRatio").floatValue = (float)photo.height / photo.width;
        data.FindProperty("mHeight").floatValue = .18f * photo.height / photo.width;
        data.ApplyModifiedPropertiesWithoutUndo();

        var previewSource = new SerializedObject(source).FindProperty("mPreview").objectReferenceValue as Component;
        if (previewSource)
        {
            var preview = root.GetComponent(previewSource.GetType()) ?? root.AddComponent(previewSource.GetType());
            var previewData = new SerializedObject(preview);
            previewData.FindProperty("mObserverBehaviour").objectReferenceValue = target;
            previewData.FindProperty("mCastedBehaviour").objectReferenceValue = target;
            previewData.FindProperty("mTargetName").stringValue = "referencematerial_6";
            previewData.ApplyModifiedPropertiesWithoutUndo();
            data.Update();
            data.FindProperty("mPreview").objectReferenceValue = preview;
            data.ApplyModifiedPropertiesWithoutUndo();
        }
        return target;
    }

    static void MakeNamesUnique(Transform parent)
    {
        var used = new HashSet<string>();
        foreach (Transform child in parent)
        {
            string name = child.name;
            for (int suffix = 2; !used.Add(child.name); suffix++)
                child.name = name + " " + suffix;
            MakeNamesUnique(child);
        }
    }

    static void AddLabel(Transform model, string title, TMP_FontAsset font)
    {
        float top = model.GetComponentsInChildren<MeshRenderer>().Max(r => r.bounds.max.y);
        float localTop = model.InverseTransformPoint(new Vector3(model.position.x, top, model.position.z)).y;
        var text = new GameObject("Experiment Label").AddComponent<TextMeshPro>();
        text.transform.SetParent(model, false);
        text.transform.localPosition = new Vector3(0, localTop + 14, -12);
        text.rectTransform.sizeDelta = new Vector2(170, 22);
        text.font = font;
        text.fontSharedMaterial = AssetDatabase.LoadAssetAtPath<Material>("Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF - Outline.mat");
        text.fontSize = 70;
        text.alignment = TextAlignmentOptions.Center;
        text.textWrappingMode = TextWrappingModes.NoWrap;
        text.text = title;
        text.ForceMeshUpdate();
    }

    static AnimationClip BakeClip(Transform root, Action<float> pose, float duration)
    {
        var parts = root.GetComponentsInChildren<Transform>();
        var samples = Mathf.CeilToInt(duration * 30);
        var keys = new Keyframe[parts.Length, 10, samples + 1];
        for (int frame = 0; frame <= samples; frame++)
        {
            float time = duration * frame / samples;
            pose(time);
            for (int i = 0; i < parts.Length; i++)
            {
                var p = parts[i].localPosition;
                var r = parts[i].localRotation;
                var s = parts[i].localScale;
                float[] values = { p.x, p.y, p.z, r.x, r.y, r.z, r.w, s.x, s.y, s.z };
                for (int channel = 0; channel < values.Length; channel++)
                    keys[i, channel, frame] = new Keyframe(time, values[channel]);
            }
        }
        pose(0f);

        var clip = new AnimationClip { legacy = true, frameRate = 30, wrapMode = WrapMode.Loop };
        string[] names = { "m_LocalPosition.x", "m_LocalPosition.y", "m_LocalPosition.z",
            "m_LocalRotation.x", "m_LocalRotation.y", "m_LocalRotation.z", "m_LocalRotation.w",
            "m_LocalScale.x", "m_LocalScale.y", "m_LocalScale.z" };
        for (int i = 0; i < parts.Length; i++)
        {
            var path = AnimationUtility.CalculateTransformPath(parts[i], root);
            bool rotationMoves = Enumerable.Range(3, 4).Any(Varies);
            for (int c = 0; c < names.Length; c++)
            {
                if (c >= 3 && c <= 6 ? !rotationMoves : !Varies(c))
                    continue;
                var frames = Enumerable.Range(0, samples + 1).Select(f => keys[i, c, f]).ToArray();
                var curve = new AnimationCurve(frames);
                for (int f = 0; f < curve.length; f++)
                {
                    AnimationUtility.SetKeyLeftTangentMode(curve, f, AnimationUtility.TangentMode.Linear);
                    AnimationUtility.SetKeyRightTangentMode(curve, f, AnimationUtility.TangentMode.Linear);
                }
                clip.SetCurve(path, typeof(Transform), names[c], curve);
            }

            bool Varies(int channel) => Enumerable.Range(1, samples).Any(f =>
                Mathf.Abs(keys[i, channel, f].value - keys[i, channel, 0].value) > .0001f);
        }
        clip.EnsureQuaternionContinuity();
        return clip;
    }
}
