using System;
using System.Collections.Generic;
using UnityEngine;

namespace PhyXara.Bridge
{
    [Serializable]
    public class ExperimentEntry
    {
        public string experimentId = "exp3_micrometer";
        public GameObject modelPrefab;

        [Tooltip("Name of the image inside the XRReferenceImageLibrary (AR mode).")]
        public string referenceImageName = "exp3_micrometer";

        [Tooltip("Drop the page/diagram image here, then run PhyXara > Sync Reference Image Library.")]
        public Texture2D referenceTexture;

        [Tooltip("Real printed width of the diagram in metres. ARCore needs this for scale.")]
        public float physicalWidthMeters = 0.15f;

        [Tooltip("Longest side of the model in AR, metres (about 12 cm on the page).")]
        public float modelSizeMeters = 0.12f;

        [Tooltip("Extra rotation (euler degrees) applied in AR so the model lies the right way on the page. 0 = model Y axis is the page normal.")]
        public Vector3 arRotationEuler = Vector3.zero;
    }

    [CreateAssetMenu(menuName = "PhyXara/Experiment Registry", fileName = "ExperimentRegistry")]
    public class ExperimentRegistry : ScriptableObject
    {
        public List<ExperimentEntry> entries = new List<ExperimentEntry>();

        public ExperimentEntry Find(string experimentId)
        {
            foreach (var e in entries)
                if (e != null && e.experimentId == experimentId) return e;
            return null;
        }

        public ExperimentEntry FindByImage(string imageName)
        {
            foreach (var e in entries)
                if (e != null && e.referenceImageName == imageName) return e;
            return null;
        }
    }
}
