import { router } from 'expo-router';
import { Award, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuizOption } from '../components/QuizOption';
import { PHYSICS_QUIZZES } from '../data/quizzes';

export const QuizScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Question 2 by default as shown in reference, or start at 0
  const [selectedKey, setSelectedKey] = useState<string | null>('C');
  const [showFeedback, setShowFeedback] = useState(true);
  const [score, setScore] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = PHYSICS_QUIZZES[currentIndex] || PHYSICS_QUIZZES[0];

  const handleSelectOption = (key: string) => {
    setSelectedKey(key);
    setShowFeedback(true);
    if (key === currentQuestion.correctOptionKey) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNext = () => {
    if (!selectedKey) {
      Alert.alert('Please select an option', 'Choose one of the multiple-choice options to continue.');
      return;
    }

    if (currentIndex < PHYSICS_QUIZZES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setShowFeedback(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedKey(null);
    setShowFeedback(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-between p-6">
        <AppHeader title="Quiz Results" showBack={false} />

        <View className="items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Trophy size={48} color="#6C4DFF" />
          </View>

          <Text className="text-2xl font-extrabold text-navy text-center mb-2">
            Quiz Completed! 🎉
          </Text>
          <Text className="text-sm text-muted text-center mb-6">
            Great job! You mastered the fundamentals of electric motors and electromagnetism.
          </Text>

          <View className="bg-white rounded-3xl p-6 border border-border w-full shadow-sm mb-6 items-center">
            <Text className="text-xs font-semibold text-muted uppercase">Final Score</Text>
            <Text className="text-4xl font-extrabold text-primary my-2">{score} pts</Text>
            <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <Award size={14} color="#32C978" />
              <Text className="text-xs font-bold text-success ml-1">Physics Pro Badge Unlocked</Text>
            </View>
          </View>
        </View>

        <View className="w-full space-y-3">
          <PrimaryButton
            title="Try Again"
            onPress={handleRestart}
            variant="outline"
            className="mb-2"
          />
          <PrimaryButton
            title="Back to Home"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Quiz"
        rightIcon="none"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}>
        {/* Question Counter & Score Badges */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            <Text className="text-xs font-bold text-primary">
              Question {currentIndex + 1} of {PHYSICS_QUIZZES.length}
            </Text>
          </View>

          <View className="bg-white px-3.5 py-1.5 rounded-full border border-border shadow-sm">
            <Text className="text-xs font-bold text-navy">Score: {score}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-white rounded-full overflow-hidden mb-6 border border-border/60">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${((currentIndex + 1) / PHYSICS_QUIZZES.length) * 100}%` }}
          />
        </View>

        {/* Question Text */}
        <View className="bg-white rounded-3xl p-5 border border-border mb-6 shadow-sm">
          <Text className="text-base font-extrabold text-navy leading-6">
            {currentQuestion.question}
          </Text>
        </View>

        {/* Multiple Choice Options */}
        <View className="mb-4">
          {currentQuestion.options.map((option) => (
            <QuizOption
              key={option.key}
              optionKey={option.key}
              text={option.text}
              isSelected={selectedKey === option.key}
              isCorrect={option.key === currentQuestion.correctOptionKey}
              showFeedback={showFeedback}
              onSelect={() => handleSelectOption(option.key)}
            />
          ))}
        </View>

        {/* Explanation Card when feedback is shown */}
        {showFeedback && (
          <View className="bg-primary-subtle/50 rounded-2xl p-4 border border-primary/20 mb-4">
            <Text className="text-xs font-bold text-primary mb-1">Explanation</Text>
            <Text className="text-xs text-navy leading-5">{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Next Button */}
      <View className="p-5 bg-background border-t border-border/40">
        <PrimaryButton
          title={currentIndex === PHYSICS_QUIZZES.length - 1 ? 'Finish Quiz' : 'Next'}
          onPress={handleNext}
          className="w-full shadow-md"
        />
      </View>
    </SafeAreaView>
  );
};

export default QuizScreen;
