import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RotateCw, Plus, Minus } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

interface ViewerControlsProps {
  autoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  autoRotate = false,
  onToggleAutoRotate,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* 360° Rotate Button */}
      <Pressable
        onPress={onToggleAutoRotate}
        style={({ pressed }) => [
          styles.controlBtn,
          autoRotate && styles.controlBtnActive,
          pressed && styles.btnPressed,
        ]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Toggle 360 rotation"
      >
        <RotateCw
          size={14}
          color={autoRotate ? '#FFFFFF' : VIEWER_TOKENS.colors.cyanAccent}
        />
        <Text
          style={[
            styles.rotateLabel,
            autoRotate && styles.rotateLabelActive,
          ]}
        >
          360°
        </Text>
      </Pressable>

      {/* Zoom In Button */}
      <Pressable
        onPress={onZoomIn}
        style={({ pressed }) => [styles.controlBtn, pressed && styles.btnPressed]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Zoom in"
      >
        <Plus size={16} color={VIEWER_TOKENS.colors.cyanAccent} strokeWidth={2.5} />
      </Pressable>

      {/* Zoom Out Button */}
      <Pressable
        onPress={onZoomOut}
        style={({ pressed }) => [styles.controlBtn, pressed && styles.btnPressed]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Zoom out"
      >
        <Minus size={16} color={VIEWER_TOKENS.colors.cyanAccent} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'column',
    gap: 8,
    zIndex: 20,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(7, 29, 59, 0.92)',
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  controlBtnActive: {
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    borderColor: VIEWER_TOKENS.colors.cyanAccent,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  rotateLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: VIEWER_TOKENS.colors.cyanAccent,
    marginTop: 1,
    letterSpacing: -0.2,
  },
  rotateLabelActive: {
    color: '#FFFFFF',
  },
});

export default ViewerControls;
