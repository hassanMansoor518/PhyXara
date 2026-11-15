using System.Collections.Generic;
using UnityEngine;

public sealed class ExperimentLabelButton : MonoBehaviour
{
    readonly List<ExperimentTapAnimation> models = new List<ExperimentTapAnimation>();
    ExperimentTapAnimation activeModel;
    UnityEngine.UI.Button button;
    UnityEngine.UI.Image background;
    TMPro.TextMeshProUGUI caption;
    RectTransform safeAreaRoot;
    Rect lastSafeArea;
    Vector2Int lastScreenSize;
    bool labelsVisible;

    void Awake()
    {
        foreach (var root in gameObject.scene.GetRootGameObjects())
            models.AddRange(root.GetComponentsInChildren<ExperimentTapAnimation>(true));

        var canvasObject = new GameObject("Experiment Controls", typeof(RectTransform), typeof(Canvas),
            typeof(UnityEngine.UI.CanvasScaler), typeof(UnityEngine.UI.GraphicRaycaster));
        canvasObject.transform.SetParent(transform, false);
        var canvas = canvasObject.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.sortingOrder = 100;
        var scaler = canvasObject.GetComponent<UnityEngine.UI.CanvasScaler>();
        scaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1080, 1920);
        scaler.matchWidthOrHeight = .5f;

        safeAreaRoot = new GameObject("Safe Area", typeof(RectTransform)).GetComponent<RectTransform>();
        safeAreaRoot.SetParent(canvas.transform, false);
        var buttonObject = new GameObject("Label", typeof(RectTransform), typeof(UnityEngine.UI.Image),
            typeof(UnityEngine.UI.Button));
        var rect = buttonObject.GetComponent<RectTransform>();
        rect.SetParent(safeAreaRoot, false);
        rect.anchorMin = rect.anchorMax = new Vector2(1, 0);
        rect.pivot = new Vector2(1, 0);
        rect.sizeDelta = new Vector2(280, 144);
        rect.anchoredPosition = new Vector2(-40, 40);
        background = buttonObject.GetComponent<UnityEngine.UI.Image>();
        background.color = new Color(.06f, .09f, .15f);
        button = buttonObject.GetComponent<UnityEngine.UI.Button>();
        button.targetGraphic = background;
        button.interactable = false;
        button.onClick.AddListener(ToggleLabels);

        caption = new GameObject("Caption", typeof(RectTransform), typeof(TMPro.TextMeshProUGUI))
            .GetComponent<TMPro.TextMeshProUGUI>();
        caption.rectTransform.SetParent(rect, false);
        caption.rectTransform.anchorMin = Vector2.zero;
        caption.rectTransform.anchorMax = Vector2.one;
        caption.rectTransform.offsetMin = new Vector2(16, 8);
        caption.rectTransform.offsetMax = new Vector2(-16, -8);
        caption.text = "Label";
        caption.fontSize = 48;
        caption.alignment = TMPro.TextAlignmentOptions.Center;
        caption.color = Color.white;
        caption.raycastTarget = false;

        if (!UnityEngine.EventSystems.EventSystem.current)
        {
            var events = new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem),
                typeof(UnityEngine.InputSystem.UI.InputSystemUIInputModule));
            events.transform.SetParent(transform, false);
        }
        ApplySafeArea();
        RefreshState();
    }

    void Update()
    {
        if (lastSafeArea != Screen.safeArea || lastScreenSize != new Vector2Int(Screen.width, Screen.height))
            ApplySafeArea();
        RefreshState();
    }

    void RefreshState()
    {
        activeModel = null;
        foreach (var model in models)
            if (model && model.CanToggleLabels) { activeModel = model; break; }
        bool available = activeModel;
        bool visible = available && activeModel.LabelsVisible;
        if (button.interactable == available && labelsVisible == visible) return;
        button.interactable = available;
        labelsVisible = visible;
        background.color = visible ? new Color(.12f, .32f, .8f) : new Color(.06f, .09f, .15f);
    }

    void ToggleLabels()
    {
        if (activeModel && activeModel.CanToggleLabels) activeModel.ToggleLabels();
        RefreshState();
    }

    void ApplySafeArea()
    {
        lastSafeArea = Screen.safeArea;
        lastScreenSize = new Vector2Int(Screen.width, Screen.height);
        var size = new Vector2(Mathf.Max(1, Screen.width), Mathf.Max(1, Screen.height));
        safeAreaRoot.anchorMin = lastSafeArea.min / size;
        safeAreaRoot.anchorMax = lastSafeArea.max / size;
        safeAreaRoot.offsetMin = safeAreaRoot.offsetMax = Vector2.zero;
    }
}
