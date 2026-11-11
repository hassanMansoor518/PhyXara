using System;
using UnityEngine;

// Model dimensions are in millimetres. Y rises from the target surface.
public sealed class ReferenceExperimentModel
{
    static readonly Color32 Steel = new Color32(177, 193, 210, 255);
    static readonly Color32 Dark = new Color32(45, 59, 77, 255);
    static readonly Color32 Wood = new Color32(172, 104, 62, 255);
    static readonly Color32 Brass = new Color32(238, 176, 69, 255);
    static readonly Color32 Blue = new Color32(42, 149, 205, 255);
    static readonly Color32 Glass = new Color32(141, 217, 230, 255);
    static readonly Color32 Red = new Color32(238, 76, 54, 255);
    static readonly Color32 White = new Color32(235, 243, 246, 255);

    readonly Transform root;
    readonly Func<Color32, Material> material;

    public ReferenceExperimentModel(Transform root, Func<Color32, Material> material)
    {
        this.root = root;
        this.material = material;
    }

    public Action<float> Build(int image)
    {
        switch (image)
        {
            case 4: return PulleyBoard();
            case 5: return PulleyTable(false);
            case 6: return PulleyTable(true);
            case 8: return Pendulum();
            case 9: return Spring();
            case 10: return Buoyancy();
            case 11: return Syringe();
            case 12: return Calorimeter();
            case 13: return Heating();
            default: throw new ArgumentOutOfRangeException(nameof(image));
        }
    }

    Action<float> PulleyBoard()
    {
        Box(root, "Foot", new Vector3(0, 4, 0), new Vector3(96, 8, 52), Dark);
        Box(root, "Vertical board", new Vector3(-23, 65, 14), new Vector3(52, 115, 7), Wood);
        Box(root, "Pulley support", new Vector3(24, 102, 14), new Vector3(45, 7, 7), Wood);
        var hinge = Group(root, "Pivoted bar", new Vector3(-37, 111, 4));
        Box(hinge, "Bar", new Vector3(0, -42, 0), new Vector3(8, 84, 7), Dark);
        Wheel(root, "Pivot", hinge.localPosition, 9, Brass);
        var wheel = Wheel(root, "Pulley", new Vector3(45, 102, 4), 15, Steel);
        var weight = Group(root, "Hanging weight", new Vector3(52, 43, 4));
        Cylinder(weight, "Weight", Vector3.zero, 13, 12, Brass);
        var diagonal = Rod(root, "Thread", 1.3f, White);
        var drop = Rod(root, "Hanging thread", 1.3f, White);
        return t =>
        {
            float travel = Cycle(t);
            hinge.localRotation = Quaternion.Euler(0, 0, 24 + 16 * travel);
            weight.localPosition = new Vector3(52, 43 - 16 * travel, 4);
            wheel.localRotation = Quaternion.Euler(0, 0, 120 * travel);
            var end = hinge.localPosition + hinge.localRotation * new Vector3(0, -82, 0);
            Stretch(diagonal, end, wheel.localPosition);
            Stretch(drop, new Vector3(52, 102, 4), weight.localPosition + Vector3.up * 6);
        };
    }

