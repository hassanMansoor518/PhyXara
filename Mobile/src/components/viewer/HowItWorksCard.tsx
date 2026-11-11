import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { VIEWER_TOKENS } from './tokens';
import { LanguageSelector, Language } from './LanguageSelector';

interface HowItWorksCardProps {
  customExplanationEn?: string;
  customExplanationUr?: string;
}

export const HowItWorksCard: React.FC<HowItWorksCardProps> = ({
  customExplanationEn,
  customExplanationUr,
}) => {
  const [language, setLanguage] = useState<Language>('EN');
  const isUrdu = language === 'UR';

  const defaultExplanationEn =
    'The micrometer screw gauge measures small dimensions with high accuracy. You rotate the thimble, which moves the spindle forward or backward. The main scale and thimble scale together give the final reading.';

  const defaultExplanationUr =
    'مائیکرو میٹر اسکرو گیج انتہائی باریک پیمائش کے لیے استعمال ہوتا ہے۔ تھمبل کو گھمانے سے اسپنڈل آگے یا پیچھے حرکت کرتا ہے۔ مین اسکیل اور تھمبل اسکیل مل کر حتمی ریڈنگ دیتے ہیں۔';

  const explanation = isUrdu
    ? customExplanationUr || defaultExplanationUr
    : customExplanationEn || defaultExplanationEn;

  const steps = [
    {
      num: '1',
      titleEn: 'Rotate Thimble',
      titleUr: 'تھمبل گھمائیں',
    },
    {
      num: '2',
      titleEn: 'Spindle Moves',
      titleUr: 'اسپنڈل حرکت کرتا ہے',
    },
    {
      num: '3',
      titleEn: 'Read the Scale',
      titleUr: 'اسکیل سے ریڈنگ لیں',
    },
  ];

  return (
    <View style={styles.card}>
      {/* Header: Lightbulb Icon + Title + Language Selector */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconCircle}>
            <Lightbulb size={18} color={VIEWER_TOKENS.colors.cyanAccent} />
          </View>
          <Text style={styles.heading}>How it works</Text>
        </View>

        <LanguageSelector language={language} onSelectLanguage={setLanguage} />
      </View>

      {/* Explanation Paragraph */}
      <Text
        style={[
          styles.explanationText,
          isUrdu && styles.explanationTextUrdu,
        ]}
      >
        {explanation}
      </Text>

      {/* 3 Numbered Steps with Connecting Arrows */}
      <View style={[styles.stepsContainer, isUrdu && styles.stepsContainerRtl]}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.num}</Text>
                </View>
                <Text style={styles.stepTitleEn}>
                  {step.titleEn}
                </Text>
                <Text style={styles.stepTitleUr}>
                  {step.titleUr}
                </Text>
              </View>

              {/* Connecting Arrow */}
              {!isLast && (
                <View style={styles.arrowContainer}>
                  {isUrdu ? (
                    <ArrowLeft size={16} color={VIEWER_TOKENS.colors.cyanAccent} />
                  ) : (
                    <ArrowRight size={16} color={VIEWER_TOKENS.colors.cyanAccent} />
                  )}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: VIEWER_TOKENS.colors.cardBg,
    borderRadius: VIEWER_TOKENS.radius.xl,
    padding: VIEWER_TOKENS.spacing.lg,
    marginHorizontal: VIEWER_TOKENS.spacing.lg,
    marginTop: VIEWER_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: VIEWER_TOKENS.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: VIEWER_TOKENS.spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VIEWER_TOKENS.colors.cyanAccentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: VIEWER_TOKENS.typography.heading,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    letterSpacing: -0.2,
  },
  explanationText: {
    fontSize: VIEWER_TOKENS.typography.body,
    lineHeight: 20,
    color: VIEWER_TOKENS.colors.secondaryText,
    marginBottom: VIEWER_TOKENS.spacing.lg,
  },
  explanationTextUrdu: {
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 23,
    color: VIEWER_TOKENS.colors.primaryText,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(2, 11, 28, 0.45)',
    borderRadius: VIEWER_TOKENS.radius.lg,
    padding: VIEWER_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 60, 112, 0.5)',
  },
  stepsContainerRtl: {
    flexDirection: 'row-reverse',
  },
  stepCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: VIEWER_TOKENS.colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepTitleEn: {
    fontSize: 12,
    fontWeight: '700',
    color: VIEWER_TOKENS.colors.primaryText,
    marginBottom: 2,
  },
  stepTitleUr: {
    fontSize: 11,
    color: VIEWER_TOKENS.colors.secondaryText,
  },
  arrowContainer: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HowItWorksCard;
