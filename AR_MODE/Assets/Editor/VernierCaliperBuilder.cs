using System.Collections.Generic;
using System.IO;
using PhyXara.Bridge;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

/// <summary>
/// Builds the vernier caliper prefab procedurally (no external model needed) and registers it as
/// "exp_vernier_caliper". Units are metres, X runs along the beam, the front (scales) faces -Z.
/// Menu: PhyXara > Build Vernier Caliper. Safe to re-run: the prefab and materials are rebuilt.
/// Batch: Unity -batchmode -quit -projectPath AR_MODE -executeMethod VernierCaliperBuilder.BuildAndPreview
/// </summary>
public static class VernierCaliperBuilder
{
    const string Dir = "Assets/Model/Vernier";
    const string PrefabPath = Dir + "/VernierCaliper.prefab";
    const string RegistryPath = "Assets/Experiments/ExperimentRegistry.asset";
    public const string ExperimentId = "exp_vernier_caliper";

    // beam
    const float BeamLength = 0.200f, BeamHeight = 0.026f, BeamHalfDepth = 0.002f;
    const float JawLowerLength = 0.050f, JawUpperLength = 0.026f;
    const float ScaleZ = -0.00203f;          // just in front of the beam face
    const float VernierZ = -0.00358f;        // just in front of the slider plate

    static Material steel, plate, ink, dark;

    [MenuItem("PhyXara/Build Vernier Caliper")]
    public static void Build()
    {
        Directory.CreateDirectory(Dir);
        MakeMaterials();

        var root = new GameObject("VernierCaliper");
        // pivot at the middle of the beam so rotating in preview looks natural
        var body = new GameObject("Body");
        body.transform.SetParent(root.transform, false);
        body.transform.localPosition = new Vector3(-0.100f, -0.0f, 0f);

        BuildFixedPart(body.transform);
        BuildSlider(body.transform);
        BuildWorkpiece(body.transform);

        root.AddComponent<VernierCaliperController>();
        root.AddComponent<VernierSliderDrag>();

        var prefab = PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
        Object.DestroyImmediate(root);
        Register(prefab);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[VernierCaliperBuilder] built " + PrefabPath + " and registered " + ExperimentId);
    }

    // ------------------------------------------------------------------ parts

    static void BuildFixedPart(Transform parent)
    {
        var fixedPart = new GameObject("Fixed").transform;
        fixedPart.SetParent(parent, false);

        Box("Beam", fixedPart, new Vector3(BeamLength * 0.5f, BeamHeight * 0.5f, 0f), new Vector3(BeamLength, BeamHeight, BeamHalfDepth * 2f), steel);
        Box("FixedLowerJaw", fixedPart, new Vector3(-0.004f, (BeamHeight - JawLowerLength) * 0.5f, 0f), new Vector3(0.008f, BeamHeight + JawLowerLength, 0.0075f), steel);
        Box("FixedUpperJaw", fixedPart, new Vector3(-0.003f, BeamHeight + JawUpperLength * 0.5f, 0f), new Vector3(0.006f, JawUpperLength, 0.0075f), steel);
        Box("EndStop", fixedPart, new Vector3(BeamLength + 0.0015f, BeamHeight * 0.5f, 0f), new Vector3(0.003f, BeamHeight, BeamHalfDepth * 2f + 0.0006f), dark);

        // main scale: mm along the bottom edge (ticks point up), inches along the top edge (ticks point down)
        var mm = new List<Tick>();
        for (var j = 0; j <= 150; j++)
        {
            var len = j % 10 == 0 ? 0.0050f : j % 5 == 0 ? 0.0038f : 0.0026f;
            mm.Add(new Tick(j * 0.001f, 0f, len));
        }
        TickObject("MmScale", fixedPart, mm, ScaleZ, Dir + "/MmScale.mesh.asset");
        for (var j = 0; j <= 150; j += 10)
            Label(fixedPart, j.ToString(), new Vector3(j * 0.001f, 0.0054f, ScaleZ - 0.0001f), 0.0024f, TextAnchor.LowerCenter);
        Label(fixedPart, "mm", new Vector3(0.1685f, 0.0054f, ScaleZ - 0.0001f), 0.0024f, TextAnchor.LowerLeft);

        var inch = new List<Tick>();
        const float sixteenth = 0.0254f / 16f;
        for (var k = 0; k <= 96; k++)
        {
            var len = k % 16 == 0 ? 0.0070f : k % 8 == 0 ? 0.0055f : k % 4 == 0 ? 0.0042f : k % 2 == 0 ? 0.0030f : 0.0020f;
            inch.Add(new Tick(k * sixteenth, BeamHeight - len, len));
        }
        TickObject("InchScale", fixedPart, inch, ScaleZ, Dir + "/InchScale.mesh.asset");
        for (var i = 0; i <= 6; i++)
            Label(fixedPart, i.ToString(), new Vector3(i * 0.0254f, 0.0120f, ScaleZ - 0.0001f), 0.0024f, TextAnchor.LowerCenter);
        Label(fixedPart, "INCH", new Vector3(0.1595f, 0.0120f, ScaleZ - 0.0001f), 0.0022f, TextAnchor.LowerLeft);
    }