    Action<float> PulleyTable(bool roller)
    {
        Box(root, "Tabletop", new Vector3(-10, 57, 0), new Vector3(127, 6, 55), Wood);
        foreach (int x in new[] { -65, 45 })
            foreach (int z in new[] { -21, 21 })
                Box(root, "Leg", new Vector3(x, 27, z), new Vector3(6, 54, 6), Wood);

        var load = Group(root, roller ? "Roller" : "Friction block", new Vector3(-45, 68, 0));
        if (roller)
        {
            var cylinder = Cylinder(load, "Roller body", Vector3.zero, 16, 29, Steel);
            cylinder.localRotation = Quaternion.Euler(90, 0, 0);
            Box(load, "Rotation marker", new Vector3(0, 8, 0), new Vector3(3, 1.5f, 26), Dark);
        }
        else
        {
            Box(load, "Block", Vector3.down * 2, new Vector3(26, 12, 22), Dark);
            Cylinder(load, "Added mass", Vector3.up * 8, 13, 8, Brass);
        }

        var pulley = Wheel(root, "Pulley", new Vector3(60, 61, 0), 15, Steel);
        var pan = Group(root, "Hanging pan", new Vector3(67, 39, 0));
        Cylinder(pan, "Pan", Vector3.zero, 26, 3, Steel);
        Cylinder(pan, "Slotted mass", Vector3.up * 4, 9, 5, Brass);
        var line = Rod(root, "Table cord", 1, White);
        var drop = Rod(root, "Hanging cord", 1, White);
        foreach (int side in new[] { -1, 1 })
            Stretch(Rod(pan, "Pan hanger", 1, Steel), new Vector3(0, 12, 0), new Vector3(0, 1, side * 11));

        return t =>
        {
            float travel = 22 * Cycle(t);
            load.localPosition = new Vector3(-45 + travel, 68, 0);
            if (roller)
                load.localRotation = Quaternion.Euler(0, 0, -travel / 8 * Mathf.Rad2Deg);
            pan.localPosition = new Vector3(67, 39 - travel, 0);
            pulley.localRotation = Quaternion.Euler(0, 0, -travel / 7.5f * Mathf.Rad2Deg);
            Stretch(line, load.localPosition + Vector3.right * (roller ? 0 : 12), new Vector3(60, 68, 0));
            Stretch(drop, new Vector3(67, 61, 0), pan.localPosition + Vector3.up * 12);
        };
    }

    Action<float> Pendulum()
    {
        Stand(-45, 119);
        Box(root, "Support arm", new Vector3(-22, 118, 0), new Vector3(54, 5, 6), Steel);
        var pivot = Group(root, "Pendulum pivot", new Vector3(2, 115, 0));
        Stretch(Rod(pivot, "Pendulum thread", 1.4f, White), Vector3.zero, Vector3.down * 85);
        Shape(pivot, "Bob", PrimitiveType.Sphere, Vector3.down * 85, Vector3.one * 17, Brass);
        return t => pivot.localRotation = Quaternion.Euler(0, 0, 28 * Mathf.Sin(t * 3.8f));
    }

    Action<float> Spring()
    {
        Stand(-45, 125);
        Box(root, "Clamp", new Vector3(-22, 120, 0), new Vector3(54, 5, 7), Dark);
        Box(root, "Ruler", new Vector3(26, 67, 7), new Vector3(10, 111, 3), White);
        for (int mark = 0; mark <= 10; mark++)
            Box(root, "Ruler mark", new Vector3(24, 18 + 10 * mark, 5), new Vector3(mark % 5 == 0 ? 7 : 4, 1, 1), Dark);

        var coil = Group(root, "Spring coil", new Vector3(0, 117, 0));
        const int segments = 48;
        var previous = new Vector3(5, 0, 0);
        for (int step = 1; step <= segments; step++)
        {
            float angle = step * 12 * Mathf.PI / segments;
            var point = new Vector3(5 * Mathf.Cos(angle), -42f * step / segments, 5 * Mathf.Sin(angle));
            Stretch(Rod(coil, "Spring wire", 1.7f, Steel), previous, point);
            previous = point;
        }

        var load = Group(root, "Hanging masses", Vector3.zero);
        Cylinder(load, "Mass", Vector3.zero, 19, 11, Dark);
        Cylinder(load, "Added mass", Vector3.up * 7, 15, 4, Brass);
        Box(load, "Pointer", new Vector3(12, 9, 0), new Vector3(21, 1.7f, 2), Red);
        return t =>
        {
            float extension = 18 * Cycle(t);
            coil.localScale = new Vector3(1, 1 + extension / 42, 1);
            load.localPosition = new Vector3(0, 67 - extension, 0);
        };
    }

    Action<float> Buoyancy()
    {
        Stand(-50, 126);
        Box(root, "Scale clamp", new Vector3(-23, 122, 0), new Vector3(58, 5, 6), Steel);
        var scale = Group(root, "Spring scale", new Vector3(0, 105, 0));
        Wheel(scale, "Dial rim", Vector3.zero, 27, Dark);
        Wheel(scale, "Dial face", Vector3.back * 2.5f, 23, White);
        var needle = Group(scale, "Apparent weight needle", Vector3.back * 5);
        Box(needle, "Needle", Vector3.up * 4, new Vector3(1.5f, 9, 1), Red);
        Cup(root, 0, 0, 31, 50, Glass);
        var water = Box(root, "Water level", new Vector3(0, 27, 7), new Vector3(56, 38, 29), Blue);
        var mass = Cylinder(root, "Immersed mass", Vector3.zero, 16, 16, Brass);
        var cord = Rod(root, "Scale cord", 1.4f, Steel);
        return t =>
        {
            float lowered = Cycle(t);
            float immersion = Mathf.InverseLerp(0.50f, .94f, lowered);
            mass.localPosition = new Vector3(0, 73 - 39 * lowered, -13);
            Stretch(cord, scale.localPosition + new Vector3(0, -12, -5), mass.localPosition + Vector3.up * 8);
            needle.localRotation = Quaternion.Euler(0, 0, -65 + 43 * immersion);
            water.localScale = new Vector3(56, 38 + 5 * immersion, 29);
        };
    }

