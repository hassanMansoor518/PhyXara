import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { ScanOverlay } from '../components/ScanOverlay';
import { PrimaryButton } from '../components/PrimaryButton';
import { Info, Sparkles } from 'lucide-react-native';

export const ScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [showTips, setShowTips] = useState(false);
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
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

  const handleGallery = () => {
    Alert.alert(
      'Select Diagram',
      'Diagram loaded from gallery!',
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

  // Permission handling
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-navy-dark items-center justify-center px-8">
        <View className="w-16 h-16 rounded-3xl bg-primary/20 items-center justify-center mb-4">
          <Info size={32} color="#6C4DFF" />
        </View>
        <Text className="text-xl font-bold text-white text-center mb-2">
          Camera Access Needed
        </Text>
        <Text className="text-sm text-white/70 text-center mb-8 leading-5">
          Camera permission is required to scan physics diagrams from your textbook and convert them into 3D AR models.
        </Text>
        <PrimaryButton
          title="Grant Permission"
          onPress={requestPermission}
          className="w-full mb-3"
        />
        <Pressable onPress={() => router.back()} className="py-2">
          <Text className="text-sm text-white/60 font-semibold">Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
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

      {/* Tips Modal */}
      <Modal
        visible={showTips}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTips(false)}
      >
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-border">
            <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-3">
              <Sparkles size={24} color="#6C4DFF" />
            </View>
            <Text className="text-lg font-bold text-navy mb-2">Scanning Tips</Text>
            <Text className="text-xs text-muted leading-5 mb-4">
              • Ensure good lighting on the diagram page.{'\n'}
              • Keep your device parallel to the textbook.{'\n'}
              • Center the diagram within the viewfinder frame.{'\n'}
              • Any physics diagram will trigger the 3D Electric Motor simulation.
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
