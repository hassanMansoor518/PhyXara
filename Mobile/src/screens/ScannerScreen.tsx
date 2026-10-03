import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useIsFocused } from 'expo-router';
import { Camera, Sparkles } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScanOverlay } from '../components/ScanOverlay';
import { unityConfig } from '../unity/config';
import { DiagramMatcherService } from '../unity/DiagramMatcher';
import { UnityBridge } from '../unity/UnityBridge';

export const ScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [showTips, setShowTips] = useState(false);
  const cameraRef = useRef<any>(null);
  // expo-camera must release the camera while Unity (which owns it in AR mode) is on top.
  const isFocused = useIsFocused();

  const openUnityAr = async () => {
    const result = await UnityBridge.open('ar', unityConfig.defaultExperimentId);
    if (!result.ok && result.reason === 'camera_denied') {
      Alert.alert('Camera Access Needed', 'Camera permission is required to scan physics diagrams.');
    }
  };

  const handleCapture = async () => {
    if (unityConfig.enabled) {
      await openUnityAr();
      return;
    }
    try {
      let imageUri = '';
      if (cameraRef.current && cameraRef.current.takePictureAsync) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        imageUri = photo?.uri || '';
      }
      router.push({
        pathname: '/detection',
        params: { imageUri },
      });
    } catch {
      // Fallback transition
      router.push({
        pathname: '/detection',
        params: { imageUri: '' },
      });
    }
  };

  const handleUnityUpload = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (picked.canceled || !picked.assets[0]) return;
    const match = await DiagramMatcherService.match(picked.assets[0].uri);
    if (!match) {
      Alert.alert('Diagram Not Recognized', 'We could not match this image to a known diagram. Try a clearer photo of the page.');
      return;
    }
    await UnityBridge.open('preview', match.experimentId);
  };

  const handleGallery = () => {
    if (unityConfig.enabled) {
      handleUnityUpload();
      return;
    }
    Alert.alert(
      'Sample Diagram Loaded',
      'Electric Motor diagram from Sindh Board Physics Chapter 14 has been selected.',
      [
        {
          text: 'Analyze Diagram',
          onPress: () => {
            router.push({
              pathname: '/detection',
              params: { imageUri: 'gallery_sample' },
            });
          },
        },
      ]
    );
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
          Camera permission is required to scan physics diagrams from your textbook and convert them into interactive 3D AR models.
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
              • Any physics diagram will trigger the 3D model simulation.
            </Text>
            <PrimaryButton
              title="Got It"
              onPress={() => setShowTips(false)}
              size="md"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScannerScreen;
