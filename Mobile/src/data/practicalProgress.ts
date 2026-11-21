import { practicalQuiz } from './practicalQuiz.ts';

export type PracticalEvent = { kind: 'learn' | 'view' | 'calculation' } |
  { kind: 'bookmark'; bookmarked: boolean } |
  { kind: 'quiz'; answers: (number | null)[]; elapsedSeconds: number };

export type PracticalAttempt = {
  id: string;
  createdAt: string;
  answers: (number | null)[];
  score: number;
  total: number;
  percentage: number;
  elapsedSeconds: number;
};

export type PracticalState = {
  learned: boolean;
  viewed: boolean;
  calculated: boolean;
  bookmarked: boolean;
  attempts: PracticalAttempt[];
  perfectQuiz?: boolean;
  quizTotals?: { count: number; correct: number; answered: number };
  countedQuizIds?: string[];
  activityDays?: string[];
  timeZone?: string;
};

export const emptyPracticalState: PracticalState = {
  learned: false, viewed: false, calculated: false, bookmarked: false, attempts: [],
};

export function applyPracticalEvent(state: PracticalState, number: number, event: PracticalEvent, id: string, createdAt: string): PracticalState {
  if (event.kind !== 'bookmark') {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: state.timeZone ?? 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(createdAt));
    state = { ...state, activityDays: [...new Set([...(state.activityDays ?? []), day])] };
  }
  switch (event.kind) {
    case 'learn': return { ...state, learned: true };
    case 'view': return { ...state, viewed: true };
    case 'calculation': return { ...state, calculated: true };
    case 'bookmark': return { ...state, bookmarked: event.bookmarked };
    case 'quiz': {
      if (state.countedQuizIds?.includes(id) || state.attempts.some(attempt => attempt.id === id)) return state;
      const totals = state.quizTotals ?? {
        count: state.attempts.length,
        correct: state.attempts.reduce((sum, attempt) => sum + attempt.score, 0),
        answered: state.attempts.reduce((sum, attempt) => sum + attempt.answers.filter(answer => answer !== null).length, 0),
      };
      const quiz = practicalQuiz(number);
      const score = quiz.filter((question, index) => question.correct === event.answers[index]).length;
      const attempt = { id, createdAt, answers: event.answers, score, total: quiz.length,
        percentage: Math.round(100 * score / quiz.length), elapsedSeconds: event.elapsedSeconds };
      return { ...state,
        quizTotals: { count: totals.count + 1, correct: totals.correct + score,
          answered: totals.answered + event.answers.filter(answer => answer !== null).length },
        countedQuizIds: [...(state.countedQuizIds ?? []), id],
        perfectQuiz: Boolean(state.perfectQuiz || (attempt.total > 0 && score === attempt.total)), attempts: [attempt, ...state.attempts.filter(item => item.id !== id)].slice(0, 25) };
    }
  }
}
export function practicalAchievements(states: PracticalState[]) {
  const learned = states.filter(state => state.learned).length;
  const viewed = states.filter(state => state.viewed).length;
  const calculated = states.filter(state => state.calculated).length;
  const attempted = states.filter(state => state.attempts.length > 0).length;
  const definitions = [
    { id: 'practical_first_learn', title: 'First Lesson', description: 'Complete Learn in one practical.', icon: 'GraduationCap', category: 'Mastery' as const, count: learned, goal: 1 },
    { id: 'practical_first_view', title: '3D Explorer', description: 'Explore the 3D / AR section of one practical.', icon: 'Box', category: 'Explorer' as const, count: viewed, goal: 1 },
    { id: 'practical_first_calculation', title: 'First Calculation', description: 'Calculate a result in one practical.', icon: 'Sparkles', category: 'Mastery' as const, count: calculated, goal: 1 },
    { id: 'practical_first_quiz', title: 'First Practical Quiz', description: 'Submit a quiz for one practical.', icon: 'Award', category: 'Mastery' as const, count: attempted, goal: 1 },
  ];
  return definitions.map(({ count, goal, ...achievement }) => ({
    ...achievement,
    unlocked: count >= goal,
    progress: Math.min(100, Math.floor(100 * count / goal)),
    completedCount: Math.min(count, goal),
    targetCount: goal,
  }));
}

export type PracticalAchievement = ReturnType<typeof practicalAchievements>[number];


export function practicalStatistics(states: PracticalState[], timeZone = 'Asia/Karachi', now = new Date()) {
  let quizzesCompleted = 0;
  let questionsAnswered = 0;
  let correct = 0;
  let modelsExplored = 0;
  const days = new Set<string>();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (const state of states) {
    quizzesCompleted += state.quizTotals?.count ?? state.attempts.length;
    questionsAnswered += state.quizTotals?.answered ??
      state.attempts.reduce((sum, attempt) => sum + attempt.answers.filter(answer => answer !== null).length, 0);
    correct += state.quizTotals?.correct ?? state.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    modelsExplored += Number(state.viewed);
    for (const day of state.activityDays ?? []) days.add(day);
    for (const attempt of state.attempts) days.add(date.format(new Date(attempt.createdAt)));
  }
  const cursor = new Date(date.format(now) + 'T00:00:00Z');
  const key = () => cursor.toISOString().slice(0, 10);
  if (!days.has(key())) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(key())) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { xp: correct * 10 + modelsExplored * 25, streak, quizzesCompleted, modelsExplored, questionsAnswered };
}
