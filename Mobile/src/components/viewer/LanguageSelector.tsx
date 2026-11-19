import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { VIEWER_TOKENS } from './tokens';

export type Language = 'EN' | 'UR';

interface LanguageSelectorProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onSelectLanguage,
}) => {
  return (
    <View style={styles.container}>
      {/* English Option */}
      <Pressable
        onPress={() => onSelectLanguage('EN')}
        style={[
          styles.pillOption,
          language === 'EN' && styles.activePill,
        ]}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Switch to English"
      >
        <Text style={[styles.optionText, language === 'EN' && styles.activeText]}>
          EN
        </Text>
      </Pressable>

      {/* Urdu Option */}
      <Pressable
        onPress={() => onSelectLanguage('UR')}
        style={[
          styles.pillOption,
          language === 'UR' && styles.activePill,
        ]}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Switch to Urdu"
      >
        <Text style={[styles.optionText, language === 'UR' && styles.activeText, styles.urduFont]}>
          اردو
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: VIEWER_TOKENS.colors.secondaryBg,
    borderRadius: VIEWER_TOKENS.radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
    alignItems: 'center',
  },
  pillOption: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: VIEWER_TOKENS.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowColor: VIEWER_TOKENS.colors.primaryBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.secondaryText,
  },
  activeText: {
    color: '#FFFFFF',
  },
  urduFont: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default LanguageSelector;
