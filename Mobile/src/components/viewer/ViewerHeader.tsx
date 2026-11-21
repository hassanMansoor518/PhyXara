import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart, HelpCircle } from 'lucide-react-native';
import { AppHeader } from '../AppHeader';

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
}) => (
  <AppHeader
    title={title}
    subtitle={subtitle}
    onBack={onBack}
    rightAccessory={
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityState={{ selected: isStarred }}
          onPress={onToggleFavorite}
          style={({ pressed }) => [styles.actionButton, isStarred && styles.starred, pressed && styles.buttonPressed]}
          hitSlop={8}
        >
          <Heart
            size={18}
            color={isStarred ? '#EF4444' : '#737A96'}
            fill={isStarred ? '#EF4444' : 'none'}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Help and guide"
          onPress={onHelp}
          style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
          hitSlop={8}
        >
          <HelpCircle size={18} color="#737A96" />
        </Pressable>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starred: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});

export default ViewerHeader;
