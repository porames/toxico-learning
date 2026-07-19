import type { Timestamp } from "firebase/firestore";

export type QuestionType = "multiple-choice" | "multiple-answer" | "true-false" | "short-answer";

export interface Option {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: Option[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
  shuffleQuestions: boolean;
  createdAt: Timestamp;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  answers: { questionId: string; answer: string | string[]; correct: boolean }[];
  startedAt: Timestamp;
  completedAt: Timestamp;
}

export function getOptionLabel(options: Option[], id: string): string {
  return options.find((o) => o.id === id)?.value ?? id;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  "multiple-choice": "Multiple choice",
  "multiple-answer": "Multiple answer",
  "true-false": "True / False",
  "short-answer": "Short answer",
};
