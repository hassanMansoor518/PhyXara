using System;
using UnityEngine;
using PhyXara.Bridge;

/// <summary>
/// Hooke's law spring apparatus (Experiment 12).
/// A vertical spring on a stand with slotted weights on a pan. The student adds/removes
/// weights and reads the pointer position on a ruler.
///
/// Physics:
///   extension = totalLoad * g / k
///   totalLoad = panMass + n * weightMass
///   Spring visual: local Y scale = (naturalLength + extension) / naturalLength
///   LoadAssembly local y  = springAnchorY - (naturalLength + extension)
///   Pointer position (mm) = (LoadAssembly.localPosition.y + pointerOffsetY - rulerZeroY) * 1000
///
/// Contract mapping for readout messages (existing ReadoutChanged signature):
///   msr     = total load in newtons
///   csr     = number of slotted weights (0..6)
///   totalMm = pointer position in whole mm from the ruler zero mark
/// </summary>
[DisallowMultipleComponent]
public class HookesLawController : MonoBehaviour, IExperimentController
{
    // ------------------------------------------------------------------ constants
    const float DefaultK       = 25f;     // N/m
    const float WeightMass     = 0.05f;   // kg per slotted weight
    const float PanMass        = 0.02f;   // kg (pan + hanger)
    const int   MaxWeights     = 6;
    const float NaturalLength  = 0.10f;   // m
    const float Gravity        = 9.8f;    // m/s²
    const float RulerZeroY     = 0.05f;   // local y of the ruler zero mark
    const float SpringAnchorY  = 0.454f;  // local y of the spring top anchor
    const float SettleTime     = 0.35f;   // SmoothDamp smooth time
    const float SettleThreshold = 0.0001f; // m/s — velocity below this = settled

    // practical: hidden k range
    const float KMin  = 15f;
    const float KMax  = 40f;
    const float KStep = 0.5f;

    // animation timing
    const float AnimStepSeconds = 1.4f;

    // ------------------------------------------------------------------ inspector refs (found by name when null)
    [Header("Parts (found by name when empty)")]
    public Transform spring;
    public Transform loadAssembly;
    public Transform pointer;
    public Transform[] weightNodes; // Weight_1 .. Weight_6

    // ------------------------------------------------------------------ runtime state
    float springK = DefaultK;
    int   weightCount;
    bool  animating, practical;
    float animTimer;
    bool  animAdding = true;
    string lang = "en";

    // SmoothDamp state
    float currentY;
    float velocityY;
    float targetY;
    bool  settled = true;
    bool  readoutSent = true;

    Vector3 springBaseScale;
    float   pointerOffsetY; // pointer local y relative to LoadAssembly local y

    // ------------------------------------------------------------------ events
    public event Action<string> StateChanged;
    public event Action<float, int, float> ReadoutChanged;

    // ------------------------------------------------------------------ public accessors
    public bool   PracticalActive => practical;
    public bool   Animating       => animating;
    public int    WeightCount     => weightCount;
    public float  SpringK         => springK;
    public string Language        => lang;

    // ------------------------------------------------------------------ lifecycle

    void Awake()
    {
        if (spring == null)       spring       = FindNode("Spring");
        if (loadAssembly == null) loadAssembly = FindNode("LoadAssembly");
        if (pointer == null && loadAssembly != null)
            pointer = FindChildNode(loadAssembly, "Pointer");

        if (spring != null) springBaseScale = spring.localScale;

        // cache pointer offset relative to LoadAssembly
        if (pointer != null && loadAssembly != null)
            pointerOffsetY = pointer.localPosition.y;
        else
            pointerOffsetY = 0f;

        // find weight nodes if not assigned
        if (weightNodes == null || weightNodes.Length == 0)
        {
            weightNodes = new Transform[MaxWeights];
            for (int i = 0; i < MaxWeights; i++)
            {
                weightNodes[i] = FindNode("Weight_" + (i + 1));
            }
        }

        // initial state: 0 weights, default k
        weightCount = 0;
        springK = DefaultK;
        targetY = ComputeLoadAssemblyY(0);
        currentY = targetY;
        velocityY = 0f;
        settled = true;
        readoutSent = true;
        Apply();
    }

