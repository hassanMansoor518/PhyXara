import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

interface AskAITutorButtonProps {
  topicName?: string;
  onPress: () => void;
  style?: object;
}

export const AskAITutorButton: React.FC<AskAITutorButtonProps> = ({
  topicName = 'Micrometer Screw Gauge',
  onPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.touchable, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Ask AI Tutor about ${topicName}`}
      >
        <LinearGradient
          colors={[VIEWER_TOKENS.colors.primaryBlue, VIEWER_TOKENS.colors.primaryBlueDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.contentRow}>
            <Sparkles size={18} color="#FFFFFF" style={styles.leftIcon} />
            <Text style={styles.buttonText}>Ask AI Tutor</Text>
            <ArrowRight size={18} color="#FFFFFF" style={styles.rightIcon} />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: VIEWER_TOKENS.spacing.lg,
    marginBottom: VIEWER_TOKENS.spacing.sm,
  },
  touchable: {
    borderRadius: VIEWER_TOKENS.radius.full,
    shadowColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    borderRadius: VIEWER_TOKENS.radius.full,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: VIEWER_TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  leftIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  rightIcon: {
    marginLeft: 'auto',
  },
});

export default AskAITutorButton;
