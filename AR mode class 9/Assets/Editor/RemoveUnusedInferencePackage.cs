using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

public static class RemoveUnusedInferencePackage
{
    static RemoveRequest request;
    static double deadline;

    public static void Run()
    {
        request = Client.Remove("com.unity.ai.inference");
        deadline = EditorApplication.timeSinceStartup + 180;
        EditorApplication.update += Poll;
    }

    static void Poll()
    {
        if (!request.IsCompleted)
        {
            if (EditorApplication.timeSinceStartup > deadline)
            {
                Debug.LogError("Removing the unused inference package timed out.");
                EditorApplication.Exit(2);
            }
            return;
        }
        EditorApplication.update -= Poll;
        bool success = request.Status == StatusCode.Success;
        if (success) Debug.Log("Removed the unused inference runtime.");
        else Debug.LogError(request.Error.message);
        EditorApplication.Exit(success ? 0 : 1);
    }
}
