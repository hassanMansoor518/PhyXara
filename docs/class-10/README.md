# Class 10 book integration

The supplied `AR_class_10.unitypackage` contains a Vuforia database and 12 target images. All 14 supplied assets were already installed and matched the package byte for byte; the original XML, DAT, images, and GUIDs are preserved.

The new apparatus follow the supplied Sindh Textbook Board *Physics Practical Journal, Class X*. Page numbers below identify the diagram used by each target, rather than the first page of its practical. `book-mapping.json` records the source-page checks and diagram thumbnails; `vuforia-package-inventory.json` records the package comparison.

| Practical | Target | Printed diagram page | PDF page |
|---|---|---:|---:|
| Glass slab refraction | glass_slab_refraction_no_watermark | 2 | 9 |
| Water index using a concave mirror | referencematerial_14 | 4 | 11 |
| Critical angle of glass | prism_total_reflection_no_watermark | 7 | 14 |
| Prism deviation | prism_diagram_enhanced | 8 | 15 |
| Convex lens by parallax | referencematerial_16 | 10 | 17 |
| Astronomical telescope | referencematerial_17 | 12 | 19 |
| Compound microscope | referencematerial_18 | 14 | 21 |
| Ohm's law | referencematerial_19 | 16 | 23 |
| Resistors in series | referencematerial_20 | 19 | 26 |
| Resistors in parallel | parallel_circuit_no_watermark | 21 | 28 |
| Galvanometer half deflection | referencematerial_22 | 23 | 30 |
| Bar magnet field | referencematerial_24 | 26 | 33 |

The scanner accepts both books without a book-selection step. Each scene contains the existing 13 Class 9 models and these 12 Class 10 models. The Class 10 reference numbers are 101-112 so they cannot collide with the Class 9 procedure numbering. The shared Label button and floating reveal apply to both books. New apparatus use one hit area each; animated parts are demonstrations rather than individual drag controls.

## Rebuild and review

1. In Unity, save open scenes and leave Play Mode.
2. Run **PhyXara > Build Class 10 Book Experiments**. This rebuilds only the Class 10 objects and assets. The first pre-Class-10 scenes are backed up in `Library/BeforeClass10`.
3. Run **PhyXara > Validate Class 10 Experiments** and **PhyXara > Render Class 10 Model Previews**.
4. Export Android, run `npm run unity:sync` in `Mobile`, then rebuild the Android app as described in `Mobile/src/unity/README.md`.

The saved book catalog is `Assets/Experiments/Class10/Class10Book.json`. The authoring data is in `Assets/Scripts/Class10Book.cs`. Rendered apparatus previews are written to `docs/class-10/models`.

## Physical calibration and source accuracy

The supplied XML declares widths of 10, 15, and 18. [Vuforia interprets XML dimensions as metres](https://developer.vuforia.com/library/vuforia-engine/images-and-objects/image-targets/device-databases/modify-dataset-configuration-xml-file/), which is too large for a printed book diagram. The scene overrides these with nominal widths of 0.10, 0.15, and 0.18 metres. This is a starting calibration, not a verified measurement of a printed book. Measure the actual width of each printed tracking crop and update its `WidthMeters` in `Class10Book.cs` before validating scale on a phone. Fit-to-page printing and screen displays can change the physical size. The source XML/DAT remain unchanged; Vuforia's authoring `GetSize()` is checked against the scene overrides.

The geometry uses millimetres scaled to Unity metres. Light paths use Snell's law and thin-lens relationships; the telescope uses a longer-focus objective and shorter-focus eyepiece. Circuit examples use consistent values and conventional-current direction. The book contains typographic inconsistencies in Ohm's-law and focal-length text; these were recorded in `book-mapping.json` and were not copied into the demonstrations.

Validation results distinguish scene/animation checks from real-camera recognition and frame-rate measurements. A physical-device pass is required before claiming printed-size calibration or recognition quality.
