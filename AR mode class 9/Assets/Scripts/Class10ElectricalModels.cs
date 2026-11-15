using System;
using TMPro;
using UnityEngine;

public sealed partial class Class10ExperimentModel
{
    Action<float> OhmsLaw()
    {
        EBench();
        var source = ESource(new Vector3(-55, 0, 35));
        var key = EKey("Main key", new Vector3(-9, 0, 36));
        var rheostat = ERheostat("Rheostat", new Vector3(46, 0, 35));
        var ammeter = EMeter("Ammeter", new Vector3(-47, 0, -36), "A");
        var voltmeter = EMeter("Voltmeter", new Vector3(44, 0, -36), "V");
        var wire = Group(root, "Test wire", new Vector3(0, 0, -2));
        Box(wire, "Wire support", new Vector3(0, 4, 0), new Vector3(43, 3, 12), White);
        EPost(wire, new Vector3(-17, 7, 0), Red);
        EPost(wire, new Vector3(17, 7, 0), Dark);
        Rod(wire, "Conductor", new Vector3(-17, 8, 0), new Vector3(17, 8, 0), .8f, Steel);
        EText(wire, "6 ohm", new Vector3(0, 5.8f, -3), 22).localRotation = Quaternion.Euler(90, 0, 0);
        var left = new Vector3(-17, 8, -2);
        var right = new Vector3(17, 8, -2);
        ELead("Source to key", Red, source.positive, new Vector3(-49, 6, 21), new Vector3(-16, 6, 21), key.left);
        ELead("Key to rheostat", Red, key.right, new Vector3(14, 7, 36), rheostat.left);
        ELead("Rheostat to ammeter", Wire, rheostat.right, new Vector3(73, 8, 35), new Vector3(73, 7, -53), new Vector3(-57, 7, -53), ammeter.positive);
        ELead("Ammeter to conductor", Red, ammeter.negative, new Vector3(-34, 6, -44), new Vector3(-34, 8, -2), left);
        ELead("Conductor return", Wire, right, new Vector3(28, 8, -2), new Vector3(28, 7, 17), new Vector3(-42, 7, 17), source.negative);
        ELead("Voltage positive", Red, left, new Vector3(-17, 8, -16), new Vector3(34, 7, -16), voltmeter.positive);
        ELead("Voltage negative", Wire, right, new Vector3(60, 7, -2), new Vector3(60, 6, -44), voltmeter.negative);
        var flowPath = new[] { source.positive, new Vector3(-49, 6, 21), new Vector3(-16, 6, 21), key.left, key.right,
            new Vector3(14, 7, 36), rheostat.left, rheostat.right, new Vector3(73, 8, 35), new Vector3(73, 7, -53),
            new Vector3(-57, 7, -53), ammeter.positive, ammeter.negative, new Vector3(-34, 6, -44), new Vector3(-34, 8, -2),
            left, right, new Vector3(28, 8, -2), new Vector3(28, 7, 17), new Vector3(-42, 7, 17), source.negative };
        var flow = Sphere(root, "Conventional current", source.positive, Vector3.one * .001f, Yellow);
        Mark(source.body, "DC source"); Mark(key.body, "Circuit key"); Mark(rheostat.body, "Variable rheostat");
        Mark(rheostat.slider, "Rheostat slider"); Mark(wire, "Test wire: 6 ohm"); Mark(ammeter.body, "Ammeter in series"); Mark(voltmeter.body, "Voltmeter across the wire");
        return t =>
        {
            float closed = EProgress(t, 1, 3), change = EProgress(t, 3, 9);
            ECloseKey(key.blade, closed);
            rheostat.slider.localPosition = new Vector3(Mathf.Lerp(-14, 14, change), 0, 0);
            float current = closed * 3 / (6 + Mathf.Lerp(24, 1.5f, change));
            ENeedle(ammeter.needle, current / .5f);
            ENeedle(voltmeter.needle, current * 6 / 3);
            EFlow(flow, flowPath, t, 3, 10);
        };
    }

