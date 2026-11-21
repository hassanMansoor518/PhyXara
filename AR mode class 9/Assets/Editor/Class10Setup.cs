using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Linq;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;
using Vuforia;

public static class Class10Setup
{
    const string Folder = "Assets/Experiments/Class10";
    const string SourceScene = "Assets/Scenes/SampleScene.unity";
    static readonly Dictionary<Color32, Material> materials = new Dictionary<Color32, Material>();

    [Serializable]
    sealed class BookManifest
    {
        public string book = Class10Book.BookTitle;
        public string sourcePdf = Class10Book.SourcePdfName;
        public string sourceSha256 = Class10Book.SourceSha256;
        public string database = Class10Book.Database;
        public string calibration = "The source XML declares 10/15/18-metre widths. Scene overrides provisionally use 0.10/0.15/0.18 metres for book diagrams. Measure the actual printed target crop before hardware calibration; resized prints and screen images need their own width.";
        public Class10Book.Entry[] experiments = Class10Book.Entries;
    }

    [MenuItem("PhyXara/Build Class 10 Book Experiments")]
    public static void Build()
    {
        RequireSavedScenes();
        var database = XDocument.Load("Assets/StreamingAssets/" + Class10Book.Database);
        var names = database.Descendants("ImageTarget").Select(e => (string)e.Attribute("name")).ToArray();
        if (names.Length != 12 || names.Distinct().Count() != 12 ||
            !names.OrderBy(n => n).SequenceEqual(Class10Book.Entries.Select(e => e.TargetName).OrderBy(n => n)))
            throw new InvalidOperationException("The Class 10 database must match all twelve book targets.");
        Directory.CreateDirectory(Folder);
        Directory.CreateDirectory("Library/BeforeClass10");
        AssetDatabase.Refresh();
        var normalPath = Folder + "/Surface Textures/Cast instrument normal.png";
        if (AssetImporter.GetAtPath(normalPath) is TextureImporter normal && normal.textureType != TextureImporterType.NormalMap)
        {
            normal.textureType = TextureImporterType.NormalMap;
            normal.SaveAndReimport();
        }
        materials.Clear();
        var font = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>("Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset");
        if (!font) throw new InvalidOperationException("The existing label font is missing.");

        var setup = EditorSceneManager.GetSceneManagerSetup();
        try
        {
            foreach (var path in new[] { SourceScene, MobileARSetup.ScenePath })
            {
                string backup = "Library/BeforeClass10/" + Path.GetFileName(path);
                if (!File.Exists(backup)) File.Copy(path, backup);
                var scene = EditorSceneManager.OpenScene(path);
                var targets = Components<ImageTargetBehaviour>(scene);
                if (targets.Count(t => !Class10Book.IsTarget(t.TargetName)) != 13)
                    throw new InvalidOperationException("Preserve all thirteen Class 9 targets before adding Class 10.");
                var manager = Components<ReferenceImageExperiments>(scene).Single();
                var data = new SerializedObject(manager);
                var entries = data.FindProperty("experiments");
                var existingEntries = new Dictionary<int, int>();
                for (int i = 0; i < entries.arraySize; i++)
                {
                    var entry = entries.GetArrayElementAtIndex(i);
                    int number = entry.FindPropertyRelative("Number").intValue;
                    if (number >= 101 && number <= 112) existingEntries.Add(number, i);
                }
                var group = scene.GetRootGameObjects().SingleOrDefault(g => g.name == "Class 10 Book") ?? new GameObject("Class 10 Book");
                foreach (var book in Class10Book.Entries)
                {
                    var target = targets.SingleOrDefault(t => t.TargetName == book.TargetName);
                    if (!target)
                    {
                        var targetObject = new GameObject("Class 10 - " + book.Title + " Image Target");
                        targetObject.transform.SetParent(group.transform, false);
                        targetObject.transform.localPosition = new Vector3((book.Number - 1) % 4 * .30f, 0, 1 + (book.Number - 1) / 4 * .30f);
                        target = targetObject.AddComponent<ImageTargetBehaviour>();
                    }
                    // Mobile targets start inactive, but the mesh and animation bakers need active children.
                    target.gameObject.SetActive(true);
                    int number = 100 + book.Number;
                    if (!existingEntries.TryGetValue(number, out int index))
                    {
                        index = entries.arraySize;
                        entries.arraySize++;
                    }
                    var entry = entries.GetArrayElementAtIndex(index);
                    var previous = existingEntries.ContainsKey(number) ? entry.FindPropertyRelative("Model").objectReferenceValue as Animation : null;
                    if (previous && previous.GetComponentInParent<ImageTargetBehaviour>(true) != target)
                        throw new InvalidOperationException("The existing model belongs to another target: " + book.Title);
                    var targetData = new SerializedObject(target);
                    var image = database.Descendants("ImageTarget").Single(e => (string)e.Attribute("name") == book.TargetName);
                    var size = ((string)image.Attribute("size")).Split(' ').Select(v => float.Parse(v, System.Globalization.CultureInfo.InvariantCulture)).ToArray();
                    targetData.FindProperty("mTrackableName").stringValue = book.TargetName;
                    targetData.FindProperty("mDataSetPath").stringValue = Class10Book.Database;
                    targetData.FindProperty("mInitializedInEditor").boolValue = true;
                    targetData.FindProperty("mImageTargetType").enumValueIndex = 0;
                    targetData.FindProperty("mWidth").floatValue = book.WidthMeters;
                    targetData.FindProperty("mHeight").floatValue = book.WidthMeters * size[1] / size[0];
                    targetData.FindProperty("mAspectRatio").floatValue = size[1] / size[0];
                    targetData.ApplyModifiedPropertiesWithoutUndo();

                    var model = new GameObject(book.Title);
                    model.transform.SetParent(target.transform, false);
                    model.transform.localScale = Vector3.one * .001f;
                    var apparatus = new Class10ExperimentModel(model.transform, MaterialFor);
                    var pose = apparatus.Build(book.Number);
                    pose(0);
                    MakeNamesUnique(model.transform);
                    SaveMeshes(model.transform, book.Number);
                    var clip = BakeReferenceExperiments.BakeClip(model.transform, pose, 12);
                    clip.name = "Class 10 " + book.Number.ToString("00") + " Procedure";
                    string clipPath = Folder + "/" + clip.name + ".anim";
                    var saved = AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);
                    if (saved)
                    {
                        EditorUtility.CopySerialized(clip, saved);
                        UnityEngine.Object.DestroyImmediate(clip);
                    }
                    else { saved = clip; AssetDatabase.CreateAsset(saved, clipPath); }
                    var player = model.AddComponent<Animation>();
                    player.AddClip(saved, saved.name);
                    player.clip = saved;
                    player.playAutomatically = false;
                    player.cullingType = AnimationCullingType.AlwaysAnimate;
                    var tap = model.AddComponent<ExperimentTapAnimation>();
                    tap.referenceNumber = number;
                    tap.animationPlayer = player;
                    tap.duration = 12;
                    tap.procedureSteps = book.Steps;
                    var bounds = ModelBounds(model.transform, saved);
                    // shortcut: one box hit area per apparatus; use part colliders when direct manipulation is added.
                    var hitArea = model.AddComponent<BoxCollider>();
                    hitArea.center = bounds.center;
                    hitArea.size = Vector3.Max(bounds.size, Vector3.one);
                    AddLabels(model.transform, book.Title, tap, apparatus, bounds, font);
                    model.SetActive(path == SourceScene);
                    entry.FindPropertyRelative("Number").intValue = number;
                    entry.FindPropertyRelative("Target").objectReferenceValue = target;
                    entry.FindPropertyRelative("Model").objectReferenceValue = player;
                    if (previous) UnityEngine.Object.DestroyImmediate(previous.gameObject);
                }
                data.ApplyModifiedPropertiesWithoutUndo();
                if (Components<ImageTargetBehaviour>(scene).Length != 25)
                    throw new InvalidOperationException("Expected thirteen Class 9 plus twelve Class 10 targets.");
                if (path == MobileARSetup.ScenePath)
                {
                    var sessionData = new SerializedObject(Components<PhyXara.Bridge.VuforiaMobileSession>(scene).Single());
                    var trackedTargets = sessionData.FindProperty("targets");
                    var allTargets = Components<ImageTargetBehaviour>(scene);
                    trackedTargets.arraySize = allTargets.Length;
                    for (int i = 0; i < allTargets.Length; i++)
                        trackedTargets.GetArrayElementAtIndex(i).objectReferenceValue = allTargets[i];
                    sessionData.ApplyModifiedPropertiesWithoutUndo();
                    foreach (var target in allTargets) target.gameObject.SetActive(false);
                }
                AssetDatabase.SaveAssets();
                if (!EditorSceneManager.SaveScene(scene)) throw new IOException("Could not save " + path);
            }
            File.WriteAllText(Folder + "/Class10Book.json", JsonUtility.ToJson(new BookManifest(), true));
            AssetDatabase.Refresh();
        }
        finally { if (setup.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(setup); }
        Debug.Log("CLASS10_BUILD_OK: twelve book experiments added alongside all thirteen Class 9 experiments in both scenes.");
    }

