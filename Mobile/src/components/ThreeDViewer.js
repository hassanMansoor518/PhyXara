import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform,
  Pressable,
} from 'react-native';
let Canvas = null;
let useFrame = () => {};
let OrbitControls = null;
let useGLTF = null;
let Center = null;
let THREE = null;
let isFiberSupported = false;

try {
  require('react-native-get-random-values');
  const fiber = require('@react-three/fiber/native');
  Canvas = fiber.Canvas;
  useFrame = fiber.useFrame || (() => {});
  const drei = require('@react-three/drei/native');
  OrbitControls = drei.OrbitControls;
  useGLTF = drei.useGLTF;
  Center = drei.Center;
  THREE = require('three');
  if (Canvas) {
    isFiberSupported = true;
  }
} catch (err) {
  console.warn('[ThreeDViewer] 3D WebGL engine failed to initialize:', err);
}


/**
 * 3D Model Renderer using useGLTF.
 * Includes automatic memory cleanup on unmount for low-RAM devices.
 */
function ModelMesh({
  uri,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  onLoaded,
}) {
  const gltf = useGLTF(uri);
  const groupRef = useRef();

  useEffect(() => {
    if (gltf && onLoaded) {
      onLoaded();
    }
  }, [gltf, onLoaded]);

  // Clean up Three.js buffers & textures upon model unmount to prevent memory leaks on 2GB/3GB RAM devices
  useEffect(() => {
    const sceneToClean = gltf?.scene;
    return () => {
      if (sceneToClean) {
        sceneToClean.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              } else {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
              }
            }
          }
        });
      }
      try {
        useGLTF.clear(uri);
      } catch (err) {
        // Silently handle if URI was not registered in cache
      }
    };
  }, [gltf, uri]);

  // Subtle continuous rotation if requested
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Center>
        <primitive object={gltf.scene} scale={scale} dispose={null} />
      </Center>
    </group>
  );
}

/**
 * Procedural Physics Fallback Mesh
 * Displayed when no external GLB/GLTF model is supplied or during fallback testing.
 */
function PhysicsFallbackMesh({ autoRotate = true }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      <Center>
        {/* Core rotor cylinder */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1.8, 32]} />
          <meshStandardMaterial
            color="#0284C7"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Armature magnetic coil */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.14, 16, 64]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Magnetic field flux ring */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.05, 12, 48]} />
          <meshBasicMaterial color="#38BDF8" wireframe />
        </mesh>
      </Center>
    </group>
  );
}

/**
 * 3D In-Canvas Suspense Loader
 */
function CanvasLoadingIndicator() {
  const spinnerRef = useRef();

  useFrame((_, delta) => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += delta * 2.5;
      spinnerRef.current.rotation.x += delta * 1.5;
    }
  });

  return (
    <group ref={spinnerRef}>
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#38BDF8" wireframe />
      </mesh>
    </group>
  );
}

/**
 * Primary React Three Fiber 3D Viewer Component
 *
 * @param {string | number | object} modelPath - Local require('...') asset or remote URL (.glb / .gltf)
 * @param {number} scale - Model scale multiplier (default: 1)
 * @param {Array<number>} position - [x, y, z] position coordinates
 * @param {Array<number>} rotation - [x, y, z] rotation in radians
 * @param {boolean} autoRotate - Enable subtle auto-rotation
 * @param {boolean} showControlsHint - Display gesture hint pill
 * @param {object} style - Optional container styling
 * @param {function} onError - Error callback
 * @param {function} onLoad - Load completion callback
 */
export const ThreeDViewer = ({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  showControlsHint = true,
  style,
  onError,
  onLoad,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const orbitRef = useRef();

  // Resolve asset whether it is a require() number, an object, or a remote URL string
  const resolvedUri = useMemo(() => {
    if (!modelPath) return null;
    try {
      if (typeof modelPath === 'string') {
        return modelPath;
      }
      if (typeof modelPath === 'number') {
        const resolved = Image.resolveAssetSource(modelPath);
        return resolved?.uri || null;
      }
      if (typeof modelPath === 'object' && modelPath.uri) {
        return modelPath.uri;
      }
    } catch (err) {
      console.warn('[ThreeDViewer] Failed to resolve modelPath:', err);
    }
    return null;
  }, [modelPath]);

  const handleModelLoaded = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  if (!isFiberSupported || !Canvas) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        <View style={styles.fallbackContent}>
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginBottom: 12 }} />
          <Text style={styles.fallbackTitle}>3D Interactive View</Text>
          <Text style={styles.fallbackSubtitle}>
            Preparing visual workspace...
          </Text>
          <Text style={styles.fallbackHint}>
            Use the Unity AR Mode above for augmented reality exploration.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
        }}
        style={styles.canvas}
      >
        {/* Studio Lighting System */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[6, 8, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-6, -4, -5]} intensity={0.6} color="#60A5FA" />
        <pointLight position={[0, 4, 2]} intensity={0.8} color="#FFFFFF" />

        {/* Interactive Touch Orbit Controls */}
        <OrbitControls
          ref={orbitRef}
          enableZoom={true}
          enableRotate={true}
          enablePan={true}
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={12}
          makeDefault
        />

        {/* 3D Model with Suspense */}
        <Suspense fallback={<CanvasLoadingIndicator />}>
          {resolvedUri && !loadError ? (
            <ModelMesh
              uri={resolvedUri}
              scale={scale}
              position={position}
              rotation={rotation}
              autoRotate={autoRotate}
              onLoaded={handleModelLoaded}
            />
          ) : (
            <PhysicsFallbackMesh autoRotate={autoRotate} />
          )}
        </Suspense>
      </Canvas>

      {/* Loading Overlay Spinner */}
      {loading && resolvedUri && !loadError && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loaderBadge}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.loadingText}>Loading 3D Visual...</Text>
          </View>
        </View>
      )}

      {/* Interactive Controls & Gesture Hint */}
      {showControlsHint && (
        <View style={styles.hintContainer} pointerEvents="box-none">
          <View style={styles.hintBadge}>
            <Text style={styles.hintText}>
              Drag to Orbit • Pinch to Zoom • 2-Finger Pan
            </Text>
          </View>
          <Pressable
            onPress={handleResetCamera}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { opacity: 0.7 },
            ]}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
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
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackContent: {
    alignItems: 'center',
    maxWidth: 320,
    backgroundColor: '#0F172A',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  fallbackTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  fallbackHint: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ThreeDViewer;
