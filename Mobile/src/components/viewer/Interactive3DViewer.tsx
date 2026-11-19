import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThreeDViewer } from '../ThreeDViewer';
import { VIEWER_TOKENS } from './tokens';

interface Interactive3DViewerProps {
  modelPath: any;
  diagramId?: string;
  has3DModel?: boolean;
  autoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  showAnnotations?: boolean;
  animationMode?: boolean;
  onAnimationModeExit?: () => void;
  onScanAnother?: () => void;
  style?: object;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  modelPath,
  diagramId = 'micrometer',
  has3DModel = true,
  autoRotate = false,
  onToggleAutoRotate,
  showAnnotations = true,
  animationMode = false,
  onAnimationModeExit,
  onScanAnother,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ThreeDViewer
        modelPath={modelPath}
        diagramId={diagramId}
        has3DModel={has3DModel}
        autoRotate={autoRotate}
        onToggleAutoRotate={onToggleAutoRotate}
        showAnnotations={showAnnotations}
        showControlsHint={false}
        animationMode={animationMode}
        onAnimationModeExit={onAnimationModeExit}
        onScanAnother={onScanAnother}
        style={styles.innerViewer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: VIEWER_TOKENS.spacing.sm,
    height: 320,
    borderRadius: VIEWER_TOKENS.radius.xl,
    overflow: 'hidden',
    backgroundColor: '#031024',
    borderWidth: 1.5,
    borderColor: VIEWER_TOKENS.colors.border,
    shadowColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  innerViewer: {
    flex: 1,
    backgroundColor: '#031024',
  },
});

export default Interactive3DViewer;