    void Update()
    {
        // animation auto-step
        if (animating)
        {
            animTimer += Time.deltaTime;
            if (animTimer >= AnimStepSeconds)
            {
                animTimer = 0f;
                if (animAdding)
                {
                    if (weightCount < MaxWeights)
                        SetWeightCount(weightCount + 1);
                    else
                    {
                        animAdding = false;
                        SetWeightCount(weightCount - 1);
                    }
                }
                else
                {
                    if (weightCount > 0)
                        SetWeightCount(weightCount - 1);
                    else
                    {
                        animAdding = true;
                        SetWeightCount(weightCount + 1);
                    }
                }
            }
        }

        // smooth movement
        if (!settled)
        {
            currentY = Mathf.SmoothDamp(currentY, targetY, ref velocityY, SettleTime);

            if (Mathf.Abs(velocityY) < SettleThreshold && Mathf.Abs(currentY - targetY) < 0.00005f)
            {
                currentY = targetY;
                velocityY = 0f;
                settled = true;

                if (!readoutSent)
                {
                    SendReadout();
                    readoutSent = true;
                }
            }
            Apply();
        }
    }

    // ------------------------------------------------------------------ IExperimentController

    public void PlayAnimation()
    {
        practical = false;
        springK = DefaultK;
        weightCount = 0;
        animating = true;
        animAdding = true;
        animTimer = 0f;
        SetWeightCount(0);
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

        // pick a hidden k: multiple of 0.5 in [15, 40]
        int steps = Mathf.RoundToInt((KMax - KMin) / KStep);
        springK = KMin + UnityEngine.Random.Range(0, steps + 1) * KStep;

        SetWeightCount(0);
        SetState("practical_started");
    }

    public void ResetPractical()
    {
        animating = false;
        practical = false;
        springK = DefaultK;
        SetWeightCount(0);
        SetState("practical_reset");
    }

    public void SetLanguage(string l)
    {
        lang = l ?? "en";
    }

    // ------------------------------------------------------------------ public weight manipulation (called by input script)

    public void AddWeight()
    {
        if (weightCount < MaxWeights)
            SetWeightCount(weightCount + 1);
    }

    public void RemoveWeight()
    {
        if (weightCount > 0)
            SetWeightCount(weightCount - 1);
    }

    // ------------------------------------------------------------------ internals

    void SetWeightCount(int n)
    {
        weightCount = Mathf.Clamp(n, 0, MaxWeights);
        targetY = ComputeLoadAssemblyY(weightCount);
        settled = false;
        readoutSent = false;
        UpdateWeightVisibility();
    }

    float ComputeExtension(int n)
    {
        float totalMass = PanMass + n * WeightMass;
        return totalMass * Gravity / springK;
    }

    float ComputeLoadAssemblyY(int n)
    {
        float ext = ComputeExtension(n);
        return SpringAnchorY - (NaturalLength + ext);
    }

    void Apply()
    {
        if (loadAssembly != null)
        {
            var pos = loadAssembly.localPosition;
            pos.y = currentY;
            loadAssembly.localPosition = pos;
        }

        // scale spring to fill the gap between anchor and LoadAssembly
        if (spring != null)
        {
            float currentLength = SpringAnchorY - currentY;
            float scaleY = currentLength / NaturalLength;
            spring.localScale = new Vector3(springBaseScale.x, springBaseScale.y * scaleY, springBaseScale.z);
        }
    }

    void UpdateWeightVisibility()
    {
        if (weightNodes == null) return;
        for (int i = 0; i < weightNodes.Length; i++)
        {
            if (weightNodes[i] != null)
                weightNodes[i].gameObject.SetActive(i < weightCount);
        }
    }

    void SendReadout()
    {
        float totalMass = PanMass + weightCount * WeightMass;
        float loadNewtons = totalMass * Gravity;

        // pointer world-space y in local coords
        float pointerY = currentY + pointerOffsetY;
        int pointerMm = Mathf.RoundToInt((pointerY - RulerZeroY) * 1000f);

        ReadoutChanged?.Invoke(loadNewtons, weightCount, pointerMm);
    }

    void SetState(string s) { StateChanged?.Invoke(s); }

    Transform FindNode(string nodeName)
    {
        foreach (var t in GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }

    static Transform FindChildNode(Transform parent, string nodeName)
    {
        foreach (Transform t in parent.GetComponentsInChildren<Transform>(true))
            if (t.name == nodeName) return t;
        return null;
    }
}
