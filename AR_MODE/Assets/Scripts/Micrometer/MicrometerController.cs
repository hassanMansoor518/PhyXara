using System;
using UnityEngine;
using PhyXara.Bridge;

/// <summary>
/// Drives the micrometer screw gauge. Finds its nodes by name (SpindleAssembly, Rotor, Anvil, Hub)
/// and turns the Rotor about its long axis; the spindle assembly advances 0.5 mm per revolution.
/// AR_MODE had no MicrometerController when the bridge was added, so this is the minimal version.
/// If you have a fuller one, keep it and make it implement IExperimentController.
/// </summary>
public class MicrometerController : MonoBehaviour, IExperimentController
{
    const float PitchMm = 0.5f;      // spindle travel per revolution
    const float MaxMm = 25f;

    [Tooltip("Local axis of the Rotor that points along the spindle.")]
    public Vector3 rotationAxis = Vector3.right;
    [Tooltip("glTF is right-handed, Unity left-handed: tick this if the thimble turns the wrong way.")]
    public bool flipRotation;
    public float animationDegreesPerSecond = 90f;

    Transform spindleAssembly, rotor, anvil, hub;
    Vector3 spindleStart;
    float turns;          // revolutions
    bool animating, practical;
    string lang = "en";

    public event Action<string> StateChanged;
    public event Action<float, int, float> ReadoutChanged;

    public bool PracticalActive => practical;
    public string Language => lang;

    void Awake()
    {
        spindleAssembly = FindNode("SpindleAssembly");
        rotor = FindNode("Rotor");
        anvil = FindNode("Anvil");
        hub = FindNode("Hub");
        if (spindleAssembly == null || rotor == null)
            Debug.LogWarning("[MicrometerController] SpindleAssembly/Rotor not found under " + name);
        if (spindleAssembly != null) spindleStart = spindleAssembly.localPosition;
        if (FindNode("Wire") == null && anvil != null && hub != null) CreateWire();
    }

    Transform FindNode(string nodeName)
    {
        foreach (var t in GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }

    // thin cylinder between anvil and hub (the thing being measured)
    void CreateWire()
    {
        var c = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        c.name = "Wire";
        Destroy(c.GetComponent<Collider>());
        c.transform.SetParent(transform, false);
        var a = anvil.position;
        var h = hub.position;
        c.transform.position = (a + h) * 0.5f;
        c.transform.rotation = Quaternion.FromToRotation(Vector3.up, (h - a).normalized);
        var s = Mathf.Max(0.0001f, transform.lossyScale.x);
        c.transform.localScale = new Vector3(0.001f / s, (h - a).magnitude / s * 0.5f, 0.001f / s);
    }

    void Update()
    {
        if (!animating) return;
        turns += animationDegreesPerSecond / 360f * Time.deltaTime;
        if (turns >= MaxMm / PitchMm) turns = 0f;
        Apply();
    }

    /// <summary>For practical-mode input (thimble drag): change the turns by delta revolutions.</summary>
    public void AddTurns(float delta)
    {
        turns = Mathf.Clamp(turns + delta, 0f, MaxMm / PitchMm);
        Apply();
    }

    void Apply()
    {
        var dir = flipRotation ? -1f : 1f;
        if (rotor != null) rotor.localRotation = Quaternion.AngleAxis(dir * turns * 360f, rotationAxis);
        var mm = turns * PitchMm;
        if (spindleAssembly != null)
        {
            var s = Mathf.Max(0.0001f, transform.lossyScale.x);
            spindleAssembly.localPosition = spindleStart - rotationAxis * (mm * 0.001f / s);
        }
        var msr = Mathf.Floor(mm / PitchMm) * PitchMm;
        var csr = Mathf.RoundToInt((mm - msr) / 0.01f);
        ReadoutChanged?.Invoke(msr, csr, mm);
    }

    void SetState(string s) { StateChanged?.Invoke(s); }

    public void PlayAnimation() { animating = true; SetState("animation_playing"); }
    public void StopAnimation() { animating = false; SetState("animation_stopped"); }
    public void StartPractical() { practical = true; animating = false; turns = 0f; Apply(); SetState("practical_started"); }
    public void ResetPractical() { practical = false; animating = false; turns = 0f; Apply(); SetState("practical_reset"); }
    public void SetLanguage(string l) { lang = l; }
}
