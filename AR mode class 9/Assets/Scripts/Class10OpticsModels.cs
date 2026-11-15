using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class Class10ExperimentModel
{
    Action<float> GlassSlab()
    {
        OpticsBoard("Refraction drawing board", 160, 112);
        Mark(Box(root, "Rectangular glass slab", new Vector3(0, 14, 0), new Vector3(50, 16, 42), Glass), "Glass slab");
        float incidence = 40 * Mathf.Deg2Rad;
        float refraction = Mathf.Asin(Mathf.Sin(incidence) / 1.5f);
        var direction = new Vector3(Mathf.Sin(incidence), 0, Mathf.Cos(incidence));
        var entry = new Vector3(-12, 10, -21);
        var exit = entry + new Vector3(42 * Mathf.Tan(refraction), 0, 42);
        var start = entry - direction * 36;
        var end = exit + direction * 36;
        var firstPins = Mark(Group(root, "Incident alignment pins", Vector3.zero), "Incident pins P1 and P2");
        OpticsPin(firstPins, "P1", Vector3.Lerp(start, entry, .2f));
        OpticsPin(firstPins, "P2", Vector3.Lerp(start, entry, .8f));
        var lastPins = Mark(Group(root, "Emergent alignment pins", Vector3.zero), "Emergent pins P3 and P4");
        OpticsPin(lastPins, "P3", Vector3.Lerp(exit, end, .25f));
        OpticsPin(lastPins, "P4", Vector3.Lerp(exit, end, .85f));
        Mark(OpticsDashes(root, "Slab surface normal", entry + Vector3.back * 18, entry + Vector3.forward * 18, Dark), "Normal at entry");
        var incoming = Mark(Rod(root, "Incident ray", start, entry, .9f, Red), "Incident ray: i = 40 degrees");
        var internalRay = Mark(Rod(root, "Refracted ray", entry, exit, .9f, Yellow), "Ray bends toward the normal");
        var outgoing = Mark(Rod(root, "Emergent ray", exit, end, .9f, Blue), "Emergent ray is parallel");
        var undeviated = entry + direction * Vector3.Dot(end - entry, direction);
        OpticsDashes(root, "Undeviated incident direction", entry, entry + direction * 84, Dark);
        var displacement = Mark(Rod(root, "Lateral displacement", end, undeviated, .65f, Green), "Lateral displacement");
        return t =>
        {
            OpticsTrace(incoming, start, entry, OpticsProgress(t, 3, 5));
            OpticsTrace(internalRay, entry, exit, OpticsProgress(t, 5, 7));
            OpticsTrace(outgoing, exit, end, OpticsProgress(t, 7, 9));
            OpticsTrace(displacement, end, undeviated, OpticsProgress(t, 9, 11), .65f);
            lastPins.localScale = Vector3.one * Mathf.Max(.001f, OpticsProgress(t, 6, 9));
        };
    }

    Action<float> WaterIndex()
    {
        Box(root, "Wooden mirror platform", new Vector3(0, 4, 0), new Vector3(108, 8, 78), Wood);
        var stand = Mark(Rod(root, "Retort stand", new Vector3(-36, 8, 8), new Vector3(-36, 108, 8), 4, Dark), "Needle stand");
        Cylinder(root, "Mirror backing", new Vector3(0, 8, 0), 52, 3, Dark);
        Mark(OpticsDish(root, "Concave mirror", new Vector3(0, 9, 0), 25, 4), "Concave mirror: pole O");
        var ruler = Mark(Group(root, "Vertical metre rod", new Vector3(40, 0, 0)), "Metre rod");
        Box(ruler, "Metre rod face", new Vector3(0, 57, 0), new Vector3(8, 100, 3), White);
        for (int i = 0; i <= 10; i++)
            Box(ruler, "Rod graduation", new Vector3(-1, 9 + 9 * i, -1.7f), new Vector3(i % 5 == 0 ? 6 : 3, .65f, .5f), Dark);
        var needle = Mark(Group(root, "Adjustable parallax needle", new Vector3(-36, 87, 0)), "Parallax needle");
        Box(needle, "Sliding clamp", new Vector3(0, 0, 8), new Vector3(10, 6, 14), Red);
        Rod(needle, "Horizontal needle", Vector3.zero, new Vector3(36, 0, 0), 1, Steel);
        var dry = Mark(OpticsDashes(root, "Dry centre reference", new Vector3(-7, 87, -2), new Vector3(10, 87, -2), Dark), "Dry centre C: OC");
        var water = Mark(Cylinder(root, "Thin water film", new Vector3(0, 12, 0), 44, 1.5f, Glass), "Water film");
        var apparent = Mark(Sphere(root, "Apparent centre A", new Vector3(0, 67.5f, 0), Vector3.one * 2.5f, Green), "Apparent centre A: OA");
        var measurement = Mark(Rod(root, "Apparent radius measurement", new Vector3(17, 9, -5), new Vector3(17, 67.5f, -5), .7f, Blue), "Water index = OC / OA");
        Rod(root, "Dry radius measurement", new Vector3(10, 9, -5), new Vector3(10, 87, -5), .6f, Dark);
        return t =>
        {
            water.localScale = new Vector3(44, .75f * Mathf.Max(.001f, OpticsProgress(t, 3, 6)), 44);
            needle.localPosition = new Vector3(-36, Mathf.Lerp(87, 67.5f, OpticsProgress(t, 6, 9)), 0);
            apparent.localScale = Vector3.one * (2.5f * Mathf.Max(.001f, OpticsProgress(t, 6, 9)));
            OpticsTrace(measurement, new Vector3(17, 9, -5), new Vector3(17, 67.5f, -5), OpticsProgress(t, 9, 11), .7f);
        };
    }

    Action<float> CriticalAngle()
    {
        OpticsBoard("Critical-angle board", 160, 142);
        Mark(OpticsPrism("Critical-angle glass prism"), "Glass prism");
        var hit = new Vector3(12, 14, -22 + 28 * Mathf.Sqrt(3));
        var normal = new Vector3(Mathf.Sqrt(3) / 2, 0, .5f);
        Mark(OpticsDashes(root, "Glass-air surface normal", hit - normal * 20, hit + normal * 20, Dark), "Normal at glass-air face");
        var protractor = Mark(OpticsRing(root, "Protractor", new Vector3(hit.x, 6.8f, hit.z), 20, .55f, Dark), "Critical angle: about 41.8 degrees");
        protractor.localRotation = Quaternion.Euler(0, 0, 90);
        var source = Mark(Group(root, "Single-ray light box", Vector3.zero), "Light ray box");
        Box(source, "Ray box casing", Vector3.zero, new Vector3(14, 10, 16), Dark);
        Box(source, "Single slit", new Vector3(0, 0, 8.2f), new Vector3(1.4f, 7, .7f), Yellow);
        var incoming = Mark(Rod(root, "Ray entering glass", Vector3.zero, Vector3.forward, .9f, Red), "Ray enters the glass");
        var inside = Rod(root, "Internal incident ray", Vector3.zero, Vector3.forward, .9f, Yellow);
        var refracted = Mark(Rod(root, "Refracted ray in air", Vector3.zero, Vector3.forward, .9f, Blue), "Refracted ray approaches 90 degrees");
        var reflected = Mark(Rod(root, "Totally reflected ray", Vector3.zero, Vector3.forward, .9f, Green), "Total internal reflection");
        return t =>
        {
            float angle = Mathf.Lerp(35, 50, OpticsProgress(t, 3, 9)) * Mathf.Deg2Rad;
            float firstRefraction = Mathf.PI / 3 - angle;
            var glassDirection = new Vector3(Mathf.Sin(firstRefraction), 0, Mathf.Cos(firstRefraction));
            var entry = hit - glassDirection * ((hit.z + 22) / glassDirection.z);
            float airAngle = Mathf.Asin(1.5f * Mathf.Sin(firstRefraction));
            var airDirection = new Vector3(Mathf.Sin(airAngle), 0, Mathf.Cos(airAngle));
            source.localPosition = entry - airDirection * 30;
            source.localRotation = Quaternion.LookRotation(airDirection, Vector3.up);
            OpticsTrace(incoming, source.localPosition + airDirection * 8, entry, OpticsProgress(t, 3, 5));
            OpticsTrace(inside, entry, hit, OpticsProgress(t, 4, 6));
            float sine = 1.5f * Mathf.Sin(angle);
            var tangent = glassDirection - Vector3.Dot(glassDirection, normal) * normal;
            var outDirection = tangent * 1.5f + normal * Mathf.Sqrt(Mathf.Max(0, 1 - sine * sine));
            OpticsTrace(refracted, hit, hit + outDirection * 32, sine <= 1 ? OpticsProgress(t, 5, 6) : 0);
            var reflection = glassDirection - 2 * Vector3.Dot(glassDirection, normal) * normal;
            var leftNormal = new Vector3(-normal.x, 0, normal.z);
            float distance = (40 * normal.x - 22 * normal.z - Vector3.Dot(leftNormal, hit)) / Vector3.Dot(leftNormal, reflection);
            OpticsTrace(reflected, hit, hit + reflection * distance, sine > 1 ? OpticsProgress(t, 6, 9) : 0);
        };
    }

    Action<float> PrismDeviation()
    {
        OpticsBoard("Prism tracing board", 166, 126);
        Mark(OpticsPrism("Equilateral glass prism"), "Glass prism");
        float halfDeviation = Mathf.Asin(.75f) - Mathf.PI / 6;
        var inDirection = new Vector3(Mathf.Cos(halfDeviation), 0, Mathf.Sin(halfDeviation));
        var outDirection = new Vector3(inDirection.x, 0, -inDirection.z);
        float x = 40 - 22 / Mathf.Sqrt(3);
        var entry = new Vector3(-x, 14, 0);
        var exit = new Vector3(x, 14, 0);
        var start = entry - inDirection * 45;
        var end = exit + outDirection * 45;
        var incidentPins = Mark(Group(root, "Prism incident pins", Vector3.zero), "Incident pins P and Q");
        OpticsPin(incidentPins, "P", Vector3.Lerp(start, entry, .15f));
        OpticsPin(incidentPins, "Q", Vector3.Lerp(start, entry, .75f));
        var emergentPins = Mark(Group(root, "Prism emergent pins", Vector3.zero), "Emergent pins R and S");
        OpticsPin(emergentPins, "R", Vector3.Lerp(exit, end, .25f));
        OpticsPin(emergentPins, "S", Vector3.Lerp(exit, end, .85f));
        var incoming = Mark(Rod(root, "Prism incident ray", start, entry, .9f, Red), "Incident ray");
        var internalRay = Mark(Rod(root, "Prism refracted ray", entry, exit, .9f, Yellow), "Refracted ray inside glass");
        var outgoing = Mark(Rod(root, "Prism emergent ray", exit, end, .9f, Blue), "Emergent ray bends toward the base");
        var intersection = new Vector3(0, 14, x * Mathf.Tan(halfDeviation));
        OpticsDashes(root, "Incident ray produced", entry, intersection + inDirection * 40, Dark);
        OpticsDashes(root, "Emergent ray produced backward", intersection, exit, Dark);
        var deviation = Mark(Group(root, "Deviation angle arc", intersection), "Angle of deviation");
        for (int i = 0; i < 8; i++)
        {
            float a = Mathf.Lerp(-halfDeviation, halfDeviation, i / 8f);
            float b = Mathf.Lerp(-halfDeviation, halfDeviation, (i + 1) / 8f);
            Rod(deviation, "Deviation arc", new Vector3(18 * Mathf.Cos(a), 0, 18 * Mathf.Sin(a)), new Vector3(18 * Mathf.Cos(b), 0, 18 * Mathf.Sin(b)), .7f, Green);
        }
        return t =>
        {
            OpticsTrace(incoming, start, entry, OpticsProgress(t, 3, 5));
            OpticsTrace(internalRay, entry, exit, OpticsProgress(t, 5, 7));
            OpticsTrace(outgoing, exit, end, OpticsProgress(t, 7, 9));
            emergentPins.localScale = Vector3.one * Mathf.Max(.001f, OpticsProgress(t, 6, 9));
            deviation.localScale = Vector3.one * Mathf.Max(.001f, OpticsProgress(t, 9, 11));
        };
    }

    Action<float> ConvexLens()
    {
        Mark(OpticsBench(), "Optical bench and ruler");
        const float axis = 55, objectDistance = 50, focalLength = 20;
        float imageDistance = focalLength * objectDistance / (objectDistance - focalLength);
        Mark(OpticsLens("Convex lens L", new Vector3(0, axis, 0), 42), "Convex lens L");
        var objectPin = Mark(Group(root, "Object pin O", new Vector3(objectDistance, 0, 0)), "Object pin O");
        Rod(objectPin, "Object upright", new Vector3(0, 14, 0), new Vector3(0, axis + 12, 0), 1.2f, Steel);
        Box(objectPin, "Object pin slider", new Vector3(0, 14, 0), new Vector3(13, 6, 28), Red);
        OpticsArrow(objectPin, "Object arrow", new Vector3(0, axis, -2), 12, Red);
        var searchPin = Mark(Group(root, "Search pin I", new Vector3(-55, 0, 0)), "Search pin I");
        Rod(searchPin, "Image search needle", new Vector3(0, 14, 0), new Vector3(0, axis - 8, 0), 1.2f, Steel);
        Box(searchPin, "Search pin slider", new Vector3(0, 14, 0), new Vector3(13, 6, 28), Red);
        var image = Mark(OpticsArrow(root, "Real inverted image", new Vector3(-imageDistance, axis, 0), -8, Green), "Real inverted image");
        Mark(Sphere(root, "Lens focal point", new Vector3(-focalLength, axis, 0), Vector3.one * 2, Yellow), "Focal point F");
        var objectTip = new Vector3(objectDistance, axis + 12, 0);
        var imageTip = new Vector3(-imageDistance, axis - 8, 0);
        var upper = new Vector3(0, axis + 12, 0);
        var center = new Vector3(0, axis, 0);
        var incident = Mark(Group(root, "Incident lens rays", Vector3.zero), "Rays from the object");
        var ray1 = Rod(incident, "Parallel incident ray", objectTip, upper, .7f, Red);
        var ray2 = Rod(incident, "Central incident ray", objectTip, center, .7f, Red);
        var converging = Mark(Group(root, "Converging lens rays", Vector3.zero), "Converging rays");
        var ray3 = Rod(converging, "Ray through the focus", upper, imageTip, .7f, Blue);
        var ray4 = Rod(converging, "Undeviated central ray", center, imageTip, .7f, Blue);
        return t =>
        {
            searchPin.localPosition = new Vector3(Mathf.Lerp(-55, -imageDistance, OpticsProgress(t, 3, 6)), 0, 0);
            OpticsTrace(ray1, objectTip, upper, OpticsProgress(t, 3, 5), .7f);
            OpticsTrace(ray2, objectTip, center, OpticsProgress(t, 3, 5), .7f);
            OpticsTrace(ray3, upper, imageTip, OpticsProgress(t, 5, 8), .7f);
            OpticsTrace(ray4, center, imageTip, OpticsProgress(t, 5, 8), .7f);
            image.localScale = Vector3.one * Mathf.Max(.001f, OpticsProgress(t, 6, 9));
        };
    }

    Action<float> Telescope()
    {
        Mark(OpticsBench(), "Optical bench");
        const float axis = 65, objectiveX = -36, objectiveF = 54, eyeF = 18, incomingSlope = -.12f;
        const float focusX = objectiveX + objectiveF;
        Mark(OpticsLens("Telescope objective", new Vector3(objectiveX, axis, 0), 36), "Objective: long focal length");
        var eye = Mark(OpticsLens("Telescope eyepiece", new Vector3(43, axis, 0), 30), "Eyepiece: short focal length");
        float imageHeight = incomingSlope * objectiveF;
        var image = Mark(OpticsArrow(root, "Intermediate inverted image", new Vector3(focusX, axis, 0), imageHeight, Green), "Real inverted intermediate image");
        Mark(Rod(root, "Common focal-plane needle", new Vector3(focusX, 14, 3), new Vector3(focusX, axis + imageHeight, 3), 1, Steel), "Shared focal plane Fo and Fe");
        var incident = Mark(Group(root, "Distant-object parallel rays", Vector3.zero), "Parallel rays from a distant object");
        var emerging = Mark(Group(root, "Telescope emerging rays", Vector3.zero), "Parallel emerging rays");
        var converging = Group(root, "Objective converging rays", Vector3.zero);
        var rays = new Transform[3, 3];
        for (int i = 0; i < 3; i++)
        {
            rays[i, 0] = Rod(incident, "Incoming telescope ray", Vector3.zero, Vector3.right, .65f, Red);
            rays[i, 1] = Rod(converging, "Objective telescope ray", Vector3.zero, Vector3.right, .65f, Yellow);
            rays[i, 2] = Rod(emerging, "Eyepiece telescope ray", Vector3.zero, Vector3.right, .65f, Blue);
        }
        return t =>
        {
            float eyeX = Mathf.Lerp(43, focusX + eyeF, OpticsProgress(t, 3, 6));
            eye.localPosition = new Vector3(eyeX, axis, 0);
            for (int i = 0; i < 3; i++)
            {
                float height = (i - 1) * 12;
                var first = new Vector3(objectiveX, axis + height, 0);
                var start = new Vector3(-78, first.y + incomingSlope * (-78 - objectiveX), 0);
                float slope = incomingSlope - height / objectiveF;
                var second = new Vector3(eyeX, first.y + slope * (eyeX - objectiveX), 0);
                float outSlope = slope - (second.y - axis) / eyeF;
                var end = new Vector3(78, second.y + outSlope * (78 - eyeX), 0);
                OpticsTrace(rays[i, 0], start, first, OpticsProgress(t, 3, 5), .65f);
                OpticsTrace(rays[i, 1], first, second, OpticsProgress(t, 5, 7), .65f);
                OpticsTrace(rays[i, 2], second, end, OpticsProgress(t, 7, 9), .65f);
            }
            image.localScale = Vector3.one * Mathf.Max(.001f, OpticsProgress(t, 6, 9));
        };
    }

    Action<float> Microscope()
    {
        Box(root, "Microscope foot", new Vector3(0, 4, 0), new Vector3(88, 8, 60), Dark);
        Rod(root, "Microscope pillar", new Vector3(30, 8, 13), new Vector3(32, 73, 13), 11, Dark);
        Rod(root, "Microscope upper arm", new Vector3(32, 73, 13), new Vector3(14, 93, 13), 10, Dark);
        Rod(root, "Microscope tube support", new Vector3(14, 93, 13), new Vector3(0, 93, 6), 9, Dark);
        var knob = Mark(Cylinder(root, "Fine-focus knob", new Vector3(32, 70, 2), 14, 7, Brass), "Focusing knob");
        knob.localRotation = Quaternion.Euler(90, 0, 0);
        var stage = Mark(Group(root, "Specimen stage", Vector3.zero), "Specimen and glass slide");
        foreach (float x in new[] { -18f, 18f })
            Box(stage, "Stage wing", new Vector3(x, 28, 0), new Vector3(22, 4, 38), Dark);
        Box(stage, "Stage back", new Vector3(0, 28, 16), new Vector3(58, 4, 7), Dark);
        Box(stage, "Glass slide", new Vector3(0, 30.5f, 0), new Vector3(43, 1, 13), Glass);
        OpticsArrow(stage, "Small specimen arrow", new Vector3(0, 31, 0), 2.5f, Red, true);
        var mirror = Mark(Sphere(root, "Illuminating mirror", new Vector3(0, 15, 0), new Vector3(25, 2, 25), Steel), "Illuminating mirror");
        mirror.localRotation = Quaternion.Euler(0, 0, -24);
        Rod(root, "Illumination path", new Vector3(0, 17, 0), new Vector3(0, 30, 0), .8f, Yellow);
        var objective = Mark(Group(root, "Microscope objective", new Vector3(0, 45, 0)), "Short-focus objective lens");
        Sphere(objective, "Objective glass", Vector3.zero, new Vector3(18, 2, 18), Glass);
        OpticsRing(objective, "Objective rim", Vector3.zero, 10, 1.1f, Brass).localRotation = Quaternion.Euler(0, 0, 90);
        var eyepiece = Mark(Group(root, "Microscope eyepiece", new Vector3(0, 92, 0)), "Eyepiece magnifies the image");
        Sphere(eyepiece, "Eyepiece glass", Vector3.zero, new Vector3(28, 2.5f, 28), Glass);
        OpticsRing(eyepiece, "Eyepiece rim", Vector3.zero, 15, 1.4f, Dark).localRotation = Quaternion.Euler(0, 0, 90);
        // The open front of the tube exposes the two lenses and the ray path.
        for (int i = 0; i <= 6; i++)
        {
            float angle = Mathf.PI * i / 6;
            var lower = new Vector3(13 * Mathf.Cos(angle), 48, 13 * Mathf.Sin(angle));
            Rod(root, "Cutaway body tube", lower, new Vector3(lower.x, 89, lower.z), 2, Brass);
        }
        var intermediate = Mark(OpticsArrow(root, "Real intermediate image", new Vector3(0, 79, 0), -7.5f, Green, true), "Real inverted intermediate image");
        var virtualImage = Mark(OpticsArrow(root, "Magnified virtual image", new Vector3(0, 45.2f, -1), -27, Blue, true), "Magnified virtual image");
        var rays = new Transform[2, 3];
        for (int i = 0; i < 2; i++)
        {
            rays[i, 0] = Rod(root, "Microscope object ray", Vector3.zero, Vector3.up, .6f, Red);
            rays[i, 1] = Rod(root, "Microscope objective ray", Vector3.zero, Vector3.up, .6f, Yellow);
            rays[i, 2] = Rod(root, "Microscope eye ray", Vector3.zero, Vector3.up, .6f, Blue);
        }
        var backRays = new Transform[2, 5];
        for (int i = 0; i < 2; i++)
            for (int d = 0; d < 5; d++)
                backRays[i, d] = Rod(root, "Virtual-image back projection", Vector3.zero, Vector3.up, .4f, Blue);
        return t =>
        {
            float objectiveY = Mathf.Lerp(45, 43, OpticsProgress(t, 3, 6));
            objective.localPosition = new Vector3(0, objectiveY, 0);
            knob.localRotation = Quaternion.Euler(90, 0, 240 * OpticsProgress(t, 3, 6));
            float u = objectiveY - 31;
            float v = 9 * u / (u - 9);
            float imageY = objectiveY + v;
            float imageX = -2.5f * v / u;
            intermediate.localPosition = new Vector3(0, imageY, 0);
            OpticsPoseArrow(intermediate, imageX, OpticsProgress(t, 5, 8));
            const float eyeY = 92, eyeF = 18;
            float objectToEye = eyeY - imageY;
            // Show the virtual image only after the image lies within the eyepiece focal length.
            float virtualProgress = objectToEye < eyeF && t >= 6 ? OpticsProgress(t, 6, 9) : 0;
            float virtualDistance = eyeF * objectToEye / Mathf.Min(-.001f, objectToEye - eyeF);
            float virtualX = -virtualDistance / objectToEye * imageX;
            float virtualY = eyeY + virtualDistance;
            if (virtualProgress == 0) { virtualX = -27; virtualY = 45.2f; }
            virtualImage.localPosition = new Vector3(0, virtualY, -1);
            OpticsPoseArrow(virtualImage, virtualX, virtualProgress);
            var objectTip = new Vector3(2.5f, 31, 0);
            for (int i = 0; i < 2; i++)
            {
                var first = new Vector3(i == 0 ? 2.5f : 0, objectiveY, 0);
                float slope = i == 0 ? -2.5f / 9 : -2.5f / u;
                var second = new Vector3(first.x + slope * (eyeY - objectiveY), eyeY, 0);
                float outSlope = slope - second.x / eyeF;
                var end = new Vector3(second.x + outSlope * 18, eyeY + 18, 0);
                OpticsTrace(rays[i, 0], objectTip, first, OpticsProgress(t, 3, 5), .6f);
                OpticsTrace(rays[i, 1], first, second, OpticsProgress(t, 5, 7), .6f);
                OpticsTrace(rays[i, 2], second, end, OpticsProgress(t, 7, 9), .6f);
                var virtualTip = new Vector3(virtualX, virtualY, 0);
                for (int d = 0; d < 5; d++)
                    OpticsTrace(backRays[i, d], Vector3.Lerp(virtualTip, second, d / 5f), Vector3.Lerp(virtualTip, second, (d + .55f) / 5), virtualProgress, .4f);
            }
        };
    }

    static float OpticsProgress(float t, float start, float end) => Mathf.SmoothStep(0, 1, Mathf.InverseLerp(start, end, t));

    static void OpticsTrace(Transform ray, Vector3 start, Vector3 end, float progress, float width = .9f)
    {
        progress = Mathf.Clamp01(progress);
        float diameter = width * Mathf.Max(.001f, Mathf.Min(1, progress * 8));
        ray.localScale = new Vector3(diameter, .5f, diameter);
        Stretch(ray, start, Vector3.Lerp(start, end, Mathf.Max(.001f, progress)));
    }

    Transform OpticsBoard(string name, float width, float depth)
    {
        var board = Group(root, name, Vector3.zero);
        Box(board, "Drawing board", new Vector3(0, 2.5f, 0), new Vector3(width, 5, depth), Wood);
        Box(board, "White paper", new Vector3(0, 5.4f, 0), new Vector3(width - 6, .8f, depth - 6), White);
        return board;
    }

    Transform OpticsBench()
    {
        var bench = Group(root, "Optical bench", Vector3.zero);
        Box(bench, "Bench base", new Vector3(0, 4, 0), new Vector3(164, 8, 46), Wood);
        foreach (float z in new[] { -10f, 10f })
            Rod(bench, "Sliding rail", new Vector3(-77, 12, z), new Vector3(77, 12, z), 2.5f, Steel);
        Box(bench, "Bench ruler", new Vector3(0, 8.7f, -23), new Vector3(154, 1, 7), White);
        for (int i = 0; i <= 20; i++)
            Box(bench, "Bench graduation", new Vector3(-74 + 7.4f * i, 9.4f, -23), new Vector3(.5f, .4f, i % 5 == 0 ? 6 : 3), Dark);
        return bench;
    }

    Transform OpticsLens(string name, Vector3 position, float diameter)
    {
        var lens = Group(root, name, position);
        Sphere(lens, "Convex glass", Vector3.zero, new Vector3(3.5f, diameter, diameter), Glass);
        OpticsRing(lens, "Lens mount", Vector3.zero, diameter / 2 + 1.2f, 1.2f, Dark);
        Rod(lens, "Lens upright", new Vector3(0, 14 - position.y, 0), new Vector3(0, -diameter / 2, 0), 3, Steel);
        Box(lens, "Lens slider", new Vector3(0, 14 - position.y, 0), new Vector3(14, 5, 29), Red);
        return lens;
    }

    void OpticsPin(Transform parent, string name, Vector3 at)
    {
        var pin = Group(parent, name, new Vector3(at.x, 6, at.z));
        Rod(pin, "Pin shaft", Vector3.zero, Vector3.up * 22, .7f, Steel);
        Sphere(pin, "Pin head", Vector3.up * 22, Vector3.one * 2.2f, Red);
    }

    Transform OpticsDashes(Transform parent, string name, Vector3 start, Vector3 end, Color32 color)
    {
        var group = Group(parent, name, Vector3.zero);
        for (int i = 0; i < 6; i++)
            Rod(group, "Dashed reference", Vector3.Lerp(start, end, i / 6f), Vector3.Lerp(start, end, (i + .55f) / 6), .5f, color);
        return group;
    }

    Transform OpticsArrow(Transform parent, string name, Vector3 position, float height, Color32 color, bool horizontal = false)
    {
        var arrow = Group(parent, name, position);
        if (horizontal) arrow.localRotation = Quaternion.Euler(0, 0, -90);
        for (int i = 0; i < 3; i++) Rod(arrow, "Arrow", Vector3.zero, Vector3.up, .7f, color);
        OpticsPoseArrow(arrow, height, 1);
        return arrow;
    }

    static void OpticsPoseArrow(Transform arrow, float height, float progress)
    {
        float shownHeight = height * Mathf.Max(.001f, progress);
        var tip = Vector3.up * shownHeight;
        var shoulder = Vector3.up * (shownHeight * .72f);
        float width = Mathf.Abs(shownHeight) * .22f;
        OpticsTrace(arrow.GetChild(0), Vector3.zero, tip, 1, .7f * Mathf.Max(.001f, progress));
        OpticsTrace(arrow.GetChild(1), tip, shoulder + Vector3.right * width, 1, .7f * Mathf.Max(.001f, progress));
        OpticsTrace(arrow.GetChild(2), tip, shoulder - Vector3.right * width, 1, .7f * Mathf.Max(.001f, progress));
    }

    Transform OpticsPrism(string name)
    {
        var shape = Box(root, name, Vector3.up * 6, Vector3.one, Glass);
        float top = -22 + 40 * Mathf.Sqrt(3);
        var corners = new[]
        {
            new Vector3(-40, 0, -22), new Vector3(40, 0, -22), new Vector3(0, 0, top),
            new Vector3(-40, 16, -22), new Vector3(40, 16, -22), new Vector3(0, 16, top)
        };
        int[] triangles = { 0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0 };
        var vertices = new Vector3[triangles.Length];
        var indices = new int[triangles.Length];
        for (int i = 0; i < triangles.Length; i++) { vertices[i] = corners[triangles[i]]; indices[i] = i; }
        var mesh = new Mesh { name = "Class10 " + name, vertices = vertices, triangles = indices };
        mesh.RecalculateNormals(); mesh.RecalculateBounds();
        shape.GetComponent<MeshFilter>().sharedMesh = mesh;
        for (int i = 0; i < 3; i++)
        {
            Rod(root, "Prism upper edge", corners[i + 3] + Vector3.up * 6, corners[(i + 1) % 3 + 3] + Vector3.up * 6, .65f, Blue);
            Rod(root, "Prism vertical edge", corners[i] + Vector3.up * 6, corners[i + 3] + Vector3.up * 6, .65f, Blue);
        }
        return shape;
    }

    Transform OpticsRing(Transform parent, string name, Vector3 position, float radius, float thickness, Color32 color)
    {
        const int segments = 24, sides = 6;
        var vertices = new Vector3[segments * sides];
        var triangles = new List<int>(segments * sides * 6);
        for (int i = 0; i < segments; i++)
            for (int j = 0; j < sides; j++)
            {
                float a = 2 * Mathf.PI * i / segments, b = 2 * Mathf.PI * j / sides;
                float r = radius + thickness * Mathf.Cos(b);
                vertices[i * sides + j] = new Vector3(thickness * Mathf.Sin(b), r * Mathf.Cos(a), r * Mathf.Sin(a));
                int n = ((i + 1) % segments) * sides, next = (j + 1) % sides;
                triangles.Add(i * sides + j); triangles.Add(n + j); triangles.Add(n + next);
                triangles.Add(i * sides + j); triangles.Add(n + next); triangles.Add(i * sides + next);
            }
        var mesh = new Mesh { name = "Class10 " + name, vertices = vertices, triangles = triangles.ToArray() };
        mesh.RecalculateNormals(); mesh.RecalculateBounds();
        var ring = Box(parent, name, position, Vector3.one, color);
        ring.GetComponent<MeshFilter>().sharedMesh = mesh;
        return ring;
    }

    Transform OpticsDish(Transform parent, string name, Vector3 position, float radius, float sag)
    {
        const int segments = 24, rings = 6;
        var vertices = new Vector3[1 + segments * rings];
        var triangles = new List<int>();
        for (int ring = 1; ring <= rings; ring++)
            for (int i = 0; i < segments; i++)
            {
                float r = radius * ring / rings, a = 2 * Mathf.PI * i / segments;
                vertices[1 + (ring - 1) * segments + i] = new Vector3(r * Mathf.Cos(a), sag * r * r / (radius * radius), r * Mathf.Sin(a));
                int here = 1 + (ring - 1) * segments + i, next = 1 + (ring - 1) * segments + (i + 1) % segments;
                if (ring == 1) { triangles.Add(0); triangles.Add(next); triangles.Add(here); }
                else
                {
                    int inner = here - segments, innerNext = next - segments;
                    triangles.Add(inner); triangles.Add(next); triangles.Add(here);
                    triangles.Add(inner); triangles.Add(innerNext); triangles.Add(next);
                }
            }
        var mesh = new Mesh { name = "Class10 concave mirror", vertices = vertices, triangles = triangles.ToArray() };
        mesh.RecalculateNormals(); mesh.RecalculateBounds();
        var dish = Box(parent, name, position, Vector3.one, Steel);
        dish.GetComponent<MeshFilter>().sharedMesh = mesh;
        return dish;
    }
}
