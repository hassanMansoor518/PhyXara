import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useIsFocused } from 'expo-router';
import {
  Camera,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  X,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScanOverlay } from '../components/ScanOverlay';
import { scannerService } from '../services/scannerService';

export const ScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [showTips, setShowTips] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('auto');
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused();

  const handleCapture = async () => {
    try {
      let imageUri = '';
      if (cameraRef.current && cameraRef.current.takePictureAsync) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (photo) {
          imageUri = photo.uri || '';
          scannerService.setActiveImage({
            uri: photo.uri,
            width: photo.width,
            height: photo.height,
            base64: photo.base64 || undefined,
            mimeType: 'image/jpeg',
          });
        }
      }

      const scanId = `scan_${Date.now()}`;
      router.push({
        pathname: '/detection',
        params: {
          imageUri,
          scanId,
          ...(selectedTarget !== 'auto' ? { topicId: selectedTarget } : {}),
        },
      });
    } catch (err) {
      console.warn('[ScannerScreen] Camera capture error:', err);
      const scanId = `scan_${Date.now()}`;
      router.push({
        pathname: '/detection',
        params: {
          imageUri: '',
          scanId,
          ...(selectedTarget !== 'auto' ? { topicId: selectedTarget } : {}),
        },
      });
    }
  };

  const handleGallery = async () => {
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (picked.canceled || !picked.assets[0]) {
        // Open the test scenarios sheet if user cancelled image library
        setShowScenarios(true);
        return;
      }

      const asset = picked.assets[0];
      scannerService.setActiveImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        base64: asset.base64 || undefined,
        mimeType: asset.mimeType || 'image/jpeg',
      });

      const imageUri = asset.uri;
      const scanId = `scan_${Date.now()}`;
      router.push({
        pathname: '/detection',
        params: {
          imageUri,
          scanId,
          ...(selectedTarget !== 'auto' ? { topicId: selectedTarget } : {}),
        },
      });
    } catch (err) {
      console.warn('[ScannerScreen] Gallery selection error:', err);
    }
  };

  const triggerScenario = (imageUri: string, topicId?: string) => {
    setShowScenarios(false);
    scannerService.clearActiveImage();
    const scanId = `scan_${Date.now()}`;
    router.push({
      pathname: '/detection',
      params: {
        imageUri,
        topicId: topicId || '',
        scanId,
      },
    });
  };

  // Permission handling in Light Theme
  if (!permission) {
    return <View className="flex-1 bg-white" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center px-8">
        <View className="w-20 h-20 rounded-3xl bg-[#EFF6FF] items-center justify-center mb-5 border border-[#DBEAFE]">
          <Camera size={36} color="#2563EB" />
        </View>
        <Text className="text-2xl font-black text-[#0F172A] text-center mb-2">
          Camera Access Needed
        </Text>
        <Text className="text-sm text-[#64748B] text-center mb-8 leading-6 max-w-[90%]">
          Camera permission is required to scan physics diagrams from your textbook and convert them into interactive 3D models.
        </Text>
        <PrimaryButton
          title="Grant Permission"
          onPress={requestPermission}
          className="w-full mb-3 shadow-md"
        />
        <Pressable onPress={() => router.back()} className="py-2.5">
          <Text className="text-sm text-[#64748B] font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          enableTorch={flashMode === 'on'}
          facing="back"
        >
          <ScanOverlay
            onBack={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            onCapture={handleCapture}
            onGallery={handleGallery}
            onTips={() => setShowTips(true)}
            onOpenScenarios={() => setShowScenarios(true)}
            selectedTarget={selectedTarget}
            onSelectTarget={(target) => setSelectedTarget(target)}
            flashMode={flashMode}
            onToggleFlash={() => setFlashMode((prev) => (prev === 'on' ? 'off' : 'on'))}
          />
        </CameraView>
      )}

      {/* Light Theme Tips Modal */}
      <Modal
        visible={showTips}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTips(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-[#E2E8F0] shadow-2xl">
            <View className="w-12 h-12 rounded-2xl bg-[#EFF6FF] items-center justify-center mb-3 border border-[#DBEAFE]">
              <Sparkles size={24} color="#2563EB" />
            </View>
            <Text className="text-lg font-black text-[#0F172A] mb-2">Scanning Tips</Text>
            <Text className="text-xs text-[#475569] leading-5 mb-5">
              • Ensure good lighting on the diagram page.{'\n'}
              • Keep your device parallel to the textbook.{'\n'}
              • Center the diagram within the blue viewfinder brackets.{'\n'}
              • Use the top target selector to choose a specific textbook diagram or leave on Auto Detect.
            </Text>
            <PrimaryButton
              title="Got It"
              onPress={() => setShowTips(false)}
              className="w-full"
            />
          </View>
        </View>
      </Modal>

      {/* Test Scenarios & Diagram Presets Bottom Sheet Modal */}
      <Modal
        visible={showScenarios}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScenarios(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-5 pb-8 px-6 border-t border-[#E2E8F0] max-h-[85%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#EFF6FF] items-center justify-center mr-2">
                  <Sliders size={16} color="#2563EB" />
                </View>
                <Text className="text-lg font-black text-[#0F172A]">
                  Diagram Test Scenarios
                </Text>
              </View>
              <Pressable
                onPress={() => setShowScenarios(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center"
              >
                <X size={16} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-xs text-[#64748B] mb-4">
              Test each diagram scenario individually. Every diagram produces its own accurate analysis and interactive model.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category 1: Diagrams with Verified 3D Model */}
              <Text className="text-[11px] font-black tracking-wider text-[#16A34A] uppercase mb-2">
                Verified 3D Models Available
              </Text>

              {/* 1. DC Electric Motor */}
              <Pressable
                onPress={() => triggerScenario('sample_motor', 'electric-motor')}
                className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-[#DCFCE7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#15803D]">
                    ⚡ DC Electric Motor
                  </Text>
                  <Text className="text-[11px] text-[#166534]">
                    Chapter 15 • Verified 3D model available
                  </Text>
                </View>
                <CheckCircle2 size={18} color="#16A34A" />
              </Pressable>

              {/* 2. Micrometer Screw Gauge */}
              <Pressable
                onPress={() => triggerScenario('sample_micrometer', 'micrometer')}
                className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl mb-4 flex-row items-center justify-between active:bg-[#DCFCE7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#15803D]">
                    🔬 Micrometer Screw Gauge
                  </Text>
                  <Text className="text-[11px] text-[#166534]">
                    Chapter 1 • Verified 3D model available
                  </Text>
                </View>
                <CheckCircle2 size={18} color="#16A34A" />
              </Pressable>

              {/* Category 2: Recognized Diagrams (No 3D Model Available) */}
              <Text className="text-[11px] font-black tracking-wider text-[#D97706] uppercase mb-2">
                Recognized (No 3D Model Available)
              </Text>

              {/* 3. AC Induction Motor */}
              <Pressable
                onPress={() => triggerScenario('sample_ac_motor', 'ac-motor')}
                className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-[#FEF3C7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#B45309]">
                    ⚡ AC Induction Motor
                  </Text>
                  <Text className="text-[11px] text-[#92400E]">
                    Chapter 15 • Shows: "No matching 3D model available"
                  </Text>
                </View>
                <Layers size={18} color="#D97706" />
              </Pressable>

              {/* 4. Electrical Circuit */}
              <Pressable
                onPress={() => triggerScenario('sample_circuit', 'circuit')}
                className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-[#FEF3C7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#B45309]">
                    🔌 Electrical Circuit (Ohm’s Law)
                  </Text>
                  <Text className="text-[11px] text-[#92400E]">
                    Chapter 14 • Shows: "No matching 3D model available"
                  </Text>
                </View>
                <Layers size={18} color="#D97706" />
              </Pressable>

              {/* 5. Step-up Transformer */}
              <Pressable
                onPress={() => triggerScenario('sample_transformer', 'transformer')}
                className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-[#FEF3C7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#B45309]">
                    🔄 Step-up Transformer
                  </Text>
                  <Text className="text-[11px] text-[#92400E]">
                    Chapter 15 • Shows: "No matching 3D model available"
                  </Text>
                </View>
                <Layers size={18} color="#D97706" />
              </Pressable>

              {/* 6. Vernier Caliper */}
              <Pressable
                onPress={() => triggerScenario('sample_vernier', 'vernier')}
                className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-[#FEF3C7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#B45309]">
                    📐 Vernier Caliper
                  </Text>
                  <Text className="text-[11px] text-[#92400E]">
                    Chapter 1 • Shows: "No matching 3D model available"
                  </Text>
                </View>
                <Layers size={18} color="#D97706" />
              </Pressable>

              {/* 7. Mechanical Spur Gear */}
              <Pressable
                onPress={() => triggerScenario('sample_gear', 'mechanical-gear')}
                className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl mb-4 flex-row items-center justify-between active:bg-[#FEF3C7]"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#B45309]">
                    ⚙️ Mechanical Gear Transmission
                  </Text>
                  <Text className="text-[11px] text-[#92400E]">
                    Chapter 4 • Shows: "No matching 3D model available"
                  </Text>
                </View>
                <Layers size={18} color="#D97706" />
              </Pressable>

              {/* Category 3: Error & Timeout Handling */}
              <Text className="text-[11px] font-black tracking-wider text-[#94A3B8] uppercase mb-2">
                Resilience & Error Handling Scenarios
              </Text>

              {/* 8. Unrecognized Non-Physics Image */}
              <Pressable
                onPress={() => triggerScenario('sample_unrelated')}
                className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl mb-2.5 flex-row items-center justify-between active:bg-red-100"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#DC2626]">
                    ⚠️ Unrecognized / Non-Diagram Image
                  </Text>
                  <Text className="text-[11px] text-[#B91C1C]">
                    Shows: "Unable to recognize this image. Please upload a clearer image..."
                  </Text>
                </View>
                <AlertTriangle size={18} color="#DC2626" />
              </Pressable>

              {/* 9. Network / Scanner Timeout */}
              <Pressable
                onPress={() => triggerScenario('sample_timeout')}
                className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-4 flex-row items-center justify-between active:bg-gray-100"
              >
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#475569]">
                    ⏱️ Network / Processing Timeout
                  </Text>
                  <Text className="text-[11px] text-[#64748B]">
                    Tests timeout protection, loading dismiss, and Retry option
                  </Text>
                </View>
                <Clock size={18} color="#475569" />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScannerScreen;
