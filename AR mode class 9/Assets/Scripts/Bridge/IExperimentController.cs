using System;

namespace PhyXara.Bridge
{
    /// <summary>
    /// What RNBridge needs from the model on a prefab root. New experiments implement this
    /// (MicrometerController does) and register their prefab in the ExperimentRegistry.
    /// </summary>
    public interface IExperimentController
    {
        void PlayAnimation();
        void StopAnimation();
        void StartPractical();
        void ResetPractical();
        void SetLanguage(string lang);

        /// <summary>Fired when the animation/practical state changes (name goes to RN).</summary>
        event Action<string> StateChanged;

        /// <summary>Fired when the reading changes: main scale (mm), circular scale divisions, total (mm).</summary>
        event Action<float, int, float> ReadoutChanged;
    }
}
