using System.Collections.Generic;
using System.IO;
using PhyXara.Bridge;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

/// <summary>
/// Builds the vernier caliper prefab procedurally (no external model needed) and registers it as
/// "exp_vernier_caliper". Proportions follow a 150 mm / 6 inch, 0.02 mm steel caliper.
/// Units are metres, X runs along the beam, Y is up (jaws hang down), the scales face -Z.
/// Menu: PhyXara > Build Vernier Caliper. Safe to re-run: the prefab, meshes and materials are rebuilt.
/// </summary>
public static class VernierCaliperBuilder
{
    const string Dir = "Assets/Model/Vernier";
    const string PrefabPath = Dir + "/VernierCaliper.prefab";
    const string RegistryPath = "Assets/Experiments/ExperimentRegistry.asset";
    public const string ExperimentId = "exp_vernier_caliper";

    // beam: bottom edge at y = 0, top edge at BeamTop; the fixed jaw's measuring face is at x = 0
    const float BeamLength = 0.205f, BeamTop = 0.0155f, BeamHalfDepth = 0.0019f;
    const float JawTipY = -0.0374f;
    const float JawHalfDepth = 0.0034f;
    const float ScaleZ = -0.00193f;          // just in front of the beam face
    const float VernierZ = -0.00348f;        // just in front of the slider plate

    // slider (origin = measuring face of the sliding lower jaw)
    const float SliderLength = 0.0545f;
    const float PlateTop = 0.0024f, PlateBottom = -0.0048f;
    const float BlockBottom = 0.0133f, BlockTop = 0.0201f;

    static Material steel, plate, ink, dark, knurl;

