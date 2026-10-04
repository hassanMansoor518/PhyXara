using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using ETouch = UnityEngine.InputSystem.EnhancedTouch.Touch;

namespace PhyXara.Bridge
{
    /// <summary>PREVIEW mode input: one-finger drag rotates the model, two-finger pinch zooms (mouse + wheel in the Editor).</summary>
    public class PreviewOrbit : MonoBehaviour
    {
        public Camera cam;
        public float rotateSpeed = 0.3f;     // degrees per pixel
        public float zoomSpeed = 0.002f;     // fraction of distance per pixel of pinch
        public float minDistanceFactor = 1.2f, maxDistanceFactor = 6f;

        /// <summary>Set by experiment-specific drag handlers (e.g. the caliper slider) so one-finger drag does not also rotate the model.</summary>
        public static bool InputBlocked;

        Transform target;
        float baseSize = 0.12f;
        float distance;
        float pinchPrev;

        void OnEnable() { EnhancedTouchSupport.Enable(); }
        void OnDisable() { EnhancedTouchSupport.Disable(); }

        public void Begin(Transform t, float size)
        {
            target = t;
            baseSize = size;
            distance = FitDistance(size);
            pinchPrev = 0f;
            Place();
        }

        public void End() { target = null; }

        // Camera distance at which the model's longest side fits the screen width with a small margin,
        // whatever the aspect ratio (a wide model such as the caliper would be cut off on a portrait phone).
        float FitDistance(float size)
        {
            if (cam == null) return size * 2.5f;
            var vHalf = cam.fieldOfView * 0.5f * Mathf.Deg2Rad;
            var hHalf = Mathf.Atan(Mathf.Tan(vHalf) * Mathf.Max(0.1f, cam.aspect));
            var fitWidth = size * 1.15f * 0.5f / Mathf.Tan(Mathf.Min(hHalf, vHalf));
            return Mathf.Max(size * 1.6f, fitWidth);
        }

        void Update()
        {
            if (target == null) return;
            if (InputBlocked) { pinchPrev = 0f; Place(); return; }

            var touches = ETouch.activeTouches;
            if (touches.Count == 1)
            {
                Rotate(touches[0].delta);
                pinchPrev = 0f;
            }
            else if (touches.Count >= 2)
            {
                var d = Vector2.Distance(touches[0].screenPosition, touches[1].screenPosition);
                if (pinchPrev > 0f) Zoom(d - pinchPrev);
                pinchPrev = d;
            }
            else
            {
                pinchPrev = 0f;
                var mouse = Mouse.current;
                if (mouse != null)
                {
                    if (mouse.leftButton.isPressed) Rotate(mouse.delta.ReadValue());
                    Zoom(mouse.scroll.ReadValue().y * 0.5f);
                }
            }
            Place();
        }

        void Rotate(Vector2 deltaPixels)
        {
            target.Rotate(Vector3.up, -deltaPixels.x * rotateSpeed, Space.World);
            target.Rotate(Vector3.right, deltaPixels.y * rotateSpeed, Space.World);
        }

        void Zoom(float pixels)
        {
            distance = Mathf.Clamp(distance * (1f - pixels * zoomSpeed), baseSize * minDistanceFactor, baseSize * maxDistanceFactor);
        }

        void Place()
        {
            if (cam == null) return;
            cam.transform.position = new Vector3(0f, 0f, -distance);
            cam.transform.rotation = Quaternion.identity;
        }
    }
}