    Action<float> Syringe()
    {
        var body = Group(root, "Syringe", new Vector3(-7, 16, 0));
        body.localRotation = Quaternion.Euler(0, 0, -90);
        Cylinder(body, "Nozzle", new Vector3(0, -43, 0), 5, 15, Steel);
        VesselWall(body, 0, -3, 11.5f, 65, Glass);
        Cylinder(body, "Finger flange", new Vector3(0, 30, 0), 34, 3, White);
        var plunger = Group(body, "Plunger", Vector3.up * 52);
        Cylinder(plunger, "Plunger rod", Vector3.down * 16, 6, 44, Steel);
        Cylinder(plunger, "Thumb pad", Vector3.up * 6, 24, 4, White);
        var liquid = Cylinder(body, "Liquid column", new Vector3(0, -34, -2), 11, 1, Blue);
        for (int mark = 0; mark <= 10; mark++)
            Box(body, "Graduation", new Vector3(10, -27 + 5 * mark, -2), new Vector3(mark % 5 == 0 ? 7 : 4, .9f, 1), Dark);
        return t =>
        {
            float filled = Cycle(t);
            plunger.localPosition = Vector3.up * (32 + 25 * filled);
            liquid.localScale = new Vector3(11, 2 + 20 * filled, 11);
            liquid.localPosition = new Vector3(0, -32 + liquid.localScale.y, -2);
        };
    }

