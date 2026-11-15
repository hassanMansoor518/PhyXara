# PhyXara — Current State and Delivery Phases

Version: 1.1 | Date: 2026-11-10 | Status: Independent application estimate pending build verification

Related: [PRD](PRD.md), [TRD](TRD.md), [Architecture](ARCHITECTURE.md).

## 1. Evidence-based current state

The repository and 36 supplied book images were inspected during planning. No successful Android build, physical-device AR session, or production authentication flow was verified. Presence of code or assets does not establish feature completion. The scope is an independent student application administered by its owner.

| Area | Observed implementation | Remaining work |
|---|---|---|
| Mobile interface | Screens for library, scanning, learning, quizzes, progress, and profiles | Connect complete practical journeys to real data |
| Authentication | Clerk provider and sign-in/sign-up hooks; simulated legacy service also present | Validate real flows and remove obsolete paths |
| Cloud learning and owner tools | No implemented application backend or owner content-management interface found in inspected source | Add user-owned attempts/progress and owner-controlled content publication |
| Unity host | Native host, bridge, AR/preview paths, export tools | Resolve dependencies and validate Android integration |
| Vernier and micrometer | Controllers and two registered experiment entries | Complete integration, source-specific lessons, and validation |
| Hooke's law | Controller and builder | Register and validate the complete practical |
| Inclined plane | Model, prefab, and controller | Adapt controller to the common bridge and integrate |
| Moments | Model assets | Implement assessed interactions and controller |
| Remaining practicals | No dedicated controllers identified in inspected source | Build content, assets, and simulations |
| Book tracking | Reference-image asset with an empty image list | Prepare and validate supported targets |
| Progress | Local persistence with demonstration initial values | Replace with real attempt-derived progress |
| Tutor/legacy recognition | Canned tutor responses and simulated recognition | Exclude unfinished features from release navigation |

Two registry entries exist for a book containing 16 practicals. This is an inventory count, not a completion percentage: the Vernier apparatus can support two practicals, and registry entries remain unverified.

Evidence locations:

- `../AR mode class 9/Assets/Experiments/ExperimentRegistry.asset`
- `../AR mode class 9/Assets/Experiments/PhyXaraReferenceImages.asset`
- `../AR mode class 9/Assets/Scripts/Bridge/IExperimentController.cs`
- `../AR mode class 9/Packages/manifest.json`
- `../Mobile/src/services/progressService.ts`
- `../Mobile/scripts/sync-unity.js`

## 2. Immediate blockers

- Unity scripts import AR Foundation but the inspected package manifest/lockfile contain Vuforia without the required AR Foundation/ARCore packages.
- The reference-image library is empty and registered entries lack reference textures.
- The synchronization script's default export path points to a different Unity directory name.
- The current bridge uses micrometer-specific measurement fields for all experiments.
- The inclined-plane controller does not implement the existing experiment interface.
- Expo documentation instructions and declared package versions disagree.
- Real cloud attempt history, personal progress, automatic assessment, and owner-controlled content publication require implementation.
- Book formulas/tables need educator review before becoming assessed content.

## 3. Delivery phases

The first public content release includes the whole supplied book. Smaller deliveries are internal milestones, not a reduction of the requested release scope.

| Phase | Work and owner | Exit criteria | Indicative duration |
|---|---|---|---|
| 0 — Stabilize and verify | Mobile/Unity developers reconcile dependencies, paths, toolchain, and one image target; educator confirms book identity | Reproducible Android build; one experiment works in AR and preview on a physical device; blockers documented | 1–2 weeks |
| 1 — Independent learning foundation | Backend/mobile developer builds direct signup, catalog, personal attempts/progress, automatic assessment, draft recovery, and private owner tools | Student signs up and completes a practice independently; second account cannot access its results; owner can publish content | 2–3 weeks |
| 2 — Reference practicals | Unity developer, artist, and educator finish Vernier practicals 1–2, micrometer 3, and Hooke's law 12; generic bridge and forms | Four complete reviewed practicals pass scientific, interaction, self-assessment, and AR checks | 3–4 weeks |
| 3 — Whole-book production | Unity developer/artist build remaining 12 practicals; educator validates content and assessment; app developer integrates tables/graphs | All 16 practicals complete the full learning journey and have validated targets | 8–12 weeks |
| 4 — Student pilot and release | QA and development team run device, personal-data access, recovery, progress, and independent-usability checks | Students from different educational backgrounds complete available practicals without instructor setup; release package and recovery verified | 2–3 weeks |
| 5 — College curriculum expansion | Content and engineering team maps an actual college syllabus and adds owner-published reviewed practicals | College students study appropriate content using the existing personal account and progress flow | Separately estimated |
| 6 — University content expansion | Add a selected university course with reviewed practicals, modules, and learning-navigation metadata | One complete university course works in the same independently operated app | Separately estimated |

Cross-platform iOS, Urdu, downloadable asset packs, and offline collections are separately prioritized after the first release. College and university support means additional student-facing learning content; institutions receive no administrative rights in any planned phase.

## 4. Schedule assumptions

Phases 0–4 total approximately 16–24 weeks with one mobile/backend developer, one Unity developer, a 3D artist, and part-time educator/QA support. This revised planning range removes institutional administration and teacher workflows, while retaining all 16 practicals, personal cloud progress, and private owner publishing. Validate staffing and scope during Phase 0.

This is a planning range, not a commitment. Re-estimate after the Android integration spike and again after the four reference practicals. A solo developer, model rework, textbook ambiguities, or native-integration incompatibility will extend the schedule. Do not assign dates to college/university content before selecting the actual syllabuses and practical counts.

## 5. Release gates

### Functional and scientific

- All 16 practicals have reviewed objectives, procedures, units, observation tables, calculations, assessments, and model interactions.
- Expected-value tests pass within experiment-specific tolerances.
- Students complete real practice attempts and receive automatic results and reviewed explanations; personal progress is derived from that work.
- Book scan and library launch lead to the same practical and learning record.

### Independent access and owner control

- Students can sign up without a school invitation, enrollment, or instructor approval.
- Two student accounts cannot access each other's private learning history.
- Direct resource-ID requests, cache access, queued jobs, and switching accounts on a shared device respect user ownership.
- Only the owner and authorized internal staff can use administration functions; students cannot publish content or grant themselves privileges.
- Changing education level or course selection preserves personal history and never changes administrative permissions.

### Android and operations

- Physical-device testing covers AR-supported and 3D-only cases, camera denial, tracking loss, low connectivity, app restart, and repeated Unity entry/exit.
- Documented recognition and frame-rate targets pass on the agreed device matrix.
- Attempt completion retries safely, drafts survive interruption, and failed synchronization is visible.
- Staging-to-production deployment, database backup restoration, and content rollback through version selection are tested.

## 6. Scope control

Preserve the current source as the starting point and replace demonstration behavior as each real workflow becomes available. Keep institution management, teacher assignments, classroom rosters, and institution-controlled app changes outside this roadmap. AI tutoring, subscriptions, university curricula, and arbitrary-image model generation are not part of the first release. Maintain a practical-by-practical checklist showing content, model, controller, tracking target, assessment, integration, and device-validation status; update completion only against observed evidence.
