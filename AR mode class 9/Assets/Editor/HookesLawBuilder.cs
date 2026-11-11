using System.IO;
using PhyXara.Bridge;
using UnityEditor;
using UnityEngine;

/// <summary>
/// Builds the Hooke's law prefab from the imported HookesLaw.glb model, adds the controller
/// and tap input scripts, registers it in the ExperimentRegistry.
/// Menu: PhyXara > Build Hooke's Law Prefab. Safe to re-run.
/// </summary>
public static class HookesLawBuilder
{
    const string ModelPath    = "Assets/Model/HookesLaw/HookesLaw.glb";
    const string Dir          = "Assets/Model/HookesLaw";
    const string PrefabPath   = Dir + "/HookesLaw.prefab";
    const string RegistryPath = "Assets/Experiments/ExperimentRegistry.asset";
    public const string ExperimentId = "exp12_hookes_law";

    [MenuItem("PhyXara/Build Hooke's Law Prefab")]
    public static void Build()
    {
        Directory.CreateDirectory(Dir);

        var model = AssetDatabase.LoadAssetAtPath<GameObject>(ModelPath);
        if (model == null)
        {
            Debug.LogError("[HookesLawBuilder] Model not found at " + ModelPath + ". Import HookesLaw.glb first.");
            return;
        }

        var instance = (GameObject)PrefabUtility.InstantiatePrefab(model);
        instance.name = "HookesLaw";

        // Add colliders to LoadAssembly and its children so raycasting works for the tap input
        AddCollidersToLoadAssembly(instance.transform);

        // Add controller and input scripts
        var ctrl = instance.AddComponent<HookesLawController>();
        instance.AddComponent<HookesLawWeightTap>();

        // Wire up node references on the controller
        WireNodes(instance.transform, ctrl);

        var prefab = PrefabUtility.SaveAsPrefabAsset(instance, PrefabPath);
        Object.DestroyImmediate(instance);

        Register(prefab);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[HookesLawBuilder] built " + PrefabPath + " and registered " + ExperimentId);
    }

    static void WireNodes(Transform root, HookesLawController ctrl)
    {
        // Use serialized fields via reflection since they are public
        ctrl.spring       = FindNode(root, "Spring");
        ctrl.loadAssembly = FindNode(root, "LoadAssembly");
        ctrl.pointer      = FindChildNode(ctrl.loadAssembly, "Pointer");

        ctrl.weightNodes = new Transform[6];
        for (int i = 0; i < 6; i++)
            ctrl.weightNodes[i] = FindNode(root, "Weight_" + (i + 1));

        if (ctrl.spring == null)       Debug.LogWarning("[HookesLawBuilder] 'Spring' node not found");
        if (ctrl.loadAssembly == null)  Debug.LogWarning("[HookesLawBuilder] 'LoadAssembly' node not found");
        if (ctrl.pointer == null)       Debug.LogWarning("[HookesLawBuilder] 'Pointer' node not found");
    }

    static void AddCollidersToLoadAssembly(Transform root)
    {
        var la = FindNode(root, "LoadAssembly");
        if (la == null) return;

        // Add a kinematic rigidbody to the LoadAssembly (moving colliders need one)
        var rb = la.gameObject.AddComponent<Rigidbody>();
        rb.isKinematic = true;
        rb.useGravity = false;

        // Add box colliders to mesh renderers under LoadAssembly
        foreach (var r in la.GetComponentsInChildren<MeshRenderer>(true))
        {
            if (r.GetComponent<Collider>() == null)
            {
                var mc = r.gameObject.AddComponent<MeshCollider>();
                mc.convex = true;
            }
        }
    }

    static void Register(GameObject prefab)
    {
        var reg = AssetDatabase.LoadAssetAtPath<ExperimentRegistry>(RegistryPath);
        if (reg == null)
        {
            Debug.LogError("[HookesLawBuilder] ExperimentRegistry not found at " + RegistryPath);
            return;
        }

        // remove old entry if present
        for (int i = reg.entries.Count - 1; i >= 0; i--)
            if (reg.entries[i] != null && reg.entries[i].experimentId == ExperimentId)
                reg.entries.RemoveAt(i);

        reg.entries.Add(new ExperimentEntry
        {
            experimentId       = ExperimentId,
            modelPrefab        = prefab,
            referenceImageName = ExperimentId,
            physicalWidthMeters = 0.18f, // placeholder until printed page measurement provided
            modelSizeMeters    = 0.25f,
            arRotationEuler    = Vector3.zero
        });

        EditorUtility.SetDirty(reg);
    }

    static Transform FindNode(Transform root, string nodeName)
    {
        foreach (var t in root.GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }

    static Transform FindChildNode(Transform parent, string nodeName)
    {
        if (parent == null) return null;
        foreach (var t in parent.GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }
}
