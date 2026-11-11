// Assets/Editor/InclinedPlaneSetup.cs
// Editor-only utility — diagnoses why InclinedPlane is invisible and fixes it.
// Menu: Tools > InclinedPlane > ...
//
// ROOT CAUSE SUMMARY (diagnosed 2026-11-05):
//   1. PRIMARY   – The model is not placed in SampleScene.unity at all.
//                  Scene only contains Main Camera, Directional Light, Global Volume.
//   2. SECONDARY – The correct FBX is "Assets/inclined_plane_rebuilt 1.fbx"
//                  (UnitScaleFactor=1 ⇒ metres, all 11 required nodes present).
//                  The copies in Assets/model/ have UnitScaleFactor=100 (cm), and
//                  "Assets/model/inclined_plane_rebuilt.fbx" is MISSING Scale_Zero_Anchor
//                  and Scale_300_Anchor, so InclinedPlaneController.Awake() would
//                  immediately log "model parts missing" and self-disable.
//   3. TERTIARY  – No GLB file exists in the project; "Assets/Model/InclinedPlane.glb"
//                  mentioned in the brief is absent.  The FBX path is the live asset.
//
// HOW TO VERIFY AFTER FIX:
//   • Run Tools > InclinedPlane > Place In Scene
//   • The model appears in the Scene view (~0.4 m × 0.2 m × 0.15 m)
//   • Play mode: Console shows the renderer diagnostic with no warnings
//   • InclinedPlaneController.Awake() must NOT log "model parts missing"

