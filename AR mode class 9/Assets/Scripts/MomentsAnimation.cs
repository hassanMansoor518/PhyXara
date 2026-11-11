using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using Vuforia;
using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;

[RequireComponent(typeof(ImageTargetBehaviour))]
public sealed class MomentsAnimation : MonoBehaviour
{
    [SerializeField] Transform model;

    ImageTargetBehaviour target;
    Transform pivot, weight2, distanceEnd, distanceLabel, distanceBar;
    Reveal[] reveals;
    Vector3 modelScale, barScale;
    Quaternion pivotRest;
    float weightX, endX, labelX, tiltDirection;
    float elapsed, zoom = 1f, pinchDistance;
    int firstTouch, secondTouch;

    readonly struct Reveal
    {
        readonly Transform part;
        readonly Vector3 scale;
        readonly float start;

        public Reveal(Transform part, float start)
        {
            this.part = part;
            scale = part.localScale;
            this.start = start;
        }

        public void Apply(float seconds) =>
            part.localScale = scale * Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(start, start + .4f, seconds));
    }

    void Awake()
    {
        target = GetComponent<ImageTargetBehaviour>();
        pivot = model.Find("RodPivot");
        var weight1 = pivot ? pivot.Find("W1") : null;
        weight2 = pivot ? pivot.Find("W2") : null;
        var marker = pivot ? pivot.Find("O_Marker") : null;
        var distance1 = pivot ? pivot.Find("D1") : null;
        var distance2 = pivot ? pivot.Find("D2") : null;
        distanceEnd = distance2 ? distance2.Find("D2_TickEnd") : null;
        distanceLabel = distance2 ? distance2.Find("D2_Label") : null;
        distanceBar = distance2 ? distance2.Find("D2_Bar") : null;
        if (!weight1 || !weight2 || !marker || !distance1 || !distanceEnd || !distanceLabel || !distanceBar)
        {
            Debug.LogError("The Principle of Moments model is missing parts required for animation.", this);
            enabled = false;
            return;
        }

        reveals = new[]
        {
            new Reveal(marker, 0f), new Reveal(weight1, .15f), new Reveal(distance1, .55f),
            new Reveal(weight2, 2f), new Reveal(distance2, 2.4f)
        };
        modelScale = model.localScale;
        pivotRest = pivot.localRotation;
        tiltDirection = -Mathf.Sign(weight1.localPosition.x);
        barScale = distanceBar.localScale;
        weightX = weight2.localPosition.x;
        endX = distanceEnd.localPosition.x;
        labelX = distanceLabel.localPosition.x;
    }

    void OnEnable() => EnhancedTouchSupport.Enable();

    void OnDisable()
    {
        EnhancedTouchSupport.Disable();
        elapsed = 0f;
        pinchDistance = 0f;
    }

    void Update()
    {
        var status = target.TargetStatus.Status;
        if (status != Status.TRACKED)
        {
            pinchDistance = 0f;
            return;
        }

        Pose(elapsed);
        elapsed = Mathf.Repeat(elapsed + Time.deltaTime, 6f);
        ReadZoom();
        model.localScale = modelScale * zoom;
    }

    void Pose(float seconds)
    {
        foreach (var reveal in reveals)
            reveal.Apply(seconds);

        float tilt = 6f * Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(.15f, 1.25f, seconds));
        tilt -= 9f * Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(2f, 2.6f, seconds));
        tilt += 3f * Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(3f, 4.5f, seconds));
        pivot.localRotation = pivotRest * Quaternion.AngleAxis(tiltDirection * tilt, Vector3.forward);

        float distance = Mathf.SmoothStep(1f, 2f / 3f, Mathf.InverseLerp(3f, 4.5f, seconds));
        SetX(weight2, weightX * distance);
        SetX(distanceEnd, endX * distance);
        SetX(distanceLabel, labelX * distance);
        distanceBar.localScale = new Vector3(barScale.x * distance, barScale.y, barScale.z);
    }

    static void SetX(Transform part, float x)
    {
        var position = part.localPosition;
        position.x = x;
        part.localPosition = position;
    }

    void ReadZoom()
    {
        var touches = Touch.activeTouches;
        if (touches.Count == 2)
        {
            var first = touches[0];
            var second = touches[1];
            float distance = Vector2.Distance(first.screenPosition, second.screenPosition);
            if (pinchDistance > 0f && first.touchId == firstTouch && second.touchId == secondTouch)
                ApplyZoom(distance / pinchDistance);
            pinchDistance = distance;
            firstTouch = first.touchId;
            secondTouch = second.touchId;
            return;
        }

        pinchDistance = 0f;
        if (touches.Count == 0 && Mouse.current != null)
        {
            float scroll = Mouse.current.scroll.ReadValue().y;
            if (scroll != 0f)
                ApplyZoom(Mathf.Exp(Mathf.Clamp(scroll * .0015f, -.25f, .25f)));
        }
    }

    void ApplyZoom(float ratio) => zoom = Mathf.Clamp(zoom * ratio, .55f, 2.5f);
}