    Action<float> Calorimeter()
    {
        Cup(root, -43, 10, 23, 45, Steel);
        Box(root, "Boiler stand", new Vector3(-43, 4, 0), new Vector3(55, 8, 49), Dark);
        Box(root, "Wooden screen", new Vector3(-5, 44, 10), new Vector3(5, 88, 53), Wood);
        Cup(root, 41, 0, 27, 40, Steel);
        Box(root, "Water cutaway", new Vector3(41, 13, 7), new Vector3(45, 20, 23), Blue);
        Thermometer(root, -44, 26, -13, 60);
        var column = Thermometer(root, 51, 14, -9, 58);
        var sample = Cylinder(root, "Heated solid", Vector3.zero, 12, 15, Brass);
        var stirrer = Rod(root, "Stirrer", 2.7f, Steel);
        return t =>
        {
            float phase = Mathf.Repeat(t / 6, 1);
            float lift = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.12f, .32f, phase));
            float move = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.32f, .55f, phase));
            float dip = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.55f, .72f, phase));
            sample.localPosition = new Vector3(Mathf.Lerp(-42, 37, move), 36 + 63 * lift - 83 * dip, -13);
            SetColumn(column, 12 + 20 * dip, 16);
            var stir = 5 * dip * Mathf.Sin(t * 8);
            Stretch(stirrer, new Vector3(32 + stir, 11, -4), new Vector3(34, 60, -4));
        };
    }

    Action<float> Heating()
    {
        var columns = new Transform[3];
        for (int i = 0; i < columns.Length; i++)
        {
            int x = 50 * (i - 1);
            Cup(root, x, 12, 20, 39, Glass);
            Box(root, "Water cutaway", new Vector3(x, 30, 3), new Vector3(33, 25, 19), Blue);
            columns[i] = Thermometer(root, x, 19, -10, 54);
            Box(root, "Support", new Vector3(x, 4, 0), new Vector3(42, 7, 37), Dark);
        }
        var flame = Shape(root, "Burner flame", PrimitiveType.Sphere, new Vector3(50, 10, -3), new Vector3(8, 12, 8), Red);
        return t =>
        {
            SetColumn(columns[0], 13, 21);
            SetColumn(columns[1], 23, 21);
            SetColumn(columns[2], 27 + 15 * Cycle(t), 21);
            flame.localScale = new Vector3(8, 11 + 2 * Mathf.Sin(t * 14), 8);
        };
    }

    void Stand(float x, float height)
    {
        Box(root, "Stand base", new Vector3(x + 19, 4, 0), new Vector3(67, 8, 54), Dark);
        Cylinder(root, "Stand rod", new Vector3(x, height / 2, 0), 4, height, Steel);
    }

    void Cup(Transform parent, float x, float bottom, float radius, float height, Color32 color)
    {
        Cylinder(parent, "Vessel base", new Vector3(x, bottom + 3, 0), 2 * radius, 6, color);
        VesselWall(parent, x, bottom + height / 2, radius, height, color);
    }

    void VesselWall(Transform parent, float x, float centerY, float radius, float height, Color32 color)
    {
        // Open the front so the moving part and liquid remain visible on the camera side.
        const int panels = 8;
        for (int i = 0; i < panels; i++)
        {
            float angle = Mathf.Lerp(-75, 75, i / (panels - 1f));
            float rad = angle * Mathf.Deg2Rad;
            var position = new Vector3(x + radius * Mathf.Sin(rad), centerY, radius * Mathf.Cos(rad));
            Box(parent, "Vessel wall", position, new Vector3(radius * .41f, height, 2), color)
                .localRotation = Quaternion.Euler(0, angle, 0);
        }
    }

    Transform Thermometer(Transform parent, float x, float bottom, float z, float height)
    {
        Box(parent, "Thermometer backing", new Vector3(x, bottom + height / 2, z + 1), new Vector3(5, height, 3), White);
        Shape(parent, "Thermometer bulb", PrimitiveType.Sphere, new Vector3(x, bottom, z - 1), Vector3.one * 6, Red);
        return Box(parent, "Thermometer column", new Vector3(x, bottom, z - 1), Vector3.one, Red);
    }

    static void SetColumn(Transform column, float height, float bottom)
    {
        var position = column.localPosition;
        position.y = bottom + height / 2;
        column.localPosition = position;
        column.localScale = new Vector3(2, height, 1.5f);
    }

    Transform Wheel(Transform parent, string name, Vector3 position, float diameter, Color32 color)
    {
        var axle = Group(parent, name, position);
        Cylinder(axle, "Wheel", Vector3.zero, diameter, 4, color).localRotation = Quaternion.Euler(90, 0, 0);
        Box(axle, "Spoke", new Vector3(0, diameter * .2f, -2.5f), new Vector3(1.2f, diameter * .35f, 1), Dark);
        return axle;
    }

    Transform Rod(Transform parent, string name, float diameter, Color32 color) =>
        Cylinder(parent, name, Vector3.zero, diameter, 1, color);

    static void Stretch(Transform rod, Vector3 start, Vector3 end)
    {
        var axis = end - start;
        rod.localPosition = (start + end) * .5f;
        rod.localRotation = Quaternion.FromToRotation(Vector3.up, axis);
        var scale = rod.localScale;
        scale.y = axis.magnitude * .5f;
        rod.localScale = scale;
    }

    Transform Box(Transform parent, string name, Vector3 position, Vector3 size, Color32 color) =>
        Shape(parent, name, PrimitiveType.Cube, position, size, color);

    Transform Cylinder(Transform parent, string name, Vector3 position, float diameter, float height, Color32 color) =>
        Shape(parent, name, PrimitiveType.Cylinder, position, new Vector3(diameter, height / 2, diameter), color);

    Transform Shape(Transform parent, string name, PrimitiveType primitive, Vector3 position, Vector3 size, Color32 color)
    {
        var shape = GameObject.CreatePrimitive(primitive);
        shape.name = name;
        shape.transform.SetParent(parent, false);
        shape.transform.localPosition = position;
        shape.transform.localScale = size;
        shape.GetComponent<Renderer>().sharedMaterial = material(color);
        var collider = shape.GetComponent<Collider>();
        UnityEngine.Object.DestroyImmediate(collider);
        return shape.transform;
    }

    static Transform Group(Transform parent, string name, Vector3 position)
    {
        var group = new GameObject(name).transform;
        group.SetParent(parent, false);
        group.localPosition = position;
        return group;
    }

    static float Cycle(float seconds) => (1 - Mathf.Cos(seconds * Mathf.PI / 2)) * .5f;
}
