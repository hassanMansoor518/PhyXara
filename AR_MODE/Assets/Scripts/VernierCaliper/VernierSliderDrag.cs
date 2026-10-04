using UnityEngine;
using UnityEngine.InputSystem;
using PhyXara.Bridge;

/// <summary>
/// Practical mode input: press on the sliding jaw and drag to open or close the caliper.
/// Works with touch and mouse (Pointer covers both). While dragging, the preview orbit is blocked so the
/// model does not rotate at the same time.
/// </summary>
[RequireComponent(typeof(VernierCaliperController))]
public class VernierSliderDrag : MonoBehaviour
{
    VernierCaliperController controller;
    bool dragging;

    void Awake() { controller = GetComponent<VernierCaliperController>(); }

    void OnDisable() { Stop(); }

    void Update()
    {
        var pointer = Pointer.current;
        if (pointer == null || controller.slider == null || !controller.PracticalActive)
        {
            Stop();
            return;
        }

        var cam = ActiveCamera();
        if (cam == null) return;

        if (pointer.press.wasPressedThisFrame)
        {
            var ray = cam.ScreenPointToRay(pointer.position.ReadValue());
            if (Physics.Raycast(ray, out var hit, 10f) && hit.collider.transform.IsChildOf(controller.slider))
            {
                dragging = true;
                PreviewOrbit.InputBlocked = true;
            }
        }

        if (!dragging) return;

        if (!pointer.press.isPressed) { Stop(); return; }

        var delta = pointer.delta.ReadValue();
        if (delta.sqrMagnitude < 0.0001f) return;

        // screen length of 1 mm along the beam, in whatever orientation the model is currently seen
        var origin = controller.slider.position;
        var oneMm = controller.slider.right * (0.001f * controller.slider.lossyScale.x);
        var a = (Vector2)cam.WorldToScreenPoint(origin);
        var b = (Vector2)cam.WorldToScreenPoint(origin + oneMm);
        var axis = b - a;
        var sq = axis.sqrMagnitude;
        if (sq < 1e-6f) return;

        controller.NudgeMm(Vector2.Dot(delta, axis) / sq);
    }

    void Stop()
    {
        if (!dragging) return;
        dragging = false;
        PreviewOrbit.InputBlocked = false;
    }

    static Camera ActiveCamera()
    {
        foreach (var c in Camera.allCameras)
            if (c.isActiveAndEnabled) return c;
        return null;
    }
}
