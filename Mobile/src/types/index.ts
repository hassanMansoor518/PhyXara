export interface PhysicsTopic {
  id: string;
  title: string;
  chaptersCount: number;
  iconName: string;
  color: string;
  category: 'Physics' | 'Chemistry' | 'Math' | 'All';
  description?: string;
}

export interface ChapterItemData {
  id: string;
  number: number;
  title: string;
  diagramsCount: number;
  completed: boolean;
  locked: boolean;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  currentScore: number;
  question: string;
  options: {
    key: string;
    text: string;
  }[];
  correctOptionKey: string;
  explanation: string;
}

export interface ScanResult {
  detected: boolean;
  object: string;
  name: string;
  confidence: number;
  imageUri?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  hasModelPreview?: boolean;
  topicId?: string;
}

export type MotorViewType = 'front' | 'side' | 'exploded';

export interface MotorPartLabel {
  id: string;
  name: string;
  top: number; // percentage or px
  left: number;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  chaptersCompleted: number;
  diagramsViewed: number;
  quizzesCompleted: number;
}
