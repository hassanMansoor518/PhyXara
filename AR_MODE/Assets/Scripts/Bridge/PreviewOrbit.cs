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
            distance = size * 2.5f;
            pinchPrev = 0f;
            Place();
        }

        public void End() { target = null; }

        void Update()
        {
            if (target == null) return;

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
