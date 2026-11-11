import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Scan, Play } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';

export type ViewerMode = '3D' | 'AR' | 'Animation';

interface ViewerModeSelectorProps {
  activeMode: ViewerMode;
  onSelectMode: (mode: ViewerMode) => void;
  arSupported?: boolean;
}

interface ModeTab {
  id: ViewerMode;
  label: string;
  icon: typeof Box;
}

const TABS: ModeTab[] = [
  { id: '3D', label: '3D Model', icon: Box },
  { id: 'AR', label: 'AR View', icon: Scan },
  { id: 'Animation', label: 'Animation', icon: Play },
];

export const ViewerModeSelector: React.FC<ViewerModeSelectorProps> = ({
  activeMode,
  onSelectMode,
  arSupported = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        {TABS.map((tab) => {
          const isSelected = activeMode === tab.id;
          const IconComponent = tab.icon;

          if (isSelected) {
            return (
              <LinearGradient
                key={tab.id}
                colors={[VIEWER_TOKENS.colors.primaryBlue, VIEWER_TOKENS.colors.primaryBlueDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeTabGradient}
              >
                <Pressable
                  onPress={() => onSelectMode(tab.id)}
                  style={styles.tabContent}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: true }}
                >
                  <IconComponent size={15} color={VIEWER_TOKENS.colors.primaryText} style={styles.tabIcon} />
                  <Text style={styles.activeTabText}>{tab.label}</Text>
                </Pressable>
              </LinearGradient>
            );
          }

          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectMode(tab.id)}
              style={({ pressed }) => [
                styles.inactiveTab,
                pressed && styles.tabPressed,
                tab.id === 'AR' && !arSupported && styles.tabDisabledState,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
            >
              <View style={styles.tabContent}>
                <IconComponent
                  size={15}
                  color={VIEWER_TOKENS.colors.secondaryText}
                  style={styles.tabIcon}
                />
                <Text style={styles.inactiveTabText}>{tab.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: VIEWER_TOKENS.spacing.lg,
    paddingVertical: VIEWER_TOKENS.spacing.xs,
    backgroundColor: VIEWER_TOKENS.colors.mainBg,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: VIEWER_TOKENS.colors.secondaryBg,
    borderRadius: VIEWER_TOKENS.radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
  },
  activeTabGradient: {
    flex: 1,
    borderRadius: VIEWER_TOKENS.radius.full,
    shadowColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveTab: {
    flex: 1,
    borderRadius: VIEWER_TOKENS.radius.full,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabDisabledState: {
    opacity: 0.85,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  tabIcon: {
    marginRight: 6,
  },
  activeTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.1,
  },
  inactiveTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: VIEWER_TOKENS.colors.secondaryText,
    letterSpacing: -0.1,
  },
});

export default ViewerModeSelector;