    static Material MaterialFor(Color32 color)
    {
        if (materials.TryGetValue(color, out var cached)) return cached;
        string path = Folder + "/" + ColorUtility.ToHtmlStringRGBA(color) + ".mat";
        var material = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (!material)
        {
            material = new Material(Shader.Find("Universal Render Pipeline/Lit")) { color = color };
            if (color.a < 255)
            {
                material.SetFloat("_Surface", 1);
                material.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
                material.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
                material.SetFloat("_ZWrite", 0);
                material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                material.SetOverrideTag("RenderType", "Transparent");
                material.renderQueue = (int)RenderQueue.Transparent;
            }
            AssetDatabase.CreateAsset(material, path);
        }
        bool metal = color.Equals(Class10ExperimentModel.Steel) || color.Equals(Class10ExperimentModel.Brass);
        bool wood = color.Equals(Class10ExperimentModel.Wood);
        bool cast = color.Equals(Class10ExperimentModel.Dark) || color.Equals(Class10ExperimentModel.Enamel);
        bool paper = color.Equals(Class10ExperimentModel.White);
        material.SetFloat("_Metallic", metal ? .62f : 0);
        material.SetFloat("_Smoothness", color.a < 255 ? .82f : metal ? .61f : wood || paper ? .24f : .38f);
        if (wood)
        {
            material.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Experiments/Models/WoodGrain.png"));
            material.color = Color.white;
        }
        else if (metal || cast || paper)
        {
            string finish = metal ? "Brushed alloy" : cast ? "Cast instrument finish" : "Paper fibre";
            material.SetTexture("_BaseMap", SurfaceMap(finish));
        }
        if (cast)
        {
            material.SetTexture("_BumpMap", SurfaceMap("Cast instrument normal"));
            material.SetFloat("_BumpScale", .35f);
            material.EnableKeyword("_NORMALMAP");
        }
        EditorUtility.SetDirty(material);
        materials.Add(color, material);
        return material;
    }