    Action<float> SeriesCircuit()
    {
        EBench();
        var source = ESource(new Vector3(-55, 0, 35));
        var key = EKey("Main key", new Vector3(-9, 0, 36));
        var rheostat = ERheostat("Rheostat", new Vector3(46, 0, 35));
        var ammeter = EMeter("Ammeter", new Vector3(-47, 0, -36), "A");
        var voltmeter = EMeter("Voltmeter", new Vector3(44, 0, -36), "V");
        var first = EResistor("R1", new Vector3(-18, 8, -1), 2);
        var second = EResistor("R2", new Vector3(18, 8, -1), 4);
        var left = new Vector3(-33, 8, -1);
        var right = new Vector3(33, 8, -1);
        ELead("Source to key", Red, source.positive, new Vector3(-49, 7, 20), new Vector3(-16, 7, 20), key.left);
        ELead("Key to rheostat", Red, key.right, rheostat.left);
        ELead("Rheostat to ammeter", Wire, rheostat.right, new Vector3(73, 8, 35), new Vector3(73, 7, -53), new Vector3(-57, 7, -53), ammeter.positive);
        ELead("Ammeter to R1", Red, ammeter.negative, new Vector3(-37, 7, -44), new Vector3(-37, 8, -1), left);
        ELead("Series junction", Wire, new Vector3(-3, 8, -1), new Vector3(3, 8, -1));
        ELead("R2 return", Wire, right, new Vector3(36, 8, 17), new Vector3(-42, 7, 17), source.negative);
        ELead("Voltage across series positive", Red, left, new Vector3(-33, 8, -16), new Vector3(34, 7, -16), voltmeter.positive);
        ELead("Voltage across series negative", Wire, right, new Vector3(60, 8, -1), new Vector3(60, 7, -44), voltmeter.negative);
        var path = new[] { left, new Vector3(-3, 8, -1), new Vector3(3, 8, -1), right };
        var flow = Sphere(root, "Same current through R1 and R2", left, Vector3.one * .001f, Yellow);
        Mark(source.body, "DC source"); Mark(key.body, "Circuit key"); Mark(rheostat.body, "Rheostat");
        Mark(first, "R1: 2 ohm"); Mark(second, "R2: 4 ohm"); Mark(ammeter.body, "Series-current ammeter"); Mark(voltmeter.body, "Voltage across R1 + R2");
        return t =>
        {
            float closed = EProgress(t, 1, 3), change = EProgress(t, 3, 9);
            ECloseKey(key.blade, closed);
            rheostat.slider.localPosition = new Vector3(Mathf.Lerp(-14, 14, change), 0, 0);
            float current = closed * 3 / (2 + 4 + Mathf.Lerp(24, 4, change));
            ENeedle(ammeter.needle, current / .5f);
            ENeedle(voltmeter.needle, current * (2 + 4) / 3);
            EFlow(flow, path, t, 3, 10);
        };
    }

    Action<float> ParallelCircuit()
    {
        EBench();
        var source = ESource(new Vector3(49, 0, 45));
        var key = EKey("Main key", new Vector3(-40, 0, 46));
        var ammeter = EMeter("Total-current ammeter", new Vector3(-65, 0, 2), "A");
        var voltmeter = EMeter("Common-voltage voltmeter", new Vector3(0, 0, -45), "V");
        var resistors = new Transform[3];
        var flows = new Transform[3];
        var branchPaths = new Vector3[3][];
        int[] resistance = { 2, 3, 4 };
        ELead("Positive rail", Red, new Vector3(-42, 8, -24), new Vector3(-42, 8, 24));
        ELead("Negative rail", Wire, new Vector3(42, 8, -24), new Vector3(42, 8, 24));
        for (int i = 0; i < 3; i++)
        {
            float z = 24 - i * 24;
            resistors[i] = EResistor("R" + (i + 1), new Vector3(0, 8, z), resistance[i]);
            branchPaths[i] = new[] { new Vector3(-42, 8, z), new Vector3(-15, 8, z), new Vector3(15, 8, z), new Vector3(42, 8, z) };
            ELead("Branch " + (i + 1) + " input", Red, branchPaths[i][0], branchPaths[i][1]);
            ELead("Branch " + (i + 1) + " return", Wire, branchPaths[i][2], branchPaths[i][3]);
            flows[i] = Sphere(root, "Branch " + (i + 1) + " current", branchPaths[i][0], Vector3.one * .001f, Yellow);
        }
        ELead("Source to key", Red, source.positive, new Vector3(55, 7, 55), new Vector3(-47, 7, 55), key.left);
        ELead("Key to ammeter", Red, key.right, new Vector3(-75, 7, 46), new Vector3(-75, 7, -6), ammeter.positive);
        ELead("Ammeter to branch junction", Red, ammeter.negative, new Vector3(-42, 8, -6));
        ELead("Parallel return", Wire, new Vector3(42, 8, 24), new Vector3(72, 8, 24), new Vector3(72, 5, 31), source.negative);
        ELead("Voltage positive", Red, new Vector3(-42, 8, -24), new Vector3(-42, 7, -50), voltmeter.positive);
        ELead("Voltage negative", Wire, new Vector3(42, 8, -24), new Vector3(42, 7, -50), voltmeter.negative);
        Mark(source.body, "DC source: 2 V example"); Mark(key.body, "Circuit key");
        for (int i = 0; i < 3; i++) Mark(resistors[i], "R" + (i + 1) + ": " + resistance[i] + " ohm");
        Mark(ammeter.body, "Total current: I1 + I2 + I3"); Mark(voltmeter.body, "Common branch voltage");
        return t =>
        {
            float closed = EProgress(t, 1, 3);
            ECloseKey(key.blade, closed);
            float voltage = 2 * closed;
            float totalCurrent = voltage / 2 + voltage / 3 + voltage / 4;
            ENeedle(ammeter.needle, totalCurrent / 3);
            ENeedle(voltmeter.needle, voltage / 3);
            for (int i = 0; i < flows.Length; i++) EFlow(flows[i], branchPaths[i], t, 3, 9);
        };
    }

