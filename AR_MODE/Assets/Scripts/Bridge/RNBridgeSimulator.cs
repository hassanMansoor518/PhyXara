using UnityEngine;

namespace PhyXara.Bridge
{
    /// <summary>
    /// Editor test: feeds RNBridge the exact JSON RN would send. Press Play, then use the on-screen buttons
    /// (or the component's context menu). Outbound messages are logged to the Console.
    /// Stripped from release builds.
    /// </summary>
    public class RNBridgeSimulator : MonoBehaviour
    {
        public RNBridge bridge;
        public string experimentId = "exp3_micrometer";

#if UNITY_EDITOR || DEVELOPMENT_BUILD
        void OnGUI()
        {
            if (bridge == null) return;
            GUILayout.BeginArea(new Rect(10, 10, 220, 400));
            if (GUILayout.Button("open preview")) Feed("{\"v\":1,\"type\":\"open\",\"mode\":\"preview\",\"experimentId\":\"" + experimentId + "\"}");
            if (GUILayout.Button("open ar")) Feed("{\"v\":1,\"type\":\"open\",\"mode\":\"ar\",\"experimentId\":\"" + experimentId + "\"}");
            if (GUILayout.Button("playAnimation")) Feed("{\"v\":1,\"type\":\"playAnimation\"}");
            if (GUILayout.Button("stopAnimation")) Feed("{\"v\":1,\"type\":\"stopAnimation\"}");
            if (GUILayout.Button("startPractical")) Feed("{\"v\":1,\"type\":\"startPractical\"}");
            if (GUILayout.Button("resetPractical")) Feed("{\"v\":1,\"type\":\"resetPractical\"}");
            if (GUILayout.Button("setLanguage ur")) Feed("{\"v\":1,\"type\":\"setLanguage\",\"lang\":\"ur\"}");
            if (GUILayout.Button("stop")) Feed("{\"v\":1,\"type\":\"stop\"}");
            GUILayout.EndArea();
        }
#endif

        public void Feed(string json)
        {
            Debug.Log("[Simulator RN -> Unity] " + json);
            bridge.OnMessage(json);
        }

        [ContextMenu("Open preview")] void OpenPreview() { Feed("{\"v\":1,\"type\":\"open\",\"mode\":\"preview\",\"experimentId\":\"" + experimentId + "\"}"); }
        [ContextMenu("Open AR")] void OpenAr() { Feed("{\"v\":1,\"type\":\"open\",\"mode\":\"ar\",\"experimentId\":\"" + experimentId + "\"}"); }
        [ContextMenu("Stop")] void StopIt() { Feed("{\"v\":1,\"type\":\"stop\"}"); }
    }
}
