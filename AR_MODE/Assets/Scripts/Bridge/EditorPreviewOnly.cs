using UnityEngine;

namespace PhyXara.Bridge
{
    /// <summary>
    /// Put on a model instance that sits in the scene only so you can look at it in the Scene/Game view while editing.
    /// It switches itself off when Play starts (RNBridge spawns the real model) and, because it carries the built-in
    /// "EditorOnly" tag, it is stripped from player builds.
    /// </summary>
    public class EditorPreviewOnly : MonoBehaviour
    {
        void Awake()
        {
            if (Application.isPlaying) gameObject.SetActive(false);
        }
    }
}
