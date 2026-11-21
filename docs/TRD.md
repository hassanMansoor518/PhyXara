# PhyXara — Technical Requirements Document

Version: 1.1 | Date: 2026-11-10 | Status: Independent student application baseline

Related: [PRD](PRD.md), [Architecture](ARCHITECTURE.md), [Delivery phases](ROADMAP.md).

## 1. Technology baseline

| Component | Decision |
|---|---|
| Android app | Retain React Native, Expo, TypeScript, and Expo Router |
| Simulation | Retain Unity 6 and the native host integration |
| Android AR | Standardize on AR Foundation and ARCore; remove conflicting unused AR integrations after validating references |
| Identity | Retain Clerk for authentication |
| Authorization | User ownership of learning records; separate owner-authorized internal administration permissions |
| Owner administration and backend | Next.js with TypeScript, versioned REST routes, and separated domain modules |
| Structured data | PostgreSQL with user-owned learning records and an app-owner-managed catalog |
| Assets | Object storage/CDN for published educational content |
| Local recovery | SQLite drafts and an idempotent retry queue, scoped by signed-in user |

Pin a compatible mobile/Unity/native-toolchain combination during Phase 0. The inspected mobile instructions name Expo 54 while the manifest declares Expo 57; resolve the discrepancy before coding. Use a native Android build for Unity rather than Expo Go. See [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/).

