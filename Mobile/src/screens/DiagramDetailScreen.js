import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
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
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ThreeDViewer from '../components/ThreeDViewer';
import { checkARSupport, isARSupportedSync, setARSupportOverride } from '../utils/arChecker';
import { UnityBridge } from '../unity/UnityBridge';

// Static assets bundled with the app for 3D Visual Mode
const DEFAULT_MOTOR_MODEL = require('../../AR_MODE/Assets/Model/electric_motor.glb');

/**
 * Registry of educational diagrams for Class 9 Physics (Sindh Textbook Board)
 */
const DIAGRAM_CATALOG = {
  'electric-motor': {
    title: 'DC Electric Motor',
    subheading: 'Electromagnetism • Principle & Construction',
    chapter: 'Chapter 15: Electromagnetism',
    board: 'Class 9 • Sindh Textbook Board',
    description:
      'A direct current (DC) motor converts electrical energy into mechanical rotational kinetic energy via the magnetic force exerted on a current-carrying loop of wire inside a magnetic field.',
    modelSource: DEFAULT_MOTOR_MODEL,
    specifications: [
      { label: 'Input', value: 'Direct Current (DC)' },
      { label: 'Torque Formula', value: 'τ = NIAB sin(θ)' },
      { label: 'Commutator', value: 'Split-ring copper' },
      { label: 'Field', value: 'Permanent magnet' },
    ],
  },
  'micrometer': {
    title: 'Micrometer Screw Gauge',
    subheading: 'Physical Quantities & Measurement',
    chapter: 'Chapter 1: Measurement',
    board: 'Class 9 • Sindh Textbook Board',
    description:
      'A precision instrument used to measure tiny dimensions such as the diameter of a wire or thickness of a sheet with a precision of 0.01 mm.',
    modelSource: DEFAULT_MOTOR_MODEL,
    specifications: [
      { label: 'Pitch', value: '0.5 mm / 1.0 mm' },
      { label: 'Least Count', value: '0.01 mm (0.001 cm)' },
      { label: 'Thimble Divisions', value: '50 or 100 parts' },
      { label: 'Zero Error', value: 'Positive / Negative' },
    ],
  },
};

/**
 * Dual-Mode Screen / Controller
 * Seamlessly manages 3D Visual Mode (React Three Fiber) vs. AR Mode (Unity Engine).
 *
 * Automatically detects low-end budget devices (lack of ARCore / 2GB-3GB RAM)
 * and defaults to 3D Visual Mode without triggering Unity AR.
 */
