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
  Box,
  AlertCircle,
  Eye,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'expo-camera';

import {
  ViewerHeader,
  ViewerModeSelector,
  Interactive3DViewer,
  HowItWorksCard,
  MeasurementInfoGrid,
  AskAITutorButton,
  VIEWER_TOKENS,
} from '../components/viewer';

import {
  checkARSupport,
  isARSupportedSync,
  AR_UNSUPPORTED_FRIENDLY_MESSAGE,
} from '../utils/arChecker';
import { UnityBridge } from '../unity/UnityBridge';
import { scannerService } from '../services/scannerService';

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
 * Redesigned 3D Learning Viewer Screen
 * Matches Target UI Design (Reference Image 2)
 *
 * Implements:
 * - Header with Back, Title, Subtitle, Favorite, and Help
 * - 3-Option Segmented Control (3D Model / AR View / Animation)
 * - Large Interactive 3D Viewport with Perspective Grid, Floating Controls, and Cyan Annotations
 * - Integrated In-Viewport Animation Playback Panel
 * - How It Works Card with English/Urdu Toggle & 3 Numbered Steps
 * - 2x2 Measurement Information Specifications Grid
 * - Prominent "Ask AI Tutor" Action Button
 */
export const DiagramDetailScreen = ({ navigation = null, route = null } = {}) => {
  const searchParams = useLocalSearchParams?.() || {};
  const params = route?.params || searchParams || {};

  const rawTopicId = params.topicId || params.diagramId || 'micrometer';

  // Fetch diagram metadata from scanner service
  const diagramData = useMemo(() => {
    return scannerService.getDiagramData(rawTopicId);
  }, [rawTopicId]);

  const diagram = useMemo(() => {
    if (!diagramData) {
      return {
        id: 'micrometer',
        title: 'Micrometer Screw Gauge',
        board: 'Class 9 • Sindh Textbook Board',
        chapter: 'Chapter 1: Measurement',
        has3DModel: true,
        modelSource: DEFAULT_MICROMETER_MODEL,
        description:
          'Translates the rotary motion of a precision screw into linear motion to measure dimensions up to 0.01 mm precision.',
        formula: 'Least Count = Pitch / Total Divisions on Thimble = 0.5 mm / 50 = 0.01 mm',
        components: [
          'Anvil & Spindle',
          'Sleeve (Main Scale)',
          'Thimble (Circular Scale)',
          'Ratchet Knob',
          'Lock Nut',
          'U-shaped Metal Frame',
        ],
        specifications: [
          { label: 'Pitch of Screw', value: '0.5 mm' },
          { label: 'Least Count', value: '0.01 mm' },
          { label: 'Thimble Divisions', value: '50' },
          { label: 'Precision', value: '±0.005 mm' },
        ],
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
      modelSource: isModelVerified ? (MODEL_SOURCES[id] || DEFAULT_MICROMETER_MODEL) : null,
    };
  }, [diagramData]);

  // State Management
  const [activeMode, setActiveMode] = useState('3D'); // '3D' | 'AR' | 'Animation'
  const [arSupported, setArSupported] = useState(isARSupportedSync());
  const [autoRotate, setAutoRotate] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [animationMode, setAnimationMode] = useState(false);

  // Friendly In-App Modal for Unsupported Devices
  const [showARUnsupportedModal, setShowARUnsupportedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(AR_UNSUPPORTED_FRIENDLY_MESSAGE);

  // Educational Help/Guide Modal
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Refresh hardware capability check on mount
  useEffect(() => {
    let isMounted = true;

    async function evaluateDeviceCapability() {
      const result = await checkARSupport();
      if (isMounted) {
        setArSupported(result.isSupported);
      }
    }

    evaluateDeviceCapability();

    return () => {
      isMounted = false;
    };
  }, []);

  // Screen Focus Listener for aggressive Memory Management
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

  // Handle Mode Switch between 3D Model, AR View, and Animation
  const handleSelectMode = useCallback(
    async (mode) => {
      if (mode === '3D') {
        setActiveMode('3D');
        setAnimationMode(false);
        return;
      }

      if (mode === 'Animation') {
        setActiveMode('Animation');
        setAnimationMode(true);
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

        // Step 1: Verify hardware compatibility
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
        setActiveMode('AR');
        triggerUnityAR();
      }
    },
    [diagram, triggerUnityAR]
  );

  // Back Navigation handler
  const handleBack = () => {
    if (animationMode && activeMode === 'Animation') {
      setActiveMode('3D');
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

  const handleToggleFavorite = () => {
    setIsStarred((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Saved to Favorites' : 'Removed from Favorites',
        `${diagram.title} has been ${next ? 'added to' : 'removed from'} your library.`
      );
      return next;
    });
  };

  const handleAskAITutor = () => {
    router.push({
      pathname: '/ai-tutor',
      params: {
        initialQuestion: `Explain how the ${diagram.title} operates, how to calculate its least count, and how to read the scale in Sindh Board Physics.`,
        topicId: diagram.id,
        topicName: diagram.title,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={VIEWER_TOKENS.colors.mainBg} />

      {/* A. Header */}
      <ViewerHeader
        title={diagram.title}
        subtitle={diagram.board || 'Class 9 • Sindh Textbook Board'}
        isStarred={isStarred}
        onBack={handleBack}
        onToggleFavorite={handleToggleFavorite}
        onHelp={() => setShowHelpModal(true)}
      />

      {/* B. Viewer Mode Selector Segmented Tabs */}
      <ViewerModeSelector
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        arSupported={arSupported}
      />

      {/* Soft alert badge if AR is unsupported and AR tab was clicked */}
      {!arSupported && activeMode === 'AR' && (
        <View style={styles.softAlertBadge}>
          <AlertCircle size={14} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={styles.softAlertText}>
            AR is not supported on this device. You can explore the 3D model in Standard View.
          </Text>
        </View>
      )}

      {/* Clean Vertically Scrollable Screen Layout */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* C & D. Interactive 3D Viewer with Floating & Animation Controls */}
        {isScreenFocused ? (
          <Interactive3DViewer
            modelPath={diagram.modelSource}
            diagramId={diagram.id}
            has3DModel={diagram.has3DModel}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
            showAnnotations={true}
            animationMode={animationMode}
            onAnimationModeExit={() => {
              setAnimationMode(false);
              setActiveMode('3D');
            }}
            onScanAnother={() => router.replace('/scanner')}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Eye size={36} color="#64748B" />
            <Text style={styles.placeholderText}>
              {activeMode === 'AR' ? 'Launching Unity AR Mode...' : '3D Engine Parked'}
            </Text>
          </View>
        )}

        {/* E. How It Works Section with EN/Urdu Toggle & 3 Steps */}
        <HowItWorksCard />

        {/* F. Measurement Information Section 2x2 Grid */}
        <MeasurementInfoGrid />

        {/* G. Ask AI Tutor Prominent Bottom Action */}
        <AskAITutorButton
          topicName={diagram.title}
          onPress={handleAskAITutor}
          style={styles.aiTutorContainer}
        />
      </ScrollView>

      {/* Friendly In-App Modal when AR is unsupported */}
      <Modal
        visible={showARUnsupportedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowARUnsupportedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <AlertCircle size={32} color="#F59E0B" />
            </View>

            <Text style={styles.modalTitle}>AR Not Supported</Text>
            <Text style={styles.modalBody}>{modalMessage}</Text>

            <Text style={styles.modalSubtext}>
              Your device hardware is optimized for Standard 3D View. You can rotate, zoom, and inspect every component interactively without ARCore.
            </Text>

            <Pressable
              onPress={() => {
                setShowARUnsupportedModal(false);
                setActiveMode('3D');
              }}
              style={styles.modalReturnButton}
            >
              <Box size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalReturnButtonText}>Return to 3D Model View</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Educational Guide & Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(32, 200, 255, 0.15)' }]}>
              <HelpCircle size={30} color={VIEWER_TOKENS.colors.cyanAccent} />
            </View>

            <Text style={styles.modalTitle}>Student Quick Guide</Text>

            <View style={styles.guideItem}>
              <Text style={styles.guideHeading}>🔬 3D Exploration</Text>
              <Text style={styles.guideText}>
                Drag with one finger to rotate the micrometer, pinch with two fingers to zoom, or tap the 360° button.
              </Text>
            </View>

            <View style={styles.guideItem}>
              <Text style={styles.guideHeading}>▶ Animation Playback</Text>
              <Text style={styles.guideText}>
                Press the play button or scrub the timeline slider to see the spindle advance and the thimble scale rotate.
              </Text>
            </View>

            <View style={styles.guideItem}>
              <Text style={styles.guideHeading}>🌐 Bilingual Notes</Text>
              <Text style={styles.guideText}>
                Toggle between EN and Urdu in the &quot;How it works&quot; section for textbook-aligned explanations.
              </Text>
            </View>

            <Pressable
              onPress={() => setShowHelpModal(false)}
              style={styles.modalReturnButton}
            >
              <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalReturnButtonText}>Got It, Continue Learning</Text>
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
    backgroundColor: VIEWER_TOKENS.colors.mainBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: VIEWER_TOKENS.colors.mainBg,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  softAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: 6,
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
  placeholderContainer: {
    height: 320,
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: VIEWER_TOKENS.spacing.sm,
    borderRadius: VIEWER_TOKENS.radius.xl,
    backgroundColor: '#031024',
    borderWidth: 1.5,
    borderColor: VIEWER_TOKENS.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: VIEWER_TOKENS.colors.secondaryText,
    fontSize: 13,
    marginTop: 8,
  },
  aiTutorContainer: {
    marginTop: VIEWER_TOKENS.spacing.lg,
    marginBottom: VIEWER_TOKENS.spacing.sm,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 11, 28, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: VIEWER_TOKENS.colors.cardBg,
    borderRadius: VIEWER_TOKENS.radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 19,
    color: VIEWER_TOKENS.colors.secondaryText,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtext: {
    fontSize: 11.5,
    lineHeight: 16,
    color: VIEWER_TOKENS.colors.mutedText,
    textAlign: 'center',
    marginBottom: 20,
  },
  guideItem: {
    width: '100%',
    marginBottom: 14,
    backgroundColor: 'rgba(6, 24, 50, 0.6)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 60, 112, 0.4)',
  },
  guideHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    marginBottom: 4,
  },
  guideText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: VIEWER_TOKENS.colors.secondaryText,
  },
  modalReturnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: VIEWER_TOKENS.radius.full,
    width: '100%',
    marginTop: 4,
  },
  modalReturnButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default DiagramDetailScreen;
