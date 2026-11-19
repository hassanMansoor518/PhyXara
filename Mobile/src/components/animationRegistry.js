/**
 * animationRegistry.js
 *
 * One entry per diagram model id. Each entry describes the full animation for
 * that model: its steps, what state props change, and camera hints per step.
 *
 * Shape of one entry:
 * {
 *   title:       string          – shown in the animation panel header
 *   available:   bool            – false → disabled button with "Coming soon"
 *   steps: [{
 *     label:      string          – short step name  (e.g. "Open Jaws")
 *     caption:    string          – one teaching sentence shown while it plays
 *     durationMs: number          – duration of this step in ms (at 1x speed)
 *     easing:     string          – 'linear'|'ease-in'|'ease-out'|'ease-in-out'
 *     // model state at the END of this step (linearly interpolated from prev)
 *     slide:      number|null     – vernier jaw opening in model-px (0 = closed)
 *     angle:      number|null     – micrometer thimble rotation in degrees (0 = closed)
 *     yawTarget:  number|null     – suggested camera yaw in degrees
 *     pitchTarget:number|null     – suggested camera pitch in degrees
 *     zoomTarget: number|null     – suggested zoom scale
 *     highlight:  string|null     – which part to highlight
 *     formula:    string|null     – live formula line shown below the caption
 *
 *     // ── optional "real practical class" fields (pass-through, not interpolated) ──
 *     teacher:    string|null     – what the teacher says during this step
 *     action:     string|null     – 'rotate'|'ratchet'|'lock'|'place-wire'|'read'
 *     clicks:     number          – number of ratchet clicks to play in this step
 *     wire:       bool            – show the wire between anvil and spindle
 *     locked:     bool            – spindle lock engaged
 *     question:   string|null     – question the teacher asks the student
 *   }]
 * }
 */

// ── easing helpers ──────────────────────────────────────────────────────────
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;

const EASINGS = {
  linear: (t) => t,
  'ease-in': easeIn,
  'ease-out': easeOut,
  'ease-in-out': easeInOut,
};

/**
 * Given an array of steps and a globalProgress (0..1),
 * returns the interpolated state object for the current frame.
 */
export function interpolateSteps(steps, globalProgress) {
  if (!steps || steps.length === 0) return {};

  const totalMs = steps.reduce((s, st) => s + st.durationMs, 0);
  if (totalMs === 0) return {};
  const elapsed = globalProgress * totalMs;

  let cumMs = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const prev = i > 0 ? steps[i - 1] : step; // first step: interpolate from itself
    const nextMs = cumMs + step.durationMs;

    if (elapsed <= nextMs || i === steps.length - 1) {
      const raw = step.durationMs > 0
        ? Math.min(1, Math.max(0, (elapsed - cumMs) / step.durationMs))
        : 1;
      const easeFn = EASINGS[step.easing] || EASINGS['ease-in-out'];
      const t = easeFn(raw);

      const lerp = (a, b) => {
        if (a == null && b == null) return null;
        if (a == null) return b;
        if (b == null) return a;
        return a + (b - a) * t;
      };

      return {
        slide: lerp(prev.slide ?? 0, step.slide ?? 0),
        angle: lerp(prev.angle ?? 0, step.angle ?? 0),
        yawTarget: lerp(prev.yawTarget ?? 0, step.yawTarget ?? 0),
        pitchTarget: lerp(prev.pitchTarget ?? 0, step.pitchTarget ?? 0),
        zoomTarget: lerp(prev.zoomTarget ?? 1, step.zoomTarget ?? 1),
        stepIndex: i,
        stepProgress: raw,            // 0..1 progress inside the current step
        caption: step.caption,
        formula: step.formula,
        highlight: step.highlight,
        label: step.label,
        // ── practical-class fields ──
        teacher: step.teacher ?? null,
        action: step.action ?? null,
        clicks: step.clicks ?? 0,
        wire: step.wire ?? false,
        locked: step.locked ?? false,
        question: step.question ?? null,
      };
    }
    cumMs = nextMs;
  }
  return {};
}

/**
 * Returns the step index active at globalProgress.
 */
export function activeStepIndex(steps, globalProgress) {
  if (!steps || steps.length === 0) return 0;
  const totalMs = steps.reduce((s, st) => s + st.durationMs, 0);
  const elapsed = globalProgress * totalMs;
  let cumMs = 0;
  for (let i = 0; i < steps.length; i++) {
    cumMs += steps[i].durationMs;
    if (elapsed <= cumMs) return i;
  }
  return steps.length - 1;
}

