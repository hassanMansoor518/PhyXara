import { practicalQuiz } from './practicalQuiz.ts';

export type PracticalEvent = { kind: 'learn' | 'view' } |
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
  bookmarked: boolean;
  attempts: PracticalAttempt[];
};

export const emptyPracticalState: PracticalState = {
  learned: false, viewed: false, bookmarked: false, attempts: [],
};

export function applyPracticalEvent(state: PracticalState, number: number, event: PracticalEvent, id: string, createdAt: string): PracticalState {
  switch (event.kind) {
    case 'learn': return { ...state, learned: true };
    case 'view': return { ...state, viewed: true };
    case 'bookmark': return { ...state, bookmarked: event.bookmarked };
    case 'quiz': {
      const quiz = practicalQuiz(number);
      const score = quiz.filter((question, index) => question.correct === event.answers[index]).length;
      const attempt = { id, createdAt, answers: event.answers, score, total: quiz.length,
        percentage: Math.round(100 * score / quiz.length), elapsedSeconds: event.elapsedSeconds };
      return { ...state, attempts: [attempt, ...state.attempts.filter(item => item.id !== id)].slice(0, 25) };
    }
  }
}