    Action<float> Galvanometer()
    {
        EBench();
        var source = ESource(new Vector3(-55, 0, 40));
        var mainKey = EKey("Main key K1", new Vector3(-9, 0, 40));
        var shuntKey = EKey("Shunt key K2", new Vector3(48, 0, -44));
        var resistance = Group(root, "Series resistance R", new Vector3(47, 0, 35));
        Box(resistance, "Resistance box", new Vector3(0, 8, 0), new Vector3(36, 12, 22), Wood);
        for (int i = 0; i < 3; i++) Cylinder(resistance, "Resistance plug " + i, new Vector3(-10 + i * 10, 16, 0), 5, 4, Brass);
        EPost(resistance, new Vector3(-21, 5, 0), Red); EPost(resistance, new Vector3(21, 5, 0), Dark);
        var galvanometer = EMeter("Galvanometer G", new Vector3(0, 0, -9), "G");
        var shunt = ERheostat("Adjustable shunt S", new Vector3(0, 0, -44));
        ELead("Source to K1", Red, source.positive, new Vector3(-49, 7, 24), new Vector3(-16, 7, 24), mainKey.left);
        ELead("K1 to series resistance", Red, mainKey.right, new Vector3(26, 5, 35));
        ELead("Resistance to G", Red, new Vector3(68, 5, 35), new Vector3(75, 7, 24), new Vector3(-34, 7, 24), new Vector3(-34, 7, -17), galvanometer.positive);
        ELead("G return", Wire, galvanometer.negative, new Vector3(23, 7, -17), new Vector3(23, 7, 17), new Vector3(-42, 7, 17), source.negative);
        ELead("Shunt input", Red, galvanometer.positive, new Vector3(-31, 7, -17), new Vector3(-31, 7, -44), shunt.left);
        ELead("Shunt to K2", Wire, shunt.right, shuntKey.left);
        ELead("Shunt return", Wire, shuntKey.right, new Vector3(67, 7, -44), new Vector3(67, 7, -27), new Vector3(10, 7, -27), galvanometer.negative);
        var mainFlow = Sphere(root, "Galvanometer current", galvanometer.positive, Vector3.one * .001f, Yellow);
        var splitFlow = Sphere(root, "Diverted shunt current", shunt.left, Vector3.one * .001f, Green);
        Mark(source.body, "DC source"); Mark(mainKey.body, "Main key K1"); Mark(resistance, "High series resistance R");
        Mark(galvanometer.body, "Galvanometer G"); Mark(shunt.body, "Adjustable shunt S"); Mark(shuntKey.body, "Shunt key K2"); Mark(galvanometer.needle, "Deflection falls to one half");
        return t =>
        {
            float closed = EProgress(t, 1, 3), shunted = EProgress(t, 6, 9);
            ECloseKey(mainKey.blade, closed); ECloseKey(shuntKey.blade, EProgress(t, 5, 6));
            shunt.slider.localPosition = new Vector3(Mathf.Lerp(-14, 14, shunted), 0, 0);
            ENeedle(galvanometer.needle, .8f * closed * (1 - .5f * shunted));
            EFlow(mainFlow, new[] { galvanometer.positive, galvanometer.negative }, t, 3, 10);
            EFlow(splitFlow, new[] { shunt.left, shunt.right, shuntKey.left, shuntKey.right, new Vector3(67, 7, -44),
                new Vector3(67, 7, -27), new Vector3(10, 7, -27), galvanometer.negative }, t, 6, 10);
        };
    }

