import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { DetectionLoader } from '../components/DetectionLoader';
import { scannerService, DetectedDiagramData } from '../services/scannerService';

export const DetectionScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    imageUri?: string;
    topicId?: string;
    scanId?: string;
  }>();

  const [status, setStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
  const [progress, setProgress] = useState(15);
  const [detectedData, setDetectedData] = useState<DetectedDiagramData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const activeScanRef = useRef<string>('');

  const executeScan = useCallback(async () => {
    setStatus('scanning');
    setProgress(20);
    setErrorMessage('');

    // Smooth visual progress ticker while scanning is in progress
    const ticker = setInterval(() => {
      setProgress((prev) => {
        if (prev < 80) return prev + 15;
        return prev;
      });
    }, 200);

    try {
      const scanId = `scan_${Date.now()}`;
      activeScanRef.current = scanId;

      const result = await scannerService.scanDiagram(params.imageUri, {
        forcedTopicId: params.topicId,
      });

      // Ignore stale scan result if a new scan was started
      if (activeScanRef.current !== scanId) {
        clearInterval(ticker);
        return;
      }

      clearInterval(ticker);

      if (result.success) {
        setProgress(100);
        setDetectedData(result.data);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      clearInterval(ticker);
      setStatus('error');
      setErrorMessage(err?.message || 'Diagram analysis failed. Please try again.');
    }
  }, [params.imageUri, params.topicId]);

  useEffect(() => {
    executeScan();
  }, [executeScan]);

  const handleComplete = () => {
    if (!detectedData) return;
    router.replace({
      pathname: '/diagram-detail',
      params: {
        topicId: detectedData.diagramId,
        diagramId: detectedData.diagramId,
        imageUri: params.imageUri || '',
        scanId: activeScanRef.current,
      },
    });
  };

  const handleRetry = () => {
    executeScan();
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/scanner');
    }
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
        title="Diagram Analysis"
        textColor="#0F172A"
        onBack={handleCancel}
      />

      {/* Center Detection Loader with Real State Management */}
      <View className="flex-1 items-center justify-center">
        <DetectionLoader
          status={status}
          detectedName={detectedData?.name}
          confidence={detectedData?.confidence}
          errorMessage={errorMessage}
          progress={progress}
          onComplete={handleComplete}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      </View>

      {/* Bottom spacer */}
      <View className="h-10" />
    </SafeAreaView>
  );
};

export default DetectionScreen;
