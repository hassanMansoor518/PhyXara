using System;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace PhyXara.Bridge
{
    /// <summary>
    /// Thin bridge between React Native and the scene. RN calls
    /// UnityView.postMessage("RNBridge", "OnMessage", json); replies go back through
    /// ReactNativeUnityViewManager.sendMessageToMobileApp (Android).
    /// Two runtime modes, switched without reloading: AR (camera + image tracking) and PREVIEW (plain camera, drag/pinch).
    /// </summary>
    public class RNBridge : MonoBehaviour
    {
        public enum Mode { Idle, AR, Preview }

        [Header("Data")]
        public ExperimentRegistry registry;

        [Header("AR rig (disabled while not in AR mode)")]
        [Tooltip("Parent of ARSession + XR Origin. Disabled outside AR mode so the camera is released.")]
        public GameObject arRig;
        public ARSession arSession;
        public ARTrackedImageManager trackedImageManager;

        [Header("Preview rig")]
        public Camera previewCamera;
        public PreviewOrbit previewOrbit;

        [Header("Readout")]
        [Tooltip("Max readout messages per second sent to RN.")]
        public float readoutRateHz = 15f;

        public Mode CurrentMode { get; private set; } = Mode.Idle;
        public string CurrentExperimentId { get; private set; }

        /// <summary>Raised for every outbound JSON string (used by the simulator/tests).</summary>
        public event Action<string> Outbound;

        GameObject model;
        IExperimentController controller;
        ExperimentEntry entry;
        bool tracked;
        float lastReadoutTime;

        void Awake()
        {
            name = "RNBridge"; // RN addresses this GameObject by name
            SetRigs(Mode.Idle);
        }

        void Start()
        {
            Send(new ReadyMessage());
        }

        // ---------------------------------------------------------------- inbound (RN -> Unity)

        public void OnMessage(string json)
        {
            InboundMessage msg;
            try { msg = JsonUtility.FromJson<InboundMessage>(json); }
            catch (Exception e) { SendError("bad_json", e.Message); return; }
            if (msg == null || string.IsNullOrEmpty(msg.type)) { SendError("bad_message", "missing type"); return; }
            if (msg.v != Msg.Version) Debug.LogWarning("[RNBridge] unexpected contract version " + msg.v);

            switch (msg.type)
            {
                case Msg.Open: HandleOpen(msg.mode, msg.experimentId); break;
                case Msg.PlayAnimation: controller?.PlayAnimation(); break;
                case Msg.StopAnimation: controller?.StopAnimation(); break;
                case Msg.StartPractical: controller?.StartPractical(); break;
                case Msg.ResetPractical: controller?.ResetPractical(); break;
                case Msg.SetLanguage: controller?.SetLanguage(msg.lang); break;
                case Msg.Stop: HandleStop(); break;
                default: SendError("unknown_type", msg.type); break;
            }
        }

        void HandleOpen(string mode, string experimentId)
        {
            if (registry == null) { SendError("no_registry", "ExperimentRegistry is not assigned"); return; }
            var e = registry.Find(experimentId);
            if (e == null || e.modelPrefab == null) { SendError("unknown_experiment", experimentId); return; }

            Teardown(); // allows re-open without reloading the player

            Mode m;
            if (mode == "ar") m = Mode.AR;
            else if (mode == "preview") m = Mode.Preview;
            else { SendError("bad_mode", mode); return; }

            entry = e;
            CurrentExperimentId = experimentId;
            SpawnModel(e);
            SetRigs(m);

            if (m == Mode.AR) EnterAR(); else EnterPreview();
        }

        void HandleStop()
        {
            Teardown();
            SetRigs(Mode.Idle);
            Send(new StateMessage { name = "stopped" });
        }

        // ---------------------------------------------------------------- modes

        void SpawnModel(ExperimentEntry e)
        {
            model = Instantiate(e.modelPrefab);
            model.name = e.experimentId;
            FitToSize(model.transform, e.modelSizeMeters);

            controller = model.GetComponentInChildren<IExperimentController>();
            if (controller == null)
            {
                SendError("no_controller", "Prefab has no IExperimentController: " + e.experimentId);
                return;
            }
            controller.StateChanged += OnControllerState;
            controller.ReadoutChanged += OnControllerReadout;
        }

        void EnterAR()
        {
            tracked = false;
            model.SetActive(false); // appears once the image is found
            if (trackedImageManager != null)
            {
                trackedImageManager.trackablesChanged.RemoveListener(OnTrackablesChanged);
                trackedImageManager.trackablesChanged.AddListener(OnTrackablesChanged);
            }
            else SendError("no_tracker", "ARTrackedImageManager is not assigned");
            if (trackedImageManager != null && trackedImageManager.referenceLibrary == null)
                SendError("no_reference_image", "No reference image library in this build: add the diagram image and re-export");
        }

        void EnterPreview()
        {
            model.SetActive(true);
            model.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
            if (previewOrbit != null) previewOrbit.Begin(model.transform, entry.modelSizeMeters);
        }

        // Disable the rigs that are not needed. Disabling the AR rig stops ARCore and releases the camera.
        void SetRigs(Mode m)
        {
            CurrentMode = m;
            if (arSession != null) arSession.enabled = m == Mode.AR;
            if (arRig != null) arRig.SetActive(m == Mode.AR);
            if (previewCamera != null) previewCamera.gameObject.SetActive(m == Mode.Preview);
            if (previewOrbit != null) previewOrbit.enabled = m == Mode.Preview;
        }

        void Teardown()
        {
            if (trackedImageManager != null) trackedImageManager.trackablesChanged.RemoveListener(OnTrackablesChanged);
            if (controller != null)
            {
                controller.StateChanged -= OnControllerState;
                controller.ReadoutChanged -= OnControllerReadout;
            }
            controller = null;
            if (previewOrbit != null) previewOrbit.End();
            if (model != null) Destroy(model);
            model = null;
            tracked = false;
        }

        // ---------------------------------------------------------------- AR tracking

        void OnTrackablesChanged(ARTrackablesChangedEventArgs<ARTrackedImage> args)
        {
            foreach (var img in args.added) HandleImage(img);
            foreach (var img in args.updated) HandleImage(img);
        }

        void HandleImage(ARTrackedImage img)
        {
            if (model == null || entry == null) return;
            if (img.referenceImage.name != entry.referenceImageName) return;

            var isTracking = img.trackingState == TrackingState.Tracking;
            if (isTracking)
            {
                // anchor on the page; image transform has +Y out of the paper, model sits flat on it
                model.transform.SetPositionAndRotation(img.transform.position, img.transform.rotation);
                if (!model.activeSelf) model.SetActive(true);
            }
            if (isTracking == tracked) return;
            tracked = isTracking;
            if (!isTracking) model.SetActive(false);
            Send(new TrackingMessage { state = isTracking ? "found" : "lost", experimentId = entry.experimentId });
        }

        // ---------------------------------------------------------------- outbound (Unity -> RN)

        void OnControllerState(string stateName) { Send(new StateMessage { name = stateName }); }

        void OnControllerReadout(float msr, int csr, float totalMm)
        {
            var now = Time.unscaledTime;
            if (now - lastReadoutTime < 1f / Mathf.Max(1f, readoutRateHz)) return;
            lastReadoutTime = now;
            Send(new ReadoutMessage { msr = msr, csr = csr, totalMm = totalMm });
        }

        public void SendError(string code, string message)
        {
            Debug.LogWarning("[RNBridge] " + code + ": " + message);
            Send(new ErrorMessage { code = code, message = message });
        }

        void Send(object payload)
        {
            var json = JsonUtility.ToJson(payload);
            Outbound?.Invoke(json);
#if UNITY_ANDROID && !UNITY_EDITOR
            try
            {
                using (var cls = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager"))
                    cls.CallStatic("sendMessageToMobileApp", json);
            }
            catch (Exception e) { Debug.LogWarning("[RNBridge] send failed: " + e.Message); }
#else
            Debug.Log("[RNBridge -> RN] " + json);
#endif
        }

        // ---------------------------------------------------------------- lifecycle

        void OnApplicationPause(bool paused)
        {
            // Unity's ARCore plugin pauses/resumes the session with the activity; we only make sure
            // a paused app does not keep a stale tracked state.
            if (paused) tracked = false;
        }

        void OnDestroy() { Teardown(); }

        // ---------------------------------------------------------------- helpers

        // Uniform scale so the longest renderer extent equals targetMeters (glTF is in metres: ~6 cm -> ~12 cm).
        static void FitToSize(Transform root, float targetMeters)
        {
            var renderers = root.GetComponentsInChildren<Renderer>();
            if (renderers.Length == 0) return;
            var b = renderers[0].bounds;
            foreach (var r in renderers) b.Encapsulate(r.bounds);
            var longest = Mathf.Max(b.size.x, Mathf.Max(b.size.y, b.size.z));
            if (longest > 1e-5f) root.localScale *= targetMeters / longest;
        }
    }
}