    Action<float> MagneticField()
    {
        EBench();
        var magnet = Group(root, "Bar magnet", new Vector3(0, 9, 0));
        var south = Box(magnet, "South pole", new Vector3(-15, 0, 0), new Vector3(30, 12, 18), Blue);
        var north = Box(magnet, "North pole", new Vector3(15, 0, 0), new Vector3(30, 12, 18), Red);
        EText(magnet, "S", new Vector3(-17, 6.2f, 0), 45).localRotation = Quaternion.Euler(90, 0, 0);
        EText(magnet, "N", new Vector3(17, 6.2f, 0), 45).localRotation = Quaternion.Euler(90, 0, 0);
        Transform firstLine = null, outerLine = null;
        foreach (int side in new[] { -1, 1 })
            for (int curve = 0; curve < 3; curve++)
            {
                float reach = side * (26 + curve * 18);
                var line = new GameObject("External field " + side + " " + curve).AddComponent<LineRenderer>();
                line.transform.SetParent(root, false); line.useWorldSpace = false;
                line.positionCount = 25; line.startWidth = line.endWidth = .0007f;
                line.sharedMaterial = material(Blue);
                for (int i = 0; i < line.positionCount; i++) line.SetPosition(i, EFieldPoint(i / 24f, reach));
                for (int arrow = 1; arrow <= 3; arrow++)
                {
                    float u = arrow / 4f;
                    var point = EFieldPoint(u, reach);
                    var direction = (EFieldPoint(u + .01f, reach) - EFieldPoint(u - .01f, reach)).normalized;
                    var cross = Vector3.Cross(direction, Vector3.up);
                    Rod(root, "Field arrow " + side + " " + curve + " " + arrow + " a", point, point - direction * 3 + cross * 1.7f, .65f, Blue);
                    Rod(root, "Field arrow " + side + " " + curve + " " + arrow + " b", point, point - direction * 3 - cross * 1.7f, .65f, Blue);
                }
                if (!firstLine) firstLine = line.transform;
                outerLine = line.transform;
            }
        var compass = Group(root, "Tracing compass", Vector3.zero);
        Cylinder(compass, "Compass case", Vector3.zero, 15, 3, Brass);
        Cylinder(compass, "Compass dial", Vector3.up * 1.8f, 13, .5f, White);
        var needle = Group(compass, "Compass needle", Vector3.up * 2.8f);
        Box(needle, "North seeking end", Vector3.right * 2.8f, new Vector3(6, .8f, 1.4f), Red);
        Box(needle, "South seeking end", Vector3.left * 2.8f, new Vector3(6, .8f, 1.4f), Blue);
        Sphere(needle, "Compass pivot", Vector3.up * .5f, Vector3.one * 1.5f, Dark);
        var marks = Group(root, "Traced field points", Vector3.zero);
        var dots = new Transform[9];
        for (int i = 0; i < dots.Length; i++) dots[i] = Sphere(marks, "Marked point " + i, EFieldPoint((i + 1) / 10f, 62), Vector3.one * .001f, Dark);
        Mark(north, "North pole N"); Mark(south, "South pole S"); Mark(compass, "Tracing compass");
        Mark(needle, "North-seeking compass needle"); Mark(firstLine, "External field: N to S"); Mark(outerLine, "Curved magnetic field line"); Mark(marks, "Compass trace marks");
        return t =>
        {
            float travel = Mathf.Lerp(.08f, .92f, EProgress(t, 3, 10));
            compass.localPosition = EFieldPoint(travel, 62) + Vector3.up;
            var direction = EFieldPoint(travel + .01f, 62) - EFieldPoint(travel - .01f, 62);
            needle.localRotation = Quaternion.Euler(0, -Mathf.Atan2(direction.z, direction.x) * Mathf.Rad2Deg, 0);
            for (int i = 0; i < dots.Length; i++) dots[i].localScale = Vector3.one * (t >= 3 && travel >= (i + 1) / 10f ? 1.5f : .001f);
        };
    }

