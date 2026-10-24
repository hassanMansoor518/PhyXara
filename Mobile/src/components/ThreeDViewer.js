import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Layers, Camera, AlertCircle } from 'lucide-react-native';
import { ANIMATION_REGISTRY, interpolateSteps } from './animationRegistry';

// Educational Interactive Illustrations for Standard 3D View (works on 100% of Android devices)
import { ElectricMotorFrontSvg } from './illustrations/ElectricMotorFrontSvg';
import { MicrometerViewerSvg } from './illustrations/MicrometerViewerSvg';
import { TransformerViewerSvg } from './illustrations/TransformerViewerSvg';
import { AcMotorViewerSvg } from './illustrations/AcMotorViewerSvg';
import { GeneratorViewerSvg } from './illustrations/GeneratorViewerSvg';
import { VernierViewerSvg } from './illustrations/VernierViewerSvg';
import { CircuitViewerSvg } from './illustrations/CircuitViewerSvg';
import { MechanicalGearViewerSvg } from './illustrations/MechanicalGearViewerSvg';

let Canvas = null;
let useFrame = () => { };
let OrbitControls = null;
let useGLTF = null;
let Center = null;
let isFiberSupported = false;

try {
  require('react-native-get-random-values');
  const fiber = require('@react-three/fiber/native');
  Canvas = fiber.Canvas;
  useFrame = fiber.useFrame || (() => { });
  const drei = require('@react-three/drei/native');
  OrbitControls = drei.OrbitControls;
  useGLTF = drei.useGLTF;
  Center = drei.Center;
  if (Canvas && typeof Canvas === 'function') {
    isFiberSupported = true;
  }
} catch {
  isFiberSupported = false;
}

// ─── Constants (pre-allocated, never inside render loop) ───
const DEG_TO_RAD = Math.PI / 180;
const PITCH_CLAMP_DEG = 80;
const INERTIA_DAMPING = 0.93;
const INERTIA_THRESHOLD = 0.05;
const IDLE_RESUME_MS = 2000;
const ENTRY_DURATION_MS = 600;
const RESET_DURATION_MS = 400;
const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Procedural Physics Fallback Mesh for WebGL
 */
function PhysicsFallbackMesh({ autoRotate = true } = {}) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 1.8, 32]} />
        <meshStandardMaterial color="#0284C7" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.14, 16, 64]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * 3D Model Renderer using useGLTF with memory cleanup and AnimationMixer support.
 * Plays embedded GLTF animation clips if present.
 */
function ModelMesh({
  uri,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  autoRotateSpeed = 0.4,
  onLoaded,
  animationState, // { playing: bool, clipIndex: number } ref
} = {}) {
  const gltf = useGLTF ? useGLTF(uri) : null;
  const groupRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef([]);

  useEffect(() => {
    if (!gltf) return;
    if (onLoaded) onLoaded();

    // Set up AnimationMixer if model has animation clips
    if (gltf.animations && gltf.animations.length > 0 && gltf.scene) {
      try {
        const THREE = require('three');
        const mixer = new THREE.AnimationMixer(gltf.scene);
        mixerRef.current = mixer;
        actionsRef.current = gltf.animations.map(clip => mixer.clipAction(clip));
        // Auto-play first clip
        if (actionsRef.current[0]) {
          actionsRef.current[0].play();
        }
      } catch { /* three not available */ }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current = [];
    };
  }, [gltf, onLoaded]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed;
    }
    // Advance animation mixer
    if (mixerRef.current && animationState?.current?.playing !== false) {
      mixerRef.current.update(delta);
    }
  });

  if (!gltf?.scene) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {Center ? (
        <Center>
          <primitive object={gltf.scene} scale={scale} dispose={null} />
        </Center>
      ) : (
        <primitive object={gltf.scene} scale={scale} dispose={null} />
      )}
    </group>
  );
}

/**
 * Fault-Tolerant 3D Model Viewer with Full Interaction Suite
 *
 * Features:
 * 1. Drag-to-rotate with yaw + pitch, pitch clamped to ±80°.
 * 2. Inertia: release velocity decays smoothly.
 * 3. Pinch-to-zoom (no conflict with rotation).
 * 4. Double-tap resets rotation + zoom with eased animation.
 * 5. Idle auto-rotate pauses on touch, resumes after 2s.
 * 6. Entry fade/scale animation on mount.
 * 7. AnimationMixer for embedded GLTF clips.
 * 8. Full cleanup on unmount.
 * 9. Strict model matching.
 */
