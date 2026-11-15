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

    [MenuItem("PhyXara/Rebuild Reference Models 10-13")]
    public static void Rebuild10To13()
    {
        RebuildModels(false);
    }

    [MenuItem("PhyXara/Rebuild Realistic Syringe")]
    public static void RebuildSyringe() => RebuildModels(true);

    public static void RebuildBookAnimations() => RebuildModels(false, true);

    [MenuItem("PhyXara/Rebuild Pulley Board")]
    public static void RebuildPulleyBoard()
    {
        RebuildModels(false, false, 4);
        ExperimentProcedureSetup.InstallPulleyBoard();
    }

    [MenuItem("PhyXara/Rebuild Calorimeter Water")]
    public static void RebuildCalorimeter()
    {
        RebuildModels(false, false, 12);
        ExperimentProcedureSetup.InstallCalorimeter();
    }

    static void RebuildModels(bool syringeOnly, bool allReferences = false, int onlyReference = 0)
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode ||
            Enumerable.Range(0, UnityEngine.SceneManagement.SceneManager.sceneCount)
                .Any(i => UnityEngine.SceneManagement.SceneManager.GetSceneAt(i).isDirty))
            throw new InvalidOperationException("Save open scenes and exit Play Mode before rebuilding.");
        var originalPath = EditorSceneManager.GetActiveScene().path;
        var shader = Shader.Find("Universal Render Pipeline/Unlit");
        var font = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>("Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset");
        if (!shader || !font) throw new InvalidOperationException("Missing model shader or font.");
        var palette = new Dictionary<Color32, Material>();
        const string backup = "Library/ReferenceModelBackups";
        Directory.CreateDirectory(backup);
        foreach (var path in new[] { ScenePath, MobileARSetup.ScenePath })
        {
            Backup(path);
            var scene = EditorSceneManager.OpenScene(path);
            var manager = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ReferenceImageExperiments>(true)).Single();
            var data = new SerializedObject(manager);
            var entries = data.FindProperty("experiments");
            int rebuilt = 0;
            for (int i = 0; i < entries.arraySize; i++)
            {
                var entry = entries.GetArrayElementAtIndex(i);
                int number = entry.FindPropertyRelative("Number").intValue;
                if (onlyReference != 0 ? number != onlyReference : number < (allReferences ? 4 : 10) || number > 13 || (syringeOnly && number != 11)) continue;
                var old = (Animation)entry.FindPropertyRelative("Model").objectReferenceValue;
                if (!old) throw new InvalidOperationException("Missing old model " + number);
                var target = old.transform.parent;
                bool active = old.gameObject.activeSelf;
                var model = new GameObject(old.name);
                model.transform.SetParent(target, false);
                model.transform.localPosition = old.transform.localPosition;
                model.transform.localRotation = old.transform.localRotation;
                model.transform.localScale = old.transform.localScale;
                var pose = new ReferenceExperimentModel(model.transform, ColorMaterial).Build(number);
                foreach (var filter in model.GetComponentsInChildren<MeshFilter>())
                {
                    var mesh = filter.sharedMesh;
                    if (!mesh || !mesh.name.StartsWith("Syringe ") || AssetDatabase.Contains(mesh)) continue;
                    string meshPath = $"{Folder}/{mesh.name}.asset";
                    var saved = AssetDatabase.LoadAssetAtPath<Mesh>(meshPath);
                    if (saved)
                    {
                        EditorUtility.CopySerialized(mesh, saved);
                        filter.sharedMesh = saved;
                        UnityEngine.Object.DestroyImmediate(mesh);
                    }
                    else AssetDatabase.CreateAsset(mesh, meshPath);
                }
                Validate(model.transform, pose);
                MakeNamesUnique(model.transform);
                AddLabel(model.transform, target.name.Replace(" Image Target", ""), font);
                var clip = BakeClip(model.transform, pose, ReferenceExperimentModel.Duration(number));
                string clipPath = $"{Folder}/Reference {number:00} Loop.anim";
                Backup(clipPath);
                var existing = AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);
                if (!existing) throw new InvalidOperationException("Missing clip " + clipPath);
                clip.name = existing.name;
                EditorUtility.CopySerialized(clip, existing);
                UnityEngine.Object.DestroyImmediate(clip);
                var animation = model.AddComponent<Animation>();
                animation.AddClip(existing, existing.name);
                animation.clip = existing;
                animation.playAutomatically = false;
                animation.cullingType = AnimationCullingType.AlwaysAnimate;
                entry.FindPropertyRelative("Model").objectReferenceValue = animation;
                UnityEngine.Object.DestroyImmediate(old.gameObject);
                model.SetActive(active);
                rebuilt++;
            }
            int expected = onlyReference != 0 || syringeOnly ? 1 : allReferences ? 9 : 4;
            if (rebuilt != expected) throw new InvalidOperationException($"Expected {expected} models in {path}");
            data.ApplyModifiedPropertiesWithoutUndo();
            AssetDatabase.SaveAssets();
            if (!EditorSceneManager.SaveScene(scene)) throw new IOException("Could not save " + path);
        }
        if (onlyReference == 0) RenderPreviews(ColorMaterial, syringeOnly);
        if (!string.IsNullOrEmpty(originalPath)) EditorSceneManager.OpenScene(originalPath);
        Debug.Log("REFERENCE_MODELS_OK: Rebuilt selected models in both scenes and validated animation transforms.");

        void Backup(string path)
        {
            string destination = Path.Combine(backup, Path.GetFileName(path));
            if (!File.Exists(destination)) File.Copy(path, destination);
        }
        Material ColorMaterial(Color32 color)
        {
            if (palette.TryGetValue(color, out var cached)) return cached;
            bool realistic = color.a < 255 || color.Equals(new Color32(244, 246, 242, 255)) || color.Equals(new Color32(33, 35, 39, 255));
            bool water = color.Equals(new Color32(42, 149, 205, 80));
            string name = realistic ? "Syringe " + ColorUtility.ToHtmlStringRGBA(color) : ColorUtility.ToHtmlStringRGB(color);
            var material = AssetDatabase.LoadAssetAtPath<Material>($"{Folder}/{name}.mat");
            if (!material)
            {
                material = new Material(realistic || onlyReference == 4 ? Shader.Find("Universal Render Pipeline/Lit") : shader) { name = name, color = color };
                if (realistic)
                {
                    material.SetFloat("_Smoothness", water ? .25f : color.a < 255 ? .92f : .48f);
                    if (color.a < 255)
                    {
                        material.SetFloat("_Surface", 1);
                        material.SetFloat("_SrcBlend", (float)UnityEngine.Rendering.BlendMode.SrcAlpha);
                        material.SetFloat("_DstBlend", (float)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                        material.SetFloat("_ZWrite", 0);
                        material.SetFloat("_Cull", (float)(water ? UnityEngine.Rendering.CullMode.Back : UnityEngine.Rendering.CullMode.Off));
                        material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                        material.SetOverrideTag("RenderType", "Transparent");
                        material.renderQueue = 3000;
                    }
                }
                AssetDatabase.CreateAsset(material, $"{Folder}/{name}.mat");
            }
            palette.Add(color, material);
            return material;
        }
    }

    static void Validate(Transform model, Action<float> pose)
    {
        for (int frame = 0; frame <= 180; frame++)
        {
            pose(frame / 30f);
            foreach (var part in model.GetComponentsInChildren<Transform>())
            {
                var p = part.localPosition;
                var s = part.localScale;
                if (float.IsNaN(p.sqrMagnitude) || float.IsInfinity(p.sqrMagnitude) ||
                    float.IsNaN(s.sqrMagnitude) || float.IsInfinity(s.sqrMagnitude) ||
                    s.x <= 0 || s.y <= 0 || s.z <= 0)
                    throw new InvalidOperationException("Invalid model transform: " + part.name);
            }
        }
        pose(0);
    }

    static void RenderPreviews(Func<Color32, Material> material, bool syringeOnly)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        string output = Path.GetFullPath("../docs/model-validation");
        Directory.CreateDirectory(output);
        var key = new GameObject("Studio key").AddComponent<Light>();
        key.type = LightType.Directional;
        key.intensity = 1.6f;
        key.transform.rotation = Quaternion.Euler(35, -35, 0);
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(.52f, .55f, .6f);
        var camera = new GameObject("Preview camera").AddComponent<Camera>();
        camera.orthographic = true;
        camera.orthographicSize = 95;
        camera.nearClipPlane = .1f;
        camera.farClipPlane = 1000;
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(.92f, .94f, .96f);
        camera.transform.position = new Vector3(0, 104, -330);
        camera.transform.LookAt(new Vector3(0, 60, 0));
        var target = new RenderTexture(1400, 1100, 24);
        camera.targetTexture = target;
        for (int number = 10; number <= 13; number++)
        {
            if (syringeOnly && number != 11) continue;
            var model = new GameObject("Reference " + number);
            var pose = new ReferenceExperimentModel(model.transform, material).Build(number);
            pose(number == 10 ? 2 : number == 12 ? 4.5f : 1);
            camera.Render();
            var previous = RenderTexture.active;
            RenderTexture.active = target;
            var image = new Texture2D(target.width, target.height, TextureFormat.RGB24, false);
            image.ReadPixels(new Rect(0, 0, target.width, target.height), 0, 0);
            image.Apply();
            File.WriteAllBytes(Path.Combine(output, $"reference-{number}.png"), image.EncodeToPNG());
            RenderTexture.active = previous;
            UnityEngine.Object.DestroyImmediate(image);
            UnityEngine.Object.DestroyImmediate(model);
        }
        camera.targetTexture = null;
        UnityEngine.Object.DestroyImmediate(target);
        UnityEngine.Object.DestroyImmediate(camera.gameObject);
        UnityEngine.Object.DestroyImmediate(key.gameObject);
    }

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
            var duration = ReferenceExperimentModel.Duration(number);
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

    public static AnimationClip BakeClip(Transform root, Action<float> pose, float duration)
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

        var clip = new AnimationClip { legacy = true, frameRate = 30, wrapMode = WrapMode.ClampForever };
        string[] names = { "m_LocalPosition.x", "m_LocalPosition.y", "m_LocalPosition.z",
            "m_LocalRotation.x", "m_LocalRotation.y", "m_LocalRotation.z", "m_LocalRotation.w",
            "m_LocalScale.x", "m_LocalScale.y", "m_LocalScale.z" };
        for (int i = 0; i < parts.Length; i++)
        {
            var path = AnimationUtility.CalculateTransformPath(parts[i], root);
            bool positionMoves = Enumerable.Range(0, 3).Any(Varies);
            bool rotationMoves = Enumerable.Range(3, 4).Any(Varies);
            bool scaleMoves = Enumerable.Range(7, 3).Any(Varies);
            for (int c = 0; c < names.Length; c++)
            {
                // Unity packs vector curves: preserve all axes when any axis changes.
                if (c < 3 ? !positionMoves : c <= 6 ? !rotationMoves : !scaleMoves)
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