    void EBench()
    {
        Box(root, "Laboratory board", Vector3.up, new Vector3(172, 2, 120), Wood);
        Box(root, "Insulated bench surface", new Vector3(0, 2.2f, 0), new Vector3(168, .4f, 116), White);
    }

    (Transform body, Vector3 positive, Vector3 negative) ESource(Vector3 position)
    {
        var body = Group(root, "DC power supply", position);
        Box(body, "Power supply housing", new Vector3(0, 13, 0), new Vector3(32, 24, 24), Dark);
        Box(body, "Power supply face", new Vector3(0, 14, -12.6f), new Vector3(29, 18, 1), Steel);
        Cylinder(body, "Voltage control", new Vector3(-8, 14, -14), 7, 3, Dark).localRotation = Quaternion.Euler(90, 0, 0);
        EPost(body, new Vector3(6, 5, -14), Red); EPost(body, new Vector3(13, 5, -14), Dark);
        EText(body, "DC", new Vector3(6, 20, -13.3f), 24);
        return (body, position + new Vector3(6, 5, -14), position + new Vector3(13, 5, -14));
    }

    (Transform body, Transform blade, Vector3 left, Vector3 right) EKey(string name, Vector3 position)
    {
        var body = Group(root, name, position);
        Box(body, "Key base", new Vector3(0, 4, 0), new Vector3(21, 5, 14), Wood);
        EPost(body, new Vector3(-7, 7, 0), Brass); EPost(body, new Vector3(7, 7, 0), Brass);
        var blade = Group(body, "Knife lever", new Vector3(-7, 7, 0));
        Rod(blade, "Conducting blade", Vector3.zero, Vector3.right * 14, 1.4f, Brass);
        Box(blade, "Insulated handle", Vector3.right * 11, new Vector3(6, 4, 5), Dark);
        return (body, blade, position + new Vector3(-7, 7, 0), position + new Vector3(7, 7, 0));
    }

    (Transform body, Transform slider, Vector3 left, Vector3 right) ERheostat(string name, Vector3 position)
    {
        var body = Group(root, name, position);
        Box(body, "Rheostat base", new Vector3(0, 5, 0), new Vector3(49, 5, 17), Dark);
        Cylinder(body, "Resistance winding", new Vector3(0, 10, 0), 8, 36, Steel).localRotation = Quaternion.Euler(0, 0, 90);
        for (int i = 0; i < 10; i++) Cylinder(body, "Winding turn " + i, new Vector3(-16 + i * 3.5f, 10, 0), 8.7f, .6f, Wire).localRotation = Quaternion.Euler(0, 0, 90);
        Rod(body, "Slider rail", new Vector3(-23, 16, -3), new Vector3(23, 16, -3), 1.4f, Brass);
        var slider = Group(body, "Slider", Vector3.zero);
        Box(slider, "Slider contact", new Vector3(0, 13, -1.5f), new Vector3(5, 8, 8), Red);
        EPost(body, new Vector3(-23, 8, 0), Red); EPost(body, new Vector3(23, 16, -3), Dark);
        return (body, slider, position + new Vector3(-23, 8, 0), position + new Vector3(23, 16, -3));
    }

    (Transform body, Transform needle, Vector3 positive, Vector3 negative) EMeter(string name, Vector3 position, string symbol)
    {
        var body = Group(root, name, position);
        Box(body, "Meter housing", new Vector3(0, 12, 0), new Vector3(31, 23, 12), Dark);
        Box(body, "White dial", new Vector3(0, 13, -6.6f), new Vector3(27, 19, 1), White);
        for (int i = 0; i < 9; i++)
        {
            float angle = Mathf.Lerp(-65, 65, i / 8f) * Mathf.Deg2Rad;
            var axis = new Vector3(Mathf.Sin(angle), Mathf.Cos(angle), 0);
            Rod(body, "Scale tick " + i, new Vector3(0, 8, -7.3f) + axis * 10.2f, new Vector3(0, 8, -7.3f) + axis * 12, .5f, Wire);
        }
        var needle = Group(body, "Needle pivot", new Vector3(0, 8, -7.8f));
        Rod(needle, "Needle", Vector3.zero, Vector3.up * 10.5f, .6f, Red);
        Sphere(needle, "Needle axle", Vector3.zero, Vector3.one * 2, Dark);
        EPost(body, new Vector3(-10, 3, -8), Red); EPost(body, new Vector3(10, 3, -8), Dark);
        EText(body, symbol, new Vector3(0, 5, -8.2f), 28);
        return (body, needle, position + new Vector3(-10, 3, -8), position + new Vector3(10, 3, -8));
    }

