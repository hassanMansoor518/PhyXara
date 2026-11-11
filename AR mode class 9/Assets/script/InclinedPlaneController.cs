using System;
using UnityEngine;

namespace PhyXara.Bridge
{
    /// <summary>
    /// Inclined-plane acceleration experiment (solid iron ball in a V-groove).
    /// Put this on the root of the InclinedPlane model. Pick the start reading on the 0-300 mm scale,
    /// call Release(), and the ball rolls to the end stop with the physically correct acceleration.
    /// Position comes from the Scale_Zero_Anchor / Scale_300_Anchor empties inside the model, so it
    /// keeps working after FitToSize or any AR scaling.
    /// Same method names as the other PhyXara experiment controllers; add ": IExperimentController"
    /// and match the interface's signatures if you want RNBridge to drive it directly.
    /// </summary>
    public class InclinedPlaneController : MonoBehaviour
    {
        public enum State { Idle, Rolling, Paused, Finished }

        [Header("Model parts (auto-filled by Reset / context menu)")]
        public Transform ramp, ball, marker, zeroAnchor, endAnchor;

        [Header("Experiment")]
        [Range(0f, 290f)] public float startMm = 100f;      // scale reading where the ball is released
        public float inclineDeg = 12f;                      // matches the modelled slope
        public float scaleLengthMm = 300f;                  // 0 - 300 mm scale
        public float ballRadiusMm = 16f;
        public float grooveHalfAngleDeg = 45f;              // 90 degree V-groove
        [Range(0.05f, 1f)] public float playbackSpeed = 0.25f; // 1 = real time, 0.25 = slow motion
        public float readoutRateHz = 15f;
        [SerializeField] bool repeatOnFinish;

        public event Action<State> StateChanged;
        /// <summary>positionMm (scale reading), elapsedSec (physical time), speedMps</summary>
        public event Action<float, float, float> ReadoutChanged;

        public State Current { get; private set; } = State.Idle;
        public float StartMm => startMm;
        public float ElapsedSec => tau;

        const float G = 9.81f;
        float tau, nextReadout, finishedAt, hiddenStart = -1f;
        Quaternion restLocalRot;

        float HalfSin => Mathf.Sin(grooveHalfAngleDeg * Mathf.Deg2Rad);
        public float AccelerationMs2 => G * Mathf.Sin(inclineDeg * Mathf.Deg2Rad) / (1f + 0.4f / (HalfSin * HalfSin));
        public float TotalTimeSec => Mathf.Sqrt(2f * (scaleLengthMm - startMm) * 0.001f / AccelerationMs2);

        void Reset() => AutoAssign();

        [ContextMenu("Auto-assign parts by name")]
        void AutoAssign()
        {
            ramp = FindDeep(transform, "Ramp");
            ball = FindDeep(transform, "Iron_Ball");
            marker = FindDeep(transform, "Initial_Position_Marker");
            zeroAnchor = FindDeep(transform, "Scale_Zero_Anchor");
            endAnchor = FindDeep(transform, "Scale_300_Anchor");
        }

        static Transform FindDeep(Transform root, string name)
        {
            foreach (Transform t in root.GetComponentsInChildren<Transform>(true))
                if (t.name == name) return t;
            return null;
        }

        void Awake()
        {
            if (!ball || !zeroAnchor || !endAnchor || !ramp) AutoAssign();
            if (!ball || !zeroAnchor || !endAnchor || !ramp)
            {
                Debug.LogError("InclinedPlaneController: model parts missing (Ramp, Iron_Ball, Scale_Zero_Anchor, Scale_300_Anchor).");
                enabled = false; return;
            }
            restLocalRot = ball.localRotation;
            ApplyAt(0f);

#if UNITY_EDITOR
            // ── Temporary renderer diagnostic (remove once model is confirmed visible) ──
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("\n[InclinedPlaneController] Renderer diagnostic at Awake:");
            sb.AppendLine($"  Root: '{name}'  pos={transform.position}  scale={transform.lossyScale}");
            foreach (var r in GetComponentsInChildren<Renderer>(true))
            {
                var b = r.bounds;
                string shaderName = (r.sharedMaterial != null && r.sharedMaterial.shader != null)
                                    ? r.sharedMaterial.shader.name : "NULL";
                sb.AppendLine($"  {r.gameObject.name} | enabled={r.enabled} | active={r.gameObject.activeInHierarchy}" +
                              $" | bounds={b.center},{b.size} | shader={shaderName}");
            }
            Debug.Log(sb.ToString());
            // ── End temporary diagnostic ──────────────────────────────────────────────
#endif
        }