// ── Vernier Caliper physics ──────────────────────────────────────────────────
//
// Sindh Board, Class 9, Chapter 1: Measurement
//   Main Scale: 1 div = 1 mm = 0.1 cm
//   Vernier Scale: 10 divs = 9 mm, so 1 VSD = 0.9 mm
//   Least Count = 1 MSD – 1 VSD = 0.1 mm = 0.01 cm
//   Reading = MSR + (n × LC)
//
// VernierViewerSvg: slide=0 → closed jaws; slide=340 → ~10mm open.
// Calibration from buildSlider geometry: VX[] tick positions span 306 model-px
// for 9 real mm → 1 mm ≈ 34 model-px.
// Demo object: slide=204 → 204/34 ≈ 6.0 mm → MSR=0.60 cm, n=0 fraction
//   Refined to slide=208 → 208/34 ≈ 6.12 mm → MSR=0.60 cm, frac≈0.12 mm → n≈1
//   For a clean n=4 example: need frac = 0.4 mm → slide = (6+0.4)*34 = 217 px.
//   So slide=217 → 6.4 mm → MSR=0.60 cm, n=4 → Reading = 0.60+0.04 = 0.64 cm.

const MM_PER_SLIDE_PX = 1 / 34; // 1 model-px ≈ 0.0294 mm

/**
 * Compute the reading a student would take from a given slide value.
 * All values in cm (matching the textbook formula output).
 */
export function vernierReading(slide) {
  const slideMm = Math.max(0, slide) * MM_PER_SLIDE_PX;
  // Main Scale Reading: last full 0.1-mm graduation before the vernier zero
  const msrMm = Math.floor(slideMm * 10) / 10;
  const msrCm = +(msrMm / 10).toFixed(2);
  // Vernier division aligned with a main-scale line
  const fracMm = slideMm - msrMm;
  const n = Math.round(fracMm * 10); // 0..9
  const lc = 0.01; // cm
  const reading = +(msrCm + n * lc).toFixed(2);
  return { msr: msrCm, n, lc, reading };
}

const SLIDE_CLOSED = 0;
const SLIDE_OPEN = 340;
const SLIDE_OBJECT = 217; // → Reading = 0.64 cm (MSR 0.60, n=4)

const VERNIER_STEPS = [
  {
    label: 'Zero Error Check',
    caption: 'Close the jaws fully. The vernier zero must align with the main-scale zero — confirming no zero error before measuring.',
    durationMs: 2000,
    easing: 'ease-in-out',
    slide: SLIDE_CLOSED,
    yawTarget: -24,
    pitchTarget: 10,
    zoomTarget: 1.0,
    highlight: null,
    formula: 'Zero Error = 0.00 cm  ✓',
  },
  {
    label: 'Open Jaws',
    caption: 'Push the sliding jaw outward to open the external jaws wide enough to receive the object being measured.',
    durationMs: 1800,
    easing: 'ease-out',
    slide: SLIDE_OPEN,
    yawTarget: -24,
    pitchTarget: 10,
    zoomTarget: 1.0,
    highlight: null,
    formula: null,
  },
  {
    label: 'Place Object & Close',
    caption: 'Place the object between the external jaws. Slide the movable jaw inward until both jaws touch the object firmly.',
    durationMs: 2200,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: -24,
    pitchTarget: 10,
    zoomTarget: 1.0,
    highlight: null,
    formula: null,
  },
  {
    label: 'Lock the Screw',
    caption: 'Turn the locking screw (knurled knob) clockwise to hold the sliding jaw in position. The tool is now ready to read.',
    durationMs: 1500,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: -10,
    pitchTarget: 20,
    zoomTarget: 1.2,
    highlight: 'lock',
    formula: null,
  },
  {
    label: 'Read Main Scale (MSR)',
    caption: 'Read the last millimetre graduation on the main scale that is completely before the vernier zero. This is the Main Scale Reading.',
    durationMs: 2500,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: -5,
    pitchTarget: 5,
    zoomTarget: 1.5,
    highlight: 'MSR',
    formula: (() => { const { msr } = vernierReading(SLIDE_OBJECT); return `MSR = ${msr.toFixed(2)} cm`; })(),
  },
  {
    label: 'Read Vernier Scale (n)',
    caption: 'Find the one vernier division line that lines up exactly with any main-scale line. Count that division number — this is n.',
    durationMs: 2500,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: 0,
    pitchTarget: 2,
    zoomTarget: 1.6,
    highlight: 'VSD',
    formula: (() => { const { n, lc } = vernierReading(SLIDE_OBJECT); return `n = ${n},  LC = 0.01 cm  →  n×LC = ${(n * lc).toFixed(2)} cm`; })(),
  },
  {
    label: 'Final Reading',
    caption: 'Apply the textbook formula: Total Reading = MSR + (n × Least Count). This is the actual size of the measured object.',
    durationMs: 2800,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: 0,
    pitchTarget: 2,
    zoomTarget: 1.6,
    highlight: 'result',
    formula: (() => {
      const { msr, n, lc, reading } = vernierReading(SLIDE_OBJECT);
      return `Reading = MSR + n×LC\n= ${msr.toFixed(2)} + ${n}×${lc.toFixed(2)}\n= ${reading.toFixed(2)} cm`;
    })(),
  },
  {
    label: 'Internal Jaws',
    caption: 'The upper (internal) jaws measure the inside diameter of a hollow object such as a pipe or ring. Same reading formula applies.',
    durationMs: 2000,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: -24,
    pitchTarget: 28,
    zoomTarget: 1.2,
    highlight: 'inside',
    formula: 'Inside Reading = MSR + n × LC',
  },
  {
    label: 'Depth Blade',
    caption: 'The depth blade (right end) measures the depth of a hole or slot. Insert it, then read MSR and VSD in exactly the same way.',
    durationMs: 2000,
    easing: 'ease-in-out',
    slide: SLIDE_OBJECT,
    yawTarget: 160,
    pitchTarget: 10,
    zoomTarget: 1.0,
    highlight: 'depth',
    formula: 'Depth Reading = MSR + n × LC',
  },
];

