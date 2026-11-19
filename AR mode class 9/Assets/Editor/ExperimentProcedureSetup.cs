using System;
using System.IO;
using System.Linq;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Vuforia;
using PhyXara.Bridge;

public static class ExperimentProcedureSetup
{
    // Reference image numbers differ from the book's experiment numbers.
    public static readonly int[] BookPages = { 1, 7, 9, 11, 14, 15, 17, 25, 27, 29, 31, 32, 34 };
    static readonly string[][] Steps =
    {
        new[] { "Check zero error and least count", "Open jaws and place the cylinder", "Close gently; read main and vernier scales", "Repeat at different positions; calculate area or volume" },
        new[] { "Check zero error and screw pitch", "Place the wire between anvil and spindle", "Turn the thimble gently to contact", "Read both scales; repeat at five positions" },
        new[] { "Set the incline and mark the starting distance", "Release the ball and start timing", "Stop timing when the ball reaches the lower end", "Repeat; compare distance with time squared" },
        new[] { "Set the board vertically; suspend the bob", "Measure the bar's oscillation period", "Release the thread: bob falls and bar pivots", "Measure the fall height; use the period to find g" },
        new[] { "Level the table; connect block, pulley and pan", "Add small weights to the hanging pan", "The block begins sliding as the pan descends", "Record limiting friction; repeat with added load" },
        new[] { "Level the table; weigh roller and pan", "Connect the thread; add small pan weights", "The roller begins rolling as the pan descends", "Record the minimum force for rolling" },
        new[] { "Balance the meter rod on the central fulcrum", "Suspend a known weight on one side", "Add the second weight and adjust its distance", "Compare clockwise and anticlockwise moments" },
        new[] { "Measure the string length and bob radius", "Displace the bob gently through a small angle", "Time ten complete oscillations", "Use T = total time / 10; repeat for other lengths" },
        new[] { "Suspend the spring; note the unloaded pointer", "Add weights and allow the spring to settle", "Read extension at each load; then unload", "Repeat for six readings; plot force against extension" },
        new[] { "Read the weight of the solid in air", "Lower the solid freely into water", "Read its smaller apparent weight", "Find the loss of weight and calculate density" },
        new[] { "Seal the empty syringe and measure mass m1", "Draw water into the syringe to the 5 mL mark", "Seal the nozzle and measure filled mass m2", "Density = (m2 - m1) / 5 mL; note room temperature" },
        new[] { "Heat the solid in the hypsometer", "Measure hot-solid and cold-water temperatures", "Transfer the hot solid quickly into the cup", "Stir; read equilibrium temperature and calculate specific heat" },
        new[] { "Place ice and thermometer in the beaker", "Heat gently; temperature stays at 0 C while melting", "After melting, water warms toward 100 C", "At boiling, steam forms at 100 C; plot temperature against time" }
    };
    static readonly string[][] PartNames =
    {
        new[] { "FixedUpperJaw", "LockScrew", "InchScale", "MmScale", "DepthRod", "FixedLowerJaw" },
        new[] { "Frame", "Anvil", "Sleeve", "Spindle", "Rotor", "ThimbleScale", "Ratchet" },
        new[] { "Iron_Ball", "Ramp", "Measurement_Scale_0-300mm", "Initial_Position_Marker", "End_Stop", "Higher_Support", "Lower_Support" },
        new[] { "Vertical board", "Pulley P1", "Pulley P2", "Thread", "Falling bob", "Bar end B", "Tension thread", "@fallN", "@fallM", "@fallh", "Pulley support" },
        new[] { "Block", "Added mass", "Table cord", "Pulley", "Slotted mass", "Pan", "Block", "Block" },
        new[] { "Roller", "Pulley", "Table cord", "Pan", "Tabletop" },
        new[] { "W1", "W2", "O_Marker", "D1", "D2", "MeterRod", "Wedge" },
        new[] { "Support arm", "Pendulum thread", "Bob", "@mean", "@left", "@right", "@length" },
        new[] { "Spring coil", "Hanging masses", "Ruler", "Pointer", "Clamp", "Stand rod" },
        new[] { "Weight in air", "Weight in air/Suspended mass", "Apparent weight", "Apparent weight/Suspended mass", "Displaced water" },
        new[] { "Syringe nozzle", "Syringe barrel", "Syringe rubber piston", "Plunger rib", "Finger flange", "Thumb pad", "Graduation" },
        new[] { "Thermometer backing", "Hypsometer stopper", "Heated solid", "Vessel base", "Wooden screen", "Thermometer backing 2", "Stirrer", "Lid rear", "Vessel base 3" },
        new[] { "Solid ice", "Melting ice", "Vessel wall 33", "Thermometer backing 5", "Burner flame", "Steam", "Vessel base 3" }
    };
    static readonly string[][] PartLabels =
    {
        new[] { "Internal jaws", "Locking screw", "Imperial scale", "Metric scale", "Depth measuring blade", "External jaws" },
        new[] { "Frame", "Anvil", "Sleeve / main scale", "Spindle", "Thimble", "Circular scale", "Ratchet" },
        new[] { "Iron ball", "Angle iron", "Distance scale", "Release marker", "End stop", "Higher support", "Lower support" },
        new[] { "Vertical board", "P1", "P2", "Thread", "Pendulum bob", "B", "W", "N", "M", "h", "P" },
        new[] { "Block (W)", "50 g weight (w)", "Pull P + p", "Pulley", "Weight (p)", "Pan (P)", "R - normal reaction", "Total load W + w" },
        new[] { "Roller", "Pulley", "String", "Pan", "Horizontal table" },
        new[] { "A - weight W1", "C - weight W2", "O - pivot", "d2 - left arm", "d1 - right arm", "Meter rod", "Fulcrum" },
        new[] { "Rigid support S", "Long thread", "Bob (metal ball)", "A - mean position", "C - extreme position", "B - extreme position", "Length L" },
        new[] { "Spring", "Weights", "Vertical scale", "Pointer", "Clamp", "Stand" },
        new[] { "Weight = 50 N", "Mass = 5 kg", "Apparent weight = 30 N", "Scale reading: 3 kg equivalent", "Displaced water: 2 kg" },
        new[] { "Nozzle", "5 mL barrel", "Rubber piston", "Plunger rod", "Finger flange", "Thumb pad", "Volume scale" },
        new[] { "Thermometer B", "Hypsometer", "Solid", "Boiler", "Wooden screen", "Thermometer A", "Stirrer", "Lid", "Calorimeter" },
        new[] { "Ice", "Melting ice", "Water", "Thermometer", "Heat source", "Steam", "Beaker" }
    };

