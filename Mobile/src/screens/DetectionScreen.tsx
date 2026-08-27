import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../components/AppHeader';
import { DetectionLoader } from '../components/DetectionLoader';

export const DetectionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ imageUri?: string }>();

  const handleComplete = () => {
    router.replace('/motor-viewer');
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-dark justify-between">
      {/* Background preview image or dark gradient overlay */}
      {params.imageUri && params.imageUri !== 'gallery_sample' ? (
        <Image
          source={{ uri: params.imageUri }}
          style={StyleSheet.absoluteFill}
          blurRadius={12}
          resizeMode="cover"
        />
      ) : null}

      {/* Dark overlay backdrop */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(8, 15, 45, 0.82)' },
        ]}
      />

      {/* Header */}
      <AppHeader
        title="Detecting"
        textColor="#FFFFFF"
        onBack={() => router.replace('/scanner')}
      />

      {/* Center Detection Loader with pulsating green check & progress */}
      <View className="flex-1 items-center justify-center">
        <DetectionLoader
          detectedName="Electric Motor"
          onComplete={handleComplete}
        />
      </View>

      {/* Bottom spacer */}
      <View className="h-10" />
    </SafeAreaView>
  );
};

export default DetectionScreen;
