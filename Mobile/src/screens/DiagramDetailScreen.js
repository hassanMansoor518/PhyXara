import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Box,
  Sparkles,
  Layers,
  AlertCircle,
  Eye,
  Info,
  Cpu,
  RotateCw,
  Play,
  Trophy,
  Star,
  CheckCircle2,
  Atom,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'expo-camera';

import ThreeDViewer from '../components/ThreeDViewer';
import {
  checkARSupport,
  isARSupportedSync,
  setARSupportOverride,
  AR_UNSUPPORTED_FRIENDLY_MESSAGE,
} from '../utils/arChecker';
import { UnityBridge } from '../unity/UnityBridge';
import { scannerService, PHYSICS_DIAGRAM_CATALOG } from '../services/scannerService';

// Bundled GLB models for 3D Visual Mode
const DEFAULT_MOTOR_MODEL = require('../../AR_MODE/Assets/Model/electric_motor.glb');
const DEFAULT_MICROMETER_MODEL = require('../../AR_MODE/Assets/Model/micrometer_screw_gauge_v2.glb');

const MODEL_SOURCES = {
  'electric-motor': DEFAULT_MOTOR_MODEL,
  'micrometer': DEFAULT_MICROMETER_MODEL,
  'ac-motor': DEFAULT_MOTOR_MODEL,
  'transformer': DEFAULT_MOTOR_MODEL,
  'generator': DEFAULT_MOTOR_MODEL,
  'vernier': DEFAULT_MICROMETER_MODEL,
  'circuit': DEFAULT_MOTOR_MODEL,
  'mechanical-gear': DEFAULT_MOTOR_MODEL,
};

/**
 * Dual-Mode Screen / Controller
 *
 * Implements the Required Flow:
 * Scan Diagram -> Show 3D Model Screen -> Choose Viewing Mode
 *
 * 1. 3D Model View:
 *    - Displays the scanned diagram's corresponding 3D model directly inside the app.
 *    - Allows rotation, zooming in, zooming out, reset, and inspection.
 *    - If no 3D model exists for the recognized diagram, displays "No matching 3D model is available for this image."
 *    - Never displays random or unrelated 3D models.
 *
 * 2. AR View:
 *    - Launched only when the user explicitly taps "AR View" and a 3D model is verified.
 *    - Checks ARCore hardware compatibility beforehand.
 */