// ── Micrometer Screw Gauge physics ───────────────────────────────────────────
//
// College practical model (matches MicrometerViewerSvg `angle` prop, in degrees):
//   Pitch            = 0.5 mm   (spindle advances 0.5 mm per full rotation)
//   Head-scale divs  = 50       (1 division = 360° / 50 = 7.2° of thimble rotation)
//   Least Count (LC) = Pitch / Divisions = 0.5 / 50 = 0.01 mm
//   Reading          = PSR + (HSR × LC)   [PSR = Pitch Scale Reading, HSR = Head Scale Reading]
//   Corrected        = Observed − Zero Error
//
// Demo experiment (real class practical): measuring the diameter of a thin wire.
//   Pitch finding : 4 full rotations → spindle moves 2.0 mm → pitch = 0.5 mm
//   Zero error    : thimble zero is 3 divisions past the datum line when jaws are
//                   closed → POSITIVE zero error = +3 × 0.01 = +0.03 mm
//   Observations  : 3 readings at different places along the wire
//                   #1 = 0.62 mm (PSR 0.5, HSR 12; angle 446.4°)
//                   #2 = 0.63 mm (PSR 0.5, HSR 13; angle 453.6°)
//                   #3 = 0.61 mm (PSR 0.5, HSR 11; angle 439.2°)
//   Mean observed : 0.62 mm
//   Corrected     : 0.62 − 0.03 = 0.59 mm

const MIC_PITCH_MM = 0.5;
const MIC_DIVISIONS = 50;
const MIC_LC_MM = MIC_PITCH_MM / MIC_DIVISIONS; // 0.01 mm
const MIC_DEG_PER_DIV = 360 / MIC_DIVISIONS;           // 7.2°

/**
 * Compute what a student would read from a given thimble angle.
 * All values in mm (practical-record style).
 */
export function micrometerReading(angle) {
  const travelMm = (Math.max(0, angle) / 360) * MIC_PITCH_MM;
  const eps = 1e-6; // guard against float errors like 61.999999
  const psr = Math.floor(travelMm / MIC_PITCH_MM + eps) * MIC_PITCH_MM;
  let hsr = Math.round((travelMm - psr) / MIC_LC_MM);
  let psrFinal = psr;
  if (hsr >= MIC_DIVISIONS) { hsr = 0; psrFinal += MIC_PITCH_MM; }
  const reading = +(psrFinal + hsr * MIC_LC_MM).toFixed(2);
  return { psr: +psrFinal.toFixed(2), hsr, lc: MIC_LC_MM, reading };
}

