import { router } from 'expo-router';
import { Award, CheckCircle2, ChevronRight, RotateCcw, Trophy, XCircle, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuizOption } from '../components/QuizOption';
import { PHYSICS_QUIZZES } from '../data/quizzes';
import { progressService } from '../services/progressService';

export const QuizScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = PHYSICS_QUIZZES[currentIndex] || PHYSICS_QUIZZES[0];
  const totalQuestions = PHYSICS_QUIZZES.length;
  const xpEarned = correctCount * 10;

  const handleSelectOption = (key: string) => {
    if (showFeedback) return;
    setSelectedKey(key);
    setShowFeedback(true);

    if (key === currentQuestion.correctOptionKey) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (!selectedKey) {
      Alert.alert('Select an Answer', 'Please choose an option to continue.');
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setShowFeedback(false);
    } else {
      setIsCompleted(true);
      // Save result using real service
      await progressService.recordQuizCompleted(xpEarned, totalQuestions);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedKey(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsCompleted(false);
  };

  // Result Screen in Light Theme
  if (isCompleted) {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-between p-6">
        <AppHeader title="Quiz Results" showBack={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
          {/* Trophy & Congrats */}
          <View className="items-center justify-center mb-6">
            <View className="w-24 h-24 rounded-3xl bg-[#EFF6FF] items-center justify-center mb-4 border border-[#DBEAFE] shadow-sm">
              <Trophy size={48} color="#2563EB" />
            </View>

            <Text className="text-2xl font-black text-[#0F172A] text-center mb-1">
              Quiz Completed! 🎉
            </Text>
            <Text className="text-xs text-[#64748B] text-center max-w-[80%] leading-5">
              Great job! You reviewed Sindh Board Physics principles and earned XP.
            </Text>
          </View>

          {/* Stats Summary Card */}
          <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm mb-4">
            <View className="flex-row items-center justify-around pb-4 border-b border-[#F1F5F9]">
              {/* Score / Accuracy */}
              <View className="items-center">
                <Text className="text-3xl font-black text-[#2563EB]">{accuracy}%</Text>
                <Text className="text-[11px] font-bold text-[#64748B] mt-0.5">Accuracy</Text>
              </View>

              <View className="w-[1px] h-8 bg-[#E2E8F0]" />

              {/* Correct */}
              <View className="items-center">
                <Text className="text-3xl font-black text-[#16A34A]">{correctCount}</Text>
                <Text className="text-[11px] font-bold text-[#64748B] mt-0.5">Correct</Text>
              </View>

              <View className="w-[1px] h-8 bg-[#E2E8F0]" />

              {/* Incorrect */}
              <View className="items-center">
                <Text className="text-3xl font-black text-[#DC2626]">{incorrectCount}</Text>
                <Text className="text-[11px] font-bold text-[#64748B] mt-0.5">Incorrect</Text>
              </View>
            </View>

            {/* XP Badge */}
            <View className="mt-4 flex-row items-center justify-between bg-[#EFF6FF] rounded-2xl p-3 border border-[#DBEAFE]">
              <View className="flex-row items-center">
                <Zap size={18} color="#2563EB" />
                <Text className="text-xs font-extrabold text-[#2563EB] ml-2">XP Earned</Text>
              </View>
              <Text className="text-sm font-black text-[#2563EB]">+{xpEarned} XP</Text>
            </View>
          </View>

          {/* Recommended Lesson Card */}
          <View className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm mb-6">
            <Text className="text-xs font-bold text-[#64748B] uppercase mb-2">Recommended Next Step</Text>
            <Pressable
              onPress={() => router.push('/motor-viewer')}
              className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] flex-row items-center justify-between active:bg-gray-100"
            >
              <View className="flex-1 mr-2">
                <Text className="text-xs font-bold text-[#0F172A]">Master Electric Motor in 3D AR</Text>
                <Text className="text-[11px] text-[#64748B] mt-0.5">Interactive simulation & vectors</Text>
              </View>
              <ChevronRight size={16} color="#2563EB" />
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="w-full gap-2.5">
          <PrimaryButton
            title="Try Again"
            onPress={handleRestart}
            variant="outline"
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
    <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-between" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="Physics Practice Quiz"
        rightIcon="none"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Counter & Score Badges */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
            <Text className="text-xs font-extrabold text-[#2563EB]">
              Question {currentIndex + 1} of {totalQuestions}
            </Text>
          </View>

          <View className="bg-white px-3.5 py-1.5 rounded-full border border-[#E2E8F0] shadow-sm">
            <Text className="text-xs font-extrabold text-[#0F172A]">Score: {correctCount * 10} pts</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-[#EFF6FF] rounded-full overflow-hidden mb-5 border border-[#E2E8F0]">
          <View
            className="h-full bg-[#2563EB] rounded-full"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </View>

        {/* Question Card */}
        <View className="bg-white rounded-3xl p-5 border border-[#E2E8F0] mb-5 shadow-sm">
          <Text className="text-base font-extrabold text-[#0F172A] leading-6">
            {currentQuestion.question}
          </Text>
        </View>

        {/* Multiple Choice Options */}
        <View className="mb-3">
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

        {/* Educational Feedback Explanation */}
        {showFeedback && (
          <View className="bg-[#F0F7FF] rounded-2xl p-4 border border-[#DBEAFE] mb-4 shadow-sm">
            <Text className="text-xs font-black text-[#2563EB] mb-1">Concept Explanation</Text>
            <Text className="text-xs text-[#0F172A] leading-5">{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Next / Submit Action */}
      <View className="p-5 bg-white border-t border-[#E2E8F0]">
        <PrimaryButton
          title={currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
          onPress={handleNext}
          className="w-full shadow-md"
        />
      </View>
    </SafeAreaView>
  );
};

export default QuizScreen;