    static void BuildSlider(Transform parent)
    {
        // origin of "Slider" = inner face of the sliding lower jaw; it moves +X by the opening
        var slider = new GameObject("Slider").transform;
        slider.SetParent(parent, false);

        Box("TopBlock", slider, new Vector3(0.030f, 0.023f, 0f), new Vector3(0.060f, 0.022f, 0.0072f), steel);
        Box("BackPlate", slider, new Vector3(0.030f, 0.0105f, 0.00285f), new Vector3(0.060f, 0.0470f, 0.0017f), steel);
        Box("VernierPlate", slider, new Vector3(0.030f, -0.0065f, 0.0000f), new Vector3(0.060f, 0.0130f, 0.0072f), plate);
        Box("SlidingLowerJaw", slider, new Vector3(0.004f, -0.0315f, 0f), new Vector3(0.008f, 0.0370f, 0.0075f), steel);
        Box("SlidingUpperJaw", slider, new Vector3(0.003f, 0.043f, 0f), new Vector3(0.006f, 0.018f, 0.0075f), steel);

        // locking thumb screw and the thumb roller
        Cylinder("LockScrew", slider, new Vector3(0.022f, 0.0375f, 0f), Quaternion.identity, 0.0034f, 0.0035f, dark);
        Cylinder("LockKnob", slider, new Vector3(0.022f, 0.0425f, 0f), Quaternion.identity, 0.0090f, 0.0030f, dark);
        Cylinder("ThumbRoller", slider, new Vector3(0.050f, -0.0100f, -0.0004f), Quaternion.Euler(90f, 0f, 0f), 0.0140f, 0.0016f, steel);

        // depth rod: hidden inside the beam, pushes out of the far end by exactly the opening
        Box("DepthRod", slider, new Vector3(BeamLength * 0.5f, 0.0130f, 0f), new Vector3(BeamLength, 0.0050f, 0.0016f), dark);

        // vernier scale: 50 divisions over 49 mm, ticks hang down from the top edge of the plate
        var vernier = new List<Tick>();
        for (var i = 0; i <= 50; i++)
        {
            var len = i % 5 == 0 ? 0.0046f : 0.0028f;
            vernier.Add(new Tick(i * 0.00098f, -len, len));
        }
        TickObject("VernierScale", slider, vernier, VernierZ, Dir + "/VernierScale.mesh.asset");
        for (var i = 0; i <= 50; i += 5)
            Label(slider, (i / 5).ToString(), new Vector3(i * 0.00098f, -0.0052f, VernierZ - 0.0001f), 0.0024f, TextAnchor.UpperCenter);
        Label(slider, "0.02mm", new Vector3(0.0545f, -0.0052f, VernierZ - 0.0001f), 0.0020f, TextAnchor.UpperRight);

        // pick collider for dragging in practical mode
        var col = slider.gameObject.AddComponent<BoxCollider>();
        col.center = new Vector3(0.030f, 0.012f, 0f);
        col.size = new Vector3(0.064f, 0.062f, 0.012f);
    }

