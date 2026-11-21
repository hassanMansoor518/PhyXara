# PhyXara — Product Requirements Document

Version: 1.1 | Date: 2026-11-10 | Status: Independent student application baseline

Related: [Technical requirements](TRD.md), [Architecture](ARCHITECTURE.md), [Delivery phases](ROADMAP.md).

## 1. Product vision

PhyXara is an independent physics learning application for individual students from any school or college, designed to expand to university students. Students study practicals, interact with simulated apparatus in 3D or augmented reality, collect observations, calculate results, and receive automatic practice feedback.

Students register directly and use one app-owner-managed curriculum catalog. The app owner controls features, content, publication, and administration. Schools, colleges, and universities describe the audience; they have no administrative role, content-editing rights, control over student accounts, or automatic access to student results. No institutional affiliation or approval is required to use the application.

## 2. Confirmed scope and defaults

User-confirmed decisions:

- Android first.
- The first content release covers all 16 practicals in the supplied 36-page image archive.
- Individual student accounts and cloud progress. This replaces the earlier interpretation of school-managed accounts.
- Scan supported book diagrams for AR, with the same experiments available in a conventional 3D library.
- English first.
- Students from any school or college; university learners in a future content expansion.
- The application is independently operated, with no institution-controlled changes or administration.

Defaults adopted for implementation:

- A private administration interface is reserved for the app owner and explicitly authorized internal staff.
- Students choose an education level, curriculum/board where relevant, and course. These are learning preferences, not school memberships or permission boundaries.
- Each person has one account and personal learning history across courses and education levels.
- The initial content collection is provisionally Class 9 physics. Its board, edition, and publication permissions must be confirmed during content preparation.
- The first catalog contains the supplied practical book. College syllabuses and university modules are later content releases; future courses are not displayed as already available.

## 3. Users and permissions

| User | Main capabilities |
|---|---|
| Student | Choose courses, study practicals, save observations, check answers, retry, and view personal progress |
| App owner | Manage the application, publish content, manage internal staff access, and oversee operations |
| Owner-authorized content editor/reviewer | Prepare and scientifically review lessons, source mappings, simulations, and assessments within granted permissions |

Students see their own private learning records. Content-editor permission does not grant access to private student records. A person's school, college, university, or email domain never grants administration privileges. An educator may review content only when explicitly appointed by the app owner as internal staff.

## 4. Learning and owner journeys

### Student journey

1. Create an individual account and sign in directly.
2. Choose an available course, browse its practicals, or resume personal study.
3. Study the objective, apparatus, theory, procedure, and precautions.
4. Scan a supported diagram or choose Open in 3D.
5. Manipulate relevant apparatus controls and observe meaningful physical changes.
6. Record repeated readings, complete calculations, and inspect graphs.
7. Answer viva or quiz questions and finish the practice attempt.
8. View automatic results, explanations, and progress; retry a practical to improve understanding.

### App-owner journey

1. Prepare a course and its source-referenced practical content.
2. Review scientific accuracy, models, tracking targets, and assessment explanations with authorized internal reviewers.
3. Validate compatibility with the Android application and publish a content version.
4. Monitor aggregate app usage, failures, and content quality.
5. Publish corrections or additional courses while preserving students' historical attempts.

Changing a selected course or education level changes catalog filters, not account ownership or access rights. Personal history remains available across those changes.

## 5. First-release requirements

| ID | Requirement |
|---|---|
| P01 | Allow students to register and study independently without school or college approval |
| P02 | Protect personal attempts and results; restrict app/content administration to the owner and authorized internal staff |
| P03 | Provide all 16 supplied practicals with complete learning, simulation, observation, and assessment flows |
| P04 | Provide guided procedure and free exploration modes, apparatus labels, rotation, zoom, and reset |
| P05 | Recognize registered book targets and open the correct prepared experiment |
| P06 | Offer the same simulation in 3D when camera access or AR support is unavailable |
| P07 | Support experiment-specific observation tables, units, repeated readings, calculations, and graphs |
| P08 | Calculate progress from completed learning work; new users start with no earned progress |
| P09 | Support self-paced practicals, draft attempts, automatic answer checking, explanations, and repeat attempts |
| P10 | Preserve drafts across network interruption and app restart; display pending synchronization |
| P11 | Provide personal progress by practical and course, plus owner-only aggregate usage and error reporting |
| P12 | Separate content from presentation so later grades, college courses, university modules, and languages can be added |

AR uses prepared image targets and existing models. Generating an arbitrary 3D model from an unknown diagram is outside this release. An unsupported image must not open an unrelated experiment.

## 6. Initial practical catalog

Page references below identify image numbers in the supplied ZIP, not an independently verified edition.

| No. | Practical | Images | Main interaction |
|---|---|---|---|
| 1 | Cylinder cross-sectional area using Vernier calipers | 1–2 | Measure diameter and calculate area |
| 2 | Cylinder volume using Vernier calipers | 3–6 | Measure diameter and length and calculate volume |
| 3 | Wire/strip measurement using a micrometer | 7–8 | Turn spindle and interpret scales |
| 4 | Ball motion on an inclined plane | 9–10 | Release ball, measure time and distance, plot results |
| 5 | Gravitational acceleration using free fall | 11–12 | Operate the illustrated apparatus and calculate results |
| 6 | Limiting friction and normal reaction | 13–14 | Change load and find motion threshold |
| 7 | Rolling friction | 15–16 | Change roller load and pulling force |
| 8 | Principle of moments | 17–18 | Move weights and balance a meter rule |
| 9 | Unknown weight using vector addition | 19–21 | Adjust forces and construct the resultant |
| 10 | Unknown mass using moments | 22–24 | Balance known and unknown masses |
| 11 | Simple pendulum and gravitational acceleration | 25–26 | Change length and time oscillations |
| 12 | Hooke's law | 27–28 | Add/remove weights and plot load versus extension |
| 13 | Density using Archimedes' principle | 29–30 | Compare weight in air and apparent weight in water |
| 14 | Liquid density using a syringe | 31 | Measure mass and volume |
| 15 | Specific heat by the method of mixtures | 32–33 | Combine materials and record temperatures |
| 16 | Heating curve of ice, water, and steam | 34–36 | Apply heat and observe phase changes |

An educator must review formulas, apparatus assumptions, tables, units, and answer keys. Apparent inconsistencies in the photographed source must be resolved and recorded rather than copied directly into assessment logic.

## 7. Acceptance and measures

- All 16 practicals support learn → interact → observe → calculate → check answers → progress.
- A student can register and complete a practical without an institution, invitation code, instructor, or assigned class.
- Two student accounts cannot read or modify each other's private attempts, drafts, or results.
- A new student sees zero earned progress, and repeated network requests do not duplicate completed attempts or progress.
- Camera denial and unsupported AR preserve access to the 3D learning flow.
- Publication metadata is flexible enough to represent a university course and module using the same personal-account model.
- Student requests to administrative endpoints are rejected; school affiliation never changes this behavior.
- Pilot reports measure practical completion, answer-check success, recognition success, crash frequency, and independent task completion. Numerical learning-outcome targets follow the baseline pilot rather than being invented in advance.

## 8. Later releases

College-level physics collections, university courses and laboratory modules, Urdu, iOS, downloadable content packs, comprehensive offline study, and optional AI tutoring are later phases. Semester or subject labels may organize university content; they do not create university-controlled accounts. Billing and subscriptions are not first-release requirements.

Institution administration, classroom rosters, teacher assignments, institutional reports, and institution-controlled publishing are outside the product scope, including the current future roadmap. Adding more educational levels does not grant institutions control of the app.
