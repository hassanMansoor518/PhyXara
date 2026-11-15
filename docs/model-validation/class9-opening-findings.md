# Class 9 model opening and empty calorimeter

Updated 14 November 2026.

The supplied screenshot shows Unity reference 12, the calorimeter (printed book experiment 15, page 32). Its blue water used the same rear-wall cutaway helper as the vessel. It had no filled volume or horizontal surface. Both boiler and calorimeter now use translucent filled cylinders. Their bottoms clear the solid bases; the transferred sample ends fully submerged above the cup base. The outer apparatus retains its educational cutaway.

The common reveal previously restarted on every tracking loss. Repeated brief webcam dropouts could keep a model flattened before its 1.1-second reveal finished. Dropouts shorter than 0.35 seconds now pause and resume the reveal. Longer losses restart it. Untracked models still hide and reject input. The reveal wrapper also stays at identity before first detection so controller Awake calibration sees the authored geometry.

The original inclined-plane prefab now contains its part labels, connecting lines, procedure captions, tap component and colliders. An accidental nested copy was removed from each scene. Both scenes retain one instance of each of the 25 models. Backups of the scenes and original prefab are under `AR mode class 9/Library/BeforeClass9OpeningRepair`; the original calorimeter clip is under `Library/BeforeCalorimeterWater`.

Printed experiment numbers differ from Unity image reference numbers:

| Printed book number | Apparatus | Unity reference |
| --- | --- | --- |
| 4 | Inclined plane | 3 |
| 7 | Rolling friction | 6 |
| 12 | Hooke's law spring | 9 |
| 5 | Vertical pulley board | 4 |
| 8 | Principle of moments | 7 |
| 15 | Calorimeter shown in screenshot | 12 |

For standalone webcam testing, open `Assets/Scenes/SampleScene.unity`. The mobile scene waits for the React Native AR session command. Scan the actual registered book illustration: the separate clean `Inclined-plane.jpg` illustration is not the trained reference-3 target.

Validation evidence:

- `model-reveal-results.txt`: all 50 scene instances, original transforms, animation bindings and hover/reveal timing.
- `label-toggle-results.txt`: all 50 instances, label extension/retraction and common button wiring.
- `tracking-reacquisition-results.txt`: actual SDK status-event dispatch with explicit Edit Mode lifecycle invocation, short/long loss behavior and model activation.
- `calorimeter-water-results.txt`: both scene water volumes/materials, fixed water levels, complete label bindings and submerged final sample.
- `calorimeter-water-front.png` and `calorimeter-water-oblique.png`: Unity renders inspected for surface visibility, sample visibility and overlapping faces.
- `../class-10/validation-results.txt`: all Class 10 apparatus, physics checks and 25 mobile target bindings preserved.

Native webcam recognition, real Play Mode timing and phone rendering were not tested. The code defects above are confirmed; this does not prove that every reported scan failure had the same cause.