AR is optional: check device support and required service availability before starting the AR session. See [Google's ARCore setup guidance](https://developers.google.com/ar/develop/unity-arf/enable-arcore).

## 2. Domain model

### Identity and individual ownership

- User: individual account linked to the identity provider, with profile and account status.
- LearningPreference: selected education level, optional curriculum/board, and preferred course. Preferences filter discovery and never grant privileges.
- StaffAccess: internal administration permissions assigned by the app owner. Never derived from signup fields, email domain, or academic affiliation.

Academic grades, college years, and university course/semester labels are curriculum metadata. Do not hard-code the domain to Class 9–12. Institution, membership, classroom, and assignment entities are not required by this product.

### Shared educational catalog

- CurriculumFramework: board or other curriculum authority, edition, and source metadata.
- Course: educational level, title, subject, optional grade label or course code, and framework association.
- Module: an ordered course subdivision, displayed as a chapter or module.
- Practical and PracticalVersion: stable practical identity and immutable published learning/assessment content.
- CoursePractical: ordered association allowing one practical to appear in several courses.
- SimulationDefinition: controller key, asset key, supported actions/parameters, measurement definitions, and supported app version.
- DiagramTarget: target identity, source image reference, printed size, and practical mapping.

Catalog records are managed by the app owner and authorized internal staff. Draft or retired content is not returned through published-catalog endpoints. Published learning content is available to individual students regardless of school affiliation.

### Learning records

- Attempt: owning user, pinned practical version, simulation version, and draft/completed lifecycle state. A retry creates a separate attempt.
- Observation: attempt, quantity, value, unit, sequence/trial, and recording timestamp.
- AttemptResult: immutable completion snapshot, server-calculated assessment outcome, and explanations derived from the reviewed answer key.
- ProgressSummary: derived per-user practical/course completion and practice history; repeat attempts do not count as additional distinct completed practicals.
- AuditEvent: actor, operation, affected record, and timestamp for administrative or sensitive account actions.

Attempts carry user_id. Observations and results inherit ownership through their attempt. Every private lookup checks authenticated ownership. A student-supplied user ID cannot change the owner of an attempt or its child records. Published content versions remain available to historical attempts when superseded.

## 3. Authorization and isolation

- Verify identity server-side and derive user ownership from the verified session for every private operation.
- Require the authenticated user's scope in repository methods for attempts, observations, results, and progress.
- Expose catalog reads separately from owner-only publishing operations.
- Restrict internal administration permissions to explicit app-owner grants. Reject attempts to self-assign staff permissions through profile updates or signup.
- Use an explicit, audited administration path for necessary support access. Content editors do not receive private learner-record privileges.
- Include user ID in private cache keys, storage paths, and queued operations; public catalog caches may be shared.
- Retain separate drafts per user and hide them on sign-out; an expired session pauses synchronization until that same user reauthenticates.
- Account suspension or deletion blocks new server operations. Pending local work cannot restore an account or bypass ownership checks.
- Schools, colleges, and universities have no application administration endpoints or special permissions.

## 4. Public API surface

All routes are versioned under /api/v1. Personal resources use /me/... and derive ownership from the authenticated session. Content management uses /admin/... with server-verified internal permissions.

| Area | Required operations |
|---|---|
| Account | Register/sign in through Clerk; read/update personal profile and learning preferences |
| Published catalog | List courses/modules/practicals and fetch immutable practical versions |
| Attempts | Create an attempt; save and retrieve drafts and observations |
| Completion | Finish an attempt, calculate assessment, return explanations, and start a fresh retry |
| Progress | Read personal practical/course progress and attempt history |
| Publishing | Owner-authorized staff prepare/review content; owner publishes validated revisions |
| Operations | Owner-only aggregate usage, error reporting, and internal staff access management |

Use pagination for lists and structured error codes for authorization, validation, conflicts, and unsupported content versions. Draft updates carry a revision number to detect overwriting newer work. Attempt completion requests carry an idempotency key scoped to user and operation. The server calculates assessment results; client-supplied grades are not authoritative. Completion freezes the attempt and updates distinct-practical progress atomically; repeating the request returns the same result. Changing a course filter does not change or reset stored progress.

## 5. Unity protocol and simulation

Replace the micrometer-specific v1 measurement format with a generic v2 contract. Retain a temporary adapter for existing controllers while migrating them.

Message envelope: protocolVersion, type, sessionId, experimentId, requestId where acknowledgment is needed, and a typed payload.

Commands: open, start, pause, reset, setParameter, performAction, recordObservation, and stop.

Events: ready, trackingChanged, stateChanged, measurementChanged, stepCompleted, acknowledged, and error.

A measurement includes quantityId, numeric value, unit, and sequence/time information. Define quantity metadata per simulation instead of using msr/csr/totalMm for unrelated measurements. Include experiment and session identifiers so late messages from a closed experiment are ignored.

- Unity owns apparatus state, physics calculations, animation, and interaction.
- The mobile app owns navigation, learning content, tables, draft storage, answer checking, and personal progress presentation.
- The backend owns access decisions, durable records, assessment, and reporting.
- Simulation/controller keys and practical IDs are separate: the same Vernier simulation serves two practicals.
- Explicitly reject incompatible protocols and unavailable controllers; do not silently launch a default experiment.
- Define valid parameters, units, expected numerical precision, assessment tolerances, and idealizations per practical, reviewed by an educator.
- Pause state-sensitive interaction during lost tracking and provide a clear recovery state. Preview mode does not depend on tracking.

## 6. Asset and content delivery

Bundle the first release's simulation code, models, and approved image-target database with the Android application. Fetch published lesson text and assessments from the backend, checking compatibility against the app's bundled simulation manifest.

Published practical versions are immutable and attempts retain their original version. Later corrections create a new version. Incompatible content cannot start a new attempt until the relevant application version is supported. Return assessment explanations after answer checking; do not include assessment answer keys in the general catalog response.

Future downloadable asset packs must have versions, checksums, compatibility metadata, and a recoverable installation process. New executable Unity behavior requires a new application build. Adding a course that reuses existing simulations can be a catalog change.

Normal book recognition runs on-device. Gallery-image recognition and its unfinished remote matcher are deferred. Camera frames are not uploaded for live AR tracking.

## 7. Quality and operational requirements

- Maintain at least 30 FPS during representative practical interactions on the agreed Android test devices.
- Target at least 90% supported-target acquisition within five seconds under the documented lighting/distance/device test conditions; report results per target.
- Release camera ownership when leaving AR; verify repeated launch/close and app background/resume cycles.
- Preserve unsynced drafts across restart and retry without duplicate observations, completed attempts, or progress.
- Use development, staging, and production environments with isolated databases and identity configuration.
- Instrument app version, experiment version, session lifecycle, recognition failures, crashes, API errors, and synchronization failures without logging credentials or full private student answers.
- Back up the database and verify restoration before release. Record the tested restore procedure and measured recovery time.
- Version migrations and use backward-compatible deployment steps while old mobile versions remain supported.
- Define personal account deletion and learning-record retention before launch; preserve user ownership checks in background jobs and erase user-specific local data during the account-removal flow.

## 8. Verification

Test scientific reference cases for all 16 practicals, numerical precision, unit conversion, graph axes, and invalid input boundaries. Test every registered target, unsupported targets, camera denial, unsupported AR devices, tracking loss/reacquisition, and 3D fallback.

For ownership tests, create two independent student accounts. Verify direct-ID requests, private cache hits, background jobs, sign-out/sign-in on a shared device, and suspended/deleted accounts. One user's queued drafts must never synchronize under the other account. Test that academic profile values and institution-style email domains confer no administrative privileges, and that students cannot call owner publishing or staff-management routes.

Verify direct signup, course selection, practice, answer checking, explanations, retries, draft revision conflicts, authentication expiry, and historical practical versions. Check that repeated practice can improve a result without inflating distinct-practical completion. Build and test the actual Android package; source inspection alone is not release evidence.