    [MenuItem("PhyXara/Install Book Procedures and Tap Animations")]
    public static void Install() => Install(0);

    public static void InstallPulleyBoard() => Install(4);

    public static void InstallCalorimeter() => Install(12);

    static void Install(int onlyReference)
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode || Enumerable.Range(0, UnityEngine.SceneManagement.SceneManager.sceneCount)
            .Any(i => UnityEngine.SceneManagement.SceneManager.GetSceneAt(i).isDirty))
            throw new InvalidOperationException("Save scenes and exit Play Mode before installing procedures.");
        string original = EditorSceneManager.GetActiveScene().path;
        const string backup = "Library/BeforeTapProcedures";
        Directory.CreateDirectory(backup);
        foreach (string path in new[] { "Assets/Scenes/SampleScene.unity", MobileARSetup.ScenePath })
        {
            string copy = Path.Combine(backup, Path.GetFileName(path));
            if (!File.Exists(copy)) File.Copy(path, copy);
            var scene = EditorSceneManager.OpenScene(path);
            var targets = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ImageTargetBehaviour>(true))
                .Where(t => !Class10Book.IsTarget(t.TargetName)).ToArray();
            if (targets.Length != 13) throw new InvalidOperationException("Expected 13 Class 9 targets in " + path);
            var manager = scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<ReferenceImageExperiments>(true)).Single();
            var entries = new SerializedObject(manager).FindProperty("experiments");
            var numbers = Enumerable.Range(0, entries.arraySize)
                .Where(i => entries.GetArrayElementAtIndex(i).FindPropertyRelative("Number").intValue <= 13).ToDictionary(
                i => (ImageTargetBehaviour)entries.GetArrayElementAtIndex(i).FindPropertyRelative("Target").objectReferenceValue,
                i => entries.GetArrayElementAtIndex(i).FindPropertyRelative("Number").intValue);
            foreach (var target in targets)
            {
                int number;
                if (!numbers.TryGetValue(target, out number) && !int.TryParse(target.TargetName.Split('_').Last(), out number))
                    throw new InvalidOperationException("Unknown target " + target.TargetName);
                if (number < 1 || number > 13)
                    throw new InvalidOperationException("Unknown target " + target.TargetName);
                if (onlyReference != 0 && number != onlyReference) continue;
                if (number == 12 && target.TargetName != "referencematerial_12")
                {
                    var targetData = new SerializedObject(target);
                    targetData.FindProperty("mTrackableName").stringValue = "referencematerial_12";
                    targetData.FindProperty("mWidth").floatValue = .18f;
                    targetData.FindProperty("mHeight").floatValue = .12736092f;
                    targetData.FindProperty("mAspectRatio").floatValue = .12736092f / .18f;
                    targetData.ApplyModifiedPropertiesWithoutUndo();
                }
                var model = target.transform.Cast<Transform>().Single(t => !t.name.StartsWith("ImageTargetPreview") && t.GetComponentsInChildren<MeshFilter>(true).Length > 0);
                var oldLabels = model.Find("Procedure Labels");
                if (oldLabels) UnityEngine.Object.DestroyImmediate(oldLabels.gameObject);
                var oldTitle = model.Find("Experiment Label");
                if (oldTitle) UnityEngine.Object.DestroyImmediate(oldTitle.gameObject);
                var tap = model.GetComponent<ExperimentTapAnimation>() ?? model.gameObject.AddComponent<ExperimentTapAnimation>();
                tap.referenceNumber = number;
                tap.duration = ReferenceExperimentModel.Duration(number);
                tap.procedureSteps = Steps[number - 1];
                tap.animationPlayer = model.GetComponent<Animation>();
                if (tap.animationPlayer) tap.animationPlayer.playAutomatically = false;
                if (number == 1) tap.driver = model.GetComponent<VernierCaliperController>();
                if (number == 2) tap.driver = model.GetComponent<MicrometerController>() ?? model.gameObject.AddComponent<MicrometerController>();
                if (number == 3)
                {
                    tap.driver = model.GetComponent<InclinedPlaneController>();
                    var duplicate = target.GetComponent<InclinedPlaneController>();
                    if (duplicate) duplicate.enabled = false;
                    var planeData = new SerializedObject(tap.driver);
                    planeData.FindProperty("repeatOnFinish").boolValue = false;
                    planeData.ApplyModifiedPropertiesWithoutUndo();
                }
                if (number == 7) tap.driver = target.GetComponent<MomentsAnimation>();
                if (!tap.animationPlayer && !tap.driver) throw new InvalidOperationException("No animation for " + target.name);
                foreach (var filter in model.GetComponentsInChildren<MeshFilter>(true))
                {
                    if (!filter.sharedMesh || filter.GetComponent<TMP_Text>() || filter.GetComponent<Collider>()) continue;
                    var collider = filter.gameObject.AddComponent<BoxCollider>();
                    collider.center = filter.sharedMesh.bounds.center;
                    collider.size = Vector3.Max(filter.sharedMesh.bounds.size, Vector3.one * .0001f);
                }
                AddLabels(model, target.name.Replace(" Image Target", ""), tap);
                EditorUtility.SetDirty(tap);
            }
            if (!EditorSceneManager.SaveScene(scene)) throw new IOException("Failed to save " + path);
        }
        if (!string.IsNullOrEmpty(original)) EditorSceneManager.OpenScene(original);
        AssetDatabase.SaveAssets();
        Debug.Log("BOOK_PROCEDURES_OK: Installed tap animations, part labels and procedure captions on 26 scene models.");
    }

    static void AddLabels(Transform model, string title, ExperimentTapAnimation tap)
    {
        var bounds = new Bounds();
        bool first = true;
        var filters = model.GetComponentsInChildren<MeshFilter>(true).Where(f => f.sharedMesh && !f.GetComponent<TMP_Text>()).ToArray();
        for (int frame = 0; frame <= (tap.animationPlayer ? 4 : 0); frame++)
        {
            if (tap.animationPlayer) tap.animationPlayer.clip.SampleAnimation(model.gameObject, tap.duration * frame / 4);
            foreach (var filter in filters)
            {
                var b = filter.sharedMesh.bounds;
                for (int corner = 0; corner < 8; corner++)
                {
                    var p = b.center + Vector3.Scale(b.extents, new Vector3((corner & 1) == 0 ? -1 : 1, (corner & 2) == 0 ? -1 : 1, (corner & 4) == 0 ? -1 : 1));
                    p = model.InverseTransformPoint(filter.transform.TransformPoint(p));
                    if (first) { bounds = new Bounds(p, Vector3.zero); first = false; } else bounds.Encapsulate(p);
                }
            }
        }
        if (tap.animationPlayer) tap.animationPlayer.clip.SampleAnimation(model.gameObject, 0);
        float size = Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z);
        float h = size * .045f;
        var group = new GameObject("Procedure Labels").transform;
        group.SetParent(model, false);
        var font = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>("Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset");
        int count = PartNames[tap.referenceNumber - 1].Length;
        var labels = new TextMeshPro[count + 2];
        labels[0] = Label(title, new Vector3(bounds.center.x, bounds.max.y + h * (tap.referenceNumber == 1 ? 6 : tap.referenceNumber == 4 ? 4 : 2), bounds.min.z), size * 1.5f, h * 1.3f);
        labels[1] = Label("Tap the model to start", new Vector3(bounds.center.x, bounds.min.y - h * (tap.referenceNumber == 1 ? 6 : 2.5f), bounds.min.z), size * 1.8f, h);
        tap.procedureLabel = labels[1];
        tap.labelledParts = new Transform[count];
        tap.leaderLines = new LineRenderer[count];
        for (int i = 0; i < count; i++)
        {
            string partName = PartNames[tap.referenceNumber - 1][i];
            var part = model.Find(partName) ?? model.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == partName);
            if (partName.StartsWith("@"))
            {
                part = new GameObject(partName).transform;
                part.SetParent(group, false);
                switch (partName)
                {
                    case "@mean": part.localPosition = new Vector3(2, 30, 0); break;
                    case "@left": part.localPosition = new Vector3(-13, 31.3f, 0); break;
                    case "@right": part.localPosition = new Vector3(17, 31.3f, 0); break;
                    case "@length": part.localPosition = new Vector3(2, 72.5f, 0); break;
                    case "@fallN": part.localPosition = new Vector3(-49, 84, -4); break;
                    case "@fallM": part.localPosition = new Vector3(-49, 23, -4); break;
                    case "@fallh": part.localPosition = new Vector3(-53, 53.5f, -4); break;
                    default: throw new InvalidOperationException("Unknown diagram point " + partName);
                }
            }
            if (!part) throw new InvalidOperationException("Missing labelled part " + partName + " on " + model.name);
            tap.labelledParts[i] = part;
            bool left = i % 2 == 0;
            int rows = (count + 1) / 2;
            float row = (i / 2f - (i % 2) * .5f) / Mathf.Max(1, rows - 1);
            float x = left ? bounds.min.x - size * .30f : bounds.max.x + size * .30f;
            var position = new Vector3(x, Mathf.Lerp(bounds.max.y - h, bounds.min.y + h, row), bounds.min.z - h);
            float width = size * .52f;
            if (tap.referenceNumber == 4)
            {
                Vector2[] positions = { new Vector2(-23, 130), new Vector2(-55, 118), new Vector2(44, 102), new Vector2(5, 115), new Vector2(-32, 73), new Vector2(17, 16), new Vector2(42, 49), new Vector2(-59, 84), new Vector2(-59, 23), new Vector2(-62, 53.5f), new Vector2(16, 102) };
                position = new Vector3(positions[i].x, positions[i].y, -12);
                width = i == 0 || i == 4 ? 48 : 28;
            }
            if (tap.referenceNumber == 1)
            {
                float[] along = { .03f, .30f, .68f, .60f, .98f, .12f };
                bool above = i < 3;
                position = new Vector3(Mathf.Lerp(bounds.min.x, bounds.max.x, along[i]), above ? bounds.max.y + h * 2 : bounds.min.y - h * 2, bounds.min.z - h);
                width = size * .30f;
            }
            labels[i + 2] = Label(PartLabels[tap.referenceNumber - 1][i], position, width, h * .78f);
            var line = new GameObject("Leader " + partName).AddComponent<LineRenderer>();
            line.transform.SetParent(group, false);
            line.useWorldSpace = true;
            line.positionCount = 2;
            line.startWidth = line.endWidth = Mathf.Abs(model.lossyScale.x) * size * .0015f;
            line.sharedMaterial = AssetDatabase.LoadAssetAtPath<Material>("Assets/Experiments/Models/2D3B4D.mat");
            line.SetPosition(0, labels[i + 2].transform.position);
            line.SetPosition(1, part.position);
            tap.leaderLines[i] = line;
        }
        tap.labels = labels;
        tap.UpdateLabels(ExperimentTapAnimation.ActiveCamera());
        TextMeshPro Label(string text, Vector3 position, float width, float height)
        {
            var label = new GameObject(text).AddComponent<TextMeshPro>();
            label.transform.SetParent(group, false);
            label.transform.localPosition = position;
            label.rectTransform.sizeDelta = new Vector2(width, height * 2.5f);
            label.font = font;
            label.fontSize = height * 10;
            label.alignment = TextAlignmentOptions.Center;
            label.textWrappingMode = TextWrappingModes.Normal;
            label.color = new Color32(30, 43, 60, 255);
            if (tap.referenceNumber == 4 && text == "Pendulum bob") label.color = Color.white;
            label.text = text;
            label.ForceMeshUpdate();
            return label;
        }
    }
}
