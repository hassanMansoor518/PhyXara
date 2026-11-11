using UnityEngine;
using UnityEngine.InputSystem;
using PhyXara.Bridge;

/// <summary>
/// Practical-mode input for the Hooke's law apparatus.
/// Tap the load assembly to add a weight, hold 0.5 s to remove one.
/// If the pointer moves more than 20 px the press is abandoned and
/// PreviewOrbit takes over.
/// </summary>
[RequireComponent(typeof(HookesLawController))]
public class HookesLawWeightTap : MonoBehaviour
{
    const float HoldThresholdSeconds = 0.5f;
    const float DragThresholdPixels  = 20f;

    HookesLawController controller;
    Camera cachedCamera;

    bool   pressing;
    float  pressTime;
    Vector2 pressStartPos;
    bool   holdFired;
    bool   abandoned; // drag exceeded threshold, left to orbit

    void Awake()
    {
        controller = GetComponent<HookesLawController>();
    }

    void OnDisable()
    {
        Release();
    }

    void Update()
    {
        var pointer = Pointer.current;
        if (pointer == null || controller == null || !controller.PracticalActive)
        {
            Release();
            return;
        }

        RefreshCamera();
        if (cachedCamera == null) return;

        // --- press start
        if (pointer.press.wasPressedThisFrame)
        {
            var screenPos = pointer.position.ReadValue();
            var ray = cachedCamera.ScreenPointToRay(screenPos);

            if (Physics.Raycast(ray, out var hit, 20f))
            {
                // check if the hit object is part of the LoadAssembly hierarchy
                var loadAssembly = controller.GetType().GetField("loadAssembly",
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

                Transform la = null;
                if (loadAssembly != null) la = loadAssembly.GetValue(controller) as Transform;
                // fallback: find by name
                if (la == null)
                {
                    foreach (var t in controller.GetComponentsInChildren<Transform>(true))
                        if (t.name == "LoadAssembly") { la = t; break; }
                }

                if (la != null && hit.collider.transform.IsChildOf(la))
                {
                    pressing = true;
                    pressTime = 0f;
                    pressStartPos = screenPos;
                    holdFired = false;
                    abandoned = false;
                    PreviewOrbit.InputBlocked = true;
                }
            }
        }

        if (!pressing) return;

        // --- press released
        if (!pointer.press.isPressed)
        {
            if (!abandoned && !holdFired)
            {
                // short tap: add weight
                controller.AddWeight();
            }
            Release();
            return;
        }

        // --- drag check
        if (!abandoned)
        {
            var currentPos = pointer.position.ReadValue();
            if (Vector2.Distance(currentPos, pressStartPos) > DragThresholdPixels)
            {
                abandoned = true;
                PreviewOrbit.InputBlocked = false;
                return;
            }
        }

        if (abandoned) return;

        // --- hold timer
        pressTime += Time.deltaTime;
        if (!holdFired && pressTime >= HoldThresholdSeconds)
        {
            holdFired = true;
            controller.RemoveWeight();
        }
    }

    void Release()
    {
        if (!pressing) return;
        pressing = false;
        holdFired = false;
        abandoned = false;
        PreviewOrbit.InputBlocked = false;
    }

    void RefreshCamera()
    {
        if (cachedCamera != null && cachedCamera.isActiveAndEnabled) return;
        cachedCamera = null;
        foreach (var c in Camera.allCameras)
        {
            if (c.isActiveAndEnabled) { cachedCamera = c; return; }
        }
    }
}