    [MenuItem("PhyXara/Build Vernier Caliper")]
    public static void Build()
    {
        Directory.CreateDirectory(Dir);
        MakeMaterials();

        var root = new GameObject("VernierCaliper");
        // pivot near the middle of the beam so rotating in preview looks natural
        var body = new GameObject("Body");
        body.transform.SetParent(root.transform, false);
        body.transform.localPosition = new Vector3(-0.100f, -0.004f, 0f);

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

    // ------------------------------------------------------------------ fixed part

    static void BuildFixedPart(Transform parent)
    {
        var fixedPart = new GameObject("Fixed").transform;
        fixedPart.SetParent(parent, false);

        // beam
        Box("Beam", fixedPart, new Vector3(BeamLength * 0.5f, BeamTop * 0.5f, 0f), new Vector3(BeamLength, BeamTop, BeamHalfDepth * 2f), steel);
        // thin raised edge strips give the beam its machined look
        Box("BeamEdgeTop", fixedPart, new Vector3(BeamLength * 0.5f, BeamTop - 0.0004f, 0f), new Vector3(BeamLength, 0.0008f, BeamHalfDepth * 2f + 0.0004f), plate);
        Box("EndBlock", fixedPart, new Vector3(BeamLength + 0.0025f, BeamTop * 0.5f, 0f), new Vector3(0.0050f, BeamTop - 0.0010f, BeamHalfDepth * 2f + 0.0004f), plate);
        Cylinder("EndScrewTop", fixedPart, new Vector3(BeamLength + 0.0025f, 0.0128f, ScaleZ - 0.0004f), Quaternion.Euler(90f, 0f, 0f), 0.0030f, 0.0010f, dark);
        Cylinder("EndScrewBottom", fixedPart, new Vector3(BeamLength + 0.0025f, 0.0028f, ScaleZ - 0.0004f), Quaternion.Euler(90f, 0f, 0f), 0.0030f, 0.0010f, dark);

        // fixed lower jaw: tapered, measuring face (x = 0) is vertical
        Prism("FixedLowerJaw", fixedPart, new[]
        {
            new Vector2(-0.0133f, BeamTop), new Vector2(0f, BeamTop), new Vector2(0f, JawTipY),
            new Vector2(-0.0062f, JawTipY), new Vector2(-0.0133f, PlateBottom)
        }, JawHalfDepth * 2f, steel);
        Box("FixedLowerTip", fixedPart, new Vector3(-0.0003f, JawTipY * 0.5f - 0.004f, 0f), new Vector3(0.0006f, 0.0150f, JawHalfDepth * 2f + 0.0002f), plate);

        // fixed upper (inside) jaw: slim hooked blade
        Prism("FixedUpperJaw", fixedPart, new[]
        {
            new Vector2(-0.0133f, BeamTop), new Vector2(0f, BeamTop), new Vector2(0f, 0.0240f), new Vector2(-0.0016f, 0.0324f),
            new Vector2(-0.0066f, 0.0324f), new Vector2(-0.0070f, 0.0215f), new Vector2(-0.0133f, 0.0190f)
        }, JawHalfDepth * 2f, steel);

        // main scale: mm along the bottom (ticks point up), inches along the top (ticks hang down)
        var mm = new List<Tick>();
        for (var j = 0; j <= 150; j++)
        {
            var len = j % 10 == 0 ? 0.0027f : j % 5 == 0 ? 0.0021f : 0.0015f;
            mm.Add(new Tick(j * 0.001f, 0.0019f, len));
        }
        TickObject("MmScale", fixedPart, mm, ScaleZ, Dir + "/MmScale.mesh.asset");
        for (var j = 0; j <= 150; j += 10)
            Label(fixedPart, j.ToString(), new Vector3(j * 0.001f, 0.0052f, ScaleZ - 0.0001f), 0.0021f, TextAnchor.LowerCenter);
        Label(fixedPart, "mm", new Vector3(0.1590f, 0.0049f, ScaleZ - 0.0001f), 0.0023f, TextAnchor.LowerLeft);

        var inch = new List<Tick>();
        const float sixteenth = 0.0254f / 16f;
        const float inchLine = 0.0137f;
        for (var k = 0; k <= 96; k++)
        {
            var len = k % 16 == 0 ? 0.0024f : k % 8 == 0 ? 0.0020f : k % 4 == 0 ? 0.0016f : k % 2 == 0 ? 0.0012f : 0.0009f;
            inch.Add(new Tick(k * sixteenth, inchLine - len, len));
        }
        TickObject("InchScale", fixedPart, inch, ScaleZ, Dir + "/InchScale.mesh.asset");
        for (var i = 0; i <= 6; i++)
            Label(fixedPart, i.ToString(), new Vector3(i * 0.0254f, 0.0085f, ScaleZ - 0.0001f), 0.0021f, TextAnchor.LowerCenter);
        Label(fixedPart, "INCH", new Vector3(0.1610f, 0.0108f, ScaleZ - 0.0001f), 0.0021f, TextAnchor.LowerLeft);
    }

    // ------------------------------------------------------------------ slider

    static void BuildSlider(Transform parent)
    {
        // origin of "Slider" = measuring face of the sliding lower jaw; it moves +X by the opening
        var slider = new GameObject("Slider").transform;
        slider.SetParent(parent, false);

        float cx = SliderLength * 0.5f;
        Box("TopBlock", slider, new Vector3(cx, (BlockBottom + BlockTop) * 0.5f, 0f), new Vector3(SliderLength, BlockTop - BlockBottom, 0.0074f), steel);
        Box("TopBlockBevel", slider, new Vector3(cx, BlockTop - 0.0004f, -0.0001f), new Vector3(SliderLength - 0.0010f, 0.0008f, 0.0076f), plate);
        // back plate wraps around behind the beam and joins the top block with the vernier plate
        Box("BackPlate", slider, new Vector3(cx, (PlateBottom + BlockTop) * 0.5f, 0.0029f), new Vector3(SliderLength, BlockTop - PlateBottom, 0.0018f), steel);
        Box("VernierPlate", slider, new Vector3(cx + 0.0006f, (PlateTop + PlateBottom) * 0.5f, -0.0002f), new Vector3(SliderLength - 0.0012f, PlateTop - PlateBottom, 0.0070f), plate);

        // sliding lower jaw
        Prism("SlidingLowerJaw", slider, new[]
        {
            new Vector2(0f, PlateBottom), new Vector2(0.0129f, PlateBottom), new Vector2(0.0052f, JawTipY), new Vector2(0f, JawTipY)
        }, JawHalfDepth * 2f, steel);
        Box("SlidingLowerTip", slider, new Vector3(0.0003f, JawTipY * 0.5f - 0.004f, 0f), new Vector3(0.0006f, 0.0150f, JawHalfDepth * 2f + 0.0002f), plate);

        // sliding upper jaw: slim blade rising from the top block
        Prism("SlidingUpperJaw", slider, new[]
        {
            new Vector2(0f, BlockTop - 0.0010f), new Vector2(0.0078f, BlockTop - 0.0010f), new Vector2(0.0066f, 0.0324f),
            new Vector2(0.0028f, 0.0324f), new Vector2(0.0005f, 0.0240f)
        }, JawHalfDepth * 2f, steel);

        // locking thumb screw (knurled knob) and the thumb roller
        Cylinder("LockScrew", slider, new Vector3(0.0232f, BlockTop + 0.0015f, 0f), Quaternion.identity, 0.0034f, 0.0034f, dark);
        var knob = Cylinder("LockKnob", slider, new Vector3(0.0232f, BlockTop + 0.0058f, 0f), Quaternion.identity, 0.0076f, 0.0044f, knurl);
        for (var n = 0; n < 24; n++)   // knurl ridges
        {
            var a = n * Mathf.PI * 2f / 24f;
            var ridge = Box("KnurlRidge" + n, knob.transform.parent, new Vector3(0.0232f + Mathf.Cos(a) * 0.00385f, BlockTop + 0.0058f, Mathf.Sin(a) * 0.00385f),
                            new Vector3(0.00035f, 0.0042f, 0.00035f), dark);
            ridge.transform.localRotation = Quaternion.Euler(0f, -a * Mathf.Rad2Deg, 0f);
        }
        Cylinder("ThumbRoller", slider, new Vector3(0.0472f, -0.0058f, -0.0004f), Quaternion.Euler(90f, 0f, 0f), 0.0098f, 0.0016f, steel);

        // depth rod: hidden inside the beam, slides out of the far end by exactly the opening
        Box("DepthRod", slider, new Vector3(BeamLength * 0.5f, 0.0082f, 0f), new Vector3(BeamLength, 0.0027f, 0.0016f), steel);

        // vernier scale: 50 divisions over 49 mm (least count 0.02 mm), ticks hang down from the top edge of the plate
        var vernier = new List<Tick>();
        for (var i = 0; i <= 50; i++)
        {
            var len = i % 5 == 0 ? 0.0030f : 0.0019f;
            vernier.Add(new Tick(i * 0.00098f, PlateTop - len, len));
        }
        TickObject("VernierScale", slider, vernier, VernierZ, Dir + "/VernierScale.mesh.asset");
        for (var i = 0; i <= 50; i += 5)
            Label(slider, (i / 5).ToString(), new Vector3(i * 0.00098f, PlateTop - 0.0034f, VernierZ - 0.0001f), 0.0021f, TextAnchor.UpperCenter);
        Label(slider, "0.02mm", new Vector3(0.0040f, BlockBottom + 0.0012f, -0.00385f), 0.0019f, TextAnchor.LowerLeft);

        // pick collider for dragging in practical mode
        var col = slider.gameObject.AddComponent<BoxCollider>();
        col.center = new Vector3(cx, 0.0076f, 0f);
        col.size = new Vector3(SliderLength + 0.004f, 0.0560f, 0.012f);
    }

    static void BuildWorkpiece(Transform parent)
    {
        // a round bar clamped between the lower jaws; the controller scales X/Y to the chosen diameter
        var wp = new GameObject("Workpiece").transform;
        wp.SetParent(parent, false);
        wp.localPosition = new Vector3(0.010f, -0.0210f, 0f);
        wp.localScale = new Vector3(0.020f, 0.020f, 0.016f);
        var mesh = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        mesh.name = "Bar";
        Object.DestroyImmediate(mesh.GetComponent<Collider>());
        mesh.transform.SetParent(wp, false);
        mesh.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
        mesh.transform.localScale = new Vector3(1f, 0.5f, 1f);
        mesh.GetComponent<MeshRenderer>().sharedMaterial = MakeMat("Workpiece", new Color(0.78f, 0.52f, 0.30f), 0.8f, 0.45f);
    }

    // ------------------------------------------------------------------ geometry helpers

    struct Tick
    {
        public float x, y, length;
        public Tick(float x, float y, float length) { this.x = x; this.y = y; this.length = length; }
    }

    const float TickWidth = 0.00016f;

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
        SaveMesh(mesh, meshPath);

        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = new Vector3(0f, 0f, z);
        go.AddComponent<MeshFilter>().sharedMesh = mesh;
        var r = go.AddComponent<MeshRenderer>();
        r.sharedMaterial = ink;
        r.shadowCastingMode = ShadowCastingMode.Off;
    }