// mm of spindle travel → thimble angle (degrees)
const mmToAngle = (mm) => (mm / MIC_PITCH_MM) * 360;

const MIC_ANGLE_CLOSED = 0;
const MIC_ANGLE_FOUR_TURNS = 4 * 360;                             // 1440° → 2.0 mm
const MIC_ANGLE_NEAR_CLOSE = 90;                                  // jaws almost closed
const MIC_ANGLE_WIDE = 720;                                 // 1.0 mm gap
const MIC_ANGLE_NEAR_WIRE = 520;                                 // just above wire thickness
const MIC_ZERO_ERR_DIV = 3;
const MIC_ANGLE_ZERO_ERR = MIC_ZERO_ERR_DIV * MIC_DEG_PER_DIV;  // 21.6° → closed jaws read +3 div
const MIC_ZERO_ERR_MM = +(MIC_ZERO_ERR_DIV * MIC_LC_MM).toFixed(2); // +0.03 mm
const MIC_ANGLE_OBJECT = mmToAngle(0.62); // 446.4° → PSR 0.5 mm, HSR 12 → 0.62 mm (trial 1)
const MIC_ANGLE_TRIAL_2 = mmToAngle(0.63); // 453.6° → HSR 13 → 0.63 mm
const MIC_ANGLE_TRIAL_3 = mmToAngle(0.61); // 439.2° → HSR 11 → 0.61 mm

const MIC_R1 = micrometerReading(MIC_ANGLE_OBJECT);
const MIC_R2 = micrometerReading(MIC_ANGLE_TRIAL_2);
const MIC_R3 = micrometerReading(MIC_ANGLE_TRIAL_3);
const MIC_MEAN_OBS = +((MIC_R1.reading + MIC_R2.reading + MIC_R3.reading) / 3).toFixed(2); // 0.62
const MIC_CORRECTED = +(MIC_MEAN_OBS - MIC_ZERO_ERR_MM).toFixed(2);                         // 0.59

