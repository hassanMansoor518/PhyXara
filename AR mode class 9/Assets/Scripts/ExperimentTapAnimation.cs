using System;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using Vuforia;
using PhyXara.Bridge;

public sealed class ExperimentTapAnimation : MonoBehaviour
{
    public int referenceNumber;
    public Animation animationPlayer;
    public MonoBehaviour driver;
    public TextMeshPro procedureLabel;
    public TextMeshPro[] labels;
    public Transform[] labelledParts;
    public LineRenderer[] leaderLines;
    public string[] procedureSteps;
    public float duration = 12;
    public bool IsPlaying { get; private set; }
    public float Elapsed { get; private set; }
    public bool LabelsVisible { get; private set; }
    public bool CanToggleLabels => isActiveAndEnabled && labels != null && labels.Length > 2 &&
        (!target || (revealTracked && revealElapsed >= RevealDuration));

    ImageTargetBehaviour target;
    Vector2 pressStart;
    float pressTime;
    bool pressing;
    int currentStep = -1;
    Renderer[][] partRenderers;
    const float RevealDuration = 1.1f;
    const float TrackingLossGrace = .35f;
    const float HoverHeight = .008f;
    const float LabelDuration = .5f;
    Transform revealRoot;
    bool revealTracked;
    float revealElapsed, hoverHeight;
    float trackingLostAt = float.NegativeInfinity;
    float labelProgress;
    Vector3[] labelPositions;

    void Awake()
    {
        labelPositions = labels?.Select(label => label ? label.transform.localPosition : Vector3.zero).ToArray();
        target = GetComponentInParent<ImageTargetBehaviour>(true);
        if (target)
        {
            // Lift along the page normal without changing the model's calibrated scale or pinch zoom.
            revealRoot = new GameObject("Image Reveal").transform;
            revealRoot.SetParent(transform.parent, false);
            transform.SetParent(revealRoot, false);
            hoverHeight = HoverHeight / Mathf.Max(.0001f, target.transform.lossyScale.y);
        }
        ResetLabels();
    }

    void OnEnable()
    {
        if (!target) target = GetComponentInParent<ImageTargetBehaviour>(true);
        if (target) target.OnTargetStatusChanged += TrackingChanged;
        SetRevealTracking(target && target.TargetStatus.Status == Status.TRACKED);
        SetCaption("Tap the model to start");
    }

    void OnDisable()
    {
        if (target) target.OnTargetStatusChanged -= TrackingChanged;
        SetRevealTracking(false);
        StopAnimation();
    }

    void TrackingChanged(ObserverBehaviour observer, TargetStatus status)
    {
        SetRevealTracking(status.Status == Status.TRACKED);
        if (status.Status != Status.TRACKED) StopAnimation();
    }

    void SetRevealTracking(bool tracked)
    {
        if (revealTracked != tracked)
        {
            revealTracked = tracked;
            if (!tracked) trackingLostAt = Time.unscaledTime;
            else if (Time.unscaledTime - trackingLostAt >= TrackingLossGrace)
            {
                revealElapsed = 0;
                if (revealRoot)
                {
                    revealRoot.localPosition = Vector3.zero;
                    revealRoot.localScale = new Vector3(1, .001f, 1);
                }
            }
        }
        if (!tracked) ResetLabels();
    }

    void AdvanceReveal(float deltaTime)
    {
        if (!revealRoot || !revealTracked || revealElapsed >= RevealDuration) return;
        revealElapsed = Mathf.Clamp(revealElapsed + Mathf.Max(0, deltaTime), 0, RevealDuration);
        float progress = Mathf.SmoothStep(0, 1, revealElapsed / RevealDuration);
        revealRoot.localScale = new Vector3(1, Mathf.Lerp(.001f, 1, progress), 1);
        revealRoot.localPosition = Vector3.up * (hoverHeight * progress);
    }

    public void ToggleLabels() => SetLabelsVisible(!LabelsVisible);

