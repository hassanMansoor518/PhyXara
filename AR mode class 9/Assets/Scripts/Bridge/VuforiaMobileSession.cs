using System;
using UnityEngine;
using Vuforia;

namespace PhyXara.Bridge
{
    public sealed class VuforiaMobileSession : MonoBehaviour
    {
        [SerializeField] VuforiaBehaviour engine;
        [SerializeField] Camera arCamera;
        [SerializeField] ImageTargetBehaviour[] targets;

        public event Action<string, bool, GameObject> TrackingChanged;
        public bool IsRunning { get; private set; }
        ImageTargetBehaviour current;

        public void SetRunning(bool running)
        {
            IsRunning = running;
            if (!running)
                ClearTracking();
            foreach (var target in targets)
                if (target)
                    target.gameObject.SetActive(running);
            arCamera.enabled = running;
            engine.enabled = running;
        }

        void LateUpdate()
        {
            if (!IsRunning)
                return;

            ImageTargetBehaviour seen = null;
            foreach (var target in targets)
            {
                if (target && target.TargetStatus.Status == Status.TRACKED)
                {
                    seen = target;
                    break;
                }
            }
            if (seen == current)
                return;
            ClearTracking();
            current = seen;
            if (current)
                TrackingChanged?.Invoke(ExperimentId(current.TargetName), true, current.gameObject);
        }

        void ClearTracking()
        {
            if (!current)
                return;
            TrackingChanged?.Invoke(ExperimentId(current.TargetName), false, current.gameObject);
            current = null;
        }

        public static string ExperimentId(string targetName)
        {
            switch (targetName)
            {
                case "referencematerial_1": return "exp_vernier_caliper";
                case "referencematerial_2": return "exp3_micrometer";
                default: return targetName;
            }
        }
    }
}