export const DiagramDetailScreen = ({ navigation = null, route = null } = {}) => {
  // Support both React Navigation (navigation, route.params) and Expo Router (useLocalSearchParams)
  const searchParams = useLocalSearchParams?.() || {};
  const params = route?.params || searchParams || {};

  const topicId = params.topicId || 'electric-motor';
  const diagram = DIAGRAM_CATALOG[topicId] || DIAGRAM_CATALOG['electric-motor'];

  // State Management
  const [activeMode, setActiveMode] = useState('3D'); // '3D' | 'AR'
  const [arSupported, setArSupported] = useState(isARSupportedSync());
  const [checkingAR, setCheckingAR] = useState(true);
  const [arReason, setArReason] = useState('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  // Evaluate AR hardware capability on mount
  useEffect(() => {
    let isMounted = true;

    async function evaluateDeviceCapability() {
      setCheckingAR(true);
      const result = await checkARSupport();
      if (isMounted) {
        setArSupported(result.isSupported);
        setArReason(result.reason);
        setCheckingAR(false);

        // If low-end device, guarantee activeMode is 3D
        if (!result.isSupported) {
          setActiveMode('3D');
        }
      }
    }

    evaluateDeviceCapability();

    return () => {
      isMounted = false;
    };
  }, []);

  // Screen Focus Listener for aggressive Memory Management on budget devices
  useEffect(() => {
    // Listen for navigation blur/focus if React Navigation prop exists
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

  // Handle Mode Switch
  const handleSelectMode = useCallback(
    async (mode) => {
      if (mode === 'AR') {
        if (!arSupported) {
          Alert.alert(
            'AR Mode Unavailable',
            arReason || 'This device does not support native AR tracking (ARCore/ARKit). 3D Visual Mode is enabled.',
            [{ text: 'Stay in 3D Mode', style: 'cancel' }]
          );
          return;
        }

        // Invoke existing Unity AR redirect
        triggerUnityAR();
        return;
      }

      // Switch back to 3D Visual Mode
      setActiveMode('3D');
    },
    [arSupported, arReason, triggerUnityAR]
  );

  // Unity AR Launch handler
  const triggerUnityAR = useCallback(async () => {
    // 1. If React Navigation is available in props
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('UnityArScreen', { topicId });
        return;
      } catch (err) {
        // Fall through to UnityBridge
      }
    }

    // 2. UnityBridge integration (Standard in PhyXara app)
    try {
      const result = await UnityBridge.open('ar', topicId);
      if (!result.ok && result.reason === 'camera_denied') {
        Alert.alert(
          'Camera Permission Denied',
          'Camera access is required to project the 3D model into your real environment.'
        );
      }
    } catch (err) {
      console.warn('[DiagramDetailScreen] Falling back to router push:', err);
      // 3. Fallback router push
      if (router?.push) {
        router.push({
          pathname: '/unity',
          params: { topicId, mode: 'ar' },
        });
      }
    }
  }, [navigation, topicId]);

  // Back Navigation handler
  const handleBack = () => {
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

      {/* Top Navigation Bar */}
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

        {/* Quick Auto-Rotate Toggle */}
        <Pressable
          onPress={() => setAutoRotate((prev) => !prev)}
          style={({ pressed }) => [
            styles.iconButton,
            autoRotate && styles.iconButtonActive,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <RotateCw size={18} color={autoRotate ? '#38BDF8' : '#94A3B8'} />
        </Pressable>
      </View>

      {/* Segmented Mode Toggle Controller */}
      <View style={styles.toggleSection}>
        <View style={styles.segmentedContainer}>
          {/* 3D Visual Mode Button */}
          <Pressable
            onPress={() => handleSelectMode('3D')}
            style={[
              styles.segmentTab,
              activeMode === '3D' && styles.segmentTabActive,
            ]}
          >
            <Box
              size={15}
              color={activeMode === '3D' ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentTabText,
                activeMode === '3D' && styles.segmentTabTextActive,
              ]}
            >
              3D Visual Mode
            </Text>
          </Pressable>

          {/* AR Mode Button */}
          <Pressable
            onPress={() => handleSelectMode('AR')}
            disabled={!arSupported}
            style={[
              styles.segmentTab,
              activeMode === 'AR' && styles.segmentTabActive,
              !arSupported && styles.segmentTabDisabled,
            ]}
          >
            <Sparkles
              size={15}
              color={
                !arSupported
                  ? '#475569'
                  : activeMode === 'AR'
                  ? '#FFFFFF'
                  : '#94A3B8'
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentTabText,
                activeMode === 'AR' && styles.segmentTabTextActive,
                !arSupported && styles.segmentTabTextDisabled,
              ]}
            >
              AR Mode
            </Text>
          </Pressable>
        </View>

        {/* Soft Alert Badge for Low-End / Non-AR Devices */}
        {!arSupported && (
          <View style={styles.softAlertBadge}>
            <AlertCircle size={14} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.softAlertText}>
              AR not supported on this device. Using 3D Interactive Mode.
            </Text>
          </View>
        )}
      </View>

      {/* Main 3D Viewport with Automatic Canvas Unmounting when unfocused */}
      <View style={styles.viewportContainer}>
        {isScreenFocused && activeMode === '3D' ? (
          <ThreeDViewer
            modelPath={diagram.modelSource}
            autoRotate={autoRotate}
            showControlsHint={true}
            style={styles.viewer}
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

            {/* Hardware badge */}
            <Pressable
              onPress={handleToggleDebugDevice}
              style={styles.hardwareBadge}
            >
              <Cpu size={12} color={arSupported ? '#10B981' : '#F59E0B'} style={{ marginRight: 4 }} />
              <Text style={styles.hardwareBadgeText}>
                {arSupported ? 'ARCore Certified' : 'Low-RAM Mode'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sheetDescription}>{diagram.description}</Text>

          {/* Quick Physics Properties Grid */}
          <View style={styles.specsGrid}>
            {diagram.specifications.map((item, index) => (
              <View key={index} style={styles.specCard}>
                <Text style={styles.specLabel}>{item.label}</Text>
                <Text style={styles.specValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
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
    paddingVertical: 12,
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
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  toggleSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    paddingVertical: 9,
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
  segmentTabDisabled: {
    opacity: 0.4,
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  segmentTabTextDisabled: {
    color: '#64748B',
  },
  softAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 6,
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
    maxHeight: 200,
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
    maxHeight: 180,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});

export default DiagramDetailScreen;
