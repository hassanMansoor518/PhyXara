// Evaluate with Unity's script eval command while SampleScene is open in Edit Mode.
var source = UnityEngine.Object.FindObjectsByType<ExperimentTapAnimation>(UnityEngine.FindObjectsInactive.Include, UnityEngine.FindObjectsSortMode.None).Single(t => t.referenceNumber == 107);
var preview = UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();
var flags = System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic;
var target = UnityEngine.Object.Instantiate(source.transform.parent.gameObject);
UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(target, preview);
var rig = new UnityEngine.GameObject("Control validation");
UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(rig, preview);
var camera = rig.AddComponent<UnityEngine.Camera>();
var model = target.GetComponentInChildren<ExperimentTapAnimation>(true);
ExperimentLabelButton hud = null;
try
{
    model.gameObject.SetActive(true);
    Call(model, "Awake");
    Check(!model.CanRotateView, "Untracked model accepted rotation");
    Call(model, "SetRevealTracking", true);
    Call(model, "AdvanceReveal", 2f);
    Check(model.CanRotateView, "Tracked model could not rotate");
    var pivot = model.GetComponent<UnityEngine.BoxCollider>().center;
    var initialCenter = model.transform.TransformPoint(pivot);
    var initialRotation = model.transform.localRotation;
    var initialPosition = model.transform.localPosition;
    var animationClip = model.animationPlayer.clip;
    animationClip.SampleAnimation(model.gameObject, 5);
    var motionPart = model.transform.Find("Fine-focus knob");
    var animatedAngle = motionPart.localRotation;
    float shorterDimension = UnityEngine.Mathf.Max(1, UnityEngine.Mathf.Min(UnityEngine.Screen.width, UnityEngine.Screen.height));
    for (int i = 0; i < 4; i++) Call(model, "RotateView", new UnityEngine.Vector2(shorterDimension / 4f, 0), camera.transform);
    Check(UnityEngine.Quaternion.Angle(initialRotation, model.transform.localRotation) < .02f, "The full turn did not return to the starting orientation");
    Call(model, "RotateView", new UnityEngine.Vector2(shorterDimension / 4f, 0), camera.transform);
    Check(UnityEngine.Mathf.Abs(UnityEngine.Quaternion.Angle(initialRotation, model.transform.localRotation) - 90) < .02f, "Drag did not produce a quarter turn");
    Call(model, "RotateView", new UnityEngine.Vector2(0, shorterDimension / 3f), camera.transform);
    Check(UnityEngine.Vector3.Distance(initialCenter, model.transform.TransformPoint(pivot)) < .00001f, "Tilt displaced the center");
    Check(UnityEngine.Quaternion.Angle(animatedAngle, motionPart.localRotation) < .02f, "Rotating changed the animated part");
    animationClip.SampleAnimation(model.gameObject, 8);
    Check(UnityEngine.Vector3.Distance(initialCenter, model.transform.TransformPoint(pivot)) < .00001f, "Animation moved the view pivot");

    hud = rig.AddComponent<ExperimentLabelButton>();
    Call(hud, "Awake");
    var button = (UnityEngine.UI.Button)hud.GetType().GetField("button", flags).GetValue(hud);
    var reset = (UnityEngine.UI.Button)hud.GetType().GetField("reset", flags).GetValue(hud);
    var caption = button.GetComponentInChildren<TMPro.TMP_Text>();
    Check(button.interactable && reset.gameObject.activeInHierarchy && caption.text == "Show labels", "Wrong initial controls");
    button.onClick.Invoke();
    Check(model.LabelsVisible && caption.text == "Hide labels", "Label control did not reveal callouts");
    reset.onClick.Invoke();
    Check(model.transform.localPosition == initialPosition && UnityEngine.Quaternion.Angle(model.transform.localRotation, initialRotation) < .02f, "Reset did not restore the authored pose");
    button.onClick.Invoke();
    Check(!model.LabelsVisible && caption.text == "Show labels", "Label control did not retract callouts");
    Call(model, "SetRevealTracking", false);
    Call(hud, "RefreshState");
    Check(!button.interactable && !reset.gameObject.activeInHierarchy && !model.CanRotateView, "Controls stayed available after tracking loss");
    return "PASS: tracked rotation and tilt, stable center, animation pose, reset, label states, tracking loss";
}
finally
{
    if (hud) Call(hud, "OnDestroy");
    UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(preview);
}
void Call(object subject, string method, params object[] args) => subject.GetType().GetMethod(method, flags).Invoke(subject, args);
void Check(bool condition, string message) { if (!condition) throw new System.Exception(message); }
