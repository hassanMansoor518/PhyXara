using System;

namespace PhyXara.Bridge
{
    // JSON contract v1. JsonUtility needs public fields on [Serializable] classes.
    public static class Msg
    {
        public const int Version = 1;

        // RN -> Unity
        public const string Open = "open";
        public const string PlayAnimation = "playAnimation";
        public const string StopAnimation = "stopAnimation";
        public const string StartPractical = "startPractical";
        public const string ResetPractical = "resetPractical";
        public const string SetLanguage = "setLanguage";
        public const string Stop = "stop";

        // Unity -> RN
        public const string Ready = "ready";
        public const string Tracking = "tracking";
        public const string State = "state";
        public const string Readout = "readout";
        public const string Error = "error";
    }

    // Superset of all inbound fields; unused ones stay at their defaults.
    [Serializable]
    public class InboundMessage
    {
        public int v;
        public string type;
        public string mode;
        public string experimentId;
        public string lang;
    }

    [Serializable] public class ReadyMessage { public int v = Msg.Version; public string type = Msg.Ready; }

    [Serializable]
    public class TrackingMessage
    {
        public int v = Msg.Version; public string type = Msg.Tracking;
        public string state; public string experimentId;
    }

    [Serializable]
    public class StateMessage
    {
        public int v = Msg.Version; public string type = Msg.State;
        public string name;
    }

    [Serializable]
    public class ReadoutMessage
    {
        public int v = Msg.Version; public string type = Msg.Readout;
        public float msr; public int csr; public float totalMm;
    }

    [Serializable]
    public class ErrorMessage
    {
        public int v = Msg.Version; public string type = Msg.Error;
        public string code; public string message;
    }
}
