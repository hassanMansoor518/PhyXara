import { ArrowLeft, ArrowRight, Check, FastForward, RotateCcw } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { practicalQuiz } from '../data/practicalQuiz';
import { newEventId } from '../services/learningService';
import type { PracticalAttempt, PracticalEvent } from '../data/practicalProgress';

const letters = ['A', 'B', 'C', 'D'];

export function PracticalAssessment({ number, history, save, onReview }: {
  number: number;
  history: PracticalAttempt[];
  save: (event: PracticalEvent, eventId?: string) => Promise<void>;
  onReview: () => void;
}) {
  const quiz = useMemo(() => practicalQuiz(number), [number]);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ score: number; elapsedSeconds: number }>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const started = useRef<number | null>(null);
  const eventId = useRef<string | undefined>(undefined);
  const question = quiz[index];

  async function advance(skip = false) {
    if (saving || (!skip && answers[index] === null)) return;
    started.current ??= Date.now();
    const submitted = skip ? answers.map((answer, i) => i === index ? null : answer) : answers;
    if (skip) setAnswers(submitted);
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      return;
    }
    const elapsedSeconds = Math.min(86400, Math.floor((Date.now() - started.current) / 1000));
    setSaving(true);
    try {
      eventId.current ??= newEventId();
      await save({ kind: 'quiz', answers: submitted, elapsedSeconds }, eventId.current);
      setResult({ score: quiz.filter((item, i) => item.correct === submitted[i]).length, elapsedSeconds });
      setError('');
    } catch {
      setError('Could not save this attempt. Tap Submit to try again.');
    } finally {
      setSaving(false);
    }
  }

  const retry = () => {
    setIndex(0);
    setAnswers(quiz.map(() => null));
    setResult(undefined);
    eventId.current = undefined;
    started.current = Date.now();
  };

  if (result) {
    return (
      <View className="gap-3">
        <View className="rounded-3xl bg-white border border-[#DCE7FA] p-5 gap-2">
          <Text className="text-sm font-bold text-[#2563EB]">Assessment complete</Text>
          <Text className="text-3xl font-black text-[#14213D]">{Math.round(100 * result.score / quiz.length)}%</Text>
          <Text className="text-[#475569]">{result.score} correct out of {quiz.length} • {quiz.length - result.score} incorrect or skipped • {result.elapsedSeconds}s</Text>
          <Text className="text-[#475569]">{result.score === quiz.length ? 'All answers correct.' : 'Review the apparatus, procedure and formula in Learn, then try again.'}</Text>
          <View className="flex-row flex-wrap gap-3 mt-2">
            <Pressable accessibilityRole="button" className="flex-row items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3" onPress={retry}>
              <RotateCcw size={16} color="white" /><Text className="text-white font-bold">Retry quiz</Text>
            </Pressable>
            <Pressable accessibilityRole="button" className="rounded-xl bg-[#EFF6FF] px-4 py-3" onPress={onReview}>
              <Text className="text-[#2563EB] font-bold">Review Learn</Text>
            </Pressable>
          </View>
        </View>
        {quiz.map((item, i) => {
          const correct = answers[i] === item.correct;
          return (
            <View key={item.question} className="rounded-2xl border border-[#DCE7FA] bg-white p-4 gap-1.5">
              <Text className={correct ? 'font-bold text-[#15803D]' : 'font-bold text-[#B91C1C]'}>
                {i + 1}. {correct ? 'Correct' : answers[i] === null ? 'Skipped' : 'Incorrect'}
              </Text>
              <Text className="font-bold text-[#14213D]">{item.question}</Text>
              {answers[i] !== null && <Text className="text-[#475569]">Your answer: {item.options[answers[i]!]}</Text>}
              <Text className="text-[#475569]">Correct answer: {item.options[item.correct]}</Text>
              <Text className="text-[#475569]">{item.explanation}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  const percentage = Math.round(100 * (index + 1) / quiz.length);
  return (
    <View className="gap-3">
      <View className="rounded-[20px] bg-[#E8F0FE] border border-[#D5E3FA] px-4 py-3 gap-2">
        <View className="flex-row justify-between">
          <Text className="font-bold text-[#14213D]">Question {index + 1} of {quiz.length}</Text>
          <Text className="font-bold text-[#14213D]">{percentage}%</Text>
        </View>
        <View className="h-2 bg-[#C9D8F6] rounded-full overflow-hidden">
          <View className="h-full bg-[#2563EB] rounded-full" style={{ width: `${percentage}%` }} />
        </View>
      </View>
      <View className="rounded-[20px] bg-white border border-[#CAD8F1] p-4 gap-2 shadow-sm">
        <Text className="text-xl leading-6 font-black text-[#101B48] mb-2">{question.question}</Text>
        {question.options.map((option, choice) => {
          const selected = answers[index] === choice;
          return (
            <Pressable key={option} disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: selected }}
              className={'flex-row gap-2.5 items-center rounded-[18px] border px-3 py-3 min-h-11 ' +
                (selected ? 'bg-[#EAF2FF] border-[#2563EB]' : 'bg-white border-[#D5E3FA]')}
              onPress={() => {
                started.current ??= Date.now();
                setAnswers(previous => previous.map((answer, i) => i === index ? choice : answer));
              }}>
              <View className={'w-5 h-5 rounded-full border items-center justify-center ' +
                (selected ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#9FB6F1]')}>
                {selected && <Check size={13} color="white" />}
              </View>
              <Text className="flex-1 text-base text-[#101B48]">{letters[choice]}.  {option}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row gap-2 mt-4">
        {index > 0 && <Pressable accessibilityLabel="Previous question" accessibilityRole="button" disabled={saving}
          className="rounded-xl bg-[#EAF2FF] p-3" onPress={() => setIndex(index - 1)}><ArrowLeft size={19} color="#2563EB" /></Pressable>}
        <Pressable accessibilityRole="button" disabled={saving}
          className="flex-1 rounded-3xl bg-[#EEF4FF] border border-[#C2D4FA] p-3 flex-row gap-2 items-center justify-center min-h-12" onPress={() => void advance(true)}>
          <FastForward size={16} color="#1754E9" /><Text className="font-bold text-[#153BA3]">Skip</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={saving || answers[index] === null}
          className={'flex-1 rounded-3xl p-3 min-h-12 flex-row gap-2 items-center justify-center ' + (saving ? 'bg-[#5684F5]' : 'bg-[#1958ED]')}
          onPress={() => void advance()}>
          <Text className="font-bold text-white">{saving ? 'Saving…' : index + 1 === quiz.length ? 'Submit' : 'Next'}</Text>
          {!saving && <ArrowRight size={18} color="white" />}
        </Pressable>
      </View>
      {!!error && <Text className="text-[#B91C1C]">{error}</Text>}
      <View className="rounded-2xl border border-[#DCE7FA] bg-white p-4 gap-2">
        <Text className="font-bold text-[#14213D]">Previous attempts</Text>
        {history.length === 0 && <Text className="text-[#64748B]">Your completed attempts will appear here.</Text>}
        {history.slice(0, 5).map(attempt => (
          <View key={attempt.id} className="flex-row justify-between gap-2">
            <Text className="text-[#475569]">{new Date(attempt.createdAt).toLocaleDateString()} • {attempt.elapsedSeconds}s</Text>
            <Text className="font-bold text-[#2563EB]">{attempt.score}/{attempt.total} • {attempt.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