    static void BuildWorkpiece(Transform parent)
    {
        // a round bar clamped between the lower jaws; the controller scales X/Y to the chosen diameter
        var wp = new GameObject("Workpiece").transform;
        wp.SetParent(parent, false);
        wp.localPosition = new Vector3(0.010f, -0.022f, 0f);
        wp.localScale = new Vector3(0.020f, 0.020f, 0.016f);
        var mesh = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        mesh.name = "Bar";
        Object.DestroyImmediate(mesh.GetComponent<Collider>());
        mesh.transform.SetParent(wp, false);
        mesh.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
        mesh.transform.localScale = new Vector3(1f, 0.5f, 1f);
        mesh.GetComponent<MeshRenderer>().sharedMaterial = MakeMat("Workpiece", new Color(0.78f, 0.52f, 0.30f), 0.8f, 0.45f);
    }

    // ------------------------------------------------------------------ helpers

    struct Tick
    {
        public float x, y, length;
        public Tick(float x, float y, float length) { this.x = x; this.y = y; this.length = length; }
    }

    const float TickWidth = 0.00017f;

    static void TickObject(string name, Transform parent, List<Tick> ticks, float z, string meshPath)
    {
        var verts = new List<Vector3>();
        var tris = new List<int>();
        var normals = new List<Vector3>();
        foreach (var t in ticks)
        {
            var i = verts.Count;
            var x0 = t.x - TickWidth * 0.5f;
            var x1 = t.x + TickWidth * 0.5f;
            var y0 = t.y;
            var y1 = t.y + t.length;
            verts.Add(new Vector3(x0, y0, 0f));
            verts.Add(new Vector3(x0, y1, 0f));
            verts.Add(new Vector3(x1, y1, 0f));
            verts.Add(new Vector3(x1, y0, 0f));
            for (var n = 0; n < 4; n++) normals.Add(Vector3.back);
            tris.AddRange(new[] { i, i + 1, i + 2, i, i + 2, i + 3 });
        }

        var mesh = new Mesh { name = name };
        mesh.SetVertices(verts);
        mesh.SetNormals(normals);
        mesh.SetTriangles(tris, 0);
        mesh.RecalculateBounds();
        AssetDatabase.DeleteAsset(meshPath);
        AssetDatabase.CreateAsset(mesh, meshPath);

        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = new Vector3(0f, 0f, z);
        go.AddComponent<MeshFilter>().sharedMesh = mesh;
        var r = go.AddComponent<MeshRenderer>();
        r.sharedMaterial = ink;
        r.shadowCastingMode = ShadowCastingMode.Off;
    }

    static void Label(Transform parent, string text, Vector3 pos, float height, TextAnchor anchor)
    {
        var go = new GameObject("Label_" + text);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = pos;
        var tm = go.AddComponent<TextMesh>();
        var font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        tm.font = font;
        tm.text = text;
        tm.anchor = anchor;
        tm.alignment = TextAlignment.Center;
        tm.fontSize = 50;
        tm.characterSize = height / (50f * 0.1f);   // glyph height ~ fontSize * characterSize * 0.1 world units
        tm.color = new Color(0.04f, 0.04f, 0.04f);
        var r = go.GetComponent<MeshRenderer>();
        r.sharedMaterial = font.material;
        r.shadowCastingMode = ShadowCastingMode.Off;
    }