        // ---------- public API (same pattern as the other experiment controllers) ----------
        public void SetStartMm(float mm)
        {
            startMm = Mathf.Clamp(mm, 0f, scaleLengthMm - 10f);
            tau = 0f; Set(State.Idle); ApplyAt(0f);
        }

        public void Release()
        {
            if (Current == State.Rolling) { Set(State.Paused); return; }
            if (Current == State.Finished) { tau = 0f; ApplyAt(0f); }
            Set(State.Rolling);
        }

        public void PlayAnimation() => Release();
        public void StopAnimation() { tau = 0f; Set(State.Idle); ApplyAt(0f); }
        public void ResetPractical() => StopAnimation();
        public void SetLanguage(string lang) { }

        /// <summary>Practical mode: picks a hidden random start (multiples of 5 mm); the student reads it off the scale.</summary>
        public void StartPractical()
        {
            hiddenStart = Mathf.Round(UnityEngine.Random.Range(20f, 250f) / 5f) * 5f;
            SetStartMm(hiddenStart);
        }
        public float RevealPracticalStartMm() => hiddenStart < 0f ? startMm : hiddenStart;

        // ---------- simulation ----------
        void Update()
        {
            if (repeatOnFinish && Current == State.Finished && Time.time >= finishedAt + 1f)
                Release();

            if (Current != State.Rolling) return;
            float T = TotalTimeSec;
            tau += Time.deltaTime * playbackSpeed;
            bool done = tau >= T;
            if (done) tau = T;
            ApplyAt(tau);
            if (done)
            {
                finishedAt = Time.time;
                Emit();
                Set(State.Finished);
            }
            else if (Time.time >= nextReadout) { Emit(); nextReadout = Time.time + 1f / Mathf.Max(1f, readoutRateHz); }
        }

        void ApplyAt(float t)
        {
            float a = AccelerationMs2;
            float sMm = Mathf.Min(0.5f * a * t * t * 1000f, scaleLengthMm - startMm);
            float readingMm = startMm + sMm;
            float k = readingMm / scaleLengthMm;
            ball.position = Vector3.LerpUnclamped(zeroAnchor.position, endAnchor.position, k);

            if (marker)    // marker stays at the release reading
            {
                Vector3 p = Vector3.LerpUnclamped(zeroAnchor.position, endAnchor.position, startMm / scaleLengthMm);
                Vector3 lp = ramp.InverseTransformPoint(p);
                marker.localPosition = new Vector3(lp.x, marker.localPosition.y, marker.localPosition.z);
            }

            // rolling spin about the ramp's local Z axis; direction follows the downhill side (+/-X)
            float rEffM = ballRadiusMm * 0.001f * HalfSin;
            float downSign = Mathf.Sign(ramp.InverseTransformPoint(endAnchor.position).x - ramp.InverseTransformPoint(zeroAnchor.position).x);
            float spinDeg = -downSign * (sMm * 0.001f / rEffM) * Mathf.Rad2Deg;
            ball.localRotation = Quaternion.AngleAxis(spinDeg, Vector3.forward) * restLocalRot;
        }

        void Emit()
        {
            float a = AccelerationMs2;
            float sMm = Mathf.Min(0.5f * a * tau * tau * 1000f, scaleLengthMm - startMm);
            ReadoutChanged?.Invoke(startMm + sMm, tau, a * tau);
        }

        void Set(State s) { if (Current == s) return; Current = s; StateChanged?.Invoke(s); }
    }
}