const MICROMETER_STEPS = [
  // 1 ─ Aim & apparatus
  {
    label: 'Aaj ka Practical',
    caption: 'Aim: Screw gauge se wire ka diameter maloom karna. Apparatus: screw gauge, tar ka tukra.',
    teacher: 'Bachon, aaj hum screw gauge se ek patle tar (wire) ka diameter naapenge. Pehle apparatus ko dhyan se dekhein.',
    durationMs: 3200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_CLOSED,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.0,
    highlight: 'parts',
    action: null,
    formula: 'Aim: Diameter of wire = ?',
  },
  // 2 ─ Parts
  {
    label: 'Parts Pehchano',
    caption: 'U-frame, anvil, spindle, sleeve (pitch scale), thimble (head scale), lock, ratchet.',
    teacher: 'Yeh U-frame hai. Is par fixed anvil hai aur samne moveable spindle. Sleeve par pitch scale hai, aur ghoomne wali thimble par head scale.',
    durationMs: 4200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_CLOSED,
    yawTarget: -12,
    pitchTarget: 6,
    zoomTarget: 1.3,
    highlight: 'parts',
    action: null,
    question: 'Ratchet ka kaam kya hota hai? (jawab aage milega)',
    formula: null,
  },
  // 3 ─ Pitch: 4 rotations
  {
    label: 'Pitch: 4 Chakkar',
    caption: 'Pitch nikalne ke liye thimble ke kai poore chakkar lagao aur sleeve par tai ki hui doori naapo.',
    teacher: 'Ab pitch nikalte hain. Main thimble ko poore 4 chakkar ghumati hoon aur dekhti hoon spindle sleeve par kitna aage gaya.',
    durationMs: 6500,
    easing: 'linear',
    angle: MIC_ANGLE_FOUR_TURNS,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.5,
    highlight: 'pitch',
    action: 'rotate',
    formula: '4 chakkar → 2.0 mm',
  },
  // 4 ─ Pitch result
  {
    label: 'Pitch Nikalo',
    caption: 'Pitch = tai ki hui doori ÷ chakkaron ki tadad.',
    teacher: '4 chakkar mein spindle 2 mm aage gaya. To ek chakkar mein kitna? 2 ko 4 se taqseem karo.',
    durationMs: 3600,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_FOUR_TURNS,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.6,
    highlight: 'pitch',
    action: null,
    question: 'Agar 5 chakkar mein 2.5 mm hota, to pitch kya hota?',
    formula: `Pitch = 2.0 mm ÷ 4\n= ${MIC_PITCH_MM.toFixed(1)} mm`,
  },
  // 5 ─ Least count
  {
    label: 'Least Count',
    caption: 'Least Count = Pitch ÷ head scale ke divisions ki tadad.',
    teacher: 'Ab thimble par divisions ginein: 50 hain. Yani ek chakkar ko 50 hisson mein taqseem kiya gaya hai.',
    durationMs: 4200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_FOUR_TURNS,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.8,
    highlight: 'thimble',
    action: null,
    formula: `LC = Pitch / Head divisions\n= ${MIC_PITCH_MM.toFixed(1)} / ${MIC_DIVISIONS}\n= ${MIC_LC_MM.toFixed(2)} mm  (0.001 cm)`,
  },
  // 6 ─ Close jaws quickly
  {
    label: 'Jaws Band Karo',
    caption: 'Thimble ko tezi se ghuma kar spindle ko anvil ke paas lao (abhi chhoona nahi).',
    teacher: 'Ab zero error dekhna hai. Pehle thimble ko jaldi se ghuma kar spindle ko anvil ke qareeb le aate hain.',
    durationMs: 3200,
    easing: 'ease-in',
    angle: MIC_ANGLE_NEAR_CLOSE,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.2,
    highlight: 'thimble',
    action: 'rotate',
    formula: null,
  },
  // 7 ─ Zero error with ratchet
  {
    label: 'Zero Error (Ratchet)',
    caption: 'Jaws band hain magar reading 0 nahi — thimble ka zero datum line se neeche hai ⇒ positive zero error.',
    teacher: 'Akhri chakkar sirf ratchet se lagate hain, jab tak "click-click-click" ki awaz na aaye. Ab dekhein: thimble ka zero datum line se 3 division neeche hai.',
    durationMs: 4800,
    easing: 'ease-out',
    angle: MIC_ANGLE_ZERO_ERR,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.9,
    highlight: 'zero',
    action: 'ratchet',
    clicks: 3,
    formula: `Zero error = +${MIC_ZERO_ERR_DIV} × ${MIC_LC_MM.toFixed(2)} = +${MIC_ZERO_ERR_MM.toFixed(2)} mm\nZero correction = −${MIC_ZERO_ERR_MM.toFixed(2)} mm`,
  },
  // 8 ─ Open gap
  {
    label: 'Gap Kholo',
    caption: 'Thimble ko ulta ghumao jab tak gap tar ki motai se zyada na ho jaye.',
    teacher: 'Ab thimble ko ulta ghuma kar gap itna khol dein ke tar aaram se is mein aa jaye.',
    durationMs: 3800,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_WIDE,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.0,
    highlight: null,
    action: 'rotate',
    formula: null,
  },
  // 9 ─ Place wire
  {
    label: 'Tar Rakho',
    caption: 'Tar ko anvil aur spindle ke beech seedha rakho.',
    teacher: 'Tar ko anvil aur spindle ke beech rakhiye. Tar seedha hona chahiye, mura hua nahi.',
    durationMs: 3000,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_WIDE,
    yawTarget: -10,
    pitchTarget: 8,
    zoomTarget: 1.3,
    highlight: 'wire',
    action: 'place-wire',
    wire: true,
    formula: null,
  },
  // 10 ─ Bring spindle near wire with thimble
  {
    label: 'Thimble se Qareeb Lao',
    caption: 'Thimble se spindle ko tar ke qareeb lao — abhi dabana nahi.',
    teacher: 'Shuru mein thimble tezi se ghuma sakte hain, jab tak spindle tar ke bilkul qareeb na pohanch jaye.',
    durationMs: 3000,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_NEAR_WIRE,
    yawTarget: -6,
    pitchTarget: 6,
    zoomTarget: 1.3,
    highlight: null,
    action: 'rotate',
    wire: true,
    formula: null,
  },
  // 11 ─ Ratchet grip
  {
    label: 'Ratchet se Pakdo',
    caption: 'Aakhri hissa sirf ratchet se, 2–3 click tak. Isse har dafa barabar zor lagta hai.',
    teacher: 'Ab thimble chhor dein aur sirf ratchet ghumayein. Jab 2–3 click suneinge to samajh jayein tar halka sa pakda gaya, ab aur nahi ghumana.',
    durationMs: 4500,
    easing: 'ease-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.4,
    highlight: 'ratchet',
    action: 'ratchet',
    clicks: 3,
    wire: true,
    question: 'Agar thimble zor se kas dein to kya hoga?',
    formula: 'Click-click-click ✓',
  },
  // 12 ─ Lock
  {
    label: 'Lock Lagao',
    caption: 'Lock lagao taake reading lete waqt spindle na hile.',
    teacher: 'Ab lock lagate hain taake spindle apni jagah se hil na sake aur hum aaram se reading le saken.',
    durationMs: 2400,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.3,
    highlight: 'lock',
    action: 'lock',
    wire: true,
    locked: true,
    formula: null,
  },
  // 13 ─ PSR
  {
    label: 'Pitch Scale Reading (PSR)',
    caption: 'Sleeve par thimble ke kinare se pehle wali aakhri graduation parho.',
    teacher: 'Pehle sleeve dekhein. Thimble ke kinare se pehle wali aakhri nazar aane wali line kaunsi hai? Yeh hamari PSR hai.',
    durationMs: 4200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.9,
    highlight: 'PSR',
    action: 'read',
    wire: true,
    locked: true,
    formula: `PSR = ${MIC_R1.psr.toFixed(1)} mm`,
  },
  // 14 ─ HSR
  {
    label: 'Head Scale Reading (HSR)',
    caption: 'Thimble ki jo division datum line ke saamne ho, woh HSR hai.',
    teacher: 'Ab thimble dekhein. Kaunsi division sleeve ki datum (beech wali) line ke bilkul saamne aa rahi hai? Woh HSR hai.',
    durationMs: 4200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 2.0,
    highlight: 'HSR',
    action: 'read',
    wire: true,
    locked: true,
    formula: `HSR = ${MIC_R1.hsr} div\nHSR × LC = ${MIC_R1.hsr} × ${MIC_R1.lc.toFixed(2)} = ${(MIC_R1.hsr * MIC_R1.lc).toFixed(2)} mm`,
  },
  // 15 ─ Observed reading 1
  {
    label: 'Observed Reading (1)',
    caption: 'Observed = PSR + (HSR × LC). Table mein likho.',
    teacher: 'Ab dono ko jama karte hain. Yeh hamari pehli observed reading hai, ise copy mein table mein likh lein.',
    durationMs: 4200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.6,
    highlight: 'result',
    action: 'read',
    wire: true,
    locked: true,
    formula: `Obs. 1 = PSR + HSR×LC\n= ${MIC_R1.psr.toFixed(1)} + ${MIC_R1.hsr}×${MIC_R1.lc.toFixed(2)}\n= ${MIC_R1.reading.toFixed(2)} mm`,
  },
  // 16 ─ Trial 2
  {
    label: 'Doosri Jagah Se Naapo',
    caption: 'Lock kholo, tar ko doosri jagah par rakho, aur dobara ratchet se pakdo.',
    teacher: 'Ek reading kaafi nahi hoti. Lock kholkar tar ko thora aage kharkate hain aur doosri jagah se naapte hain.',
    durationMs: 5200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_TRIAL_2,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.5,
    highlight: 'ratchet',
    action: 'ratchet',
    clicks: 3,
    wire: true,
    locked: false,
    formula: `Obs. 2 = ${MIC_R2.psr.toFixed(1)} + ${MIC_R2.hsr}×${MIC_R2.lc.toFixed(2)} = ${MIC_R2.reading.toFixed(2)} mm`,
  },
  // 17 ─ Trial 3
  {
    label: 'Teesri Jagah Se Naapo',
    caption: 'Teesri jagah se dobara naapo.',
    teacher: 'Ab teesri jagah se. Dhyan rahe, har dafa ratchet hi use karna hai.',
    durationMs: 5200,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_TRIAL_3,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.5,
    highlight: 'ratchet',
    action: 'ratchet',
    clicks: 3,
    wire: true,
    locked: false,
    formula: `Obs. 3 = ${MIC_R3.psr.toFixed(1)} + ${MIC_R3.hsr}×${MIC_R3.lc.toFixed(2)} = ${MIC_R3.reading.toFixed(2)} mm`,
  },
  // 18 ─ Mean
  {
    label: 'Observation Table',
    caption: 'Teeno observed readings ka mean nikalo.',
    teacher: 'Teeno readings ka average nikalein. Isse random error kam hota hai.',
    durationMs: 4800,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_TRIAL_3,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.2,
    highlight: 'result',
    action: null,
    wire: false,
    formula: `Obs: ${MIC_R1.reading.toFixed(2)}, ${MIC_R2.reading.toFixed(2)}, ${MIC_R3.reading.toFixed(2)} mm\nMean = (${MIC_R1.reading.toFixed(2)}+${MIC_R2.reading.toFixed(2)}+${MIC_R3.reading.toFixed(2)})/3\n= ${MIC_MEAN_OBS.toFixed(2)} mm`,
  },
  // 19 ─ Zero correction
  {
    label: 'Zero Correction',
    caption: 'Sahi diameter = Observed mean − Zero error.',
    teacher: 'Yaad hai zero error +0.03 mm tha? Woh observed reading mein pehle se shamil hai, is liye hum ise minus karenge.',
    durationMs: 5000,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.2,
    highlight: 'zero',
    action: null,
    question: 'Agar zero error negative hota (−0.03 mm) to kya karte?',
    formula: `Corrected = Observed − Zero error\n= ${MIC_MEAN_OBS.toFixed(2)} − (+${MIC_ZERO_ERR_MM.toFixed(2)})\n= ${MIC_CORRECTED.toFixed(2)} mm`,
  },
  // 20 ─ Result
  {
    label: 'Result',
    caption: 'Result: Tar ka diameter = 0.59 mm = 0.059 cm.',
    teacher: 'To tar ka diameter 0.59 mm hai. Result copy mein unit ke saath likhna na bhoolein.',
    durationMs: 3600,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_OBJECT,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.0,
    highlight: 'result',
    action: null,
    formula: `Diameter of wire = ${MIC_CORRECTED.toFixed(2)} mm\n= ${(MIC_CORRECTED / 10).toFixed(3)} cm`,
  },
  // 21 ─ Precautions
  {
    label: 'Ehtiyat (Precautions)',
    caption: 'Precautions: ratchet use karo • zero error check karo • tar na dabao • seedhi nazar se parho.',
    teacher: 'Yaad rakhein: hamesha ratchet use karein, spindle ko zor se na kasein, zero error zaroor check karein, aur reading aankh seedhi rakh kar parhein.',
    durationMs: 4800,
    easing: 'ease-in-out',
    angle: MIC_ANGLE_CLOSED,
    yawTarget: 0,
    pitchTarget: 0,
    zoomTarget: 1.0,
    highlight: null,
    action: null,
    formula: 'Ratchet → constant force → sahi reading',
  },
];

