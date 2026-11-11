import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, Heart, HelpCircle } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

interface ViewerHeaderProps {
  title?: string;
  subtitle?: string;
  isStarred?: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onHelp: () => void;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  title = 'Micrometer Screw Gauge',
  subtitle = 'Class 9 • Sindh Textbook Board',
  isStarred = false,
  onBack,
  onToggleFavorite,
  onHelp,
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={18} color={VIEWER_TOKENS.colors.primaryText} />
      </Pressable>

      {/* Title & Board Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right Actions: Favorite & Help */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={onToggleFavorite}
          style={({ pressed }) => [
            styles.circleButton,
            isStarred && styles.circleButtonStarred,
            pressed && styles.buttonPressed,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isStarred ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            color={isStarred ? '#EF4444' : VIEWER_TOKENS.colors.secondaryText}
            fill={isStarred ? '#EF4444' : 'none'}
          />
        </Pressable>

        <Pressable
          onPress={onHelp}
          style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Help and guide"
        >
          <HelpCircle size={18} color={VIEWER_TOKENS.colors.secondaryText} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: VIEWER_TOKENS.spacing.lg,
    paddingTop: VIEWER_TOKENS.spacing.sm,
    paddingBottom: VIEWER_TOKENS.spacing.md,
    backgroundColor: VIEWER_TOKENS.colors.mainBg,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: VIEWER_TOKENS.colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
  },
  circleButtonStarred: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: VIEWER_TOKENS.spacing.md,
  },
  title: {
    fontSize: VIEWER_TOKENS.typography.title,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: VIEWER_TOKENS.typography.subtitle,
    color: VIEWER_TOKENS.colors.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: VIEWER_TOKENS.spacing.sm,
  },
});

export default ViewerHeader;
