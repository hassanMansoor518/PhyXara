using UnityEditor.SceneManagement;

// Copy this and the two model-validation test scripts into Assets/Editor for a complete check.
public static class Class10BuildAndCheck
{
    public static void ReviewOnly()
    {
        Class10Review.Validate();
        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        Class10Review.Render();
    }

    public static void Run()
    {
        Class10Setup.Build();
        MobileARSetup.Build();
        Class10Review.Validate();
        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        ModelRevealValidation.Run();
        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        LabelToggleValidation.Run();
        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        Class10Review.Render();
    }
}
