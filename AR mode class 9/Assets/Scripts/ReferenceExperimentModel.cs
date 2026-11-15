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
        Action<float> pose;
        switch (image)
        {
            case 4: return PulleyBoard();
            case 5: pose = PulleyTable(false); break;
            case 6: pose = PulleyTable(true); break;
            case 8: return Pendulum();
            case 9: pose = Spring(); break;
            case 10: pose = Buoyancy(); break;
            case 11: pose = Syringe(); break;
            case 12: return Calorimeter();
            case 13: return Heating();
            default: throw new ArgumentOutOfRangeException(nameof(image));
        }
        if (image == 9)
            return t => pose(2 * Mathf.SmoothStep(0, 1, t <= 6 ? Mathf.InverseLerp(3, 6, t) : 1 - Mathf.InverseLerp(6, 9, t)));
        // One procedure: prepare, move once, then hold the final reading.
        return t => pose(2 * Mathf.SmoothStep(0, 1, Mathf.InverseLerp(3, 9, t)));
    }

    public static float Duration(int image) => image == 8 ? 20 : 12;

    Action<float> PulleyBoard()
    {
        var cord = new Color32(32, 28, 23, 255);
        var pulleyColor = new Color32(219, 158, 120, 255);
        Box(root, "Foot", new Vector3(-23, 5, 14), new Vector3(76, 6, 33), Wood);
        foreach (float x in new[] { -47f, 1f })
            Cylinder(root, "Rubber foot", new Vector3(x, 1, 6), 8, 2, cord);
        Box(root, "Vertical board", new Vector3(-23, 65, 14), new Vector3(52, 115, 7), Wood);
        Box(root, "Pulley support", new Vector3(21, 92, 14), new Vector3(40, 9, 7), Wood);
        Box(root, "Lower support", new Vector3(10, 70, 14), new Vector3(14, 8, 7), Wood);
        for (int dash = 0; dash < 12; dash++)
            foreach (float x in new[] { -36.5f, -23.5f })
                Box(root, "Bar rest position", new Vector3(x, 16 + dash * 7, 10.3f), new Vector3(.5f, 3.5f, .3f), White);
        var hinge = Group(root, "Pivoted bar", new Vector3(-30, 98, 4));
        Box(hinge, "Bar edge", new Vector3(0, -42, 0), new Vector3(13, 84, 6), cord);
        Box(hinge, "Bar", new Vector3(.7f, -42, -3.2f), new Vector3(11.6f, 84, 1), Wood);
        var end = Shape(hinge, "Bar end B", PrimitiveType.Cylinder, new Vector3(0, -80, -4), new Vector3(3, .5f, 3), cord);
        end.localRotation = Quaternion.Euler(90, 0, 0);
        var first = Wheel(root, "Pulley P1", new Vector3(-39, 112, -4), 7.5f, pulleyColor);
        var second = Wheel(root, "Pulley P2", new Vector3(35, 92, -4), 7.5f, pulleyColor);
        var bob = Shape(root, "Falling bob", PrimitiveType.Sphere, new Vector3(-42.75f, 84, -4), Vector3.one * 10, new Color32(112, 119, 113, 255));
        var suspension = Rod(root, "Bob thread", .45f, cord);
        var thread = Rod(root, "Thread", .45f, cord);
        var tension = Rod(root, "Tension thread", .45f, cord);
        var firstRim = new Transform[8];
        var secondRim = new Transform[8];
        for (int i = 0; i < firstRim.Length; i++)
        {
            firstRim[i] = Rod(root, "P1 groove thread", .45f, cord);
            secondRim[i] = Rod(root, "P2 groove thread", .45f, cord);
        }
        Stretch(Rod(root, "Fall height", .35f, cord), new Vector3(-53, 84, -4), new Vector3(-53, 23, -4));
        foreach (float y in new[] { 84f, 23f })
            Stretch(Rod(root, "Height mark", .35f, cord), new Vector3(-55, y, -4), new Vector3(-48, y, -4));
        return t =>
        {
            float fall = Mathf.Clamp01((t - 6) / 1.5f);
            float swing = t >= 3 && t < 6 ? 3 * Mathf.Sin((t - 3) * 2 * Mathf.PI / 1.5f) : 0;
            hinge.localRotation = Quaternion.Euler(0, 0, 31 * (1 - Mathf.SmoothStep(0, 1, fall)) + swing);
            bob.localPosition = new Vector3(-42.75f, 84 - 61 * fall * fall, -4);
            Stretch(suspension, new Vector3(-42.75f, 112, -6.5f), bob.localPosition + Vector3.up * 5);
            suspension.localScale = new Vector3(t <= 6 ? .45f : .001f, suspension.localScale.y, t <= 6 ? .45f : .001f);
            var tip = hinge.localPosition + hinge.localRotation * end.localPosition;
            var axis = tip - second.localPosition;
            axis.z = 0;
            float tangent = Mathf.Atan2(axis.y, axis.x) + Mathf.Acos(3.75f / axis.magnitude);
            var top1 = RimPoint(first, 75 * Mathf.Deg2Rad);
            var top2 = RimPoint(second, 75 * Mathf.Deg2Rad);
            Stretch(thread, top1, top2);
            Stretch(tension, RimPoint(second, tangent), tip);
            for (int i = 0; i < firstRim.Length; i++)
            {
                Stretch(firstRim[i], RimPoint(first, Mathf.Lerp(180, 75, i / 8f) * Mathf.Deg2Rad), RimPoint(first, Mathf.Lerp(180, 75, (i + 1) / 8f) * Mathf.Deg2Rad));
                Stretch(secondRim[i], RimPoint(second, Mathf.Lerp(75 * Mathf.Deg2Rad, tangent, i / 8f)), RimPoint(second, Mathf.Lerp(75 * Mathf.Deg2Rad, tangent, (i + 1) / 8f)));
            }
        };

        Vector3 RimPoint(Transform wheel, float angle) => wheel.localPosition + new Vector3(3.75f * Mathf.Cos(angle), 3.75f * Mathf.Sin(angle), -2.5f);
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
        return t =>
        {
            // Ten small oscillations after the initial displacement; duration is illustrative.
            float angle = t < 3 ? 10 * Mathf.SmoothStep(0, 1, t / 3) : 10 * Mathf.Cos(2 * Mathf.PI * 10 * Mathf.Clamp01((t - 3) / 15));
            pivot.localRotation = Quaternion.Euler(0, 0, angle);
        };
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
        var addedWeights = new Transform[5];
        for (int i = 0; i < addedWeights.Length; i++)
            addedWeights[i] = Cylinder(load, "Additional weight", Vector3.up * (11 + 4 * i), 15, 3.5f, Brass);
        Box(load, "Pointer", new Vector3(12, 9, 0), new Vector3(21, 1.7f, 2), Red);
        return t =>
        {
            float extension = 18 * Cycle(t);
            for (int i = 0; i < addedWeights.Length; i++)
            {
                float visible = Cycle(t) >= (i + 1) / 6f ? 1 : .001f;
                addedWeights[i].localScale = new Vector3(15, 1.75f, 15) * visible;
            }
            coil.localScale = new Vector3(1, 1 + extension / 42, 1);
            load.localPosition = new Vector3(0, 67 - extension, 0);
        };
    }

    Action<float> Buoyancy()
    {
        var movingScale = new Transform[2];
        Transform needle = null;
        Transform collected = null;
        for (int i = 0; i < 2; i++)
        {
            float x = i == 0 ? -47 : 43;
            Cup(root, x, 0, 24, 43, Glass);
            VesselWall(root, x, 17, 22, 29, Blue);
            Stretch(Rod(root, "Overflow spout", 4, Glass), new Vector3(x + 23, 32, 0), new Vector3(x + 34, 29, 0));
            Cup(root, x + 37, 0, 11, 13, Glass);
            if (i == 1)
                collected = Cylinder(root, "Displaced water", new Vector3(x + 37, 4, 0), 19, 1, Blue);
            var scale = Group(root, i == 0 ? "Weight in air" : "Apparent weight", new Vector3(x, 103, -4));
            movingScale[i] = scale;
            Cylinder(scale, "Dial rim", Vector3.zero, 31, 5, Steel).localRotation = Quaternion.Euler(90, 0, 0);
            Cylinder(scale, "Dial face", Vector3.back * 3, 27, 1, White).localRotation = Quaternion.Euler(90, 0, 0);
            for (int tick = 0; tick < 40; tick++)
            {
                float angle = tick * Mathf.PI / 20;
                var mark = Box(scale, "Dial tick", new Vector3(12 * Mathf.Sin(angle), 12 * Mathf.Cos(angle), -4), new Vector3(.55f, tick % 5 == 0 ? 2.4f : 1.2f, .5f), Dark);
                mark.localRotation = Quaternion.Euler(0, 0, -tick * 9);
            }
            for (int n = 0; n < 10; n++)
            {
                float angle = n * Mathf.PI / 5;
                Caption(scale, n.ToString(), new Vector3(9 * Mathf.Sin(angle), 9 * Mathf.Cos(angle), -4.5f), 2.7f);
            }
            var pointer = Group(scale, "Scale needle", Vector3.back * 5);
            Box(pointer, "Needle", Vector3.down * 4, new Vector3(.9f, 9, .6f), Dark);
            Shape(pointer, "Needle hub", PrimitiveType.Sphere, Vector3.zero, Vector3.one * 2, Dark);
            Stretch(Rod(scale, "Suspension", 1.3f, Steel), new Vector3(0, -16, 0), new Vector3(0, -39, 0));
            Cylinder(scale, "Suspended mass", new Vector3(0, -44, 0), 11, 11, Steel);
            if (i == 1) needle = pointer;
        }
        return t =>
        {
            float immersion = Cycle(t);
            movingScale[1].localPosition = new Vector3(43, 103 - 39 * immersion, -4);
            needle.localRotation = Quaternion.Euler(0, 0, 72 * immersion);
            collected.localScale = new Vector3(19, .5f + 4 * immersion, 19);
            collected.localPosition = new Vector3(80, 3.5f + 4 * immersion, 0);
        };
    }

    Action<float> Syringe()
    {
        var plastic = new Color32(244, 246, 242, 255);
        var rubber = new Color32(33, 35, 39, 255);
        var clear = new Color32(190, 220, 230, 55);
        // The AR scenes have no lights; keep the plastic shading visible when this target is tracked.
        var light = Group(root, "Syringe lighting", Vector3.zero).gameObject.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.2f;
        light.transform.localRotation = Quaternion.Euler(35, -35, 0);
        var body = Group(root, "Syringe", new Vector3(0, 65, 0));
        body.localRotation = Quaternion.Euler(0, 0, -135);
        Revolve(body, "Syringe barrel", new[] { new Vector2(8.2f, -37), new Vector2(9, -37), new Vector2(9, 33), new Vector2(8.2f, 33) }, clear);
        Revolve(body, "Syringe nozzle", new[] { new Vector2(.7f, -49), new Vector2(1.8f, -49), new Vector2(2.6f, -41), new Vector2(8.9f, -37), new Vector2(8.2f, -36), new Vector2(.7f, -40) }, plastic);
        Revolve(body, "Syringe barrel rim", new[] { new Vector2(8.2f, 31), new Vector2(9.6f, 31), new Vector2(9.6f, 34), new Vector2(8.2f, 34) }, clear);
        var flange = Cylinder(body, "Finger flange", new Vector3(0, 34, 0), 1, 3, plastic);
        flange.localScale = new Vector3(33, 1.5f, 17);
        var plunger = Group(body, "Plunger", Vector3.zero);
        Revolve(plunger, "Syringe rubber piston", new[] { new Vector2(.01f, -3), new Vector2(7.5f, -3), new Vector2(8.1f, -2), new Vector2(8.1f, -1), new Vector2(7.6f, 0), new Vector2(8.1f, 1), new Vector2(8.1f, 2), new Vector2(7.5f, 3), new Vector2(.01f, 3) }, rubber);
        Box(plunger, "Plunger rib", Vector3.up * 35, new Vector3(10, 65, 1.8f), plastic);
        Box(plunger, "Plunger cross rib", Vector3.up * 35, new Vector3(1.8f, 65, 10), plastic);
        var pad = Cylinder(plunger, "Thumb pad", Vector3.up * 69, 1, 3, plastic);
        pad.localScale = new Vector3(25, 1.5f, 18);
        for (int mark = 0; mark <= 25; mark++)
        {
            float y = -30 + mark * 2.16f;
            Box(body, "Graduation", new Vector3(-1.8f, y, -9.1f), new Vector3(mark % 5 == 0 ? 8 : 4, .35f, .2f), rubber);
            if (mark % 5 == 0 && mark > 0)
                Caption(body, (mark / 5).ToString(), new Vector3(4.5f, y, -9.5f), 3.6f);
        }
        Caption(body, "ml", new Vector3(4, 28, -9.5f), 3);
        var liquid = Cylinder(body, "Syringe water", new Vector3(0, -34, 0), 15.8f, .1f, new Color32(80, 170, 215, 100));
        return t =>
        {
            float length = 54 * Cycle(t);
            plunger.localPosition = Vector3.up * (-29 + length);
            liquid.localPosition = new Vector3(0, -33 + length / 2, 0);
            liquid.localScale = new Vector3(15.8f, Mathf.Max(.05f, length / 2), 15.8f);
        };
    }

    void Revolve(Transform parent, string name, Vector2[] profile, Color32 color)
    {
        const int sides = 72;
        var vertices = new Vector3[profile.Length * (sides + 1)];
        var triangles = new int[profile.Length * sides * 6];
        for (int ring = 0; ring < profile.Length; ring++)
        {
            for (int side = 0; side <= sides; side++)
            {
                float angle = 2 * Mathf.PI * side / sides;
                vertices[ring * (sides + 1) + side] = new Vector3(profile[ring].x * Mathf.Cos(angle), profile[ring].y, profile[ring].x * Mathf.Sin(angle));
                if (side == sides) continue;
                int a = ring * (sides + 1) + side;
                int b = ((ring + 1) % profile.Length) * (sides + 1) + side;
                int index = (ring * sides + side) * 6;
                triangles[index] = a;
                triangles[index + 1] = b;
                triangles[index + 2] = a + 1;
                triangles[index + 3] = a + 1;
                triangles[index + 4] = b;
                triangles[index + 5] = b + 1;
            }
        }
        var mesh = new Mesh { name = name, vertices = vertices, triangles = triangles };
        mesh.RecalculateNormals();
        mesh.RecalculateBounds();
        var part = Group(parent, name, Vector3.zero).gameObject;
        part.AddComponent<MeshFilter>().sharedMesh = mesh;
        part.AddComponent<MeshRenderer>().sharedMaterial = material(color);
    }

    Action<float> Calorimeter()
    {
        Tripod(-51, 27, 20);
        Cup(root, -51, 28, 18, 19, Glass);
        Cylinder(root, "Boiler water", new Vector3(-51, 37.55f, 0), 32, 6.9f, new Color32(42, 149, 205, 80));
        VesselWall(root, -51, 72, 10, 56, Glass);
        Cylinder(root, "Hypsometer stopper", new Vector3(-51, 102, 0), 22, 7, Dark);
        var hotColumn = Thermometer(root, -51, 67, -2, 66);
        Stretch(Rod(root, "Steam outlet", 5, Glass), new Vector3(-60, 58, 0), new Vector3(-77, 46, 0));
        Box(root, "Wooden screen", new Vector3(-18, 60, 9), new Vector3(4, 120, 43), Wood);
        Cylinder(root, "Burner base", new Vector3(-51, 3, 0), 16, 5, Dark);
        Cylinder(root, "Burner tube", new Vector3(-51, 12, 0), 5, 15, Steel);
        Shape(root, "Burner flame", PrimitiveType.Sphere, new Vector3(-51, 22, 0), new Vector3(7, 12, 7), Brass);
        Cup(root, 31, 0, 22, 46, Glass);
        Cup(root, 31, 4, 15, 30, Steel);
        Cylinder(root, "Calorimeter water", new Vector3(31, 16.55f, 0), 27, 12.9f, new Color32(42, 149, 205, 80));
        // A cutaway lid leaves the thermometer, stirrer and sample visible.
        Box(root, "Lid rear", new Vector3(31, 38, 10), new Vector3(32, 3, 9), Steel);
        Cylinder(root, "Clamp stand", new Vector3(62, 45, 6), 3, 90, Steel);
        Box(root, "Clamp base", new Vector3(43, 2, 6), new Vector3(47, 4, 27), Dark);
        Stretch(Rod(root, "Thermometer clamp", 3, Steel), new Vector3(20, 83, 0), new Vector3(62, 83, 6));
        var column = Thermometer(root, 28, 13, -5, 82);
        var stirrer = Rod(root, "Stirrer", 2, Steel);
        Stretch(Rod(root, "Stirrer handle", 2, Steel), new Vector3(39, 63, -3), new Vector3(52, 68, -3));
        var sample = Cylinder(root, "Heated solid", Vector3.zero, 9, 12, Brass);
        var thread = Rod(root, "Sample thread", .7f, Dark);
        return t =>
        {
            float phase = Mathf.Clamp01(t / 12);
            float lift = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.25f, .40f, phase));
            float move = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.40f, .58f, phase));
            float dip = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(.58f, .75f, phase));
            SetColumn(hotColumn, 5 + 45 * Mathf.SmoothStep(0, 1, Mathf.InverseLerp(0, .25f, phase)), 67);
            float reset = 0;
            sample.localPosition = Vector3.Lerp(new Vector3(Mathf.Lerp(-51, 37, move), 70 + 60 * lift - 113.5f * dip, -4), new Vector3(-51, 70, -4), reset);
            Stretch(thread, sample.localPosition + Vector3.up * 6, sample.localPosition + Vector3.up * 25);
            SetColumn(column, 19 + 23 * dip * (1 - reset), 13);
            Stretch(stirrer, new Vector3(39 + 2 * dip * Mathf.Sin(t * 8), 11, -3), new Vector3(39, 63, -3));
        };
    }

    Action<float> Heating()
    {
        var columns = new Transform[3];
        var meltingIce = Group(root, "Melting ice", new Vector3(0, 47, -5));
        for (int piece = 0; piece < 4; piece++)
        {
            var position = new Vector3((piece % 2) * 14 - 7, (piece / 2) * 12, 0);
            Box(meltingIce, "Ice piece", position, Vector3.one * 11, White);
            Box(root, "Solid ice", position + new Vector3(-57, 47, -5), Vector3.one * 11, White);
        }
        var steam = Group(root, "Steam", new Vector3(57, 83, 0));
        for (int puff = 0; puff < 3; puff++)
            Shape(steam, "Vapour", PrimitiveType.Sphere, new Vector3((puff % 2) * 6, puff * 9, 0), new Vector3(5, 8, 5), White);
        for (int i = 0; i < columns.Length; i++)
        {
            int x = 57 * (i - 1);
            Tripod(x, 20, 22);
            Cup(root, x, 21, 23, 58, Glass);
            VesselWall(root, x, 46, 21, 43, Blue);
            columns[i] = Thermometer(root, x, 35, -16, 68);
            var outside = Thermometer(root, x + 27, 25, -1, 55);
            SetColumn(outside, i == 2 ? 25 : 9, 25);
        }
        Cylinder(root, "Burner base", new Vector3(57, 2, 0), 23, 4, Dark);
        var flame = Shape(root, "Burner flame", PrimitiveType.Sphere, new Vector3(57, 11, 0), new Vector3(13, 18, 11), Red);
        Shape(root, "Flame core", PrimitiveType.Sphere, new Vector3(57, 9, -3), new Vector3(7, 12, 7), Brass);
        return t =>
        {
            SetColumn(columns[0], 2, 35);
            SetColumn(columns[1], 20, 35);
            float melted = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(3, 6, t));
            float heated = Mathf.SmoothStep(0, 1, Mathf.InverseLerp(6, 10, t));
            meltingIce.localScale = Vector3.one * Mathf.Max(.001f, 1 - melted);
            SetColumn(columns[1], 2, 35);
            SetColumn(columns[2], 2 + 57 * heated, 35);
            steam.localScale = Vector3.one * Mathf.Max(.001f, Mathf.InverseLerp(10, 12, t));
            flame.localScale = new Vector3(13, 17 + 2 * Mathf.Sin(t * 14), 11);
        };
    }

    void Tripod(float x, float height, float radius)
    {
        Cylinder(root, "Stand top", new Vector3(x, height, 0), radius * 2, 3, Dark);
        for (int leg = 0; leg < 3; leg++)
        {
            float angle = leg * Mathf.PI * 2 / 3;
            Stretch(Rod(root, "Tripod leg", 2.6f, Steel),
                new Vector3(x + radius * Mathf.Cos(angle), 1, radius * Mathf.Sin(angle)),
                new Vector3(x + .8f * radius * Mathf.Cos(angle), height, .8f * radius * Mathf.Sin(angle)));
        }
    }

    void Caption(Transform parent, string value, Vector3 position, float height)
    {
        var text = new GameObject("Mark " + value).AddComponent<TMPro.TextMeshPro>();
        text.transform.SetParent(parent, false);
        text.transform.localPosition = position;
        text.rectTransform.sizeDelta = new Vector2(height * 3, height * 1.5f);
        text.font = TMPro.TMP_Settings.defaultFontAsset;
        text.fontSize = height * 10;
        text.alignment = TMPro.TextAlignmentOptions.Center;
        text.color = Dark;
        text.text = value;
        text.ForceMeshUpdate();
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
        const int panels = 32;
        for (int i = 0; i < panels; i++)
        {
            float angle = Mathf.Lerp(-75, 75, i / (panels - 1f));
            float rad = angle * Mathf.Deg2Rad;
            var position = new Vector3(x + radius * Mathf.Sin(rad), centerY, radius * Mathf.Cos(rad));
            Box(parent, "Vessel wall", position, new Vector3(radius * .088f, height, 1), color)
                .localRotation = Quaternion.Euler(0, angle, 0);
        }
    }

    Transform Thermometer(Transform parent, float x, float bottom, float z, float height)
    {
        Box(parent, "Thermometer outline", new Vector3(x, bottom + height / 2, z + 1.5f), new Vector3(5.8f, height + 1, 3), Steel);
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
