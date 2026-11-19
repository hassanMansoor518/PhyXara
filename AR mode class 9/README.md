# AR mode class 9

This Unity project contains 13 Class 9 and 12 Class 10 Vuforia image targets with animated, labelled AR experiments.

1. Get Vuforia Engine 11.4.4 for Unity from the [Vuforia SDK downloads](https://developer.vuforia.com/downloads/sdk). Place the SDK tarball named `com.ptc.vuforia.engine-11.4.4.tgz` in `Packages/` before opening the project.
2. Open this folder in Unity 6.0.84f1 and let Unity resolve the packages.
3. Open `Assets/Scenes/SampleScene.unity`. On `ARCamera`, open Vuforia Configuration and enter your own App License Key. Keep changes that contain a key local.
4. Enter Play Mode and point the webcam at a reference image. The models are also available under their respective image targets in the Edit Mode Hierarchy.

Models rise from the detected image and settle above it. Tap a model to run its procedure; use the **Label** button to show or retract its part callouts. For standalone webcam testing use `SampleScene`; `PhyXaraMobile` waits for the React Native AR-session command.

See [the Class 10 book mapping](../docs/class-10/README.md) and [Class 9 model repair notes](../docs/model-validation/class9-opening-findings.md) for image numbering, validation and hardware-testing limits. SDK archives, generated builds and local license keys stay outside Git.