    static void SaveMesh(Mesh mesh, string path)
    {
        AssetDatabase.DeleteAsset(path);
        AssetDatabase.CreateAsset(mesh, path);
    }

    /// <summary>Extrudes a simple 2D polygon (XY plane) symmetric around z = 0 into a flat-shaded solid.</summary>
    static GameObject Prism(string name, Transform parent, Vector2[] polygon, float thickness, Material mat)
    {
        var poly = new List<Vector2>(polygon);
        if (SignedArea(poly) < 0f) poly.Reverse();          // make it counter-clockwise
        var tri = Triangulate(poly);
        var h = thickness * 0.5f;

        var verts = new List<Vector3>();
        var norms = new List<Vector3>();
        var idx = new List<int>();

        void AddTri(Vector3 a, Vector3 b, Vector3 c, Vector3 wantedNormal)
        {
            if (Vector3.Dot(Vector3.Cross(b - a, c - a), wantedNormal) < 0f) { var t = b; b = c; c = t; }
            var i = verts.Count;
            verts.Add(a); verts.Add(b); verts.Add(c);
            norms.Add(wantedNormal); norms.Add(wantedNormal); norms.Add(wantedNormal);
            idx.Add(i); idx.Add(i + 1); idx.Add(i + 2);
        }

        for (var i = 0; i < tri.Count; i += 3)
        {
            var a = poly[tri[i]]; var b = poly[tri[i + 1]]; var c = poly[tri[i + 2]];
            AddTri(new Vector3(a.x, a.y, -h), new Vector3(b.x, b.y, -h), new Vector3(c.x, c.y, -h), Vector3.back);
            AddTri(new Vector3(a.x, a.y, h), new Vector3(b.x, b.y, h), new Vector3(c.x, c.y, h), Vector3.forward);
        }
        for (var i = 0; i < poly.Count; i++)
        {
            var p = poly[i]; var q = poly[(i + 1) % poly.Count];
            var edge = q - p;
            var n = new Vector3(edge.y, -edge.x, 0f).normalized;       // outward for a CCW polygon
            AddTri(new Vector3(p.x, p.y, -h), new Vector3(q.x, q.y, -h), new Vector3(q.x, q.y, h), n);
            AddTri(new Vector3(p.x, p.y, -h), new Vector3(q.x, q.y, h), new Vector3(p.x, p.y, h), n);
        }

        var mesh = new Mesh { name = name };
        mesh.SetVertices(verts);
        mesh.SetNormals(norms);
        mesh.SetTriangles(idx, 0);
        mesh.RecalculateBounds();
        SaveMesh(mesh, Dir + "/" + name + ".mesh.asset");

        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.AddComponent<MeshFilter>().sharedMesh = mesh;
        go.AddComponent<MeshRenderer>().sharedMaterial = mat;
        return go;
    }

