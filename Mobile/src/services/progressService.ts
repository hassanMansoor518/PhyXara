import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  category: 'Explorer' | 'Mastery' | 'Streak';
  rewardXP: number;
}

export interface UserStats {
  xp: number;
  streak: number;
  questionsAnswered: number;
  quizzesCompleted: number;
  chaptersCompleted: number;
  modelsExplored: number;
  overallProgress: number; // percentage
}

const STORAGE_KEY_STATS = '@phyxara_user_stats';
const STORAGE_KEY_ACHIEVEMENTS = '@phyxara_user_achievements';

const INITIAL_STATS: UserStats = {
  xp: 120,
  streak: 7,
  questionsAnswered: 18,
  quizzesCompleted: 4,
  chaptersCompleted: 2,
  modelsExplored: 6,
  overallProgress: 72,
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_scan',
    title: 'First Scan',
    description: 'Scan your first textbook physics diagram in AR',
    icon: 'Scan',
    unlocked: true,
    progress: 100,
    category: 'Explorer',
    rewardXP: 50,
  },
  {
    id: 'first_quiz',
    title: 'First Quiz',
    description: 'Complete your first chapter practice quiz',
    icon: 'Award',
    unlocked: true,
    progress: 100,
    category: 'Mastery',
    rewardXP: 50,
  },
  {
    id: '7_day_streak',
    title: '7 Day Streak',
    description: 'Practice physics concepts for 7 consecutive days',
    icon: 'Flame',
    unlocked: true,
    progress: 100,
    category: 'Streak',
    rewardXP: 100,
  },
  {
    id: 'physics_explorer',
    title: 'Physics Explorer',
    description: 'Explore 5 different 3D AR models and animations',
    icon: 'Box',
    unlocked: true,
    progress: 100,
    category: 'Explorer',
    rewardXP: 75,
  },
  {
    id: 'ar_master',
    title: 'AR Master',
    description: 'Interact with all callouts and exploded views',
    icon: 'Sparkles',
    unlocked: false,
    progress: 60,
    category: 'Mastery',
    rewardXP: 150,
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Score 100% on any chapter test',
    icon: 'Trophy',
    unlocked: false,
    progress: 80,
    category: 'Mastery',
    rewardXP: 120,
  },
  {
    id: 'chapter_completed',
    title: 'Chapter Completed',
    description: 'Finish all lessons and quizzes in Kinematics',
    icon: 'GraduationCap',
    unlocked: false,
    progress: 85,
    category: 'Mastery',
    rewardXP: 200,
  },
];

export const progressService = {
  getStats: async (): Promise<UserStats> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_STATS);
      if (data) {
        return JSON.parse(data);
      }
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(INITIAL_STATS));
      return INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  },

  getAchievements: async (): Promise<Achievement[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (data) {
        return JSON.parse(data);
      }
      await AsyncStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
      return INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  recordQuizCompleted: async (earnedXP: number, totalQuestions: number): Promise<UserStats> => {
    try {
      const current = await progressService.getStats();
      const updated: UserStats = {
        ...current,
        xp: current.xp + earnedXP,
        questionsAnswered: current.questionsAnswered + totalQuestions,
        quizzesCompleted: current.quizzesCompleted + 1,
      };
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      return updated;
    } catch {
      return INITIAL_STATS;
    }
  },

  recordScanCompleted: async (): Promise<UserStats> => {
    try {
      const current = await progressService.getStats();
      const updated: UserStats = {
        ...current,
        modelsExplored: current.modelsExplored + 1,
        xp: current.xp + 25,
      };
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      return updated;
    } catch {
      return INITIAL_STATS;
    }
  },
};

export default progressService;