    static Texture2D SurfaceMap(string finish)
    {
        var texture = AssetDatabase.LoadAssetAtPath<Texture2D>($"{Folder}/Surface Textures/{finish}.png");
        if (!texture) throw new InvalidOperationException("Missing Class 10 surface texture: " + finish);
        return texture;
    }

    static void SaveMeshes(Transform model, int number)
    {
        int index = 0;
        foreach (var filter in model.GetComponentsInChildren<MeshFilter>())
        {
            if (filter.GetComponent<TMP_Text>()) continue;
            var mesh = filter.sharedMesh;
            if (!mesh || !string.IsNullOrEmpty(AssetDatabase.GetAssetPath(mesh))) continue;
            string path = Folder + "/Class 10 " + number.ToString("00") + " Mesh " + index++ + ".asset";
            var saved = AssetDatabase.LoadAssetAtPath<Mesh>(path);
            if (saved)
            {
                EditorUtility.CopySerialized(mesh, saved);
                filter.sharedMesh = saved;
                UnityEngine.Object.DestroyImmediate(mesh);
            }
            else AssetDatabase.CreateAsset(mesh, path);
        }
    }

    static Bounds ModelBounds(Transform model, AnimationClip clip)
    {
        var filters = model.GetComponentsInChildren<MeshFilter>();
        var bounds = new Bounds();
        bool first = true;
        foreach (float time in new[] { 0f, 3f, 6f, 9f, 12f })
        {
            clip.SampleAnimation(model.gameObject, time);
            foreach (var filter in filters)
            {
                var meshBounds = filter.sharedMesh.bounds;
                for (int corner = 0; corner < 8; corner++)
                {
                    var point = meshBounds.center + Vector3.Scale(meshBounds.extents,
                        new Vector3((corner & 1) == 0 ? -1 : 1, (corner & 2) == 0 ? -1 : 1, (corner & 4) == 0 ? -1 : 1));
                    point = model.InverseTransformPoint(filter.transform.TransformPoint(point));
                    if (first) { bounds = new Bounds(point, Vector3.zero); first = false; }
                    else bounds.Encapsulate(point);
                }
            }
        }
        clip.SampleAnimation(model.gameObject, 0);
        return bounds;
    }

