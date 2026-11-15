using System;

public static class Class10Book
{
    public const string Database = "Vuforia/AR_class_10.xml";
    public const string BookTitle = "Physics Practical Journal - Class X (Sindh Textbook Board)";
    public const string SourcePdfName = "837751091-10th-Class-Physics-Practical-Book-1.pdf";
    public const string SourceSha256 = "54edcba64137eab28f6500bcd862088abd0f6dd4220496a465b6e53857c5ad39";

    [Serializable]
    public sealed class Entry
    {
        public int Number;
        public string TargetName;
        public string Title;
        public int PdfPage;
        public int PrintedPage;
        public float WidthMeters;
        public string[] Steps;

        public Entry(int number, string targetName, string title, int pdfPage, int printedPage,
            float widthMeters, params string[] steps)
        {
            Number = number; TargetName = targetName; Title = title;
            PdfPage = pdfPage; PrintedPage = printedPage; WidthMeters = widthMeters; Steps = steps;
        }
    }

    public static readonly Entry[] Entries =
    {
        new Entry(1, "glass_slab_refraction_no_watermark", "Refraction through a glass slab", 9, 2, .10f,
            "Trace the glass slab and draw an incident ray", "Place two pins along the incident ray",
            "Align two emergent pins; trace the refracted ray", "Measure i and r; compare sin i / sin r"),
        new Entry(2, "referencematerial_14", "Refractive index of water with a concave mirror", 11, 4, .18f,
            "Place the concave mirror horizontally", "Adjust the needle until its image has no parallax",
            "Add water; find the new no-parallax position", "Compare the real and apparent radii of curvature"),
        new Entry(3, "prism_total_reflection_no_watermark", "Critical angle of glass", 14, 7, .10f,
            "Trace the prism and mark a normal", "Send a ray into the glass through the first face",
            "Adjust until the emergent ray grazes the surface", "Measure the critical angle inside the glass"),
        new Entry(4, "prism_diagram_enhanced", "Deviation of light through a prism", 15, 8, .18f,
            "Trace the triangular prism and an incident ray", "Align pins with the emergent ray",
            "Draw the refracted path and measure deviation", "Repeat at different angles; find minimum deviation"),
        new Entry(5, "referencematerial_16", "Focal length of a convex lens by parallax", 17, 10, .18f,
            "Place the lens and object pin on a scale", "Move the search pin to the image position",
            "Remove parallax between the image and search pin", "Measure p and q; calculate f = p q / (p + q)"),
        new Entry(6, "referencematerial_17", "Astronomical telescope", 19, 12, .18f,
            "Choose a long-focus objective and short-focus eyepiece", "Align both lenses on a common axis",
            "Adjust their separation to focus a distant object", "Compare magnification with f objective / f eyepiece"),
        new Entry(7, "referencematerial_18", "Compound microscope", 21, 14, .18f,
            "Place a small object on the microscope stage", "Focus the short-focus objective near the object",
            "Adjust the eyepiece to view the intermediate image", "Observe the enlarged final image"),
        new Entry(8, "referencematerial_19", "Verify Ohm's law", 23, 16, .18f,
            "Connect the ammeter in series with the resistance", "Connect the voltmeter across the resistance",
            "Close the key; vary current with the rheostat", "Record V and I; check that V / I stays constant"),
        new Entry(9, "referencematerial_20", "Resistors in series", 26, 19, .18f,
            "Connect the two resistors in one series path", "Place the ammeter in series and voltmeter across both",
            "Close the key and record voltage and current", "Compare V / I with R1 + R2"),
        new Entry(10, "parallel_circuit_no_watermark", "Resistors in parallel", 28, 21, .15f,
            "Connect the resistors across the same two nodes", "Apply the same voltage to all branches",
            "Observe current splitting between the branches", "Check 1 / R = 1 / R1 + 1 / R2 + 1 / R3"),
        new Entry(11, "referencematerial_22", "Galvanometer resistance by half deflection", 30, 23, .18f,
            "Connect a high series resistance and galvanometer", "Close the main key and note the deflection",
            "Close the shunt key; adjust for half deflection", "Use the series and shunt resistances to calculate G"),
        new Entry(12, "referencematerial_24", "Magnetic field of a bar magnet", 33, 26, .18f,
            "Place a bar magnet on a sheet of paper", "Place the plotting compass near its north pole",
            "Mark successive compass directions around the magnet", "Trace field lines from north to south outside the magnet")
    };

    public static bool IsTarget(string name) => Array.Exists(Entries, entry => entry.TargetName == name);
}