    static float SignedArea(List<Vector2> p)
    {
        var a = 0f;
        for (var i = 0; i < p.Count; i++)
        {
            var q = p[(i + 1) % p.Count];
            a += p[i].x * q.y - q.x * p[i].y;
        }
        return a * 0.5f;
    }

    // ear clipping for a simple counter-clockwise polygon
    static List<int> Triangulate(List<Vector2> p)
    {
        var result = new List<int>();
        var idx = new List<int>();
        for (var i = 0; i < p.Count; i++) idx.Add(i);

        var guard = 0;
        while (idx.Count > 3 && guard++ < 1000)
        {
            var clipped = false;
            for (var i = 0; i < idx.Count; i++)
            {
                var i0 = idx[(i + idx.Count - 1) % idx.Count];
                var i1 = idx[i];
                var i2 = idx[(i + 1) % idx.Count];
                var a = p[i0]; var b = p[i1]; var c = p[i2];
                if (Cross(b - a, c - b) <= 0f) continue;                    // reflex vertex
                var ear = true;
                foreach (var k in idx)
                {
                    if (k == i0 || k == i1 || k == i2) continue;
                    if (PointInTriangle(p[k], a, b, c)) { ear = false; break; }
                }
                if (!ear) continue;
                result.Add(i0); result.Add(i1); result.Add(i2);
                idx.RemoveAt(i);
                clipped = true;
                break;
            }
            if (!clipped) break;
        }
        if (idx.Count == 3) { result.Add(idx[0]); result.Add(idx[1]); result.Add(idx[2]); }
        return result;
    }