export const ThreeDViewer = ({
  modelPath,
  diagramId = 'electric-motor',
  has3DModel = true,
  scale: initialScale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  // Existing props (backward compatible)
  autoRotate: autoRotateProp = false,
  showControlsHint = true,
  style,
  onError,
  onLoad,
  onScanAnother,
  // New API props
  autoRotateSpeed = 1.5,
  enableRotate = true,
  enableZoom = true,
  minZoom = 0.5,
  maxZoom = 2.5,
  onInteractionStart,
  onInteractionEnd,
  // Animation mode: when true the animation panel is shown in-place
  animationMode = false,
  onAnimationModeExit,
}) => {
  // WebGL loading state with strict safety timeout
  const [loadingWebGL, setLoadingWebGL] = useState(isFiberSupported);
  const [webGLFailed, setWebGLFailed] = useState(!isFiberSupported);
  const orbitRef = useRef(null);
  const animationStateRef = useRef({ playing: true, clipIndex: 0 });

  // ─── Gesture State (refs to avoid React re-renders every frame) ───
  const yawAngle = useSharedValue(0);
  const pitchAngle = useSharedValue(0);
  const zoomScale = useSharedValue(initialScale);
  const savedScale = useSharedValue(initialScale);

  // Snapshot at gesture start — used for delta-from-start formula
  const startYaw = useSharedValue(0);
  const startPitch = useSharedValue(0);

  // Inertia velocities (deg/frame)
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  // Interaction tracking for idle auto-rotate
  const isTouching = useSharedValue(false);
  const lastInteractionTime = useSharedValue(Date.now());

  // Entry animation
  const entryProgress = useSharedValue(0);

  // Auto-rotate state derived from props + idle detection
  const autoRotateActive = useRef(autoRotateProp);
  const idleTimerRef = useRef(null);

  // ─── Entry Animation ───
  useEffect(() => {
    entryProgress.value = withTiming(1, {
      duration: ENTRY_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    if (onLoad) onLoad();
  }, []);

  // ─── Auto-rotate idle resume ───
  useEffect(() => {
    autoRotateActive.current = autoRotateProp;
  }, [autoRotateProp]);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      autoRotateActive.current = autoRotateProp;
    }, IDLE_RESUME_MS);
  }, [autoRotateProp]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // ─── Inertia rAF Loop (single loop, refs only, no allocations) ───
  const rafRef = useRef(null);
  const inertiaActive = useRef(false);

  const startInertiaLoop = useCallback(() => {
    if (inertiaActive.current) return;
    inertiaActive.current = true;

    const tick = () => {
      if (isTouching.value) {
        inertiaActive.current = false;
        return;
      }

      const vx = velocityX.value;
      const vy = velocityY.value;

      if (Math.abs(vx) < INERTIA_THRESHOLD && Math.abs(vy) < INERTIA_THRESHOLD) {
        velocityX.value = 0;
        velocityY.value = 0;
        inertiaActive.current = false;
        return;
      }

      yawAngle.value = (yawAngle.value + vx) % 360;
      const newPitch = pitchAngle.value + vy;
      pitchAngle.value = Math.max(-PITCH_CLAMP_DEG, Math.min(PITCH_CLAMP_DEG, newPitch));

      velocityX.value = vx * INERTIA_DAMPING;
      velocityY.value = vy * INERTIA_DAMPING;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Auto-rotate via rAF (only for SVG fallback path)
  const autoRotateRafRef = useRef(null);
  const lastAutoRotateTime = useRef(0);

  useEffect(() => {
    if (!webGLFailed) return; // WebGL uses useFrame instead

    const autoRotateTick = (timestamp) => {
      if (!autoRotateActive.current || isTouching.value) {
        lastAutoRotateTime.current = timestamp;
        autoRotateRafRef.current = requestAnimationFrame(autoRotateTick);
        return;
      }

      const delta = lastAutoRotateTime.current ? (timestamp - lastAutoRotateTime.current) / 1000 : 0;
      lastAutoRotateTime.current = timestamp;

      if (delta > 0 && delta < 0.1) {
        yawAngle.value = (yawAngle.value + autoRotateSpeed * delta * 30) % 360;
      }

      autoRotateRafRef.current = requestAnimationFrame(autoRotateTick);
    };

    autoRotateRafRef.current = requestAnimationFrame(autoRotateTick);

    return () => {
      if (autoRotateRafRef.current) {
        cancelAnimationFrame(autoRotateRafRef.current);
        autoRotateRafRef.current = null;
      }
    };
  }, [webGLFailed, autoRotateSpeed]);

  // ─── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (autoRotateRafRef.current) cancelAnimationFrame(autoRotateRafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // ─── WebGL safety timeout ───
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoadingWebGL(false);
      setWebGLFailed(true);
    }, 400);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Rotation speed normalized to viewport width so it feels consistent across devices
  const rotationFactor = 360 / SCREEN_WIDTH;

  // ─── Gestures ───

  // JS callbacks bridged from worklet via runOnJS
  const onTouchStart = useCallback(() => {
    autoRotateActive.current = false;
    if (onInteractionStart) onInteractionStart();
  }, [onInteractionStart]);

  const onTouchEnd = useCallback(() => {
    startIdleTimer();
    startInertiaLoop();
    if (onInteractionEnd) onInteractionEnd();
  }, [onInteractionEnd, startIdleTimer, startInertiaLoop]);

  // One-finger drag → rotate (yaw + pitch)
  // Uses delta-from-start so the model tracks the finger exactly and
  // does NOT drift (the old formula was adding velocityX every onUpdate frame).
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1) // Ensures pinch (2 fingers) never triggers rotation
    .enabled(enableRotate)
    .onBegin(() => {
      'worklet';
      isTouching.value = true;
      velocityX.value = 0;
      velocityY.value = 0;
      // Snapshot current angles so we can compute delta cleanly
      startYaw.value = yawAngle.value;
      startPitch.value = pitchAngle.value;
      runOnJS(onTouchStart)();
    })
    .onUpdate((e) => {
      'worklet';
      // yaw = startYaw + dx * 0.4  (horizontal drag)
      yawAngle.value = (startYaw.value + e.translationX * 0.4) % 360;
      // pitch = clamp(startPitch - dy * 0.3, -60, 60)  (vertical drag, inverted)
      const newPitch = startPitch.value - e.translationY * 0.3;
      pitchAngle.value = Math.max(-60, Math.min(60, newPitch));
    })
    .onEnd((e) => {
      'worklet';
      isTouching.value = false;
      lastInteractionTime.value = Date.now();
      // Store release velocity for inertia (scaled to deg/frame)
      velocityX.value = e.velocityX * 0.003;
      velocityY.value = e.velocityY * 0.002;
      runOnJS(onTouchEnd)();
    });

  // Pinch → zoom only (two fingers)
  const pinchGesture = Gesture.Pinch()
    .enabled(enableZoom)
    .onBegin(() => {
      'worklet';
      isTouching.value = true;
      runOnJS(onTouchStart)();
    })
    .onUpdate((e) => {
      'worklet';
      // Smooth lerp toward target scale
      const target = Math.min(Math.max(savedScale.value * e.scale, minZoom), maxZoom);
      zoomScale.value = zoomScale.value + (target - zoomScale.value) * 0.3;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = zoomScale.value;
      isTouching.value = false;
      lastInteractionTime.value = Date.now();
      runOnJS(onTouchEnd)();
    });

  // Double-tap → reset rotation + zoom with eased animation
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      yawAngle.value = withTiming(0, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
      pitchAngle.value = withTiming(0, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
      zoomScale.value = withTiming(initialScale, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
      savedScale.value = initialScale;
      velocityX.value = 0;
      velocityY.value = 0;
    });

  // Compose: pan + pinch run simultaneously, double-tap is exclusive
  const composedGestures = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture)
  );

  // ─── Animated styles ───
  // IMPORTANT: Do NOT add rotateY / rotateX here.
  // Those CSS transforms rotate a flat 2D plane — at 90° the SVG becomes a
  // paper-thin sliver no matter what it draws inside.
  // Instead, yaw and pitch are passed as *props* to each SVG viewer so the
  // component can do its own real 3D projection. Only scale (zoom) and
  // opacity (entry fade) belong on the wrapper.
  const animatedModelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: zoomScale.value * entryProgress.value },
    ],
    opacity: entryProgress.value,
  }));

  // JS-thread readable copies of shared values for passing to SVG prop callbacks.
  const [svgYaw, setSvgYaw] = useState(0);
  const [svgPitch, setSvgPitch] = useState(0);

  // Sync shared values → React state so SVG viewers re-render with correct angles.
  // IMPORTANT: only call setState when the value actually changed.
  // Calling setState unconditionally every rAF frame causes React to schedule
  // a re-render on every frame → which fires the effect again → infinite loop.
  const svgSyncRef = useRef(null);
  const prevYawRef = useRef(0);
  const prevPitchRef = useRef(0);
  useEffect(() => {
    let alive = true;
    const sync = () => {
      if (!alive) return;
      const y = yawAngle.value;
      const p = pitchAngle.value;
      // Only call setState when something actually changed
      if (y !== prevYawRef.current || p !== prevPitchRef.current) {
        prevYawRef.current = y;
        prevPitchRef.current = p;
        setSvgYaw(y);
        setSvgPitch(p);
      }
      svgSyncRef.current = requestAnimationFrame(sync);
    };
    svgSyncRef.current = requestAnimationFrame(sync);
    return () => {
      alive = false;
      if (svgSyncRef.current) cancelAnimationFrame(svgSyncRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // ─── Animation system ───────────────────────────────────────────────────
  // Look up the registry entry for this diagram.
  const animEntry = useMemo(() => {
    const k = (diagramId || '').toLowerCase();
    // Match the same keys used in ANIMATION_REGISTRY
    for (const [id, entry] of Object.entries(ANIMATION_REGISTRY)) {
      if (k.includes(id)) return entry;
    }
    return null;
  }, [diagramId]);

  const [animPlaying, setAnimPlaying] = useState(false);
  const [animProgress, setAnimProgress] = useState(0); // 0..1
  const [animSpeed, setAnimSpeed] = useState(1);       // 0.5 | 1 | 2
  // animPose holds the full interpolated pose for the current frame.
  // Computed directly inside the rAF tick so slide updates every frame.
  const [animPose, setAnimPose] = useState({
    slide: 0, yawTarget: -24, pitchTarget: 10, zoomTarget: 1,
    caption: '', formula: null, label: '', stepIndex: 0,
  });
  // Keep a ref to animEntry so the rAF closure always reads the latest value
  // without being re-created every time animEntry changes.
  const animEntryRef = useRef(null);
  animEntryRef.current = animEntry;
  const animSpeedRef = useRef(1);
  animSpeedRef.current = animSpeed;

  // Track previous animationMode so we can reset on entry
  const prevAnimMode = useRef(false);
  useEffect(() => {
    if (animationMode && !prevAnimMode.current) {
      // Entering animation mode: reset to beginning
      setAnimProgress(0);
      setAnimPlaying(false);
      setAnimPose({ slide: 0, yawTarget: -24, pitchTarget: 10, zoomTarget: 1, caption: '', formula: null, label: '', stepIndex: 0 });
    }
    if (!animationMode && prevAnimMode.current) {
      setAnimPlaying(false);
    }
    prevAnimMode.current = animationMode;
  }, [animationMode]);

  // ─ rAF tick ─ computes the full pose in the same frame as the time advance.
  // Using two separate effects (one for progress, one for pose) caused a
  // one-render lag that made the jaw appear frozen on web.
  const animTickRef = useRef(null);
  const animLastTs = useRef(0);
  const animProgressRef = useRef(0); // mirror of animProgress, readable inside rAF without closure stale

  useEffect(() => {
    if (!animationMode || !animPlaying || !animEntryRef.current?.available) {
      if (animTickRef.current) {
        cancelAnimationFrame(animTickRef.current);
        animTickRef.current = null;
      }
      return;
    }

    const entry = animEntryRef.current;
    const totalMs = entry.totalMs;
    animLastTs.current = 0;

    const tick = (ts) => {
      if (!animLastTs.current) animLastTs.current = ts;
      const dtMs = (ts - animLastTs.current) * animSpeedRef.current;
      animLastTs.current = ts;

      const next = Math.min(1, animProgressRef.current + dtMs / totalMs);
      animProgressRef.current = next;

      // Compute full pose here, in the same rAF callback, no second effect
      const pose = interpolateSteps(entry.steps, next);

      // Batch-update both progress and pose in one React commit
      setAnimProgress(next);
      setAnimPose({
        slide: pose.slide ?? 0,
        yawTarget: pose.yawTarget ?? -24,
        pitchTarget: pose.pitchTarget ?? 10,
        zoomTarget: pose.zoomTarget ?? 1,
        caption: pose.caption ?? '',
        formula: pose.formula ?? null,
        label: pose.label ?? '',
        stepIndex: pose.stepIndex ?? 0,
      });

      // Smooth camera — only when user is not dragging
      if (!isTouching.value) {
        const camEase = { duration: 600, easing: Easing.inOut(Easing.cubic) };
        if (pose.yawTarget != null) yawAngle.value = withTiming(pose.yawTarget, camEase);
        if (pose.pitchTarget != null) pitchAngle.value = withTiming(pose.pitchTarget, camEase);
        if (pose.zoomTarget != null) {
          zoomScale.value = withTiming(pose.zoomTarget, camEase);
          savedScale.value = pose.zoomTarget;
        }
      }

      if (next >= 1) {
        setAnimPlaying(false);
        return; // don't schedule another frame
      }
      animTickRef.current = requestAnimationFrame(tick);
    };

    animTickRef.current = requestAnimationFrame(tick);
    return () => {
      if (animTickRef.current) cancelAnimationFrame(animTickRef.current);
      animTickRef.current = null;
    };
  }, [animationMode, animPlaying]); // speed is read via ref, entry via ref

  // When scrubbing / stepping (not playing), update pose immediately without a tick loop.
  useEffect(() => {
    if (animPlaying) return; // tick handles it while playing
    if (!animEntryRef.current?.available) return;
    const pose = interpolateSteps(animEntryRef.current.steps, animProgress);
    if (!pose || !Object.keys(pose).length) return;
    setAnimPose({
      slide: pose.slide ?? 0,
      yawTarget: pose.yawTarget ?? -24,
      pitchTarget: pose.pitchTarget ?? 10,
      zoomTarget: pose.zoomTarget ?? 1,
      caption: pose.caption ?? '',
      formula: pose.formula ?? null,
      label: pose.label ?? '',
      stepIndex: pose.stepIndex ?? 0,
    });
    // Animate camera to the step target when scrubbing
    if (!isTouching.value) {
      const camEase = { duration: 600, easing: Easing.inOut(Easing.cubic) };
      if (pose.yawTarget != null) yawAngle.value = withTiming(pose.yawTarget, camEase);
      if (pose.pitchTarget != null) pitchAngle.value = withTiming(pose.pitchTarget, camEase);
      if (pose.zoomTarget != null) { zoomScale.value = withTiming(pose.zoomTarget, camEase); savedScale.value = pose.zoomTarget; }
    }
  }, [animProgress, animPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animTickRef.current) cancelAnimationFrame(animTickRef.current);
    };
  }, []);

  // Animation control helpers
  const handleAnimPlayPause = useCallback(() => {
    if (animProgress >= 1) {
      animProgressRef.current = 0;
      setAnimProgress(0);
      setAnimPlaying(true);
    } else {
      setAnimPlaying((p) => !p);
    }
  }, [animProgress]);

  const handleAnimReplay = useCallback(() => {
    animProgressRef.current = 0;
    setAnimProgress(0);
    setAnimPlaying(true);
  }, []);

  const handleAnimStepForward = useCallback(() => {
    if (!animEntryRef.current?.steps?.length) return;
    setAnimPlaying(false);
    const entry = animEntryRef.current;
    const totalMs = entry.totalMs;
    let cumMs = 0;
    for (let i = 0; i < entry.steps.length; i++) {
      cumMs += entry.steps[i].durationMs;
      const stepEndProg = cumMs / totalMs;
      if (stepEndProg > animProgressRef.current + 0.001) {
        animProgressRef.current = Math.min(stepEndProg, 1);
        setAnimProgress(animProgressRef.current);
        return;
      }
    }
    animProgressRef.current = 1;
    setAnimProgress(1);
  }, []);

  const handleAnimStepBack = useCallback(() => {
    if (!animEntryRef.current?.steps?.length) return;
    setAnimPlaying(false);
    const entry = animEntryRef.current;
    const totalMs = entry.totalMs;
    let cumMs = 0;
    let prevBoundary = 0;
    for (let i = 0; i < entry.steps.length; i++) {
      const stepEndProg = (cumMs + entry.steps[i].durationMs) / totalMs;
      if (stepEndProg >= animProgressRef.current - 0.001 && i > 0) {
        animProgressRef.current = prevBoundary;
        setAnimProgress(prevBoundary);
        return;
      }
      prevBoundary = stepEndProg;
      cumMs += entry.steps[i].durationMs;
    }
    animProgressRef.current = 0;
    setAnimProgress(0);
  }, []);

  const handleAnimScrub = useCallback((frac) => {
    const v = Math.min(1, Math.max(0, frac));
    animProgressRef.current = v;
    setAnimPlaying(false);
    setAnimProgress(v);
  }, []);

  const handleSpeedCycle = useCallback(() => {
    setAnimSpeed((s) => (s === 0.5 ? 1 : s === 1 ? 2 : 0.5));
  }, []);

  // ─── Zoom buttons ───
  const handleZoomIn = () => {
    if (!enableZoom) return;
    if (isFiberSupported && !webGLFailed && orbitRef.current?.dollyIn) {
      orbitRef.current.dollyIn(1.25);
      orbitRef.current.update();
    } else {
      zoomScale.value = withSpring(Math.min(zoomScale.value + 0.25, maxZoom));
      savedScale.value = zoomScale.value;
    }
  };

  const handleZoomOut = () => {
    if (!enableZoom) return;
    if (isFiberSupported && !webGLFailed && orbitRef.current?.dollyOut) {
      orbitRef.current.dollyOut(1.25);
      orbitRef.current.update();
    } else {
      zoomScale.value = withSpring(Math.max(zoomScale.value - 0.25, minZoom));
      savedScale.value = zoomScale.value;
    }
  };

  const handleReset = () => {
    if (isFiberSupported && !webGLFailed && orbitRef.current?.reset) {
      orbitRef.current.reset();
    }
    yawAngle.value = withTiming(0, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
    pitchAngle.value = withTiming(0, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
    zoomScale.value = withTiming(initialScale, { duration: RESET_DURATION_MS, easing: Easing.inOut(Easing.cubic) });
    savedScale.value = initialScale;
    velocityX.value = 0;
    velocityY.value = 0;
  };

  // Resolve Asset URI
  const resolvedUri = useMemo(() => {
    if (!modelPath) return null;
    try {
      if (typeof modelPath === 'string') return modelPath;
      if (typeof modelPath === 'number') {
        const resolved = Image.resolveAssetSource(modelPath);
        return resolved?.uri || null;
      }
      if (typeof modelPath === 'object' && modelPath.uri) return modelPath.uri;
    } catch {
      return null;
    }
    return null;
  }, [modelPath]);

  // Model Verification: Check if a 3D model is supported for this diagram
  const key = (diagramId || '').toLowerCase();
  const isModelMatched =
    has3DModel &&
    (key.includes('motor') ||
      key.includes('micrometer') ||
      key.includes('screw') ||
      key.includes('transformer') ||
      key.includes('generator') ||
      key.includes('vernier') ||
      key.includes('circuit') ||
      key.includes('gear'));

  // 1. If NO MATCHING 3D MODEL is available for this recognized diagram
  if (!isModelMatched || !modelPath) {
    return (
      <View style={[styles.container, styles.noModelContainer, style]}>
        <View style={styles.noModelCard}>
          <View style={styles.noModelIconBadge}>
            <Layers size={30} color="#F59E0B" />
          </View>
          <Text style={styles.noModelTitle}>
            No matching 3D model is available for this image.
          </Text>
          <Text style={styles.noModelSubtitle}>
            This physics diagram was recognized and its properties are listed below, but no verified 3D asset is available for this topic.
          </Text>
          {onScanAnother ? (
            <Pressable
              onPress={onScanAnother}
              style={({ pressed }) => [
                styles.scanAnotherButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Camera size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.scanAnotherButtonText}>Scan Another Image</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  // 2. Render verified 3D diagram visual (SVG fallback illustrations)
  // yaw and pitch are passed as props so each viewer can do its own
  // real 3D projection. The wrapper Animated.View applies NO rotateX/rotateY
  // (that caused the flat-paper / sliver bug).
  const renderDiagramVisual = () => {
    if (key.includes('micrometer') || key.includes('screw') || key.includes('exp3')) {
      return (
        <MicrometerViewerSvg
          width={320}
          height={134}
          onAngleChange={(a) => console.log('Angle:', a)}
        />
      );
    }
    if (key.includes('transformer')) {
      return (
        <TransformerViewerSvg
          width={290} height={230}
          rotationAngle={svgYaw}
        />
      );
    }
    if (key.includes('ac-motor') || key.includes('induction')) {
      return (
        <AcMotorViewerSvg
          width={290} height={230}
          rotationAngle={svgYaw}
        />
      );
    }
    if (key.includes('generator') || key.includes('dynamo')) {
      return (
        <GeneratorViewerSvg
          width={290} height={230}
          rotationAngle={svgYaw}
        />
      );
    }
    if (key.includes('vernier') || key.includes('caliper')) {
      // slide is driven by animPose when in animation mode.
      // yaw/pitch always come from the gesture shared values (svgYaw/svgPitch).
      return (
        <VernierViewerSvg
          width={290} height={230}
          yaw={svgYaw}
          pitch={svgPitch}
          slide={animationMode ? animPose.slide : 0}
          thickness={2.4}
          autoFit
        />
      );
    }
    if (key.includes('circuit') || key.includes('ohm')) {
      return (
        <CircuitViewerSvg
          width={290} height={230}
          rotationAngle={svgYaw}
        />
      );
    }
    if (key.includes('gear')) {
      return (
        <MechanicalGearViewerSvg
          width={290} height={230}
          rotationAngle={svgYaw}
        />
      );
    }
    // Default to DC Electric Motor
    return (
      <ElectricMotorFrontSvg
        width={290} height={230}
        rotationAngle={svgYaw}
      />
    );
  };

  // The outer container is a flex column.
  // When animationMode is on, the viewer occupies the top portion and the
  // animation panel sits below it as a flex sibling (NOT an absolute overlay).
  // This ensures the model is always visible while the panel is open.
  return (
    <View style={[styles.container, style]}>
      {/* ── Viewer area (shrinks when panel is open) ── */}
      <View style={animationMode ? styles.viewerArea : styles.viewerAreaFull}>
        {/* Debug overlay — remove after verifying */}
        {animationMode && (
          <View style={styles.debugBar} pointerEvents="none">
            <Text style={styles.debugText}>
              t={Math.round(animProgress * (animEntryRef.current?.totalMs || 0))}ms  step={animPose.stepIndex}  slide={Math.round(animPose.slide)}
            </Text>
          </View>
        )}
        {/* 1. WebGL 3D Canvas (If Fiber is available without errors) */}
        {isFiberSupported && !webGLFailed ? (
          <Canvas
            camera={{ position: [0, 1.5, 4], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{
              powerPreference: 'default',
              antialias: false,
              alpha: true,
              depth: true,
            }}
            style={styles.canvas}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[6, 8, 5]} intensity={1.2} />
            <directionalLight position={[-6, -4, -5]} intensity={0.5} color="#60A5FA" />
            <pointLight position={[0, 4, 2]} intensity={0.7} color="#FFFFFF" />

            <OrbitControls
              ref={orbitRef}
              enableZoom={enableZoom}
              enableRotate={enableRotate}
              enablePan={true}
              enableDamping={true}
              dampingFactor={0.08}
              autoRotate={autoRotateProp}
              autoRotateSpeed={autoRotateSpeed}
              minPolarAngle={Math.PI * 0.05} // ~9° from top (prevents flip)
              maxPolarAngle={Math.PI * 0.95} // ~171° from top
              minDistance={minZoom}
              maxDistance={maxZoom * 5}
              makeDefault
            />

            <Suspense fallback={null}>
              {resolvedUri ? (
                <ModelMesh
                  uri={resolvedUri}
                  scale={initialScale}
                  position={position}
                  rotation={rotation}
                  autoRotate={autoRotateProp}
                  autoRotateSpeed={autoRotateSpeed * 0.3}
                  animationState={animationStateRef}
                  onLoaded={() => {
                    setLoadingWebGL(false);
                    if (onLoad) onLoad();
                  }}
                />
              ) : (
                <PhysicsFallbackMesh autoRotate={autoRotateProp} />
              )}
            </Suspense>
          </Canvas>
        ) : (
          /* 2. Standard Interactive 3D Viewer (Immediate, zero loading hang, 100% reliable) */
          <View style={styles.standardContainer}>
            <GestureDetector gesture={composedGestures}>
              <Animated.View style={[styles.modelWrapper, animatedModelStyle]}>
                {renderDiagramVisual()}
              </Animated.View>
            </GestureDetector>
          </View>
        )}

        {/* Floating Zoom & Reset Buttons — always on top of viewer area */}
        <View style={styles.floatingControls} pointerEvents="box-none">
          <Pressable
            onPress={handleZoomIn}
            style={({ pressed }) => [styles.controlButton, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Text style={styles.controlButtonText}>+</Text>
          </Pressable>
          <Pressable
            onPress={handleZoomOut}
            style={({ pressed }) => [styles.controlButton, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Text style={styles.controlButtonText}>−</Text>
          </Pressable>
        </View>

        {/* Loading Overlay */}
        {loadingWebGL && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <View style={styles.loaderBadge}>
              <ActivityIndicator size="small" color="#38BDF8" />
              <Text style={styles.loadingText}>Initializing 3D View...</Text>
            </View>
          </View>
        )}

        {/* Gesture Hint — shown only when panel is closed */}
        {showControlsHint && !animationMode && (
          <View style={styles.hintContainer} pointerEvents="box-none">
            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>
                Drag to Rotate • Pinch to Zoom • Double-Tap to Reset
              </Text>
            </View>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.resetButtonText}>Reset View</Text>
            </Pressable>
          </View>
        )}
      </View>{/* end viewerArea */}

      {/* ── Animation Panel — flex sibling below viewer, NOT an overlay ── */}
      {animationMode && (
        <View style={styles.animPanel}>
          {/* Header row: title + close */}
          <View style={styles.animHeader}>
            <Text style={styles.animTitle} numberOfLines={1}>
              {animEntry?.title || 'Animation'}
            </Text>
            <Pressable
              onPress={onAnimationModeExit}
              style={({ pressed }) => [styles.animCloseBtn, pressed && { opacity: 0.7 }]}
              hitSlop={10}
            >
              <Text style={styles.animCloseBtnText}>✕</Text>
            </Pressable>
          </View>

          {animEntry && !animEntry.available ? (
            <View style={styles.animComingSoon}>
              <Text style={styles.animComingSoonIcon}>🔬</Text>
              <Text style={styles.animComingSoonText}>{animEntry.comingSoon}</Text>
            </View>
          ) : animEntry?.available ? (
            <>
              {/* Caption */}
              <View style={styles.animCaptionBox}>
                <Text style={styles.animStepLabel}>
                  {animPose.label || animEntry.steps[0]?.label || ''}
                </Text>
                <Text style={styles.animCaption}>
                  {animPose.caption || animEntry.steps[0]?.caption || ''}
                </Text>
                {animPose.formula ? (
                  <Text style={styles.animFormula}>{animPose.formula}</Text>
                ) : null}
              </View>

              {/* Step chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.animDotsScroll}
                contentContainerStyle={styles.animDotsContent}
              >
                {animEntry.steps.map((st, idx) => {
                  const stepEndMs = animEntry.steps.slice(0, idx + 1).reduce((a, s) => a + s.durationMs, 0);
                  const stepStartMs = animEntry.steps.slice(0, idx).reduce((a, s) => a + s.durationMs, 0);
                  const curMs = animProgress * animEntry.totalMs;
                  const isActive = curMs >= stepStartMs && curMs < stepEndMs;
                  const isDone = curMs >= stepEndMs;
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        handleAnimScrub(stepStartMs / animEntry.totalMs);
                      }}
                      style={[
                        styles.animDot,
                        isDone && styles.animDotDone,
                        isActive && styles.animDotActive,
                      ]}
                    >
                      <Text style={[styles.animDotText, (isDone || isActive) && { color: '#fff' }]} numberOfLines={1}>
                        {st.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Scrubber */}
              <View style={styles.animScrubRow}>
                <Text style={styles.animTimeText}>
                  {Math.round(animProgress * animEntry.totalMs / 1000)}s
                </Text>
                <Pressable
                  style={styles.animScrubTrack}
                  onPress={(e) => {
                    // coarse scrub: locationX / track pixel width
                    // track fills remaining space, approximate with Dimensions
                    const trackW = SCREEN_WIDTH - 72; // 2×28 time labels + gaps
                    handleAnimScrub(e.nativeEvent.locationX / trackW);
                  }}
                >
                  <View style={[styles.animScrubFill, { flex: animProgress }]} />
                  <View style={[styles.animScrubEmpty, { flex: Math.max(0.001, 1 - animProgress) }]} />
                </Pressable>
                <Text style={styles.animTimeText}>
                  {Math.round(animEntry.totalMs / 1000)}s
                </Text>
              </View>

              {/* Controls row */}
              <View style={styles.animControls}>
                <Pressable
                  onPress={handleAnimStepBack}
                  style={({ pressed }) => [styles.animCtrlBtn, pressed && { opacity: 0.6 }]}
                  hitSlop={8}
                >
                  <Text style={styles.animCtrlIcon}>⏮</Text>
                </Pressable>

                <Pressable
                  onPress={handleAnimPlayPause}
                  style={({ pressed }) => [styles.animPlayBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.animPlayIcon}>
                    {animPlaying ? '⏸' : animProgress >= 1 ? '↺' : '▶'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleAnimStepForward}
                  style={({ pressed }) => [styles.animCtrlBtn, pressed && { opacity: 0.6 }]}
                  hitSlop={8}
                >
                  <Text style={styles.animCtrlIcon}>⏭</Text>
                </Pressable>

                <Pressable
                  onPress={handleAnimReplay}
                  style={({ pressed }) => [styles.animCtrlBtn, pressed && { opacity: 0.6 }]}
                  hitSlop={8}
                >
                  <Text style={styles.animCtrlIcon}>↺</Text>
                </Pressable>

                <Pressable
                  onPress={handleSpeedCycle}
                  style={({ pressed }) => [styles.animSpeedBtn, pressed && { opacity: 0.7 }]}
                  hitSlop={8}
                >
                  <Text style={styles.animSpeedText}>{animSpeed}×</Text>
                </Pressable>

                <Pressable
                  onPress={handleReset}
                  style={({ pressed }) => [styles.animResetBtn, pressed && { opacity: 0.7 }]}
                  hitSlop={8}
                >
                  <Text style={styles.resetButtonText}>Reset View</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.animComingSoon}>
              <Text style={styles.animComingSoonText}>No animation available for this model.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Outer flex column — viewer on top, animation panel on bottom
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#090D16',
  },
  // Viewer fills all space when panel is closed
  viewerAreaFull: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // Viewer occupies ~58% height when panel is open (leaves 42% for the panel)
  viewerArea: {
    flex: 1,     // still flex:1 so it fills remaining space above the panel
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  standardContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  loaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    elevation: 6,
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  hintBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  resetButtonText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  noModelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noModelCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 20,
    alignItems: 'center',
    maxWidth: 320,
  },
  noModelIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noModelTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  noModelSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  scanAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scanAnotherButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Animation panel — flex sibling below the viewer, NOT an absolute overlay
  animPanel: {
    flexShrink: 0,            // don't let it compress; let viewer shrink instead
    maxHeight: '45%',         // panel never takes more than 45% of the viewer height
    backgroundColor: 'rgba(9,13,22,0.98)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(56,189,248,0.25)',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  animHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  animTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  animCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animCloseBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  animCaptionBox: {
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  animStepLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  animCaption: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 17,
  },
  animFormula: {
    color: '#A78BFA',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 5,
    lineHeight: 16,
  },
  animDotsScroll: {
    marginBottom: 8,
  },
  animDotsContent: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  animDot: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    maxWidth: 100,
  },
  animDotDone: {
    backgroundColor: 'rgba(16,185,129,0.25)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  animDotActive: {
    backgroundColor: 'rgba(56,189,248,0.25)',
    borderColor: '#38BDF8',
  },
  animDotText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  animScrubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  animTimeText: {
    color: '#64748B',
    fontSize: 10,
    width: 26,
    textAlign: 'center',
  },
  animScrubTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(30,41,59,0.9)',
  },
  animScrubFill: {
    height: 4,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  animScrubEmpty: {
    height: 4,
    backgroundColor: 'rgba(56,189,248,0.15)',
  },
  animControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  animCtrlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animCtrlIcon: {
    color: '#94A3B8',
    fontSize: 14,
  },
  animPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  animPlayIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  animSpeedBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  animSpeedText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
  },
  animComingSoon: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  animComingSoonIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  animComingSoonText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  animResetBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
  },
});

export default ThreeDViewer;
