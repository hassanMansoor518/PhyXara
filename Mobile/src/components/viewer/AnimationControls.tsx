import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

interface AnimationControlsProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTimeMs: number;
  totalTimeMs: number;
  speed: number;
  onTogglePlayPause: () => void;
  onScrub: (fraction: number) => void;
  onCycleSpeed: () => void;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  progress,
  currentTimeMs,
  totalTimeMs,
  speed,
  onTogglePlayPause,
  onScrub,
  onCycleSpeed,
}) => {
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef<number>(180);

  const handleTrackPress = (event: GestureResponderEvent) => {
    const clickX = event.nativeEvent.locationX;
    const width = trackWidthRef.current || 180;
    const fraction = Math.max(0, Math.min(1, clickX / width));
    onScrub(fraction);
  };

  const formattedCurrent = formatTime(currentTimeMs);
  const formattedTotal = formatTime(totalTimeMs > 0 ? totalTimeMs : 45000);
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));

  return (
    <View style={styles.container}>
      {/* Play / Pause circular button */}
      <Pressable
        onPress={onTogglePlayPause}
        style={({ pressed }) => [styles.playBtn, pressed && styles.btnPressed]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause animation' : 'Play animation'}
      >
        {isPlaying ? (
          <Pause size={14} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
        )}
      </Pressable>

      {/* Scrub Slider Track */}
      <View
        ref={trackRef}
        style={styles.scrubTrackContainer}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <Pressable
          style={styles.touchableTrack}
          onPress={handleTrackPress}
          hitSlop={{ top: 12, bottom: 12 }}
        >
          {/* Base track */}
          <View style={styles.trackBackground}>
            {/* Active progress fill */}
            <View style={[styles.trackFill, { width: `${clampedProgress * 100}%` }]} />
          </View>

          {/* Glowing thumb indicator */}
          <View
            style={[
              styles.trackThumb,
              { left: `${clampedProgress * 100}%` },
            ]}
          />
        </Pressable>
      </View>

      {/* Time duration display: 00:12 / 00:45 */}
      <Text style={styles.timeText}>
        {formattedCurrent} / {formattedTotal}
      </Text>

      {/* Speed Selector: 1x, 1.5x, 2x */}
      <Pressable
        onPress={onCycleSpeed}
        style={({ pressed }) => [styles.speedBtn, pressed && styles.btnPressed]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Playback speed ${speed}x`}
      >
        <Text style={styles.speedText}>{speed}x</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 24, 50, 0.88)',
    borderRadius: VIEWER_TOKENS.radius.full,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 60, 112, 0.8)',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  scrubTrackContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    marginRight: 10,
  },
  touchableTrack: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 4,
    backgroundColor: 'rgba(16, 60, 112, 0.8)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    borderRadius: 2,
  },
  trackThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: VIEWER_TOKENS.colors.cyanAccent,
    top: 7,
    marginLeft: -5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: VIEWER_TOKENS.colors.cyanAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: VIEWER_TOKENS.colors.secondaryText,
    fontVariant: ['tabular-nums'],
    marginRight: 10,
    letterSpacing: 0.2,
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: VIEWER_TOKENS.radius.full,
    backgroundColor: 'rgba(7, 29, 59, 0.8)',
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
  },
});

export default AnimationControls;