    Transform EResistor(string name, Vector3 position, int value)
    {
        var resistor = Group(root, name, position);
        Cylinder(resistor, "Resistor body", Vector3.zero, 4.5f, 18, new Color32(215, 193, 149, 255)).localRotation = Quaternion.Euler(0, 0, 90);
        var bands = new[] { value == 2 ? Red : value == 3 ? new Color32(230, 126, 34, 255) : Yellow, Dark, Brass, Brass };
        for (int i = 0; i < bands.Length; i++) Cylinder(resistor, "Resistor band " + i, new Vector3(-6 + i * 4, 0, 0), 4.8f, 1.4f, bands[i]).localRotation = Quaternion.Euler(0, 0, 90);
        Rod(resistor, "Left lead", Vector3.left * 15, Vector3.left * 9, .9f, Steel);
        Rod(resistor, "Right lead", Vector3.right * 9, Vector3.right * 15, .9f, Steel);
        EText(resistor, value + " ohm", new Vector3(0, -3, -6), 22).localRotation = Quaternion.Euler(90, 0, 0);
        return resistor;
    }

    void EPost(Transform parent, Vector3 position, Color32 color)
    {
        Cylinder(parent, "Terminal base " + position, position, 3.3f, 2, Dark);
        Sphere(parent, "Terminal cap " + position, position + Vector3.up * 1.2f, Vector3.one * 2.8f, color);
    }

    Transform EText(Transform parent, string value, Vector3 position, float fontSize)
    {
        var text = new GameObject(value).AddComponent<TextMeshPro>();
        text.transform.SetParent(parent, false); text.transform.localPosition = position;
        text.font = TMP_Settings.defaultFontAsset;
        text.text = value; text.fontSize = fontSize; text.color = Dark;
        text.alignment = TextAlignmentOptions.Center; text.rectTransform.sizeDelta = new Vector2(32, 7);
        text.ForceMeshUpdate();
        return text.transform;
    }

    void ELead(string name, Color32 color, params Vector3[] points)
    {
        var lead = Group(root, name, Vector3.zero);
        for (int i = 1; i < points.Length; i++) Rod(lead, "Wire segment " + i, points[i - 1], points[i], 1.2f, color);
    }

    static void ECloseKey(Transform blade, float closed) => blade.localRotation = Quaternion.Euler(0, 0, 38 * (1 - closed));
    static void ENeedle(Transform needle, float fraction) => needle.localRotation = Quaternion.Euler(0, 0, Mathf.Lerp(65, -65, Mathf.Clamp01(fraction)));
    static float EProgress(float time, float start, float end) => Mathf.SmoothStep(0, 1, Mathf.InverseLerp(start, end, time));

    static void EFlow(Transform marker, Vector3[] path, float time, float start, float end)
    {
        marker.localScale = Vector3.one * (time >= start ? 2.2f : .001f);
        float length = 0;
        for (int i = 1; i < path.Length; i++) length += Vector3.Distance(path[i - 1], path[i]);
        float remaining = length * EProgress(time, start, end);
        for (int i = 1; i < path.Length; i++)
        {
            float segment = Vector3.Distance(path[i - 1], path[i]);
            if (remaining <= segment) { marker.localPosition = Vector3.Lerp(path[i - 1], path[i], segment > .0001f ? remaining / segment : 0); return; }
            remaining -= segment;
        }
        marker.localPosition = path[path.Length - 1];
    }

    static Vector3 EFieldPoint(float t, float reach)
    {
        float u = 1 - t;
        return u * u * u * new Vector3(30, 4, 0) + 3 * u * u * t * new Vector3(90, 4, reach)
            + 3 * u * t * t * new Vector3(-90, 4, reach) + t * t * t * new Vector3(-30, 4, 0);
    }
}