    static void AddLabels(Transform model, string title, ExperimentTapAnimation tap,
        Class10ExperimentModel apparatus, Bounds bounds, TMP_FontAsset font)
    {
        if (apparatus.LabelledParts.Count < 5 || apparatus.LabelledParts.Count != apparatus.PartLabels.Count)
            throw new InvalidOperationException("Each Class 10 apparatus needs at least five labelled parts.");
        float size = Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z);
        float height = size * .045f;
        var group = new GameObject("Procedure Labels").transform;
        group.SetParent(model, false);
        tap.labelledParts = apparatus.LabelledParts.ToArray();
        tap.leaderLines = new LineRenderer[tap.labelledParts.Length];
        tap.labels = new TextMeshPro[tap.labelledParts.Length + 2];
        tap.labels[0] = Label("Class 10 - " + title, new Vector3(bounds.center.x, bounds.max.y + height * 2, bounds.min.z), size * 1.7f, height * 1.25f);
        tap.labels[1] = Label("Tap the model to start", new Vector3(bounds.center.x, bounds.min.y - height * 2.5f, bounds.min.z), size * 1.9f, height);
        tap.procedureLabel = tap.labels[1];
        for (int i = 0; i < tap.labelledParts.Length; i++)
        {
            int rows = (tap.labelledParts.Length + 1) / 2;
            float row = (i / 2) / (float)Mathf.Max(1, rows - 1);
            var position = new Vector3(i % 2 == 0 ? bounds.min.x - size * .30f : bounds.max.x + size * .30f,
                Mathf.Lerp(bounds.max.y - height, bounds.min.y + height, row), bounds.min.z - height);
            var label = Label(apparatus.PartLabels[i], position, size * .52f, height * .78f);
            tap.labels[i + 2] = label;
            var line = new GameObject("Leader " + apparatus.PartLabels[i]).AddComponent<LineRenderer>();
            line.transform.SetParent(group, false);
            line.useWorldSpace = true;
            line.positionCount = 2;
            line.startWidth = line.endWidth = .001f * size * .0015f;
            line.sharedMaterial = MaterialFor(new Color32(36, 49, 66, 255));
            line.SetPosition(0, label.transform.position);
            line.SetPosition(1, tap.labelledParts[i].position);
            label.gameObject.SetActive(false);
            line.gameObject.SetActive(false);
            tap.leaderLines[i] = line;
        }
        tap.UpdateLabels(ExperimentTapAnimation.ActiveCamera());

        TextMeshPro Label(string text, Vector3 position, float width, float textHeight)
        {
            var label = new GameObject(text).AddComponent<TextMeshPro>();
            label.transform.SetParent(group, false);
            label.transform.localPosition = position;
            label.rectTransform.sizeDelta = new Vector2(width, textHeight * 2.5f);
            label.font = font;
            label.fontSize = textHeight * 10;
            label.alignment = TextAlignmentOptions.Center;
            label.textWrappingMode = TextWrappingModes.Normal;
            label.color = new Color32(30, 43, 60, 255);
            label.text = text;
            label.ForceMeshUpdate();
            return label;
        }
    }

    static void MakeNamesUnique(Transform parent)
    {
        var names = new HashSet<string>();
        foreach (Transform child in parent)
        {
            string original = child.name;
            for (int suffix = 2; !names.Add(child.name); suffix++) child.name = original + " " + suffix;
            MakeNamesUnique(child);
        }
    }

    static T[] Components<T>(Scene scene) where T : Component =>
        scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<T>(true)).ToArray();

    static void RequireSavedScenes()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode || Enumerable.Range(0, SceneManager.sceneCount).Any(i => SceneManager.GetSceneAt(i).isDirty))
            throw new InvalidOperationException("Save scenes and exit Play Mode before building Class 10 experiments.");
    }
}