    public void SetLabelsVisible(bool visible)
    {
        if (visible == LabelsVisible || (visible && !CanToggleLabels)) return;
        LabelsVisible = visible;
        if (!visible)
        {
            if (labelProgress == 0) ResetLabels();
            return;
        }
        for (int i = 2; i < labels.Length; i++)
        {
            if (!labels[i]) continue;
            labels[i].gameObject.SetActive(true);
            labels[i].GetComponent<Renderer>().enabled = true;
            labels[i].ForceMeshUpdate();
        }
        foreach (var line in leaderLines)
            if (line) { line.gameObject.SetActive(true); line.enabled = true; }
    }

    void AdvanceLabels(float deltaTime)
    {
        float goal = LabelsVisible ? 1 : 0;
        if (labelProgress == goal) return;
        labelProgress = Mathf.MoveTowards(labelProgress, goal, Mathf.Max(0, deltaTime) / LabelDuration);
        if (labelProgress == 0) ResetLabels();
    }

    void ResetLabels()
    {
        LabelsVisible = false;
        labelProgress = 0;
        for (int i = 2; labels != null && i < labels.Length; i++)
        {
            if (!labels[i]) continue;
            labels[i].alpha = 0;
            if (labelledParts != null && i - 2 < labelledParts.Length && labelledParts[i - 2])
                labels[i].transform.position = labelledParts[i - 2].position;
            labels[i].gameObject.SetActive(false);
        }
        for (int i = 0; leaderLines != null && i < leaderLines.Length; i++)
        {
            if (!leaderLines[i]) continue;
            var point = labelledParts[i] ? labelledParts[i].position : transform.position;
            leaderLines[i].SetPosition(0, point);
            leaderLines[i].SetPosition(1, point);
            leaderLines[i].gameObject.SetActive(false);
        }
    }

    public void PlayAnimation()
    {
        StopAnimation();
        if (animationPlayer && animationPlayer.clip)
        {
            var state = animationPlayer[animationPlayer.clip.name];
            state.time = 0;
            state.wrapMode = WrapMode.ClampForever;
            animationPlayer.Play(animationPlayer.clip.name);
        }
        else if (driver is MomentsAnimation moments) moments.PlayAnimation();
        else if (driver is InclinedPlaneController plane) { plane.StopAnimation(); plane.PlayAnimation(); }
        else if (driver is IExperimentController controller) controller.PlayAnimation();
        else { Debug.LogError("No animation assigned to " + name, this); return; }
        IsPlaying = true;
        Elapsed = 0;
        currentStep = -1;
        UpdateCaption();
    }

    public void StopAnimation()
    {
        IsPlaying = false;
        pressing = false;
        Elapsed = 0;
        if (animationPlayer && animationPlayer.clip)
        {
            animationPlayer.Stop();
            animationPlayer.clip.SampleAnimation(gameObject, 0);
        }
        StopDriver();
        SetCaption("Tap the model to start");
    }

    void StopDriver()
    {
        if (driver is MomentsAnimation moments) moments.StopAnimation();
        else if (driver is InclinedPlaneController plane) plane.StopAnimation();
        else if (driver is IExperimentController controller) controller.StopAnimation();
    }

    void SetCaption(string value)
    {
        if (procedureLabel) procedureLabel.text = value;
    }

    void UpdateCaption()
    {
        if (procedureSteps == null || procedureSteps.Length == 0) return;
        int step = Mathf.Min(procedureSteps.Length - 1, Mathf.FloorToInt(Elapsed / duration * procedureSteps.Length));
        if (step == currentStep) return;
        currentStep = step;
        SetCaption($"{step + 1}/{procedureSteps.Length}  {procedureSteps[step]}");
    }

