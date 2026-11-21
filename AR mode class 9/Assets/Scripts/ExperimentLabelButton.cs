using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public sealed class ExperimentLabelButton : MonoBehaviour
{
    readonly List<ExperimentTapAnimation> models = new List<ExperimentTapAnimation>();
    ExperimentTapAnimation activeModel;
    Button button, reset;
    TextMeshProUGUI caption;
    RectTransform toolbar;
    Sprite surface;
    RectTransform safeAreaRoot;
    Rect lastSafeArea;
    Vector2Int lastScreenSize;

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
        toolbar = new GameObject("Model Actions", typeof(RectTransform)).GetComponent<RectTransform>();
        toolbar.SetParent(safeAreaRoot, false);
        toolbar.anchorMin = toolbar.anchorMax = toolbar.pivot = new Vector2(1, 0);
        toolbar.anchoredPosition = new Vector2(-36, 36);
        toolbar.sizeDelta = new Vector2(650, 132);
        surface = RoundedSurface();
        button = MakeButton("Show labels", 0, out caption);
        reset = MakeButton("Reset view", -333, out _);
        button.onClick.AddListener(ToggleLabels);
        reset.onClick.AddListener(() => { if (activeModel) activeModel.ResetView(); });

        if (!UnityEngine.EventSystems.EventSystem.current)
        {
            var events = new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem),
                typeof(UnityEngine.InputSystem.UI.InputSystemUIInputModule));
            events.transform.SetParent(transform, false);
        }
        ApplySafeArea();
        RefreshState();
    }

    Button MakeButton(string title, float x, out TextMeshProUGUI text)
    {
        var control = new GameObject(title, typeof(RectTransform), typeof(Image), typeof(Button)).GetComponent<Button>();
        var rect = (RectTransform)control.transform;
        rect.SetParent(toolbar, false);
        rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(1, 0);
        rect.sizeDelta = new Vector2(315, 132);
        rect.anchoredPosition = new Vector2(x, 0);
        var image = control.GetComponent<Image>();
        image.sprite = surface;
        image.type = Image.Type.Sliced;
        control.targetGraphic = image;
        var colors = control.colors;
        colors.highlightedColor = new Color(.93f, .97f, 1);
        colors.pressedColor = new Color(.77f, .85f, .91f);
        control.colors = colors;
        image.color = new Color32(24, 43, 58, 255);
        text = new GameObject("Caption", typeof(RectTransform), typeof(TextMeshProUGUI)).GetComponent<TextMeshProUGUI>();
        text.rectTransform.SetParent(rect, false);
        text.rectTransform.anchorMin = Vector2.zero;
        text.rectTransform.anchorMax = Vector2.one;
        text.rectTransform.offsetMin = new Vector2(16, 8);
        text.rectTransform.offsetMax = new Vector2(-16, -8);
        text.text = title;
        text.fontSize = 42;
        text.fontStyle = FontStyles.Bold;
        text.alignment = TextAlignmentOptions.Center;
        text.color = Color.white;
        text.raycastTarget = false;
        return control;
    }

    static Sprite RoundedSurface()
    {
        const int size = 64, radius = 24;
        var texture = new Texture2D(size, size, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp };
        var pixels = new Color32[size * size];
        for (int y = 0; y < size; y++)
            for (int x = 0; x < size; x++)
            {
                float dx = Mathf.Max(0, Mathf.Abs(x + .5f - size / 2f) - (size / 2f - radius));
                float dy = Mathf.Max(0, Mathf.Abs(y + .5f - size / 2f) - (size / 2f - radius));
                byte alpha = (byte)(255 * Mathf.Clamp01(radius + .5f - Mathf.Sqrt(dx * dx + dy * dy)));
                pixels[y * size + x] = new Color32(255, 255, 255, alpha);
            }
        texture.SetPixels32(pixels);
        texture.Apply();
        return Sprite.Create(texture, new Rect(0, 0, size, size), Vector2.one * .5f, 100, 0,
            SpriteMeshType.FullRect, Vector4.one * radius);
    }

    void OnDestroy()
    {
        if (!surface) return;
        if (Application.isPlaying)
        {
            Destroy(surface.texture);
            Destroy(surface);
        }
        else
        {
            DestroyImmediate(surface.texture);
            DestroyImmediate(surface);
        }
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
        button.interactable = available;
        toolbar.gameObject.SetActive(available);
        reset.gameObject.SetActive(available && activeModel.CanRotateView);
        button.image.color = visible ? new Color32(0, 105, 99, 255) : new Color32(24, 43, 58, 255);
        caption.text = visible ? "Hide labels" : "Show labels";
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