    static float Cross(Vector2 a, Vector2 b) { return a.x * b.y - a.y * b.x; }

    static bool PointInTriangle(Vector2 p, Vector2 a, Vector2 b, Vector2 c)
    {
        var d1 = Cross(b - a, p - a);
        var d2 = Cross(c - b, p - b);
        var d3 = Cross(a - c, p - c);
        var neg = d1 < 0f || d2 < 0f || d3 < 0f;
        var pos = d1 > 0f || d2 > 0f || d3 > 0f;
        return !(neg && pos);
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
    static GameObject Cylinder(string name, Transform parent, Vector3 center, Quaternion rot, float diameter, float length, Material mat)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        go.name = name;
        Object.DestroyImmediate(go.GetComponent<Collider>());
        go.transform.SetParent(parent, false);
        go.transform.localPosition = center;
        go.transform.localRotation = rot;
        go.transform.localScale = new Vector3(diameter, length * 0.5f, diameter);
        go.GetComponent<MeshRenderer>().sharedMaterial = mat;
        return go;
    }

    static void MakeMaterials()
    {
        steel = MakeMat("VernierSteel", new Color(0.62f, 0.64f, 0.67f), 0.55f, 0.40f);
        plate = MakeMat("VernierPlate", new Color(0.76f, 0.78f, 0.80f), 0.45f, 0.50f);
        dark = MakeMat("VernierDark", new Color(0.16f, 0.17f, 0.19f), 0.6f, 0.40f);
        knurl = MakeMat("VernierKnurl", new Color(0.30f, 0.31f, 0.33f), 0.7f, 0.35f);
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

    /// <summary>
    /// Imports the caliper photo as the AR tracking image for exp_vernier_caliper and refreshes the reference image library.
    /// Show that picture full screen on a monitor (about 25 cm wide) and point the phone at it.
    /// </summary>
    public static void PrepareReferenceImage()
    {
        const string texPath = "Assets/Experiments/ReferenceImages/vernier-caliper.png";
        var importer = (TextureImporter)AssetImporter.GetAtPath(texPath);
        importer.textureType = TextureImporterType.Default;
        importer.isReadable = true;
        importer.mipmapEnabled = false;
        importer.npotScale = TextureImporterNPOTScale.None;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.maxTextureSize = 2048;
        importer.SaveAndReimport();

        var reg = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>(RegistryPath);
        var entry = reg.Find(ExperimentId);
        entry.referenceTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(texPath);
        entry.referenceImageName = ExperimentId;
        entry.physicalWidthMeters = 0.25f;
        EditorUtility.SetDirty(reg);
        AssetDatabase.SaveAssets();
        PhyXaraSetup.SyncLibrary();
        Debug.Log("[VernierCaliperBuilder] reference image ready: " + texPath);
    }

    // ------------------------------------------------------------------ preview renders so the result can be checked

    [MenuItem("PhyXara/Build Vernier Caliper + Preview PNG")]
    public static void BuildAndPreview()
    {
        Build();
        RenderPreview("vernier-closed.png", 0f, 0f, 0f);
        RenderPreview("vernier-open-63.14mm.png", 0f, 0f, 63.14f);
        RenderPreview("vernier-angle.png", -28f, 14f, 31.5f);
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
        cam.backgroundColor = new Color(0.90f, 0.91f, 0.94f);
        cam.fieldOfView = 24f;
        cam.transform.position = new Vector3(0f, 0.0f, -0.46f);
        cam.transform.LookAt(new Vector3(0f, 0.004f, 0f));
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
        var docs = Path.Combine(projectRoot, "Docs");
        Directory.CreateDirectory(docs);
        File.WriteAllBytes(Path.Combine(docs, fileName), tex.EncodeToPNG());

        Object.DestroyImmediate(go);
        Object.DestroyImmediate(camGo);
        Object.DestroyImmediate(lightGo);
        Object.DestroyImmediate(rt);
        Object.DestroyImmediate(tex);
    }
}