    void Update()
    {
        if (target && target.TargetStatus.Status != Status.TRACKED) return;
        if (revealRoot && revealElapsed < RevealDuration) return;
        Advance(Time.deltaTime);
        var pointer = Pointer.current;
        if (pointer == null) return;
        if (Touchscreen.current != null && Touchscreen.current.touches.Count(t => t.press.isPressed) > 1)
        {
            pressing = false;
            return;
        }
        var position = pointer.position.ReadValue();
        if (pointer.press.wasPressedThisFrame)
        {
            int pointerId = Touchscreen.current != null && Touchscreen.current.primaryTouch.press.isPressed
                ? Touchscreen.current.primaryTouch.touchId.ReadValue() : -1;
            if (EventSystem.current && EventSystem.current.IsPointerOverGameObject(pointerId)) return;
            var camera = ActiveCamera();
            if (camera && Physics.Raycast(camera.ScreenPointToRay(position), out var hit, 100f) &&
                hit.collider.GetComponentInParent<ExperimentTapAnimation>() == this)
            {
                pressing = true;
                pressStart = position;
                pressTime = Time.unscaledTime;
            }
        }
        if (!pressing) return;
        if (Vector2.Distance(position, pressStart) > 20 || Time.unscaledTime - pressTime > .6f)
            pressing = false;
        else if (pointer.press.wasReleasedThisFrame) PlayAnimation();
    }

    public void Advance(float deltaTime)
    {
        if (!IsPlaying) return;
        Elapsed = Mathf.Min(duration, Elapsed + Mathf.Max(0, deltaTime));
        UpdateCaption();
        // Keep the caliper closed on the workpiece once the first measurement is complete.
        if (driver is VernierCaliperController caliper && Elapsed > 2 && caliper.Clamped)
            caliper.StopAnimation();
        if (Elapsed < duration) return;
        IsPlaying = false;
        if (animationPlayer && animationPlayer.clip)
        {
            animationPlayer.Stop();
            animationPlayer.clip.SampleAnimation(gameObject, animationPlayer.clip.length);
        }
        if (driver is IExperimentController controller) controller.StopAnimation();
        SetCaption(procedureSteps.Last() + "\nTap the model to replay");
    }

    public static Camera ActiveCamera()
    {
        var main = Camera.main;
        if (main && main.isActiveAndEnabled) return main;
        return Camera.allCameras.FirstOrDefault(c => c.isActiveAndEnabled);
    }

    void LateUpdate()
    {
        if (target && !revealTracked) return;
        AdvanceReveal(Time.unscaledDeltaTime);
        AdvanceLabels(Time.unscaledDeltaTime);
        UpdateLabels(ActiveCamera());
    }

    public void UpdateLabels(Camera camera)
    {
        if (!camera || labels == null) return;
        for (int i = 0; i < Mathf.Min(2, labels.Length); i++)
            if (labels[i]) labels[i].transform.rotation = camera.transform.rotation;
        float progress = labelPositions == null ? 1 : Mathf.SmoothStep(0, 1, labelProgress);
        if (progress == 0) return;
        if (partRenderers == null || partRenderers.Length != labelledParts.Length)
            partRenderers = labelledParts.Select(p => p ? p.GetComponentsInChildren<Renderer>(true) : Array.Empty<Renderer>()).ToArray();
        for (int i = 0; leaderLines != null && i < leaderLines.Length; i++)
        {
            if (!leaderLines[i] || !labelledParts[i]) continue;
            var point = labelledParts[i].position;
            var renderers = partRenderers[i];
            if (renderers.Length > 0)
            {
                var bounds = renderers[0].bounds;
                for (int r = 1; r < renderers.Length; r++) bounds.Encapsulate(renderers[r].bounds);
                point = bounds.center;
            }
            var label = labels[i + 2];
            if (labelPositions != null)
            {
                var home = label.transform.parent.TransformPoint(labelPositions[i + 2]);
                label.transform.position = Vector3.Lerp(point, home, progress);
                label.alpha = progress;
            }
            label.transform.rotation = camera.transform.rotation;
            var direction = label.transform.InverseTransformPoint(point);
            var textBounds = label.textBounds;
            var edge = Mathf.Abs(direction.y) > Mathf.Abs(direction.x)
                ? Vector3.up * Mathf.Sign(direction.y) * textBounds.extents.y
                : Vector3.right * Mathf.Sign(direction.x) * textBounds.extents.x;
            leaderLines[i].SetPosition(0, Vector3.Lerp(point, label.transform.TransformPoint(textBounds.center + edge), progress));
            leaderLines[i].SetPosition(1, point);
        }
    }
}
