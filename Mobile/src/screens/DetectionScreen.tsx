import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { DetectionLoader } from '../components/DetectionLoader';

export const DetectionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ imageUri?: string }>();

  const handleComplete = () => {
    router.replace('/motor-viewer');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-between">
      {/* Background preview image or light overlay */}
      {params.imageUri && params.imageUri !== 'gallery_sample' ? (
        <Image
          source={{ uri: params.imageUri }}
          style={StyleSheet.absoluteFill}
          blurRadius={20}
          resizeMode="cover"
        />
      ) : null}

      {/* Light translucent overlay backdrop */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(248, 250, 252, 0.92)' },
        ]}
      />

      {/* Header */}
      <AppHeader
        title="AR Analysis"
        textColor="#0F172A"
        onBack={() => router.replace('/scanner')}
      />

      {/* Center Detection Loader */}
      <View className="flex-1 items-center justify-center">
        <DetectionLoader
          detectedName="Electric Motor (DC)"
          onComplete={handleComplete}
        />
      </View>

      {/* Bottom spacer */}
      <View className="h-10" />
    </SafeAreaView>
  );
};

export default DetectionScreen;
