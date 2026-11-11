using System.Collections.Generic;
using UnityEngine;
using Vuforia;

public sealed class ReferenceImageExperiments : MonoBehaviour
{
    [SerializeField] List<Experiment> experiments = new List<Experiment>();

    [System.Serializable]
    sealed class Experiment
    {
        public int Number;
        public ImageTargetBehaviour Target;
        public Animation Model;
    }

    void OnEnable()
    {
        foreach (var experiment in experiments)
            if (experiment.Target)
                experiment.Target.OnTargetStatusChanged += SetVisibility;

        foreach (var experiment in experiments)
            if (experiment.Target)
                SetVisibility(experiment.Target, experiment.Target.TargetStatus);
    }

    void OnDisable()
    {
        foreach (var experiment in experiments)
        {
            if (experiment.Target)
                experiment.Target.OnTargetStatusChanged -= SetVisibility;
            if (experiment.Model)
                experiment.Model.gameObject.SetActive(false);
        }
    }

    void SetVisibility(ObserverBehaviour target, TargetStatus status)
    {
        foreach (var experiment in experiments)
        {
            if (experiment.Target != target || !experiment.Model)
                continue;

            var model = experiment.Model;
            bool tracked = status.Status == Status.TRACKED;
            if (model.gameObject.activeSelf == tracked)
                return;

            model.gameObject.SetActive(tracked);
            if (tracked)
                model.Play();
            return;
        }
    }
}