    static GameObject Box(string name, Transform parent, Vector3 center, Vector3 size, Material mat)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.name = name;
        Object.DestroyImmediate(go.GetComponent<Collider>());
        go.transform.SetParent(parent, false);
        go.transform.localPosition = center;
        go.transform.localScale = size;
        go.GetComponent<MeshRenderer>().sharedMaterial = mat;
        return go;
    }

    // axis of the cylinder is local Y before the rotation; diameter and length are in metres
    static void Cylinder(string name, Transform parent, Vector3 center, Quaternion rot, float diameter, float length, Material mat)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        go.name = name;
        Object.DestroyImmediate(go.GetComponent<Collider>());
        go.transform.SetParent(parent, false);
        go.transform.localPosition = center;
        go.transform.localRotation = rot;
        go.transform.localScale = new Vector3(diameter, length * 0.5f, diameter);
        go.GetComponent<MeshRenderer>().sharedMaterial = mat;
    }

    static void MakeMaterials()
    {
        steel = MakeMat("VernierSteel", new Color(0.70f, 0.72f, 0.75f), 0.9f, 0.55f);
        plate = MakeMat("VernierPlate", new Color(0.82f, 0.84f, 0.86f), 0.85f, 0.65f);
        dark = MakeMat("VernierDark", new Color(0.18f, 0.19f, 0.21f), 0.9f, 0.45f);
        ink = MakeMat("VernierInk", new Color(0.03f, 0.03f, 0.03f), 0f, 0.1f);
    }

    static Material MakeMat(string name, Color color, float metallic, float smoothness)
    {
        var path = Dir + "/" + name + ".mat";
        var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (mat == null)
        {
            mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            AssetDatabase.CreateAsset(mat, path);
        }
        mat.SetColor("_BaseColor", color);
        mat.SetFloat("_Metallic", metallic);
        mat.SetFloat("_Smoothness", smoothness);
        EditorUtility.SetDirty(mat);
        return mat;
    }

    static void Register(GameObject prefab)
    {
        var reg = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>(RegistryPath);
        if (reg == null) { Debug.LogWarning("[VernierCaliperBuilder] registry missing: run PhyXara > Setup Scene And Assets first"); return; }

        var entry = reg.Find(ExperimentId);
        if (entry == null)
        {
            entry = new ExperimentEntry { experimentId = ExperimentId };
            reg.entries.Add(entry);
        }
        entry.modelPrefab = prefab;
        entry.referenceImageName = ExperimentId;
        entry.physicalWidthMeters = 0.15f;
        entry.modelSizeMeters = 0.15f;
        entry.arRotationEuler = new Vector3(90f, 0f, 0f);   // scales face up when the model lies on the page
        EditorUtility.SetDirty(reg);
    }

    // ------------------------------------------------------------------ batch helper: render a PNG so the result can be checked

    [MenuItem("PhyXara/Build Vernier Caliper + Preview PNG")]
    public static void BuildAndPreview()
    {
        Build();
        RenderPreview("vernier-preview.png", 0f, 0f, 0f);
        RenderPreview("vernier-preview-open.png", 0f, 0f, 63.14f);
    }

    static void RenderPreview(string fileName, float yaw, float pitch, float openingMm)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
        var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
        var controller = go.GetComponent<VernierCaliperController>();
        controller.SendMessage("Awake", SendMessageOptions.DontRequireReceiver);
        if (openingMm > 0f) controller.SetOpeningMm(openingMm);
        go.transform.rotation = Quaternion.Euler(pitch, yaw, 0f);

        var camGo = new GameObject("PreviewCam");
        var cam = camGo.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.86f, 0.88f, 0.92f);
        cam.fieldOfView = 24f;
        cam.transform.position = new Vector3(0f, 0.0f, -0.52f);
        cam.transform.LookAt(new Vector3(0f, 0.012f, 0f));
        var lightGo = new GameObject("Light");
        var light = lightGo.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.4f;
        lightGo.transform.rotation = Quaternion.Euler(30f, -20f, 0f);

        var rt = new RenderTexture(2400, 800, 24, RenderTextureFormat.ARGB32);
        cam.targetTexture = rt;
        cam.Render();
        RenderTexture.active = rt;
        var tex = new Texture2D(rt.width, rt.height, TextureFormat.RGB24, false);
        tex.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0);
        tex.Apply();
        RenderTexture.active = null;
        var projectRoot = Directory.GetParent(Application.dataPath).FullName;
        File.WriteAllBytes(Path.Combine(projectRoot, fileName), tex.EncodeToPNG());

        Object.DestroyImmediate(go);
        Object.DestroyImmediate(camGo);
        Object.DestroyImmediate(lightGo);
        Object.DestroyImmediate(rt);
        Object.DestroyImmediate(tex);
    }
}