export const DiagramDetailScreen = ({ navigation = null, route = null } = {}) => {
  const searchParams = useLocalSearchParams?.() || {};
  const params = route?.params || searchParams || {};

  const rawTopicId = params.topicId || params.diagramId || 'electric-motor';

  // Fetch full diagram metadata from scanner service
  const diagramData = useMemo(() => {
    return scannerService.getDiagramData(rawTopicId);
  }, [rawTopicId, params.scanId]);

  const diagram = useMemo(() => {
    if (!diagramData) {
      return {
        id: 'unrecognized',
        title: 'Unrecognized Image',
        board: 'Curriculum Scanner',
        chapter: 'Physics Syllabus',
        has3DModel: false,
        modelSource: null,
        description: 'Unable to recognize this image. Please upload a clearer image and try again.',
        formula: '',
        components: [],
        specifications: [],
      };
    }

    const id = diagramData.diagramId;
    const isModelVerified = Boolean(diagramData.has3DModel);

    return {
      ...diagramData,
      id,
      has3DModel: isModelVerified,
      description: diagramData.principle || diagramData.description || '',
      experimentId: id === 'micrometer' ? 'exp3_micrometer' : id === 'electric-motor' ? 'electric_motor' : null,
      modelSource: isModelVerified ? (MODEL_SOURCES[id] || DEFAULT_MOTOR_MODEL) : null,
    };
  }, [diagramData]);

  // State Management
  const [activeMode, setActiveMode] = useState('3D'); // '3D' | 'AR'
  const [arSupported, setArSupported] = useState(isARSupportedSync());
  const [checkingAR, setCheckingAR] = useState(true);
  const [arReason, setArReason] = useState('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  // true when the in-place animation panel is open inside the viewer
  const [animationMode, setAnimationMode] = useState(false);

  // Friendly In-App Modal for Unsupported Devices
  const [showARUnsupportedModal, setShowARUnsupportedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(AR_UNSUPPORTED_FRIENDLY_MESSAGE);

  // Refresh hardware capability check on mount
  useEffect(() => {
    let isMounted = true;

    async function evaluateDeviceCapability() {
      setCheckingAR(true);
      const result = await checkARSupport();
      if (isMounted) {
        setArSupported(result.isSupported);
        setArReason(result.reason);
        setCheckingAR(false);
        // Default to safe 3D Standard View
        setActiveMode('3D');
      }
    }

    evaluateDeviceCapability();

    return () => {
      isMounted = false;
    };
  }, [params.scanId]);

  // Screen Focus Listener for aggressive Memory Management on budget devices
  useEffect(() => {
    if (navigation?.addListener) {
      const unsubscribeFocus = navigation.addListener('focus', () => {
        setIsScreenFocused(true);
      });
      const unsubscribeBlur = navigation.addListener('blur', () => {
        setIsScreenFocused(false);
      });
      return () => {
        unsubscribeFocus();
        unsubscribeBlur();
      };
    }
  }, [navigation]);

  // Unity AR Launch handler (called ONLY when AR is confirmed supported)
  const triggerUnityAR = useCallback(async () => {
    try {
      const experimentId = diagram.experimentId || 'exp3_micrometer';
      const result = await UnityBridge.open('ar', experimentId);

      if (!result.ok) {
        if (result.reason === 'camera_denied') {
          Alert.alert(
            'Camera Access Needed',
            'Camera permission is required to place the 3D model into your real room.',
            [
              { text: 'Stay in 3D Mode', style: 'cancel', onPress: () => setActiveMode('3D') },
              {
                text: 'Grant Permission',
                onPress: async () => {
                  await Camera.requestCameraPermissionsAsync();
                },
              },
            ]
          );
        } else if (result.reason === 'ar_unsupported') {
          setModalMessage(AR_UNSUPPORTED_FRIENDLY_MESSAGE);
          setShowARUnsupportedModal(true);
          setActiveMode('3D');
        }
      }
    } catch (err) {
      console.warn('[DiagramDetailScreen] Error opening Unity AR:', err);
      setActiveMode('3D');
      Alert.alert(
        'Unable to Start AR',
        'Could not start AR session. You can continue exploring in 3D Standard View.',
        [{ text: 'Continue in 3D', onPress: () => setActiveMode('3D') }]
      );
    }
  }, [diagram]);

  // Handle Mode Switch
  const handleSelectMode = useCallback(
    async (mode) => {
      if (mode === '3D') {
        setActiveMode('3D');
        return;
      }

      if (mode === 'AR') {
        if (!diagram.has3DModel) {
          Alert.alert(
            '3D Model Unavailable for AR',
            'No matching 3D model is available for this image. AR mode requires a verified 3D model.',
            [{ text: 'Continue in 3D View', onPress: () => setActiveMode('3D') }]
          );
          return;
        }

        // Step 1: Re-verify hardware compatibility
        const checkResult = await checkARSupport();
        if (!checkResult.isSupported) {
          setModalMessage(checkResult.reason || AR_UNSUPPORTED_FRIENDLY_MESSAGE);
          setShowARUnsupportedModal(true);
          setActiveMode('3D');
          return;
        }

        // Step 2: Check Camera Permission
        const permission = await Camera.getCameraPermissionsAsync();
        const granted = permission.granted || (await Camera.requestCameraPermissionsAsync()).granted;
        if (!granted) {
          Alert.alert(
            'Camera Access Needed',
            'Camera permission is required to view models in Augmented Reality.',
            [
              { text: 'Stay in 3D View', style: 'cancel', onPress: () => setActiveMode('3D') },
              {
                text: 'Grant Permission',
                onPress: async () => {
                  const retry = await Camera.requestCameraPermissionsAsync();
                  if (retry.granted) {
                    triggerUnityAR();
                  }
                },
              },
            ]
          );
          return;
        }

        // Step 3: Launch Unity AR
        triggerUnityAR();
      }
    },
    [triggerUnityAR]
  );

  // Back Navigation handler — also exits animation mode first
  const handleBack = () => {
    if (animationMode) {
      setAnimationMode(false);
      return;
    }
    if (navigation?.goBack && navigation.canGoBack?.()) {
      navigation.goBack();
    } else if (router?.canGoBack?.()) {
      router.back();
    } else {
      router?.replace?.('/(tabs)');
    }
  };

  // Toggle debug override for quick verification of low-end vs. AR mode
  const handleToggleDebugDevice = async () => {
    const nextOverride = arSupported ? false : true;
    setARSupportOverride(nextOverride);
    const refreshed = await checkARSupport(true);
    setArSupported(refreshed.isSupported);
    setArReason(refreshed.reason);
    if (!refreshed.isSupported) {
      setActiveMode('3D');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          hitSlop={12}
        >
          <ArrowLeft size={20} color="#F8FAFC" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {diagram.title}
          </Text>
          <Text style={styles.headerSubtitle}>{diagram.board}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setAutoRotate((prev) => !prev)}
            style={({ pressed }) => [
              styles.iconButton,
              autoRotate && styles.iconButtonActive,
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={8}
          >
            <RotateCw size={17} color={autoRotate ? '#38BDF8' : '#94A3B8'} />
          </Pressable>

          <Pressable
            onPress={() => {
              setIsStarred((prev) => !prev);
              Alert.alert(
                !isStarred ? 'Saved to Favorites' : 'Removed from Favorites',
                `${diagram.title} has been updated in your library.`
              );
            }}
            style={({ pressed }) => [
              styles.iconButton,
              isStarred && styles.iconButtonActive,
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={8}
          >
            <Star
              size={17}
              color={isStarred ? '#F59E0B' : '#94A3B8'}
              fill={isStarred ? '#F59E0B' : 'none'}
            />
          </Pressable>
        </View>
      </View>

      {/* Quick Navigation Strip (Animation, AI Tutor, Quiz) */}
      <View style={styles.quickNavStrip}>
        <Pressable
          onPress={() => setAnimationMode((prev) => !prev)}
          style={[
            styles.quickNavPill,
            animationMode && styles.quickNavPillActive,
          ]}
        >
          <Play size={12} color={animationMode ? '#0B0F19' : '#38BDF8'} fill={animationMode ? '#0B0F19' : '#38BDF8'} />
          <Text style={[styles.quickNavText, animationMode && styles.quickNavTextActive]}>Animation</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/ai-tutor',
              params: { initialQuestion: `Explain how the ${diagram.title} operates and its key components.` },
            })
          }
          style={styles.quickNavPill}
        >
          <Sparkles size={12} color="#A78BFA" />
          <Text style={[styles.quickNavText, { color: '#C4B5FD' }]}>AI Tutor</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/quiz')}
          style={styles.quickNavPill}
        >
          <Trophy size={12} color="#FBBF24" />
          <Text style={[styles.quickNavText, { color: '#FDE68A' }]}>Quiz</Text>
        </Pressable>
      </View>

      {/* Two Required Viewing Mode Buttons */}
      <View style={styles.toggleSection}>
        <View style={styles.segmentedContainer}>
          {/* Button 1: 3D Model View (Standard Mode) */}
          <Pressable
            onPress={() => handleSelectMode('3D')}
            style={[
              styles.segmentTab,
              activeMode === '3D' && styles.segmentTabActive,
            ]}
          >
            <Box
              size={16}
              color={activeMode === '3D' ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentTabText,
                activeMode === '3D' && styles.segmentTabTextActive,
              ]}
            >
              3D Model View
            </Text>
          </Pressable>

          {/* Button 2: AR View */}
          <Pressable
            onPress={() => handleSelectMode('AR')}
            style={[
              styles.segmentTab,
              activeMode === 'AR' && styles.segmentTabActive,
            ]}
          >
            <Sparkles
              size={16}
              color={activeMode === 'AR' ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentTabText,
                activeMode === 'AR' && styles.segmentTabTextActive,
              ]}
            >
              AR View
            </Text>
          </Pressable>
        </View>

        {/* Soft Alert Banner when AR is unsupported on this device */}
        {!arSupported && (
          <View style={styles.softAlertBadge}>
            <AlertCircle size={14} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.softAlertText}>
              AR is not supported on this device. You can still explore the 3D model in Standard View.
            </Text>
          </View>
        )}
      </View>

      {/* Main 3D Viewport with Verified Model Matching */}
      <View style={styles.viewportContainer}>
        {isScreenFocused && activeMode === '3D' ? (
          <ThreeDViewer
            modelPath={diagram.modelSource}
            diagramId={diagram.id}
            has3DModel={diagram.has3DModel}
            autoRotate={autoRotate}
            showControlsHint={true}
            onScanAnother={() => router.replace('/scanner')}
            style={styles.viewer}
            animationMode={animationMode}
            onAnimationModeExit={() => setAnimationMode(false)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Eye size={36} color="#64748B" />
            <Text style={styles.placeholderText}>
              {activeMode === 'AR' ? 'Launching Unity AR Mode...' : '3D Engine Parked'}
            </Text>
          </View>
        )}
      </View>

      {/* Educational Physics Specs Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetHeaderRow}>
            <View style={styles.tag}>
              <Layers size={12} color="#38BDF8" style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>{diagram.chapter}</Text>
            </View>

            {/* Model verification status badge */}
            {diagram.has3DModel ? (
              <View style={[styles.hardwareBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                <Box size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={[styles.hardwareBadgeText, { color: '#10B981' }]}>3D Model Matched</Text>
              </View>
            ) : (
              <View style={[styles.hardwareBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                <AlertCircle size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={[styles.hardwareBadgeText, { color: '#F59E0B' }]}>No 3D Model</Text>
              </View>
            )}
          </View>

          <Text style={styles.sheetDescription}>{diagram.description}</Text>

          {/* Principle & Formula Badge */}
          {diagram.formula ? (
            <View style={styles.formulaCard}>
              <View style={styles.formulaHeader}>
                <Atom size={14} color="#38BDF8" style={{ marginRight: 6 }} />
                <Text style={styles.formulaTitle}>Core Formula / Principle</Text>
              </View>
              <Text style={styles.formulaText}>{diagram.formula}</Text>
            </View>
          ) : null}

          {/* Detected Components Chips */}
          {diagram.components && diagram.components.length > 0 && (
            <View style={styles.componentsSection}>
              <Text style={styles.sectionTitle}>Detected Components</Text>
              <View style={styles.componentChipsRow}>
                {diagram.components.map((comp, idx) => (
                  <View key={idx} style={styles.componentChip}>
                    <CheckCircle2 size={12} color="#10B981" style={{ marginRight: 5 }} />
                    <Text style={styles.componentChipText}>{comp}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Physics Properties Grid */}
          <View style={styles.specsGrid}>
            {diagram.specifications.map((item, index) => (
              <View key={index} style={styles.specCard}>
                <Text style={styles.specLabel}>{item.label}</Text>
                <Text style={styles.specValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Ask AI Tutor CTA */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/ai-tutor',
                params: { initialQuestion: `Explain how the ${diagram.title} operates and its role in Sindh Board Physics.` },
              })
            }
            style={styles.aiTutorButton}
          >
            <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.aiTutorButtonText}>
              Ask AI Tutor About {diagram.title}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Friendly In-App Modal when AR is unsupported on device */}
      <Modal
        visible={showARUnsupportedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowARUnsupportedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <AlertCircle size={32} color="#F59E0B" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>AR Not Supported</Text>

            {/* Required user-facing explanation */}
            <Text style={styles.modalBody}>{modalMessage}</Text>

            <Text style={styles.modalSubtext}>
              Your device hardware is optimized for Standard 3D View. You can rotate, zoom, and inspect every component interactively without ARCore.
            </Text>

            {/* Return to 3D Model View Button */}
            <Pressable
              onPress={() => {
                setShowARUnsupportedModal(false);
                setActiveMode('3D');
              }}
              style={styles.modalReturnButton}
            >
              <Box size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalReturnButtonText}>
                Return to 3D Model View
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  quickNavStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginLeft: 5,
  },
  // Animation pill highlighted state
  quickNavPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  quickNavTextActive: {
    color: '#0B0F19',
  },
  toggleSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#0B0F19',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#161F30',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  segmentTabActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  segmentTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  softAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  softAlertText: {
    fontSize: 11,
    color: '#FCD34D',
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
  viewportContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#070A10',
  },
  viewer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 8,
  },
  bottomSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: 260,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  sheetScroll: {
    maxHeight: 240,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  hardwareBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  sheetDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  formulaCard: {
    backgroundColor: '#161F30',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 12,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formulaTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
  },
  formulaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  componentsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  componentChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  componentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  componentChipText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '500',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  specCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#161F30',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  specLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '700',
    marginTop: 2,
  },
  aiTutorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  aiTutorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    color: '#FCD34D',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  modalReturnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalReturnButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default DiagramDetailScreen;
