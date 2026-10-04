using System;
using UnityEngine;
using PhyXara.Bridge;

/// <summary>
/// Working vernier caliper (least count 0.02 mm: 50 vernier divisions span 49 mm of the main scale).
/// The model is built by Assets/Editor/VernierCaliperBuilder.cs. Everything is computed in the prefab's local
/// space (metres), so the readings stay correct whatever scale RNBridge gives the model.
///
/// Contract mapping for readout messages:
///   msr     = main scale reading, whole millimetres just left of the vernier zero
///   csr     = vernier division (0..49) that lines up with a main scale mark; each division is 0.02 mm
///   totalMm = msr + csr * 0.02
/// </summary>
public class VernierCaliperController : MonoBehaviour, IExperimentController
{
    public const float LeastCountMm = 0.02f;
    public const float MaxOpeningMm = 150f;
    const float RodRevealStartMm = 0f;

    [Header("Parts (found by name when empty)")]
    public Transform slider;
    public Transform workpiece;

    [Header("Animation")]
    public float animationSpeedMmPerSec = 28f;
    public float animationOpenMm = 70f;
    public float animationWorkpieceMm = 23.46f;
    public float animationHoldSeconds = 1.6f;

    float openingMm;                 // jaw gap, 0 when the jaws touch
    float targetWidthMm;             // workpiece diameter, 0 = no workpiece
    bool animating, practical;
    int animPhase;                   // 0 opening, 1 closing, 2 holding
    float holdTimer;
    float lastQuantizedMm = -1f;
    Vector3 sliderStart;
    string lang = "en";

    public event Action<string> StateChanged;
    public event Action<float, int, float> ReadoutChanged;

    public bool PracticalActive => practical;
    public bool Animating => animating;
    public float OpeningMm => openingMm;
    public float TargetWidthMm => targetWidthMm;
    public string Language => lang;
    public bool Clamped => targetWidthMm > 0f && openingMm <= targetWidthMm + 0.0005f;

    void Awake()
    {
        if (slider == null) slider = FindNode("Slider");
        if (workpiece == null) workpiece = FindNode("Workpiece");
        if (slider != null) sliderStart = slider.localPosition;
        SetWorkpiece(0f);
        Apply(true);
    }

    Transform FindNode(string nodeName)
    {
        foreach (var t in GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }

    void Update()
    {
        if (!animating) return;

        switch (animPhase)
        {
            case 0:
                SetOpeningMm(openingMm + animationSpeedMmPerSec * Time.deltaTime);
                if (openingMm >= animationOpenMm - 0.001f) animPhase = 1;
                break;
            case 1:
                SetOpeningMm(openingMm - animationSpeedMmPerSec * Time.deltaTime);
                if (Clamped) { animPhase = 2; holdTimer = 0f; SetState("jaws_clamped"); }
                break;
            default:
                holdTimer += Time.deltaTime;
                if (holdTimer >= animationHoldSeconds) { animPhase = 0; SetState("animation_playing"); }
                break;
        }
    }

    // ------------------------------------------------------------------ public API

    /// <summary>Move the sliding jaw. The workpiece (if any) stops the jaws from closing past its width.</summary>
    public void SetOpeningMm(float mm)
    {
        var min = targetWidthMm > 0f ? targetWidthMm : 0f;
        openingMm = Mathf.Clamp(mm, min, MaxOpeningMm);
        Apply(false);
    }

    public void NudgeMm(float deltaMm) { SetOpeningMm(openingMm + deltaMm); }

    /// <summary>The reading a student would write down: whole mm, vernier division, total.</summary>
    public void GetReading(out float msr, out int vernierDivision, out float totalMm)
    {
        totalMm = Mathf.Round(openingMm / LeastCountMm) * LeastCountMm;
        msr = Mathf.Floor(totalMm + 1e-4f);
        vernierDivision = Mathf.Clamp(Mathf.RoundToInt((totalMm - msr) / LeastCountMm), 0, 49);
        totalMm = msr + vernierDivision * LeastCountMm;
    }

    // ------------------------------------------------------------------ IExperimentController

    public void PlayAnimation()
    {
        practical = false;
        animating = true;
        animPhase = 0;
        SetWorkpiece(animationWorkpieceMm);
        SetOpeningMm(animationWorkpieceMm + 2f);
        SetState("animation_playing");
    }

    public void StopAnimation()
    {
        animating = false;
        SetState("animation_stopped");
    }

    public void StartPractical()
    {
        animating = false;
        practical = true;
        // random diameter between 6 and 45 mm, a multiple of the least count so the correct answer is exactly readable
        targetWidthMm = Mathf.Round(UnityEngine.Random.Range(6f, 45f) / LeastCountMm) * LeastCountMm;
        SetWorkpiece(targetWidthMm);
        SetOpeningMm(60f);
        SetState("practical_started");
    }

    public void ResetPractical()
    {
        animating = false;
        practical = false;
        SetWorkpiece(0f);
        SetOpeningMm(0f);
        SetState("practical_reset");
    }

    public void SetLanguage(string l) { lang = l; }

    // ------------------------------------------------------------------ internals

    void SetWorkpiece(float widthMm)
    {
        targetWidthMm = widthMm;
        if (workpiece == null) return;
        workpiece.gameObject.SetActive(widthMm > 0f);
        if (widthMm <= 0f) return;
        var d = widthMm * 0.001f;
        var s = workpiece.localScale;
        workpiece.localScale = new Vector3(d, d, s.z);
        var p = workpiece.localPosition;
        workpiece.localPosition = new Vector3(d * 0.5f, p.y, p.z);
    }

    void Apply(bool force)
    {
        if (slider != null)
            slider.localPosition = sliderStart + Vector3.right * (openingMm * 0.001f);

        GetReading(out var msr, out var div, out var total);
        if (!force && Mathf.Approximately(total, lastQuantizedMm)) return;
        lastQuantizedMm = total;
        ReadoutChanged?.Invoke(msr, div, total);
    }

    void SetState(string s) { StateChanged?.Invoke(s); }
}
