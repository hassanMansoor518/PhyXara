using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class WoodMaterialSetup
{
    [MenuItem("PhyXara/Apply Wooden Apparatus Materials")]
    public static void Apply()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode) throw new InvalidOperationException("Exit Play Mode first.");
        const string texturePath = "Assets/Experiments/Models/WoodGrain.png";
        AssetDatabase.ImportAsset(texturePath, ImportAssetOptions.ForceSynchronousImport);
        var importer = (TextureImporter)AssetImporter.GetAtPath(texturePath);
        importer.wrapMode = TextureWrapMode.Repeat;
        importer.filterMode = FilterMode.Trilinear;
        importer.mipmapEnabled = true;
        importer.sRGBTexture = true;
        importer.SaveAndReimport();
        var grain = AssetDatabase.LoadAssetAtPath<Texture2D>(texturePath);
        if (!grain) throw new InvalidOperationException("Missing wood grain texture.");
        var wood = AssetDatabase.LoadAssetAtPath<Material>("Assets/Experiments/Models/AC683E.mat");
        if (!wood) throw new InvalidOperationException("Missing apparatus wood material.");
        foreach (var material in new[] { wood, AssetDatabase.LoadAssetAtPath<Material>("Assets/model/texture/principal of moments/M_Wood.mat") })
        {
            if (!material) continue;
            material.shader = Shader.Find("Universal Render Pipeline/Lit");
            material.SetColor("_BaseColor", Color.white);
            material.SetTexture("_BaseMap", grain);
            material.SetFloat("_Metallic", 0);
            material.SetFloat("_Smoothness", .2f);
            EditorUtility.SetDirty(material);
        }
        string original = EditorSceneManager.GetActiveScene().path;
        int woodenRenderers = 0;
        foreach (var path in new[] { "Assets/Scenes/SampleScene.unity", MobileARSetup.ScenePath })
        {
            var scene = EditorSceneManager.OpenScene(path);
            foreach (var renderer in scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<MeshRenderer>(true)))
            {
                bool woodenSupport = renderer.name == "Higher_Support" || renderer.name == "Lower_Support" || renderer.name == "Lower_Support_Step";
                var materials = renderer.sharedMaterials;
                for (int i = 0; i < materials.Length; i++)
                {
                    if (materials[i] && (woodenSupport || materials[i].name.IndexOf("wood", StringComparison.OrdinalIgnoreCase) >= 0 || materials[i] == wood))
                    {
                        materials[i] = wood;
                        woodenRenderers++;
                    }
                }
                renderer.sharedMaterials = materials;
            }
            var key = scene.GetRootGameObjects().FirstOrDefault(g => g.name == "Apparatus Lighting");
            if (!key)
            {
                var light = new GameObject("Apparatus Lighting").AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.3f;
                light.transform.rotation = Quaternion.Euler(45, -35, 0);
            }
            foreach (var light in scene.GetRootGameObjects().SelectMany(r => r.GetComponentsInChildren<Light>(true)).Where(l => l.name == "Syringe lighting"))
                light.intensity = .3f;
            if (!EditorSceneManager.SaveScene(scene)) throw new IOException("Failed to save " + path);
        }
        AssetDatabase.SaveAssets();
        if (!string.IsNullOrEmpty(original)) EditorSceneManager.OpenScene(original);
        Debug.Log("WOOD_MATERIALS_OK: Textured " + woodenRenderers + " apparatus surfaces across both scenes.");
    }
}
