using System;
using System.Collections.Generic;
using UnityEngine;

// Apparatus dimensions use millimetres; the scene scales them to metres.
public sealed partial class Class10ExperimentModel
{
    static readonly Color32 Steel = new Color32(177, 193, 210, 255);
    static readonly Color32 Dark = new Color32(36, 49, 66, 255);
    static readonly Color32 Wood = new Color32(172, 104, 62, 255);
    static readonly Color32 Brass = new Color32(228, 174, 73, 255);
    static readonly Color32 Blue = new Color32(42, 127, 205, 255);
    static readonly Color32 Glass = new Color32(130, 217, 237, 110);
    static readonly Color32 Red = new Color32(226, 67, 57, 255);
    static readonly Color32 White = new Color32(235, 241, 245, 255);
    static readonly Color32 Green = new Color32(53, 157, 121, 255);
    static readonly Color32 Yellow = new Color32(246, 180, 39, 255);
    static readonly Color32 Wire = new Color32(39, 48, 61, 255);

    readonly Transform root;
    readonly Func<Color32, Material> material;
    public readonly List<Transform> LabelledParts = new List<Transform>();
    public readonly List<string> PartLabels = new List<string>();

    public Class10ExperimentModel(Transform root, Func<Color32, Material> material)
    {
        this.root = root;
        this.material = material;
    }

    public Action<float> Build(int number)
    {
        switch (number)
        {
            case 1: return GlassSlab();
            case 2: return WaterIndex();
            case 3: return CriticalAngle();
            case 4: return PrismDeviation();
            case 5: return ConvexLens();
            case 6: return Telescope();
            case 7: return Microscope();
            case 8: return OhmsLaw();
            case 9: return SeriesCircuit();
            case 10: return ParallelCircuit();
            case 11: return Galvanometer();
            case 12: return MagneticField();
            default: throw new ArgumentOutOfRangeException(nameof(number));
        }
    }

    Transform Mark(Transform part, string label)
    {
        LabelledParts.Add(part);
        PartLabels.Add(label);
        return part;
    }

    static Transform Group(Transform parent, string name, Vector3 position)
    {
        var group = new GameObject(name).transform;
        group.SetParent(parent, false);
        group.localPosition = position;
        return group;
    }

    Transform Shape(Transform parent, string name, PrimitiveType primitive, Vector3 position, Vector3 size, Color32 color)
    {
        var shape = GameObject.CreatePrimitive(primitive);
        shape.name = name;
        shape.transform.SetParent(parent, false);
        shape.transform.localPosition = position;
        shape.transform.localScale = size;
        shape.GetComponent<Renderer>().sharedMaterial = material(color);
        UnityEngine.Object.DestroyImmediate(shape.GetComponent<Collider>());
        return shape.transform;
    }

    Transform Box(Transform parent, string name, Vector3 position, Vector3 size, Color32 color) =>
        Shape(parent, name, PrimitiveType.Cube, position, size, color);

    Transform Cylinder(Transform parent, string name, Vector3 position, float diameter, float height, Color32 color) =>
        Shape(parent, name, PrimitiveType.Cylinder, position, new Vector3(diameter, height / 2, diameter), color);

    Transform Sphere(Transform parent, string name, Vector3 position, Vector3 size, Color32 color) =>
        Shape(parent, name, PrimitiveType.Sphere, position, size, color);

    Transform Rod(Transform parent, string name, Vector3 start, Vector3 end, float diameter, Color32 color)
    {
        var rod = Cylinder(parent, name, Vector3.zero, diameter, 1, color);
        Stretch(rod, start, end);
        return rod;
    }

    static void Stretch(Transform rod, Vector3 start, Vector3 end)
    {
        var axis = end - start;
        rod.localPosition = (start + end) * .5f;
        rod.localRotation = Quaternion.FromToRotation(Vector3.up, axis.normalized);
        var scale = rod.localScale;
        scale.y = Mathf.Max(.001f, axis.magnitude * .5f);
        rod.localScale = scale;
    }
}