#if UNITY_EDITOR
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace PhyXara.Bridge.Editor
{
    public static class InclinedPlaneSetup
    {
        // ── Asset paths ────────────────────────────────────────────────────────────
        /// <summary>
        /// Preferred: root-level FBX, UnitScaleFactor=1 (metres), all anchor nodes present.
        /// GUID: 6c8c550a0d0c6bf48af76fe04d9750d7
        /// </summary>
        const string FBX_PREFERRED = "Assets/inclined_plane_rebuilt 1.fbx";

        /// <summary>
        /// Fallback: model-folder copy, UnitScaleFactor=100 (cm, Unity bakes 0.01 scale),
        /// all anchor nodes present (animationType:0, fine).
        /// GUID: a44516be576f9114fac788982c20fa2d
        /// </summary>
        const string FBX_FALLBACK = "Assets/model/inclined_plane_rebuilt 1.fbx";

        // ── Fix FBX import settings ────────────────────────────────────────────────
        [MenuItem("Tools/InclinedPlane/Fix FBX Import Settings")]
        static void FixImportSettings()
        {
            FixSingleFbx(FBX_PREFERRED);
            FixSingleFbx(FBX_FALLBACK);
        }

        static void FixSingleFbx(string path)
        {
            var importer = AssetImporter.GetAtPath(path) as ModelImporter;
            if (importer == null)
            {
                Debug.LogWarning($"[InclinedPlaneSetup] No ModelImporter at '{path}' – skipping.");
                return;
            }

            bool dirty = false;

            // 1. Rig: Generic (animationType=2) or None (0) – NOT Humanoid (3).
            //    Humanoid adds an Avatar + extra root, wastes memory, and can silently
            //    rename or reparent hierarchy nodes under "avatarSetup".
            //    animationType:2 in the meta == ModelImporterAnimationType.Generic (correct).
            //    The preferred FBX is already Generic; we keep it, just ensure it's not 3.
            if (importer.animationType == ModelImporterAnimationType.Human)
            {
                importer.animationType = ModelImporterAnimationType.Generic;
                dirty = true;
                Debug.Log($"[InclinedPlaneSetup] {path}: animationType Humanoid → Generic");
            }

            // 2. Use file scale so Unity reads UnitScaleFactor from the FBX automatically.
            //    Preferred FBX: UnitScaleFactor=1  → root scale stays (1,1,1)  ✓
            //    Fallback FBX:  UnitScaleFactor=100 → Unity bakes 0.01 → world size correct
            if (!importer.useFileScale)
            {
                importer.useFileScale = true;
                dirty = true;
                Debug.Log($"[InclinedPlaneSetup] {path}: useFileScale enabled");
            }

            // 3. materialLocation=InPrefab (value 1) – already set, but guard it.
            if (importer.materialLocation != ModelImporterMaterialLocation.InPrefab)
            {
                importer.materialLocation = ModelImporterMaterialLocation.InPrefab;
                dirty = true;
                Debug.Log($"[InclinedPlaneSetup] {path}: materialLocation → InPrefab");
            }

            if (dirty)
            {
                importer.SaveAndReimport();
                Debug.Log($"[InclinedPlaneSetup] Reimported {path}.");
            }
            else
            {
                Debug.Log($"[InclinedPlaneSetup] {path}: import settings already correct.");
            }
        }

        // ── Place model in scene ───────────────────────────────────────────────────
        /// <summary>
        /// Instantiates the InclinedPlane FBX into the active scene, adds
        /// InclinedPlaneController, positions it 0.5 m in front of the main camera,
        /// then immediately runs the renderer diagnostic.
        /// </summary>
        [MenuItem("Tools/InclinedPlane/Place In Scene")]
        static void PlaceInScene()
        {
            // Load preferred, then fallback
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(FBX_PREFERRED)
                      ?? AssetDatabase.LoadAssetAtPath<GameObject>(FBX_FALLBACK);

            if (prefab == null)
            {
                Debug.LogError("[InclinedPlaneSetup] Cannot load InclinedPlane FBX.\n" +
                               $"  Tried: {FBX_PREFERRED}\n  Tried: {FBX_FALLBACK}\n" +
                               "Make sure at least one of these files exists in the project.");
                return;
            }

            // Remove stale instances
            foreach (var name in new[] { "inclined_plane_rebuilt 1", "inclined_plane_rebuilt" })
            {
                var stale = GameObject.Find(name);
                if (stale != null)
                {
                    Undo.DestroyObjectImmediate(stale);
                    Debug.Log($"[InclinedPlaneSetup] Removed existing '{name}'.");
                }
            }

            // Instantiate as a prefab instance so the connection to the FBX is preserved
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            Undo.RegisterCreatedObjectUndo(go, "Place InclinedPlane");

            // Position 0.5 m in front of the Scene/Main camera
            var cam = Camera.main;
            if (cam != null)
            {
                go.transform.position = cam.transform.position + cam.transform.forward * 0.5f;
                go.transform.rotation = Quaternion.identity;
            }
            else
            {
                go.transform.position = new Vector3(0f, 0f, 0.5f);
                go.transform.rotation = Quaternion.identity;
            }

            // Add controller if absent
            if (go.GetComponent<InclinedPlaneController>() == null)
            {
                Undo.AddComponent<InclinedPlaneController>(go);
                Debug.Log("[InclinedPlaneSetup] Added InclinedPlaneController.");
            }

            Selection.activeGameObject = go;
            SceneView.FrameLastActiveSceneView();

            Debug.Log($"[InclinedPlaneSetup] ✓ Placed '{go.name}' at {go.transform.position}, " +
                      $"scale {go.transform.lossyScale}.");

            // Run diagnostic immediately
            DiagnoseRenderers(go);
        }

        [MenuItem("Tools/InclinedPlane/Place In Scene", true)]
        static bool ValidatePlaceInScene() => !Application.isPlaying;

        [MenuItem("Tools/InclinedPlane/Fix FBX Import Settings", true)]
        static bool ValidateFixImport() => !Application.isPlaying;

        // ── Diagnose (menu entry) ──────────────────────────────────────────────────
        [MenuItem("Tools/InclinedPlane/Diagnose Renderers")]
        static void DiagnoseRenderersMenu()
        {
            var go = Selection.activeGameObject;
            if (go == null)
            {
                go = GameObject.Find("inclined_plane_rebuilt 1")
                  ?? GameObject.Find("inclined_plane_rebuilt");
            }
            if (go == null)
            {
                Debug.LogWarning("[InclinedPlane Diagnose] Select the model root, or run " +
                                 "'Tools > InclinedPlane > Place In Scene' first.");
                return;
            }
            DiagnoseRenderers(go);
        }

        // ── Core diagnostic ────────────────────────────────────────────────────────
        /// <summary>
        /// Logs a full renderer report: bounds, shader, surface type, alpha,
        /// active/enabled state, and camera culling verdict for every renderer
        /// under <paramref name="root"/>. Also callable at runtime.
        /// </summary>
        internal static void DiagnoseRenderers(GameObject root)
        {
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("\n╔══════════ InclinedPlane Renderer Diagnostic ══════════╗");
            sb.AppendLine($"  Root : '{root.name}'");
            sb.AppendLine($"  World pos   : {root.transform.position}");
            sb.AppendLine($"  Lossy scale : {root.transform.lossyScale}");
            sb.AppendLine($"  GO active   : {root.activeInHierarchy}");

            var renderers = root.GetComponentsInChildren<Renderer>(true);
            sb.AppendLine($"  Renderers   : {renderers.Length}");

            if (renderers.Length == 0)
            {
                sb.AppendLine("  ⚠ NO RENDERERS found under this root.");
                sb.AppendLine("    Possible causes:");
                sb.AppendLine("    • FBX imported as pure-transform (no meshes baked)");
                sb.AppendLine("    • Wrong FBX file used (check Assets vs Assets/model/)");
            }

            foreach (var r in renderers)
            {
                Bounds b = r.bounds;
                sb.AppendLine($"\n  ┌─ {r.gameObject.name}");
                sb.AppendLine($"  │  Renderer enabled : {r.enabled}");
                sb.AppendLine($"  │  GO active        : {r.gameObject.activeInHierarchy}");
                sb.AppendLine($"  │  Layer            : '{LayerMask.LayerToName(r.gameObject.layer)}' ({r.gameObject.layer})");
                sb.AppendLine($"  │  World bounds     : center={b.center:F4}  size={b.size:F4}");
                float vol = b.size.x * b.size.y * b.size.z;
                sb.AppendLine($"  │  Bounds volume    : {vol:F6} m³  {(vol < 1e-9f ? "⚠ NEAR ZERO – possible scale=0 or missing mesh" : "")}");

                var mf = r.GetComponent<MeshFilter>();
                if (mf != null)
                    sb.AppendLine($"  │  Mesh             : {(mf.sharedMesh != null ? $"'{mf.sharedMesh.name}' ({mf.sharedMesh.vertexCount} verts)" : "NULL ⚠")}");

                var mats = r.sharedMaterials;
                if (mats == null || mats.Length == 0)
                {
                    sb.AppendLine("  │  ⚠ NO materials assigned!");
                }
                else
                {
                    for (int i = 0; i < mats.Length; i++)
                    {
                        var mat = mats[i];
                        if (mat == null) { sb.AppendLine($"  │  Material[{i}] : NULL ⚠"); continue; }

                        string sh     = mat.shader != null ? mat.shader.name : "NULL";
                        bool isPink   = sh == "Hidden/InternalErrorShader";
                        bool isUrp    = sh.StartsWith("Universal Render Pipeline") || sh.StartsWith("Shader Graphs/");
                        float alpha   = mat.HasProperty("_BaseColor") ? mat.GetColor("_BaseColor").a
                                      : mat.HasProperty("_Color")      ? mat.GetColor("_Color").a : -1f;
                        int surface   = mat.HasProperty("_Surface") ? (int)mat.GetFloat("_Surface") : -1;
                        string surStr = surface == 0 ? "Opaque" : surface == 1 ? "Transparent" : "unknown";

                        sb.AppendLine($"  │  Material[{i}] : '{mat.name}'");
                        sb.AppendLine($"  │    Shader  : {sh}" +
                                      (isPink ? " ⚠ ERROR/PINK shader!" : !isUrp ? " ⚠ Not a URP shader!" : " ✓"));
                        sb.AppendLine($"  │    Surface : {surStr}  Alpha={alpha:F3}");
                    }
                }
            }

            // Camera culling check
            sb.AppendLine("\n  ── Camera culling ──");
            var allCams = Camera.allCameras;
            if (allCams.Length == 0)
                sb.AppendLine("  ⚠ No cameras in scene!");

            foreach (var cam in allCams)
            {
                sb.AppendLine($"  Camera '{cam.name}' | near={cam.nearClipPlane} far={cam.farClipPlane} | cullingMask={cam.cullingMask}");
                foreach (var r in renderers)
                {
                    int layer = r.gameObject.layer;
                    if ((cam.cullingMask & (1 << layer)) == 0)
                        sb.AppendLine($"    ⚠ '{r.gameObject.name}' CULLED – layer {layer} ('{LayerMask.LayerToName(layer)}') not in cullingMask.");

                    float dist = Vector3.Distance(r.bounds.center, cam.transform.position);
                    if (dist > cam.farClipPlane)
                        sb.AppendLine($"    ⚠ '{r.gameObject.name}' beyond far clip. dist={dist:F2} farClip={cam.farClipPlane}");
                }
            }

            sb.AppendLine("╚═══════════════════════════════════════════════════════╝");
            Debug.Log(sb.ToString());
        }
    }
}
#endif
