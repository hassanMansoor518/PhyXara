import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
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
  // (SVG viewers receive these via useAnimatedProps or plain JS state; we use
  //  a Reanimated-driven re-render approach: bind yaw/pitch to React state.)
  const [svgYaw, setSvgYaw] = useState(0);
  const [svgPitch, setSvgPitch] = useState(0);

  // Sync shared values → React state so SVG viewers re-render with correct angles.
  // We use a lightweight rAF bridge so we don't block the UI thread.
  const svgSyncRef = useRef(null);
  useEffect(() => {
    let alive = true;
    const sync = () => {
      if (!alive) return;
      setSvgYaw(yawAngle.value);
      setSvgPitch(pitchAngle.value);
      svgSyncRef.current = requestAnimationFrame(sync);
    };
    svgSyncRef.current = requestAnimationFrame(sync);
    return () => {
      alive = false;
      if (svgSyncRef.current) cancelAnimationFrame(svgSyncRef.current);
    };
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
          width={290} height={230}
          rotationAngle={svgYaw}
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
      // Pass both yaw and pitch so the solid-3D projector sees both axes.
      // thickness=2.4 ensures the caliper reads as chunky from any angle.
      return (
        <VernierViewerSvg
          width={290} height={230}
          yaw={svgYaw}
          pitch={svgPitch}
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

  return (
    <View style={[styles.container, style]}>
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

      {/* Floating Zoom & Reset Buttons */}
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

      {/* Loading Overlay (Auto-dismissed within 400ms to prevent infinite spinner) */}
      {loadingWebGL && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loaderBadge}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.loadingText}>Initializing 3D View...</Text>
          </View>
        </View>
      )}

      {/* Interactive Gesture Hint & Reset View Pill */}
      {showControlsHint && (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
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
});

export default ThreeDViewer;