// ── Registry ────────────────────────────────────────────────────────────────

/**
 * ANIMATION_REGISTRY
 * Keys match diagramId values from PHYSICS_DIAGRAM_CATALOG.
 */
export const ANIMATION_REGISTRY = {
  'vernier': {
    title: 'How a Vernier Caliper Works',
    available: true,
    steps: VERNIER_STEPS,
    totalMs: VERNIER_STEPS.reduce((s, st) => s + st.durationMs, 0),
  },
  'electric-motor': {
    title: 'How a DC Electric Motor Works',
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: 'Electric Motor animation coming soon. Open question: which coil and commutator diagram does the Sindh Board textbook show?',
  },
  'micrometer': {
    title: 'How a Micrometer Screw Gauge Works',
    available: true,
    steps: MICROMETER_STEPS,
    totalMs: MICROMETER_STEPS.reduce((s, st) => s + st.durationMs, 0),
  },
  'ac-motor': {
    title: 'How an AC Induction Motor Works',
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: 'AC Motor animation coming soon. Rotating-field visualisation needs SVG support for rotor phase.',
  },
  'transformer': {
    title: 'How a Step-up Transformer Works',
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: 'Transformer animation coming soon. Need primary/secondary turn counts from the textbook for ratio visualisation.',
  },
  'generator': {
    title: 'How an AC Generator Works',
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: 'Generator animation coming soon. Coil rotation + sinusoidal EMF waveform needs waveform overlay SVG.',
  },
  'circuit': {
    title: "Ohm's Law in a Circuit",
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: "Circuit animation coming soon. Need rheostat range and ammeter/voltmeter values from the textbook.",
  },
  'mechanical-gear': {
    title: 'How Gear Transmission Works',
    available: false,
    steps: [],
    totalMs: 0,
    comingSoon: 'Gear animation coming soon. Need driver/driven tooth counts from the textbook for exact gear ratio.',
  },
};